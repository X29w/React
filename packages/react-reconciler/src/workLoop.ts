/**
 * 工作循环的文件
 * @每一个fiber都是
 * 1. 如果有子节点，遍历子节点  2、 没有子节点就遍历兄弟节点
 * 2. 每一个fiber都是先beginWork 然后completeWork
 */
import { createWorkInProgress, FiberNode, FiberRootNode } from "./fiber";
import { beginWork } from "./beginWork";
import { completeWork } from "./completeWork";
import { HostRoot } from "./workTags";
import { MutationMask, NoFlags, PassiveMask } from "./fiberFlags";
import {
  commitHookEffectListCreate,
  commitHookEffectListDestroy,
  commitHookEffectListUnmount,
  commitLayoutEffects,
  commitMutationEffects,
} from "./commitWork";
import {
  getNextLane,
  lanesToSchedulerPriority,
  markRootFinished,
  markRootSuspended,
  mergeLanes,
  NoLane,
  SyncLane,
} from "./fiberLanes";
import { flushSyncCallbacks, scheduleSyncCallback } from "./syncTaskQueue";
import {
  unstable_cancelCallback,
  unstable_NormalPriority as NormalPriority,
  unstable_scheduleCallback as scheduleCallback,
  unstable_shouldYield,
} from "scheduler";
import { HookHasEffect, Passive } from "./hookEffectTags";
import { getSuspenseThenable, SuspenseException } from "./thenable";
import { resetHookOnWind } from "./fiberHooks";
import { throwException } from "./fiberThrow";
import { unwindWork } from "./fiberUnwindWork";
import { scheduleMicroTask } from "react-dom/src/hostConfig";

// 当前正在处理的fiber节点
let workInProgress: FiberNode | null = null;
// 当前渲染的lane
let wipRootRenderLane: React.Lane = NoLane;
// 标记根节点是否有被动效果
let rootDoesHasPassiveEffects: Boolean = false;

// 工作中的状态（1. 并发更新被打断 2. suspense被打断
const RootInProgress = 0; // 当前正在进行中
const RootInComplete = 1; // 未执行完
const RootCompleted = 2; // 执行完
const RootDidNotComplete = 3; // 由于挂起，当前是未完成状态，不用进入commit阶段
let wipRootExitStatus: number = RootInProgress; // 工作的状态

// 定义挂起的原因类型
type SuspendedReason = typeof NotSuspended | typeof SuspendedOnData;
const NotSuspended = 0; // 未挂起
const SuspendedOnData = 1; // 挂起在数据上
let wipSuspendedReason: SuspendedReason = NotSuspended; // 当前挂起的原因

// 保存我们抛出的数据
let wipThrowValue: any = null;

let c = 0; // 错误计数器

/**
 * 准备一个新的工作栈
 * @param root - FiberRootNode 根节点
 * @param lane - React.Lane 当前的lane
 */
const prepareFreshStack = (root: FiberRootNode, lane: React.Lane) => {
  root.finishedLane = NoLane; // 重置完成的lane
  root.finishedWork = null; // 重置完成的工作
  workInProgress = createWorkInProgress(root.current, {}); // 创建新的工作进度
  wipRootRenderLane = lane; // 设置当前渲染的lane

  // 重置suspensed的状态
  wipSuspendedReason = NotSuspended; // 重置挂起状态
  wipThrowValue = null; // 重置抛出值
  wipRootExitStatus = RootInProgress; // 重置工作状态为进行中
};

/**
 * 在fiber上调度更新
 * @param fiber - FiberNode 当前的fiber节点
 * @param lane - React.Lane 当前的lane
 */
export const scheduleUpdateOnFiber = (fiber: FiberNode, lane: React.Lane) => {
  // fiberRootNode
  let root = markUpdateLaneFromFiberToRoot(fiber, lane); // 标记更新的lane
  markRootUpdated(root, lane); // 更新根节点的状态
  ensureRootIsScheduled(root); // 确保根节点被调度
};

/**
 * 确保根节点被调度
 * @param root - FiberRootNode 根节点
 */
