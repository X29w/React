import {
  createFiberFromFragment,
  createFiberFromOffscreen,
  createWorkInProgress,
  FiberNode,
} from "./fiber"; // 导入与 Fiber 相关的函数和类型
import {
  ContextProvider,
  Fragment,
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  OffscreenComponent,
  SuspenseComponent,
} from "./workTags"; // 导入不同类型的工作标签
import { processUpdateQueue } from "./updateQueue"; // 导入处理更新队列的函数
import {
  cloneChildFibers,
  mountChildFibers,
  reconcileChildFibers,
} from "./childFibers"; // 导入处理子 Fiber 的函数
import { bailOutHook, renderWithHooks } from "./fiberHooks"; // 导入处理 Hook 的函数
import { includeSomeLanes, NoLanes } from "./fiberLanes"; // 导入与优先级相关的函数
import {
  ChildDeletion,
  DidCapture,
  NoFlags,
  Placement,
  Ref,
} from "./fiberFlags"; // 导入不同的 Fiber 标志
import { pushProvider } from "./fiberContext"; // 导入上下文提供者的函数
import { pushSuspenseHandler } from "./suspenseContext"; // 导入处理 Suspense 的函数

// 是否能命中 bailout
let didReceiveUpdate = false; // 默认命中 bailout 策略，不接受更新

// 标记 WIP 收到更新
export const markWipReceivedUpdate = () => (didReceiveUpdate = true); // 接受更新，没有命中 bailout

// 创建一个映射表，将 tag 对应到具体的更新函数
const updateFunctionMap: Record<
  React.WorkTag,
  (wip: FiberNode, renderLane: React.Lane) => FiberNode | null
> = {
  [HostRoot]: updateHostRoot,
  [HostComponent]: updateHostComponent,
  [FunctionComponent]: updateFunctionComponent,
  [HostText]: () => null, // 文本节点没有子节点，无需处理
  [Fragment]: updateFragment,
  [ContextProvider]: updateContextProvider,
  [SuspenseComponent]: updateSuspenseComponent,
  [OffscreenComponent]: updateOffscreenComponent,
};

// 主逻辑
export const beginWork = (
  wip: FiberNode,
  renderLane: React.Lane
): FiberNode | null => {
  didReceiveUpdate = false; // 重置更新标志
  const current = wip.alternate; // 获取当前 Fiber

  if (current !== null) {
    const { memoizedProps: oldProps, type: oldType } = current; // 获取旧的 props 和类型
    const { pendingProps: newProps, type: newType } = wip; // 获取新的 props 和类型

    console.log("-x-react-beginWork", oldProps, newProps, wip);
    console.log("-x-react-beginWork-比较", oldProps === newProps);

    // 判断 props 和 type 是否变化
    if (oldProps !== newProps || oldType !== newType) {
      didReceiveUpdate = true; // 未命中 bailout
    } else {
      console.warn("命中bailout --- 满足props 和 type");

      // 判断 state 或 context 是否变化
      if (!checkScheduledUpdateOrContext(current, renderLane)) {
        // context 的入栈操作
        if (wip.tag === ContextProvider) {
          const newValue = wip.memoizedProps!.value; // 获取新的值
          const context = wip.type._context; // 获取上下文
          pushProvider(context, newValue); // 入栈
        }

        return bailoutOnAlreadyFinishedWork(wip, renderLane); // 跳过更新
      }
    }
  }

  // 重置 lanes，因为 beginWork 过程中消费了 update
  wip.lanes = NoLanes;

  // 根据 tag 执行对应的更新函数
  const updateFunction = updateFunctionMap[wip.tag];
  if (updateFunction) {
    return updateFunction(wip, renderLane); // 调用对应的更新函数
  }

  if (__DEV__) {
    console.warn("beginWork未实现的类型");
  }

  return null; // 默认返回 null
};

/**
 * 复用上一次的结果，不进行本次更新
 * @param wip
 * @param renderLane
 */
