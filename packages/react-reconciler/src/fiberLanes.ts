import { FiberRootNode } from "./fiber"; // 导入 FiberRootNode 类型
import ReactCurrentBatchConfig from "react/src/currentBatchConfig"; // 导入当前批处理配置
import {
  unstable_getCurrentPriorityLevel,
  unstable_IdlePriority,
  unstable_ImmediatePriority,
  unstable_NormalPriority,
  unstable_UserBlockingPriority,
} from "scheduler"; // 导入调度器的优先级相关常量

// 定义不同的 lane
export const NoLane = 0b0000; // 没有 lane
export const NoLanes = 0b0000; // 没有 lanes

// lane 模型
export const SyncLane = 0b00001; // 对应于 unstable_ImmediatePriority
export const InputContinuousLane = 0b00010; // 对应于连续输入事件 -> unstable_UserBlockingPriority
export const DefaultLane = 0b00100; // 对应于 unstable_NormalPriority
export const TransitionLane = 0b01000; // 对应于 transition 的优先级
export const IdleLane = 0b10000; // 对应于闲置的优先级

/**
 * 合并两个 lanes
 * @param laneA - 第一个 lane
 * @param laneB - 第二个 lane
 * @returns 合并后的 lanes
 */
export const mergeLanes = (laneA: React.Lane, laneB: React.Lane): React.Lanes =>
  laneA | laneB;

/**
 * 请求更新的 lane
 * @returns 当前的 lane
 */
export const requestUpdateLane = () => {
  // 增加 transition 逻辑
  const isTransition = ReactCurrentBatchConfig.transition !== null; // 检查是否为 transition
  if (isTransition) {
    return TransitionLane; // 返回 transition lane
  }

  // 从调度器中获取优先级
  const currentSchedulerPriority = unstable_getCurrentPriorityLevel();
  // 将调度器优先级转换为 lane
  const lane = schedulerPriorityToLane(currentSchedulerPriority);
  return lane; // 返回对应的 lane
};

/**
 * 获取优先级最高的 lane
 * @param {Lanes} lanes - lanes 集合
 * @returns {Lane} - 优先级最高的 lane
 */
export const getHighestPriorityLane = (lanes: React.Lanes): React.Lane =>
  lanes & -lanes; // 使用位运算获取最高优先级的 lane

/**
 * 判断优先级是否足够更新（交集）
 * @param set - lanes 集合
 * @param subset - 子集合
 * @returns 是否是子集合
 */
export const isSubsetOfLanes = (set: React.Lanes, subset: React.Lane) =>
  (set & subset) === subset; // 检查 subset 是否在 set 中

/**
 * 标记根节点为完成状态
 * @param root - FiberRootNode
 * @param lane - 当前的 lane
 */
export const markRootFinished = (root: FiberRootNode, lane: React.Lane) => {
  root.pendingLanes &= ~lane; // 从 pendingLanes 中移除当前 lane

  root.suspendedLanes = NoLanes; // 重置 suspendedLanes
  root.pendingLanes = NoLanes; // 重置 pendingLanes
};

/**
 * 将 lanes 转换为调度器的优先级
 * @param lanes - lanes 集合
 * @returns 对应的调度器优先级
 */
export const lanesToSchedulerPriority = (lanes: React.Lanes): 1 | 2 | 3 | 5 => {
  const lane = getHighestPriorityLane(lanes); // 获取最高优先级的 lane

  // 定义优先级映射
  const priorityMap: Record<number, 1 | 2 | 3 | 5> = {
    [SyncLane]: unstable_ImmediatePriority,
    [InputContinuousLane]: unstable_UserBlockingPriority,
    [DefaultLane]: unstable_NormalPriority,
  };

  // 返回对应的优先级，如果没有匹配则返回闲置优先级
  return priorityMap[lane] || unstable_IdlePriority;
};

/**
 * 将调度器的优先级转换为 lane
 * @param schedulerPriority - 调度器优先级
 * @returns 对应的 lane
 */
export const schedulerPriorityToLane = (schedulerPriority: number) => {
  // 定义优先级映射
  const priorityMap: Record<number, React.Lanes> = {
    [unstable_ImmediatePriority]: SyncLane,
    [unstable_UserBlockingPriority]: InputContinuousLane,
    [unstable_NormalPriority]: DefaultLane,
  };

  // 返回对应的 lane，如果没有匹配则返回 NoLane
  return priorityMap[schedulerPriority] || NoLane;
};

/**
 * 标记根节点为挂起状态
 * @param root - FiberRootNode
 * @param suspendedLane - 挂起的 lane
 */
export const markRootSuspended = (
  root: FiberRootNode,
  suspendedLane: React.Lanes
) => {
  root.suspendedLanes |= suspendedLane; // 将挂起的 lane 添加到 suspendedLanes
  root.pingedLanes &= ~suspendedLane; // 从 pingedLanes 中移除挂起的 lane
};

/**
 * 标记 ping 的 lane
 * @param root - FiberRootNode
 * @param pingedLane - ping 的 lane
 */
export const markRootPinged = (root: FiberRootNode, pingedLane: React.Lanes) =>
  (root.pingedLanes |= root.suspendedLanes & pingedLane); // 将 ping 的 lane 添加到 pingedLanes

/**
 * 获取下一个可用的 lane
 * @param root - FiberRootNode
 * @returns 下一个可用的 lane
 */
export const getNextLane = (root: FiberRootNode): React.Lane => {
  const pendingLanes = root.pendingLanes; // 获取当前的 pendingLanes

  if (pendingLanes === NoLanes) {
    return NoLane; // 如果没有 pendingLanes，返回 NoLane
  }

  let nextLane = NoLane; // 初始化下一个 lane

  const suspendedLanes = pendingLanes & ~root.suspendedLanes; // 获取未挂起的 lanes

  if (suspendedLanes !== NoLanes) {
    nextLane = getHighestPriorityLane(suspendedLanes); // 获取最高优先级的未挂起 lane
  } else {
    const pingedLanes = pendingLanes & root.pingedLanes; // 获取 ping 的 lanes
    if (pingedLanes !== NoLanes) {
      nextLane = getHighestPriorityLane(pingedLanes); // 获取最高优先级的 ping lane
    }
  }
  return nextLane; // 返回下一个可用的 lane
};

/**
 * 检查父集合中是否存在子集合
 * @param set - lanes 集合
 * @param subset - 子集合
 * @returns 是否包含子集合
 */
export const includeSomeLanes = (
  set: React.Lanes,
  subset: React.Lane | React.Lanes
): boolean => (set & subset) !== NoLanes; // 检查是否有交集

/**
 * 移除子集合
 * @param set - lanes 集合
 * @param subset - 子集合
 * @returns 移除后的 lanes
 */
export const removeLanes = (
  set: React.Lanes,
  subset: React.Lane | React.Lanes
): React.Lanes => set & ~subset; // 从 set 中移除 subset
