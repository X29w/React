import { FiberNode, FiberRootNode } from "./fiber"; // 导入 FiberNode 和 FiberRootNode 类型
import { HostRoot } from "./workTags"; // 导入 HostRoot 标签
import { createUpdate, createUpdateQueue, enqueueUpdate } from "./updateQueue"; // 导入更新队列相关函数
import { scheduleUpdateOnFiber } from "./workLoop"; // 导入调度更新的函数
import { requestUpdateLane } from "./fiberLanes"; // 导入请求更新优先级的函数
import {
  unstable_ImmediatePriority,
  unstable_runWithPriority,
} from "scheduler"; // 导入调度器的优先级相关函数

/**
 * ReactDOM.createRoot() 中调用
 * 1. 创建 fiberRootNode 和 hostRootFiber，并建立联系
 * @param {Container} container - React 应用的容器
 * @returns {FiberRootNode} - 创建的 FiberRootNode
 */
export const createContainer = (container: React.Container) => {
  const hostRootFiber = new FiberNode(HostRoot, {}, null); // 创建根 FiberNode
  const fiberRootNode = new FiberRootNode(container, hostRootFiber); // 创建 FiberRootNode
  hostRootFiber.updateQueue = createUpdateQueue(); // 初始化更新队列
  return fiberRootNode; // 返回创建的 FiberRootNode
};

/**
 * ReactDOM.createRoot().render 中调用更新
 * 1. 创建 update，并将其推到 enqueueUpdate 中
 * @param {React.ReactElementType | null} element - 要渲染的 React 元素
 * @param {FiberRootNode} root - FiberRootNode
 * @returns {React.ReactElementType | null} - 返回传入的元素
 */
export const updateContainer = (
  element: React.ReactElementType | null,
  root: FiberRootNode
) => {
  unstable_runWithPriority(unstable_ImmediatePriority, () => {
    const hostRootFiber = root.current; // 获取当前的根 FiberNode
    const lane = requestUpdateLane(); // 每一个更新设置一个 lane（优先级）
    const update = createUpdate<React.ReactElementType | null>(element, lane); // 创建更新
    enqueueUpdate(
      // 首页渲染，直接插入更新
      hostRootFiber.updateQueue as React.UpdateQueue<React.ReactElementType | null>,
      update,
      hostRootFiber,
      lane
    ); // 将更新推入更新队列
    // 插入更新后，进入调度
    scheduleUpdateOnFiber(hostRootFiber, lane); // 调度更新
  });
  return element; // 返回传入的元素
};