const bailoutOnAlreadyFinishedWork = (
  wip: FiberNode,
  renderLane: React.Lane
) => {
  // 1. 检查优化程度
  /**
   * 如果这个检查返回false，
   * 说明当前fiber的子节点不包含任何应该在当前render lane更新的内容。这种情况下，
   * 这个fiber subtree（该节点及其所有子节点）在当前渲染过程中可以被跳过（bailout），
   * 因为没有相关的更新需要应用于这部分的DOM。
   * 因此，通过返回null来中止当前fiber的工作。
   */
  if (!includeSomeLanes(wip.childLanes, renderLane)) {
    // 检查整个子树
    if (__DEV__) {
      console.warn("bailout整课子树", wip);
    }
    return null; // 跳过更新
  }
  if (__DEV__) {
    console.warn("bailout一个fiber", wip);
  }

  cloneChildFibers(wip); // 克隆子 Fiber
  return wip.child; // 返回子节点
};

/**
 * renderLane 代表本次更新对应的优先级
 * updateLanes 代表当前fiber所有未执行的update对应的更新的优先级
 *
 * 所以这行代码的意思是： 当前这个fiber中所有未执行的update对应更新的优先级中是否包含了本次更新的优先级，也就是本次更新当前这个fiber是否有状态会变化
 * @param current
 * @param renderLane
 */
const checkScheduledUpdateOrContext = (
  current: FiberNode,
  renderLane: React.Lane
): boolean => {
  const updateLanes = current.lanes; // 获取当前 Fiber 的更新优先级

  if (includeSomeLanes(updateLanes, renderLane)) {
    // 本次更新存在的优先级，在当前的 fiber 中存在
    return true; // 存在更新
  }
  return false; // 不存在更新
};

/**
 * hostRoot的beginWork工作流程
 * 1. 计算状态的最新值  2. 创造子fiberNode
 * @param {FiberNode} wip
 */
function updateHostRoot(wip: FiberNode, renderLane: React.Lane) {
  const baseState = wip.memoizedState; // 获取基础状态
  const updateQueue =
    wip.updateQueue as React.UpdateQueue<React.ReactElementType>; // 获取更新队列
  // 这里是计算最新值
  const pending = updateQueue.shared.pending; // 获取待处理的更新
  updateQueue.shared.pending = null; // 清空待处理更新

  const prevChildren = wip.memoizedState; // 计算前的值
  const { memoizedState } = processUpdateQueue(baseState, pending, renderLane); // 计算最新状态
  wip.memoizedState = memoizedState; // 更新状态

  const current = wip.alternate; // 获取当前 Fiber
  if (current !== null) {
    if (!current.memoizedState) {
      current.memoizedState = memoizedState; // 更新当前状态
    }
  }

  const nextChildren = wip.memoizedState; // 子对应的 ReactElement
  if (prevChildren === nextChildren) {
    // 没有变化
    return bailoutOnAlreadyFinishedWork(wip, renderLane); // 跳过更新
  }
  reconcileChildren(wip, nextChildren); // 处理子节点
  console.warn("--hostRoot的beginWork工作流程--", wip);
  return wip.child; // 返回子节点
}

function updateSuspenseComponent(wip: FiberNode) {
  const current = wip.alternate; // 获取当前 Fiber
  const nextProps = wip.pendingProps; // 获取新的 props

  let showFallback = false; // 是否显示 fallback
  const didSuspend = (wip.flags & DidCapture) !== NoFlags; // 是否挂起
  if (didSuspend) {
    // 显示 fallback
    showFallback = true;
    wip.flags &= ~DidCapture; // 清除 DidCapture
  }

  const nextPrimaryChildren = nextProps.children; // 主渲染的内容
  const nextFallbackChildren = nextProps.fallback; // fallback 内容

  pushSuspenseHandler(wip); // 入栈处理

  if (current === null) {
    // mount
    if (showFallback) {
      // 挂起
      return mountSuspenseFallbackChildren(
        wip,
        nextPrimaryChildren,
        nextFallbackChildren
      );
    } else {
      // 正常
      return mountSuspensePrimaryChildren(wip, nextPrimaryChildren);
    }
  } else {
    // update
    if (showFallback) {
      // 挂起
      return updateSuspenseFallbackChildren(
        wip,
        nextPrimaryChildren,
        nextFallbackChildren
      );
    } else {
      // 正常
      return updateSuspensePrimaryChildren(wip, nextPrimaryChildren);
    }
  }
}