export const ensureRootIsScheduled = (root: FiberRootNode) => {
  let updateLane = getNextLane(root); // 获取下一个lane
  const existingCallback = root.callbackNode; // 获取当前的callback

  if (updateLane === NoLane) {
    if (existingCallback !== null) {
      unstable_cancelCallback(existingCallback); // 取消现有的callback
    }
    root.callbackNode = null; // 重置callback
    root.callbackPriority = NoLane; // 重置优先级
    return; // 结束
  }

  const curPriority = updateLane; // 当前优先级
  const prevPriority = root.callbackPriority; // 之前的优先级
  if (curPriority === prevPriority) {
    // 如果之前的优先级等于当前的优先级, 不需要重新的调度
    return; // 结束
  }

  // 当前产生了更高优先级调度，取消之前的调度
  if (existingCallback !== null) {
    unstable_cancelCallback(existingCallback); // 取消现有的callback
  }

  let newCallbackNode = null; // 新的callback节点
  if (__DEV__) {
    console.log(
      `-x-react-在${updateLane === SyncLane ? "微" : "宏"} 任务中调度，优先级：`,
      updateLane
    ); // 打印调度信息
  }

  if (updateLane === SyncLane) {
    // 同步优先级  用微任务调度
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root)); // 调度同步工作
    scheduleMicroTask(flushSyncCallbacks); // 调度微任务
  } else {
    // 其他优先级 用宏任务调度
    const schedulerPriority = lanesToSchedulerPriority(updateLane); // 将react-lane 转换成 调度器的优先级
    newCallbackNode = scheduleCallback(
      schedulerPriority,
      // @ts-ignore
      performConcurrentWorkOnRoot.bind(null, root) // 调度并发工作
    );
  }
  // 保存当前的调度任务以及调度任务的优先级
  root.callbackNode = newCallbackNode; // 保存新的callback节点
  root.callbackPriority = curPriority; // 保存当前优先级
};

/**
 * 处理rootNode的lanes
 * @param root - FiberRootNode 根节点
 * @param lane - React.Lane 当前的lane
 */
export const markRootUpdated = (root: FiberRootNode, lane: React.Lane) =>
  (root.pendingLanes = mergeLanes(root.pendingLanes, lane)); // 合并待处理的lanes

// root.pendingLanes -> 整个组件树下的fiber中存在更新的lane合集
// fiberNode.lanes -> 单个fiber中update对应的lane合集
// 从当前触发更新的fiber向上遍历到根节点fiber
/**
 * 从当前fiber向上遍历到根节点，标记更新的lane
 * @param fiber - FiberNode 当前的fiber节点
 * @param lane - React.Lane 当前的lane
 */
const markUpdateLaneFromFiberToRoot = (fiber: FiberNode, lane: React.Lane) => {
  let node = fiber; // 当前节点
  let parent = node.return; // 父节点
  while (parent !== null) {
    parent.childLanes = mergeLanes(parent.childLanes, lane); // 合并子节点的lanes
    const alternate = parent.alternate; // 获取交替节点
    if (alternate !== null) {
      alternate.childLanes = mergeLanes(alternate.childLanes, lane); // 合并交替节点的lanes
    }
    node = parent; // 移动到父节点
    parent = node.return; // 更新父节点
  }
  if (node.tag === HostRoot) {
    return node.stateNode; // 返回根节点的状态
  }
  return null; // 返回null
};

/**
 * 并发更新的render入口 -> scheduler时间切片执行的函数
 * @didTimeout - 调度器传入 -> 任务是否过期
 * @param root - FiberRootNode 根节点
 * @param didTimeout - boolean 任务是否过期
 */
