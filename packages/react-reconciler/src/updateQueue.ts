import { isSubsetOfLanes, mergeLanes, NoLane } from "./fiberLanes"; // 导入与 lanes 相关的函数
import { FiberNode } from "./fiber"; // 导入 FiberNode 类型

/**
 * 创建更新对象
 * @param {Action<State>} action - 更新的动作
 * @param lane - 保存未执行更新对应的 lane
 * @returns {Update<State>} - 返回创建的更新对象
 */
export const createUpdate = <State>(
  action: React.Action<State>,
  lane: React.Lane
): React.Update<State> => {
  return {
    action,
    lane,
    next: null, // 初始化下一个更新为 null
  };
};

/**
 * 初始化更新队列
 * @returns {UpdateQueue<Action>} - 返回初始化的更新队列
 */
export const createUpdateQueue = <State>() => {
  return {
    shared: {
      pending: null, // 初始化 pending 更新为 null
    },
    dispatch: null, // 初始化 dispatch 为 null
  } as React.UpdateQueue<State>;
};

/**
 * 将更新添加到更新队列
 * @param {UpdateQueue<Action>} updateQueue - 更新队列
 * @param {Update<Action>} update - 要添加的更新
 * @param fiber - 当前的 FiberNode
 * @param lane - 更新的优先级
 */
export const enqueueUpdate = <State>(
  updateQueue: React.UpdateQueue<State>,
  update: React.Update<State>,
  fiber: FiberNode,
  lane: React.Lane
) => {
  const pending = updateQueue.shared.pending; // 获取当前的 pending 更新
  if (pending === null) {
    // 第一次执行更新
    update.next = update; // 将更新的下一个指向自身
  } else {
    // 处理后续的更新
    update.next = pending.next; // 将新更新的下一个指向当前 pending 的下一个
    pending.next = update; // 将当前 pending 的下一个指向新更新
  }
  updateQueue.shared.pending = update; // 更新队列的 pending 更新为新更新

  // 合并当前 FiberNode 的 lanes
  fiber.lanes = mergeLanes(fiber.lanes, lane);
  const alternate = fiber.alternate; // 获取当前 FiberNode 的替代节点
  if (alternate !== null) {
    alternate.lanes = mergeLanes(alternate.lanes, lane); // 合并替代节点的 lanes
  }
};

/**
 * 处理更新队列，计算状态的最新值
 * @param baseState - 基础状态
 * @param pendingUpdate - 当前待处理的更新
 * @param renderLane - 渲染的优先级
 * @param onSkipUpdate - 可选的回调函数，用于处理被跳过的更新
 * @returns {Object} - 返回最新的 memoizedState、baseState 和 baseQueue
 */
export const processUpdateQueue = <State>(
  baseState: State,
  pendingUpdate: React.Update<State> | null,
  renderLane: React.Lane,
  onSkipUpdate?: <State>(update: React.Update<State>) => void
): {
  memoizedState: State; // 最新的 memoizedState
  baseState: State; // 基础状态
  baseQueue: React.Update<State> | null; // 基础队列
} => {
  const result: ReturnType<typeof processUpdateQueue<State>> = {
    memoizedState: baseState, // 初始化 memoizedState 为 baseState
    baseState,
    baseQueue: null, // 初始化 baseQueue 为 null
  };

  if (pendingUpdate !== null) {
    // 处理第一个更新
    const first = pendingUpdate.next; // 获取第一个更新
    let pending = pendingUpdate.next as React.Update<any>; // 当前待处理的更新

    let newBaseState = baseState; // 最后一个未跳过更新计算后的结果
    let newBaseQueueFirst: React.Update<State> | null = null; // 新的基础队列的第一个
    let newBaseQueueLast: React.Update<State> | null = null; // 新的基础队列的最后一个
    let newState = baseState; // 每次计算的结果

    do {
      const updateLane = pending.lane; // 获取当前更新的优先级
      if (!isSubsetOfLanes(renderLane, updateLane)) {
        // 如果优先级不够，跳过更新
        const clone = createUpdate(pending.action, pending.lane); // 克隆被跳过的更新
        onSkipUpdate?.(clone); // 调用可选的跳过更新回调
        // 判断是否是第一个被跳过的更新
        if (newBaseQueueFirst === null) {
          // 如果是第一个被跳过的更新
          newBaseQueueFirst = clone; // 设置新的基础队列的第一个
          newBaseQueueLast = clone; // 设置新的基础队列的最后一个
          newBaseState = newState; // 更新基础状态为最后一个未跳过的更新计算后的结果
        } else {
          // 如果不是第一个被跳过的更新
          (newBaseQueueLast as React.Update<State>).next = clone; // 将新的克隆更新添加到基础队列的最后
          newBaseQueueLast = clone; // 更新新的基础队列的最后一个
        }
      } else {
        // 如果优先级足够，处理更新
        if (newBaseQueueFirst !== null) {
          // 如果有被跳过的更新
          const clone = createUpdate(pending.action, NoLane); // 创建一个优先级为 NoLane 的克隆更新
          (newBaseQueueLast as React.Update<State>).next = clone; // 将克隆更新添加到基础队列的最后
          newBaseQueueLast = clone; // 更新新的基础队列的最后一个
        }

        const action = pending.action; // 获取当前更新的动作
        if (action instanceof Function) {
          // 如果动作是一个函数，计算新的状态
          newState = action(baseState); // 计算新的状态
        } else {
          // 如果动作是一个值，直接赋值
          newState = action; // 更新新的状态
        }
      }
      pending = pending.next as React.Update<any>; // 移动到下一个待处理的更新
    } while (pending !== first); // 循环直到回到第一个更新

    if (newBaseQueueLast === null) {
      // 如果本次计算没有更新被跳过
      newBaseState = newState; // 更新基础状态为新的状态
    } else {
      // 如果本次计算有更新被跳过
      newBaseQueueLast.next = newBaseQueueFirst; // 将基础队列的最后一个更新指向第一个被跳过的更新
    }
    result.memoizedState = newState; // 更新结果的 memoizedState
    result.baseState = newBaseState; // 更新结果的 baseState
    result.baseQueue = newBaseQueueLast; // 更新结果的 baseQueue
  }
  return result; // 返回结果
};