/**
 * 挂起状态的 mount 阶段
 * @param wip
 * @param primaryChildren
 * @param fallbackChildren
 */
function mountSuspenseFallbackChildren(
  wip: FiberNode,
  primaryChildren: any,
  fallbackChildren: any
) {
  const primaryChildProps: React.OffscreenProps = {
    mode: "hidden", // 设置为隐藏模式
    children: primaryChildren, // 主内容
  };
  const primaryChildFragment = createFiberFromOffscreen(primaryChildProps); // 创建主内容的 Fiber
  const fallbackChildFragment = createFiberFromFragment(fallbackChildren, null); // 创建 fallback 的 Fiber

  fallbackChildFragment.flags |= Placement; // 标记为插入

  primaryChildFragment.return = wip; // 设置返回指针
  fallbackChildFragment.return = wip; // 设置返回指针
  primaryChildFragment.sibling = fallbackChildFragment; // 设置兄弟关系
  wip.child = primaryChildFragment; // 设置子节点

  return fallbackChildFragment; // 返回 fallback 的 Fiber
}

/**
 * 正常流程的 mount 阶段
 * @param wip
 * @param primaryChildren
 */
function mountSuspensePrimaryChildren(wip: FiberNode, primaryChildren: any) {
  const primaryChildProps: React.OffscreenProps = {
    mode: "visible", // 设置为可见模式
    children: primaryChildren, // 主内容
  };
  const primaryChildFragment = createFiberFromOffscreen(primaryChildProps); // 创建主内容的 Fiber

  wip.child = primaryChildFragment; // 设置子节点
  primaryChildFragment.return = wip; // 设置返回指针

  return primaryChildFragment; // 返回主内容的 Fiber
}

function updateSuspenseFallbackChildren(
  wip: FiberNode,
  primaryChildren: any,
  fallbackChildren: any
) {
  const current = wip.alternate as FiberNode; // 获取当前 Fiber
  const currentPrimaryChildFragment = current.child as FiberNode; // 获取当前主内容的 Fiber
  const currentFallbackChildFragment: FiberNode | null =
    currentPrimaryChildFragment.sibling; // 获取当前 fallback 的 Fiber

  const primaryChildProps: React.OffscreenProps = {
    mode: "hidden", // 设置为隐藏模式
    children: primaryChildren, // 主内容
  };

  const primaryChildFragment = createWorkInProgress(
    currentPrimaryChildFragment,
    primaryChildProps
  ); // 创建主内容的工作 Fiber

  let fallbackChildFragment;
  if (currentFallbackChildFragment) {
    fallbackChildFragment = createWorkInProgress(
      currentFallbackChildFragment,
      fallbackChildren
    ); // 更新 fallback 的 Fiber
  } else {
    fallbackChildFragment = createFiberFromFragment(fallbackChildren, null); // 创建新的 fallback 的 Fiber
    fallbackChildFragment.flags |= Placement; // 标记为插入
  }

  fallbackChildFragment.return = wip; // 设置返回指针
  primaryChildFragment.return = wip; // 设置返回指针
  primaryChildFragment.sibling = fallbackChildFragment; // 设置兄弟关系
  wip.child = primaryChildFragment; // 设置子节点

  return fallbackChildFragment; // 返回 fallback 的 Fiber
}

/**
 * 正常流程的更新
 * @param wip
 * @param primaryChildren
 * @param fallbackChildren
 */
function updateSuspensePrimaryChildren(wip: FiberNode, primaryChildren: any) {
  const current = wip.alternate as FiberNode; // 获取当前 Fiber
  const currentPrimaryChildFragment = current.child as FiberNode; // 获取当前主内容的 Fiber
  const currentFallbackChildFragment: FiberNode | null =
    currentPrimaryChildFragment.sibling; // 获取当前 fallback 的 Fiber

  const primaryChildProps: React.OffscreenProps = {
    mode: "visible", // 设置为可见模式
    children: primaryChildren, // 主内容
  };

  const primaryChildFragment = createWorkInProgress(
    currentPrimaryChildFragment,
    primaryChildProps
  ); // 创建主内容的工作 Fiber
  primaryChildFragment.return = wip; // 设置返回指针
  primaryChildFragment.sibling = null; // 清空兄弟关系
  wip.child = primaryChildFragment; // 设置子节点

  if (currentFallbackChildFragment) {
    const deletions = wip.deletions; // 获取待删除的 Fiber
    if (deletions === null) {
      wip.deletions = [currentFallbackChildFragment]; // 初始化待删除的 Fiber
      wip.flags |= ChildDeletion; // 标记为删除
    } else {
      deletions.push(currentFallbackChildFragment); // 添加到待删除的 Fiber
    }
  }

  return primaryChildFragment; // 返回主内容的 Fiber
}