const performConcurrentWorkOnRoot = (
  root: FiberRootNode,
  didTimeout: boolean
): any => {
  // 并发开始的时候，需要保证useEffect回调已经执行
  const curCallback = root.callbackNode; // 当前callback
  let didFlushPassiveEffect = flushPassiveEffects(root.pendingPassiveEffects); // 刷新被动效果
  if (didFlushPassiveEffect) {
    // 这里表示：useEffect执行，触发了更新，并产生了比当前的更新优先级更高的更新，取消本次的调度
    if (root.callbackNode !== curCallback) {
      return null; // 返回null
    }
  }

  const lane = getNextLane(root); // 获取下一个lane
  const curCallbackNode = root.callbackNode; // 当前callback节点
  // 防御性编程
  if (lane === NoLane) {
    return null; // 返回null
  }

  const needSync = lane === SyncLane || didTimeout; // 判断是否需要同步
  console.log("-x-react-didTimeout--", didTimeout); // 打印是否超时

  // render阶段
  const exitStatus = renderRoot(root, lane, !needSync); // 渲染根节点

  // 再次执行调度，用于判断之后root.callbackNode === curCallbackNode,
  ensureRootIsScheduled(root); // 确保根节点被调度

  switch (exitStatus) {
    // 中断
    case RootInComplete:
      // ensureRootIsScheduled中有更高的优先级插入进来, 停止之前的调度
      if (root.callbackNode !== curCallbackNode) {
        return null; // 返回null
      }
      console.log("-x-react-中断--", didTimeout); // 打印中断信息
      // 继续调度
      return performConcurrentWorkOnRoot.bind(null, root); // 继续调度
    // 已经更新完
    case RootCompleted:
      const finishedWork = root.current.alternate; // 获取完成的工作
      root.finishedWork = finishedWork; // 设置完成的工作
      root.finishedLane = lane; // 设置完成的lane
      wipRootRenderLane = NoLane; // 重置渲染的lane
      commitRoot(root); // 提交根节点
      break;
    case RootDidNotComplete:
      wipRootRenderLane = NoLane; // 重置渲染的lane
      markRootSuspended(root, lane); // 标记根节点为挂起
      ensureRootIsScheduled(root); // 确保根节点被调度
      break;
    default:
      console.error("还未实现的并发更新结束状态"); // 打印错误信息
      break;
  }
};

/**
 * 同步更新入口(render入口)
 * @param {FiberRootNode} root - 根节点
 */
const performSyncWorkOnRoot = (root: FiberRootNode) => {
  let nextLane = getNextLane(root); // 获取下一个lane
  // 同步批处理中断的条件
  if (nextLane !== SyncLane) {
    // 其他比SyncLane 低的优先级
    ensureRootIsScheduled(root); // 确保根节点被调度
    return; // 结束
  }
  let exitStatus = renderRoot(root, nextLane, false); // 渲染根节点
  switch (exitStatus) {
    case RootCompleted:
      const finishedWork = root.current.alternate; // 获取完成的工作
      root.finishedWork = finishedWork; // 设置完成的工作
      root.finishedLane = nextLane; // 设置完成的lane
      wipRootRenderLane = NoLane; // 重置渲染的lane
      commitRoot(root); // 提交根节点
      break;
    case RootDidNotComplete:
      wipRootRenderLane = NoLane; // 重置渲染的lane
      markRootSuspended(root, nextLane); // 标记根节点为挂起
      ensureRootIsScheduled(root); // 确保根节点被调度
      break;
    default:
      if (__DEV__) {
        console.error("还未实现的同步更新结束状态"); // 打印错误信息
      }
      break;
  }
};

/**
 * 并发和同步更新的入口（render阶段）
 * @param root - FiberRootNode 根节点
 * @param lane - React.Lane 当前的lane
 * @param shouldTimeSlice - boolean 是否使用时间切片
 */
