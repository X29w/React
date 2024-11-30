```tsx
import { FiberNode } from "./fiber"; // 导入 FiberNode 类型
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

import { NoFlags, Ref, Update, Visibility } from "./fiberFlags"; // 导入 Fiber 标志
import { popProvider } from "./fiberContext"; // 导入上下文提供者的弹出函数
import { popSuspenseHandler } from "./suspenseContext"; // 导入 Suspense 处理器的弹出函数
import { mergeLanes, NoLanes } from "./fiberLanes"; // 导入合并 lanes 的函数
import {
  appendInitialChild,
  createInstance,
  createTextInstance,
} from "react-dom/src/hostConfig"; // 导入与 DOM 操作相关的函数

// 标记更新
const markUpdate = (fiber: FiberNode) => (fiber.flags |= Update);

// 标记 Ref
const markRef = (fiber: FiberNode) => (fiber.flags |= Ref);

/**
 * 完成工作函数，处理 Fiber 的更新和挂载逻辑
 * @param wip - 当前正在处理的 Fiber 节点
 */
export const completeWork = (wip: FiberNode) => {
  const newProps = wip.pendingProps; // 获取新的 props
  const current = wip.alternate; // 获取当前 Fiber 的替代节点

  // 定义不同类型 Fiber 的处理函数
  const handlers: Record<number, () => void> = {
    [HostComponent]: () => {
      if (current !== null && wip.stateNode) {
        // 更新逻辑
        markUpdate(wip); // 标记更新
        if (current.ref !== wip.ref) {
          markRef(wip); // 标记 Ref
        }
      } else {
        // 挂载逻辑
        const instance = createInstance(wip.type, newProps); // 创建 DOM 实例
        appendAllChildren(instance, wip); // 将子节点插入到 DOM 树中
        if (wip.ref !== null) {
          markRef(wip); // 标记 Ref
        }
        wip.stateNode = instance; // 设置状态节点
      }
    },
    [HostText]: () => {
      if (current !== null && wip.stateNode) {
        // 更新逻辑
        const oldText = current.memoizedProps!.content; // 获取旧文本
        const newText = newProps.content; // 获取新文本
        if (oldText !== newText) {
          markUpdate(wip); // 标记更新
        }
      } else {
        // 挂载逻辑
        wip.stateNode = createTextInstance(newProps.content); // 创建文本实例
      }
    },
    [HostRoot]: () => bubbleProperties(wip), // 传播属性
    [FunctionComponent]: () => bubbleProperties(wip), // 传播属性
    [Fragment]: () => bubbleProperties(wip), // 传播属性
    [OffscreenComponent]: () => bubbleProperties(wip), // 传播属性
    [ContextProvider]: () => {
      const context = wip.type._context; // 获取上下文
      popProvider(context); // 弹出上下文提供者
      bubbleProperties(wip); // 传播属性
    },
    [SuspenseComponent]: () => {
      popSuspenseHandler(); // 弹出 Suspense 处理器
      const offscreenFiber = wip.child as FiberNode; // 获取 Offscreen 组件的子节点
      const isHidden = offscreenFiber.pendingProps.mode === "hidden"; // 判断是否隐藏
      const currentOffscreenFiber = offscreenFiber.alternate; // 获取当前 Offscreen 组件的替代节点

      if (currentOffscreenFiber !== null) {
        // 更新逻辑
        const wasHidden = currentOffscreenFiber.pendingProps.mode === "hidden"; // 判断之前是否隐藏
        if (wasHidden !== isHidden) {
          offscreenFiber.flags |= Visibility; // 标记可见性变化
          bubbleProperties(offscreenFiber); // 传播属性
        }
      } else if (isHidden) {
        // 挂载逻辑
        offscreenFiber.flags |= Visibility; // 标记为隐藏
        bubbleProperties(offscreenFiber); // 传播属性
      }
    },
  };

  // 获取对应的处理函数并调用
  const handler = handlers[wip.tag];
  if (handler) {
    handler(); // 调用对应的处理函数
  } else if (__DEV__) {
    console.warn("未实现的 completeWork"); // 开发模式下警告
  }

  bubbleProperties(wip); // 传播属性
  return null; // 返回 null
};

/**
 * 在 parent 的节点下，插入 wip
 * 难点：是 fiber 对应的节点和 DOM 树不对应
 * @param parent - 父节点
 * @param wip - 当前正在处理的 Fiber 节点
 */
const appendAllChildren = (parent: React.Container, wip: FiberNode) => {
  let node = wip.child; // 获取子节点

  while (node !== null) {
    if (node?.tag === HostComponent || node?.tag === HostText) {
      appendInitialChild(parent, node?.stateNode); // 将子节点添加到父节点
    } else if (node.child !== null) {
      node.child.return = node; // 设置子节点的返回指针
      // 继续向下查找
      node = node.child;
      continue;
    }

    if (node === wip) {
      return; // 如果节点是 wip，返回
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === wip) {
        return; // 如果没有返回节点或返回节点是 wip，返回
      }
      // 向上找
      node = node?.return;
    }
    node.sibling.return = node.return; // 设置兄弟节点的返回指针
    node = node.sibling; // 移动到下一个兄弟节点
  }
};

/**
 * 传播属性
 * @param wip - 当前正在处理的 Fiber 节点
 */
const bubbleProperties = (wip: FiberNode) => {
  let subtreeFlags = NoFlags; // 初始化子树标志
  let child = wip.child; // 获取子节点
  let newChildLanes = NoLanes; // 初始化新的子节点 lanes

  while (child !== null) {
    subtreeFlags |= child.subtreeFlags; // 合并子树标志
    subtreeFlags |= child.flags; // 合并子节点标志

    // 合并 child.lanes 和 child.childLanes
    newChildLanes = mergeLanes(
      newChildLanes,
      mergeLanes(child.lanes, child.childLanes)
    );
    child.return = wip; // 设置子节点的返回指针
    child = child.sibling; // 移动到下一个兄弟节点
  }
  wip.subtreeFlags |= subtreeFlags; // 更新 wip 的子树标志
  wip.childLanes = newChildLanes; // 更新 wip 的子节点 lanes
};
```

### 讲解补充：

1. **React 的 Fiber 架构**：

   - Fiber 是 React 16 引入的一种新的协调算法，旨在提高渲染性能和用户体验。它允许 React 在渲染过程中中断和恢复工作，从而实现更流畅的用户界面。

2. **完成工作**：

   - `completeWork` 函数负责处理 Fiber 的更新和挂载逻辑。它根据不同的 Fiber 类型调用相应的处理函数，确保正确地更新或创建 DOM 节点。

3. **处理不同类型的 Fiber**：

   - 通过使用 `handlers` 对象，将不同类型的 Fiber 处理逻辑映射到对应的处理函数，简化了代码结构。

4. **属性传播**：

   - `bubbleProperties` 函数用于传播属性，合并子节点的标志和 lanes，以确保父节点能够正确反映其子节点的状态。

5. **类型安全**：
   - 代码中使用了 TypeScript 的类型注解，确保在编译时捕获潜在的类型错误。这有助于提高代码的可维护性和可靠性。

通过这些注释和讲解，希望能帮助你更好地理解这段代码的结构和功能。如果有任何具体问题或需要进一步的解释，请随时询问！