function updateOffscreenComponent(wip: FiberNode) {
  const nextProps = wip.pendingProps; // 获取新的 props
  const nextChildren = nextProps.children; // 获取子节点
  reconcileChildren(wip, nextChildren); // 处理子节点
  return wip.child; // 返回子节点
}

function updateContextProvider(wip: FiberNode) {
  const providerType = wip.type; // 获取提供者类型
  const context = providerType._context; // 获取上下文
  const oldProps = wip.memoizedProps; // 旧的 props
  const newProps = wip.pendingProps; // 新的 props

  const newValue = newProps.value; // 新的值

  if (oldProps && newValue !== oldProps.value) {
    // context.value 发生了变化
    // todo: 从 Provider 向下 DFS，寻找消费了当前变化的 context 的 consumer
    // 如果找到 consumer, 从 consumer 开始向上遍历到 Provider
    // 标记沿途的组件存在更新
  }

  // 逻辑 - context 入栈
  if (__DEV__ && !("value" in newProps)) {
    console.warn("<Context.Provider>需要传入 value");
  }
  pushProvider(context, newValue); // 入栈

  const nextChildren = newProps.children; // 获取新的子节点
  reconcileChildren(wip, nextChildren); // 处理子节点
  return wip.child; // 返回子节点
}

/**
 * Fragment 的 beginWork
 * @param wip
 */
function updateFragment(wip: FiberNode) {
  const nextChildren = wip.pendingProps; // 获取新的子节点
  reconcileChildren(wip, nextChildren as any); // 处理子节点
  return wip.child; // 返回子节点
}

/**
 * 函数组件的 beginWork
 * @param wip
 */
function updateFunctionComponent(wip: FiberNode, renderLane: React.Lane) {
  const nextChildren = renderWithHooks(wip, renderLane); // 渲染 Hook

  const current = wip.alternate; // 获取当前 Fiber
  if (current !== null && !didReceiveUpdate) {
    // 命中 bailout 策略
    bailOutHook(wip, renderLane); // 跳过 Hook
    return bailoutOnAlreadyFinishedWork(wip, renderLane); // 跳过更新
  }
  reconcileChildren(wip, nextChildren); // 处理子节点
  return wip.child; // 返回子节点
}

/**
 * HostComponent 的 beginWork 工作流程
 * 1、 创建子 fiberNode  <div><span></span></div> span 节点在 div 的 props.children 中
 * @param {FiberNode} wip
 */
function updateHostComponent(wip: FiberNode) {
  const nextProps = wip.pendingProps; // 获取新的 props
  const nextChildren = nextProps.children; // 获取子节点
  markRef(wip.alternate, wip); // 标记 ref
  reconcileChildren(wip, nextChildren); // 处理子节点
  return wip.child; // 返回子节点
}

/**
 * 对比子节点的 current fiberNode 和 子节点的 ReactElement 生成对应的子节点的 fiberNode
 * @param {FiberNode} wip
 * @param {ReactElementType} children
 */
function reconcileChildren(wip: FiberNode, children?: React.ReactElementType) {
  const current = wip.alternate; // 获取当前 Fiber
  if (current !== null) {
    // update
    wip.child = reconcileChildFibers(wip, current?.child, children); // 处理更新
  } else {
    // mount
    wip.child = mountChildFibers(wip, null, children); // 处理挂载
  }
}

/**
 * 标记 Ref
 */
function markRef(current: FiberNode | null, workInProgress: FiberNode) {
  const ref = workInProgress.ref; // 获取 ref
  // mount 时有 ref 或者 update 时 ref 变化
  if (
    (current === null && ref !== null) ||
    (current !== null && current.ref !== ref)
  ) {
    workInProgress.flags |= Ref; // 标记 Ref
  }
}