const renderRoot = (
  root: FiberRootNode,
  lane: React.Lane,
  shouldTimeSlice: boolean
) => {
  if (__DEV__) {
    console.log(`开始${shouldTimeSlice ? "并发" : "同步"}render更新`); // 打印渲染信息
  }

  // 由于并发更新会不断的执行，但是并不需要更新，所以我们需要判断优先级看看是否需要初始化
  // 如果wipRootRenderLane 不等于 当前更新的lane， 就需要重新初始化，从根部开始调度
  if (wipRootRenderLane !== lane) {
    // 初始化，将workInProgress 指向第一个fiberNode
    prepareFreshStack(root, lane); // 准备新的工作栈
  }

  do {
    try {
      if (wipSuspendedReason !== NotSuspended && workInProgress !== null) {
        // 有错误，进入unwind流程
        const throwValue = wipThrowValue; // 获取抛出值
        wipSuspendedReason = NotSuspended; // 重置挂起状态
        wipThrowValue = null; // 重置抛出值
        // unwind操作
        throwAndUnwindWorkLoop(root, workInProgress, throwValue, lane); // 进行unwind操作
      }

      shouldTimeSlice ? workLoopConcurrent() : workLoopSync(); // 根据是否使用时间切片选择工作循环
      break; // 结束循环
    } catch (e) {
      if (__DEV__) {
        console.warn("workLoop发生错误", e); // 打印错误信息
      }
      c++; // 增加错误计数
      if (c > 20) {
        console.warn("~~~~warn~~~~~!!!!!!!! 错误"); // 打印警告信息
        break; // 结束循环
      }
      handleThrow(e); // 处理抛出错误
    }
  } while (true);

  if (wipRootExitStatus !== RootInProgress) {
    return wipRootExitStatus; // 返回工作状态
  }

  // 中断执行
  if (shouldTimeSlice && workInProgress !== null) {
    return RootInComplete; // 返回未完成状态
  }
  if (!shouldTimeSlice && workInProgress !== null && __DEV__) {
    console.error(`render阶段结束时wip不应该为null`); // 打印错误信息
  }

  //render阶段执行完
  return RootCompleted; // 返回完成状态
};

/**
 * unWind流程的具体操作
 * @param root - FiberRootNode 根节点
 * @param unitOfWork - FiberNode 当前的fiberNode(抛出错误的位置）
 * @param thrownValue - 请求的promise
 * @param lane - React.Lane 当前的lane
 */
const throwAndUnwindWorkLoop = (
  root: FiberRootNode,
  unitOfWork: FiberNode,
  thrownValue: any,
  lane: React.Lane
) => {
  // 重置FC 的全局变量
  resetHookOnWind(); // 重置hook状态
  // 请求返回后重新触发更新
  throwException(root, thrownValue, lane); // 抛出异常
  // unwind
  unwindUnitOfWork(unitOfWork); // 进行unwind操作
};

/**
 * 一直向上查找，找到距离它最近的Suspense fiberNode
 * @param unitOfWork - FiberNode 当前的fiberNode
 */
const unwindUnitOfWork = (unitOfWork: FiberNode) => {
  let incompleteWork: FiberNode | null = unitOfWork; // 当前未完成的工作

  // 查找最近的suspense
  do {
    const next = unwindWork(incompleteWork); // 进行unwind操作
    if (next !== null) {
      workInProgress = next; // 更新当前工作
      return; // 返回
    }

    const returnFiber = incompleteWork.return as FiberNode; // 获取返回的fiber
    if (returnFiber !== null) {
      returnFiber.deletions = null; // 重置deletions
    }
    incompleteWork = returnFiber; // 更新未完成的工作
  } while (incompleteWork !== null);

  // 使用了use 但是没有定义suspense -> 到了root
  wipRootExitStatus = RootDidNotComplete; // 标记为未完成状态
  workInProgress = null; // 重置当前工作
};

/**
 * 处理抛出的错误
 * @param throwValue - 抛出的值
 */
const handleThrow = (throwValue: any) => {
  // Error  Boundary
  if (throwValue === SuspenseException) {
    throwValue = getSuspenseThenable(); // 获取suspense的thenable
    wipSuspendedReason = SuspendedOnData; // 标记为挂起状态
  }
  wipThrowValue = throwValue; // 保存抛出值
};

/**
 * 提交根节点的工作
 * @param root - FiberRootNode 根节点
 */
