```tsx
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
```

### 讲解补充：

1. **React 的容器概念**：

   - 在 React 中，容器（Container）是指应用的根节点，通常是一个 DOM 元素。`createContainer` 函数用于创建一个新的容器，并初始化与之相关的 Fiber 结构。

2. **FiberNode 和 FiberRootNode**：

   - `FiberNode` 是 React 中的基本单位，表示组件的状态和结构。`FiberRootNode` 是根节点的 FiberNode，包含了与整个应用相关的信息。

3. **创建容器**：

   - `createContainer` 函数创建一个新的 `FiberNode` 作为根节点，并将其与 `FiberRootNode` 关联。它还初始化了更新队列，以便后续的更新可以被管理。

4. **更新容器**：

   - `updateContainer` 函数用于处理容器的更新。它首先使用 `unstable_runWithPriority` 设置更新的优先级，然后创建一个更新对象，并将其推入更新队列。

5. **优先级管理**：

   - 每个更新都有一个优先级（lane），通过 `requestUpdateLane` 函数获取。优先级的管理确保了高优先级的更新能够优先处理，从而提高用户体验。

6. **调度更新**：

   - 在将更新推入队列后，调用 `scheduleUpdateOnFiber` 函数来调度更新。这一过程确保了 React 能够在适当的时机重新渲染组件。

7. **返回值**：
   - `updateContainer` 函数返回传入的元素，这在某些情况下可能用于链式调用或其他逻辑。

通过这些注释和讲解，希望能帮助你更好地理解这段代码的结构和功能。如果有任何具体问题或需要进一步的解释，请随时询问！