const commitRoot = (root: FiberRootNode) => {
  const finishedWork = root.finishedWork; // 获取完成的工作

  if (finishedWork === null) {
    return; // 如果没有完成的工作，结束
  }

  if (__DEV__) {
    console.warn("commit阶段开始", finishedWork); // 打印提交阶段信息
  }
  const lane = root.finishedLane; // 获取完成的lane

  if (lane === NoLane && __DEV__) {
    console.error("commit阶段finishedLane 不应该是NoLane"); // 打印错误信息
  }
  // 重置
  root.finishedWork = null; // 重置完成的工作
  root.finishedLane = NoLane; // 重置完成的lane
  markRootFinished(root, lane); // 标记根节点为完成

  // 当前Fiber树中存在函数组件需要执行useEffect的回调
  if (
    (finishedWork.flags & PassiveMask) !== NoFlags ||
    (finishedWork.subtreeFlags & PassiveMask) !== NoFlags
  ) {
    // 防止多次调用
    if (!rootDoesHasPassiveEffects) {
      rootDoesHasPassiveEffects = true; // 标记为存在被动效果
      // 调度副作用
      scheduleCallback(NormalPriority, () => {
        // 执行副作用
        flushPassiveEffects(root.pendingPassiveEffects); // 刷新被动效果
        return; // 返回
      });
    }
  }

  // 判断是否存在子阶段需要执行的操作
  const subtreeHasEffect =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags; // 子节点是否有更新
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags; // 根节点是否更新

  if (subtreeHasEffect || rootHasEffect) {
    // 阶段1/3 beforeMutation

    // 阶段2/3 mutation Placement
    commitMutationEffects(finishedWork, root); // 提交变更效果

    // fiber Tree 切换
    root.current = finishedWork; // 更新当前fiber树

    //阶段3/3 layout
    commitLayoutEffects(finishedWork, root); // 提交布局效果
  } else {
    // fiber Tree 切换
    root.current = finishedWork; // 更新当前fiber树
  }

  rootDoesHasPassiveEffects = false; // 重置被动效果标记
  ensureRootIsScheduled(root); // 确保根节点被调度
};

/**
 * 刷新被动效果
 * @param pendingPassiveEffects - React.PendingPassiveEffects 待处理的被动效果
 */
const flushPassiveEffects = (
  pendingPassiveEffects: React.PendingPassiveEffects
) => {
  let didFlushPassiveEffect = false; // 标记是否刷新了被动效果
  // unmount effect
  pendingPassiveEffects.unmount.forEach((effect) => {
    didFlushPassiveEffect = true; // 标记为已刷新
    commitHookEffectListUnmount(Passive, effect); // 提交卸载效果
  });
  pendingPassiveEffects.unmount = []; // 清空卸载效果

  pendingPassiveEffects.update.forEach((effect) => {
    didFlushPassiveEffect = true; // 标记为已刷新
    commitHookEffectListDestroy(Passive | HookHasEffect, effect); // 提交销毁效果
  });

  pendingPassiveEffects.update.forEach((effect) => {
    didFlushPassiveEffect = true; // 标记为已刷新
    commitHookEffectListCreate(Passive | HookHasEffect, effect); // 提交创建效果
  });

  pendingPassiveEffects.update = []; // 清空更新效果
  flushSyncCallbacks(); // 刷新同步回调
  return didFlushPassiveEffect; // 返回是否刷新了被动效果
};

// 同步更新
const workLoopSync = () => {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress); // 执行单元工作
  }
};

// 并发更新
const workLoopConcurrent = () => {
  while (workInProgress !== null && !unstable_shouldYield()) {
    performUnitOfWork(workInProgress); // 执行单元工作
  }
};

/**
 * 执行单元工作
 * @param fiber - FiberNode 当前的fiber节点
 */
const performUnitOfWork = (fiber: FiberNode): void => {
  const next = beginWork(fiber, wipRootRenderLane); // 开始工作，获取下一个fiber
  // 工作完成，需要将pendingProps 复制给 已经渲染的props
  fiber.memoizedProps = fiber.pendingProps; // 更新已渲染的props

  if (next === null) {
    // 没有子fiber
    completeUnitOfWork(fiber); // 完成单元工作
  } else {
    workInProgress = next; // 更新当前工作
  }
};

/**
 * 完成单元工作
 * @param fiber - FiberNode 当前的fiber节点
 */
const completeUnitOfWork = (fiber: FiberNode) => {
  let node: FiberNode | null = fiber; // 当前节点
  do {
    completeWork(node); // 完成工作
    const sibling = node.sibling; // 获取兄弟节点
    if (sibling !== null) {
      workInProgress = sibling; // 更新当前工作为兄弟节点
      return; // 返回
    }
    node = node.return; // 更新当前节点为返回节点
    workInProgress = node; // 更新当前工作
  } while (node !== null); // 循环直到节点为null
};
