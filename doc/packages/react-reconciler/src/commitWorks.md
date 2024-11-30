```tsx
import { FiberNode, FiberRootNode } from "./fiber"; // 导入 FiberNode 和 FiberRootNode 类型
import {
  ChildDeletion,
  LayoutMask,
  MutationMask,
  NoFlags,
  PassiveEffect,
  PassiveMask,
  Placement,
  Ref,
  Update,
  Visibility,
} from "./fiberFlags"; // 导入不同的 Fiber 标志
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  OffscreenComponent,
} from "./workTags"; // 导入不同类型的工作标签
import {
  appendChildToContainer,
  commitUpdate,
  hideInstance,
  hideTextInstance,
  insertChildToContainer,
  removeChild,
  unhideInstance,
  unhideTextInstance,
} from "react-dom/src/hostConfig"; // 导入与 DOM 操作相关的函数
import { HookHasEffect } from "./hookEffectTags"; // 导入 Hook 的效果标志

let nextEffect: FiberNode | null = null; // 用于跟踪下一个要处理的 Fiber

/**
 * commit 副作用入口，使用深度优先搜索 (DFS) 形式
 * @param mask - 需要处理的标志
 * @param callback - 处理每个 Fiber 的回调函数
 * @returns 处理函数
 */
const commitEffects = (
  mask: React.Flags,
  callback: (fiber: FiberNode, root: FiberRootNode) => void
) => {
  return (finishedWork: FiberNode, root: FiberRootNode) => {
    nextEffect = finishedWork; // 初始化下一个要处理的 Fiber

    while (nextEffect !== null) {
      const child: FiberNode | null = nextEffect.child; // 获取当前 Fiber 的子节点
      // 向下遍历
      if ((nextEffect.subtreeFlags & mask) !== NoFlags && child !== null) {
        nextEffect = child; // 继续向下遍历子节点
      } else {
        // 向上遍历 DFS
        up: while (nextEffect !== null) {
          callback(nextEffect, root); // 处理当前 Fiber
          const sibling: FiberNode | null = nextEffect.sibling; // 获取当前 Fiber 的兄弟节点
          if (sibling !== null) {
            nextEffect = sibling; // 如果有兄弟节点，处理兄弟节点
            break up; // 退出内层循环
          }
          nextEffect = nextEffect.return; // 向上返回
        }
      }
    }
  };
};

/**
 * 处理 Fiber 的变更效果
 * @param finishedWork - 完成的工作 Fiber
 * @param root - Fiber 树的根节点
 */
const commitMutationEffectsOnFibers = (
  finishedWork: FiberNode,
  root: FiberRootNode
) => {
  const { flags, tag } = finishedWork; // 获取当前 Fiber 的标志和类型

  // 处理插入
  if ((flags & Placement) !== NoFlags) {
    commitPlacement(finishedWork); // 执行插入操作
    finishedWork.flags &= ~Placement; // 清除插入标志
  }
  // 处理更新
  if ((flags & Update) !== NoFlags) {
    commitUpdate(finishedWork); // 执行更新操作
    finishedWork.flags &= ~Update; // 清除更新标志
  }
  // 处理子节点删除
  if ((flags & ChildDeletion) !== NoFlags) {
    const deletions = finishedWork.deletions; // 获取待删除的子节点
    if (deletions !== null) {
      deletions.forEach((childToDelete) => {
        commitDeletion(childToDelete, root); // 处理每个待删除的子节点
      });
    }
    finishedWork.flags &= ~ChildDeletion; // 清除删除标志
  }

  // 处理被动效果
  if ((flags & PassiveEffect) !== NoFlags) {
    commitPassiveEffect(finishedWork, root, "update"); // 收集被动效果的回调
    finishedWork.flags &= ~PassiveEffect; // 清除被动效果标志
  }

  // 解绑之前的 Ref
  if ((flags & Ref) !== NoFlags && tag === HostComponent) {
    safelyDetachRef(finishedWork); // 安全解绑 Ref
  }

  // 处理 OffscreenComponent 的可见性变化
  if ((flags & Visibility) !== NoFlags && tag === OffscreenComponent) {
    const isHidden = finishedWork.pendingProps.mode === "hidden"; // 判断是否隐藏
    hideOrUnhideAllChildren(finishedWork, isHidden); // 处理子节点的隐藏或显示
    finishedWork.flags &= ~Visibility; // 清除可见性标志
  }
};

/**
 * 处理 OffscreenComponent 中的子 Host 节点
 * @param finishedWork - 完成的工作 Fiber
 * @param isHidden - 是否隐藏
 */
function hideOrUnhideAllChildren(finishedWork: FiberNode, isHidden: boolean) {
  // 1. 找到所有子树的顶层 Host 节点
  findHostSubtreeRoot(finishedWork, (hostRoot) => {
    // 2. 标记隐藏或展示
    const instance = hostRoot.stateNode; // 获取 Host 节点的实例
    if (hostRoot.tag === HostComponent) {
      isHidden ? hideInstance(instance) : unhideInstance(instance); // 隐藏或显示实例
    } else if (hostRoot.tag === HostText) {
      isHidden
        ? hideTextInstance(instance) // 隐藏文本实例
        : unhideTextInstance(instance, hostRoot.memoizedProps!.content); // 显示文本实例
    }
  });
}

/**
 * 查找子树的顶层 Host 节点
 * @param finishedWork - 完成的工作 Fiber
 * @param callback - 处理每个 Host 子树根节点的回调函数
 */
function findHostSubtreeRoot(
  finishedWork: FiberNode,
  callback: (hostSubtreeRoot: FiberNode) => void
) {
  let node = finishedWork; // 从完成的工作 Fiber 开始
  let hostSubtreeRoot = null; // 子树顶层的 Host 节点

  while (true) {
    if (node.tag === HostComponent) {
      if (hostSubtreeRoot === null) {
        hostSubtreeRoot = node; // 找到顶层 Host 节点
        callback(node); // 调用回调
      }
    } else if (node.tag === HostRoot) {
      if (hostSubtreeRoot === null) {
        callback(node); // 调用回调
      }
    } else if (
      node.tag === OffscreenComponent &&
      node.pendingProps.mode === "hidden" &&
      node !== finishedWork
    ) {
      // 内嵌 Suspense，什么都不需要单独做，嵌套内部就处理
    } else if (node.child !== null) {
      node.child.return = node; // 设置子节点的返回指针
      node = node.child; // 向下遍历
      continue;
    }

    if (node === finishedWork) {
      return; // 终止条件
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === finishedWork) {
        return; // 终止条件
      }
      if (hostSubtreeRoot === node) {
        hostSubtreeRoot = null; // 重置顶层 Host 节点
      }
      node = node.return; // 向上返回
    }

    if (hostSubtreeRoot === node) {
      hostSubtreeRoot = null; // 重置顶层 Host 节点
    }
    node.sibling.return = node.return; // 设置兄弟节点的返回指针
    node = node.sibling; // 移动到下一个兄弟节点
  }
}

/**
 * 安全解绑当前的 Ref
 * @param current - 当前 Fiber 节点
 */
function safelyDetachRef(current: FiberNode) {
  const ref = current.ref; // 获取当前 Fiber 的 Ref
  if (ref !== null) {
    if (typeof ref === "function") {
      ref(null); // 如果是函数，调用并传入 null
    } else {
      ref.current = null; // 如果是对象，设置 current 为 null
    }
  }
}

/**
 * commit 副作用入口，使用 DFS 形式
 * @param finishedWork - 完成的工作 Fiber
 */
export const commitMutationEffects = commitEffects(
  MutationMask | PassiveMask,
  commitMutationEffectsOnFibers
);

/**
 * layout 阶段
 * @param finishedWork - 完成的工作 Fiber
 */
const commitLayoutEffectsOnFibers = (finishedWork: FiberNode) => {
  const { flags, tag } = finishedWork; // 获取当前 Fiber 的标志和类型

  if ((flags & Ref) !== NoFlags && tag === HostComponent) {
    // 绑定新的 Ref
    safelyAttachRef(finishedWork); // 安全绑定 Ref
  }
};

// commit layout effects
export const commitLayoutEffects = commitEffects(
  LayoutMask,
  commitLayoutEffectsOnFibers
);

/**
 * 安全绑定 Ref
 * @param fiber - Fiber 节点
 */
function safelyAttachRef(fiber: FiberNode) {
  const ref = fiber.ref; // 获取 Fiber 的 Ref
  if (ref !== null) {
    const instance = fiber.stateNode; // 获取 Fiber 的实例
    if (typeof ref === "function") {
      ref(instance); // 如果是函数，调用并传入实例
    } else {
      ref.current = instance; // 如果是对象，设置 current 为实例
    }
  }
}

/**
 * 提交被动效果
 * @param fiber - Fiber 节点
 * @param root - Fiber 树的根节点
 * @param type - 被动效果的类型
 */
function commitPassiveEffect(
  fiber: FiberNode,
  root: FiberRootNode,
  type: keyof React.PendingPassiveEffects
) {
  // update unmount
  if (
    fiber.tag !== FunctionComponent ||
    (type === "update" && (fiber.flags & PassiveEffect) === NoFlags)
  ) {
    return; // 如果不是函数组件或没有被动效果，直接返回
  }
  const updateQueue = fiber.updateQueue as React.FCUpdateQueue<any>; // 获取更新队列
  if (updateQueue !== null) {
    if (updateQueue.lastEffect === null && __DEV__) {
      console.error("当 FC 存在 PassiveEffect flags 时，不应该不存在 effect");
    }
    root.pendingPassiveEffects[type].push(
      updateQueue.lastEffect as React.Effect // 将最后的 effect 添加到待处理的被动效果中
    );
  }
}

/**
 * 提交 Hook 效果列表
 * @param flags - 效果标志
 * @param lastEffect - 最后一个效果
 * @param callback - 处理每个效果的回调
 */
function commitHookEffectList(
  flags: React.Flags,
  lastEffect: React.Effect,
  callback: (effect: React.Effect) => void
) {
  let effect = lastEffect.next as React.Effect; // 获取下一个效果
  do {
    if ((effect.tag & flags) === flags) {
      callback(effect); // 调用回调处理效果
    }
    effect = effect.next as React.Effect; // 移动到下一个效果
  } while (effect !== lastEffect.next); // 循环直到回到最后一个效果
}

/**
 * 提交 Hook 效果列表的卸载
 * @param flags - 效果标志
 * @param lastEffect - 最后一个效果
 */
export function commitHookEffectListUnmount(
  flags: React.Flags,
  lastEffect: React.Effect
) {
  commitHookEffectList(flags, lastEffect, (effect) => {
    const destroy = effect.destroy; // 获取销毁函数
    if (typeof destroy === "function") {
      destroy(); // 调用销毁函数
    }
    effect.tag &= ~HookHasEffect; // 清除 HookHasEffect 标志
  });
}

/**
 * 提交 Hook 效果列表的销毁
 * @param flags - 效果标志
 * @param lastEffect - 最后一个效果
 */
export function commitHookEffectListDestroy(
  flags: React.Flags,
  lastEffect: React.Effect
) {
  commitHookEffectList(flags, lastEffect, (effect) => {
    const destroy = effect.destroy; // 获取销毁函数
    if (typeof destroy === "function") {
      destroy(); // 调用销毁函数
    }
  });
}

/**
 * 提交 Hook 效果列表的创建
 * @param flags - 效果标志
 * @param lastEffect - 最后一个效果
 */
export function commitHookEffectListCreate(
  flags: React.Flags,
  lastEffect: React.Effect
) {
  commitHookEffectList(flags, lastEffect, (effect) => {
    const create = effect.create; // 获取创建函数
    if (typeof create === "function") {
      effect.destroy = create(); // 调用创建函数并保存销毁函数
    }
  });
}

/**
 * 记录要删除的子节点
 * @param childrenToDelete - 要删除的子节点数组
 * @param unmountFiber - 要卸载的 Fiber 节点
 */
function recordHostChildrenToDelete(
  childrenToDelete: FiberNode[],
  unmountFiber: FiberNode
) {
  // 1. 找到第一个 root host 节点
  const lastOne = childrenToDelete[childrenToDelete.length - 1];
  if (!lastOne) {
    childrenToDelete.push(unmountFiber); // 如果没有，直接添加
  } else {
    // 2. 每找到一个 host 节点，判断下这个节点是不是第一个的兄弟节点
    let node = lastOne.sibling; // 获取最后一个的兄弟节点
    while (node !== null) {
      if (unmountFiber === node) {
        childrenToDelete.push(unmountFiber); // 如果是，添加到删除列表
      }
      node = node.sibling; // 移动到下一个兄弟节点
    }
  }
}

/**
 * 删除对应的子 Fiber 节点
 * @param childToDelete - 要删除的子 Fiber 节点
 * @param root - Fiber 树的根节点
 */
function commitDeletion(childToDelete: FiberNode, root: FiberRootNode) {
  const rootChildrenToDelete: FiberNode[] = []; // 存储要删除的根子节点
  // 递归子树
  commitNestedComponent(childToDelete, (unmountFiber) => {
    switch (unmountFiber.tag) {
      case HostComponent:
        recordHostChildrenToDelete(rootChildrenToDelete, unmountFiber); // 记录要删除的子节点
        safelyDetachRef(unmountFiber); // 安全解绑 Ref
        return;
      case HostText:
        recordHostChildrenToDelete(rootChildrenToDelete, unmountFiber); // 记录要删除的子节点
        return;
      case FunctionComponent:
        commitPassiveEffect(unmountFiber, root, "unmount"); // 提交被动效果
        return;
      default:
        if (__DEV__) {
          console.warn("未处理的 unmount 类型", unmountFiber); // 开发模式下警告
        }
        break;
    }
  });
  // 移除 rootHostNode 的 DOM
  if (rootChildrenToDelete.length) {
    const hostParent = getHostParent(childToDelete); // 获取父节点
    if (hostParent !== null) {
      rootChildrenToDelete.forEach((node) => {
        removeChild(node.stateNode, hostParent); // 从父节点中移除子节点
      });
    }
  }
  childToDelete.return = null; // 清空返回指针
  childToDelete.child = null; // 清空子节点
}

/**
 * 提交嵌套组件的卸载
 * @param root - 根 Fiber 节点
 * @param onCommitUnmount - 卸载时的回调函数
 */
function commitNestedComponent(
  root: FiberNode,
  onCommitUnmount: (fiber: FiberNode) => void
) {
  let node = root; // 从根节点开始
  while (true) {
    onCommitUnmount(node); // 调用卸载回调

    if (node.child !== null) {
      // 向下遍历
      node.child.return = node; // 设置子节点的返回指针
      node = node.child; // 移动到子节点
      continue;
    }

    if (node === root) {
      // 终止条件
      return;
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === root) {
        return; // 终止条件
      }
      // 向上返回
      node = node.return; // 移动到父节点
    }
    node.sibling.return = node.return; // 设置兄弟节点的返回指针
    node = node.sibling; // 移动到下一个兄弟节点
  }
}

/**
 * 提交插入操作
 * @param finishWork - 完成的工作 Fiber
 */
const commitPlacement = (finishWork: FiberNode) => {
  if (__DEV__) {
    console.warn("执行 commitPlacement 操作", finishWork); // 开发模式下警告
  }
  // parentDom 插入 finishWork 对应的 DOM

  // 1. 找到 parentDom
  const hostParent = getHostParent(finishWork); // 获取父节点

  // host sibling
  const sibling = getHostSibling(finishWork); // 获取兄弟节点

  if (hostParent !== null) {
    insertOrAppendPlacementNodeIntoContainer(finishWork, hostParent, sibling); // 插入或追加节点
  }
};

/**
 * 获取相邻的真正的 DOM 节点
 * @param fiber - Fiber 节点
 * @returns 相邻的 DOM 节点或 null
 */
function getHostSibling(fiber: FiberNode) {
  let node: FiberNode = fiber; // 从当前 Fiber 开始

  findSibling: while (true) {
    // 向上遍历
    while (node.sibling === null) {
      const parent = node.return; // 获取父节点
      if (
        parent === null ||
        parent.tag === HostComponent ||
        parent.tag === HostRoot
      ) {
        return null; // 如果没有父节点或是 Host 节点，返回 null
      }
      node = parent; // 移动到父节点
    }

    node.sibling.return = node.return; // 设置兄弟节点的返回指针
    node = node.sibling; // 移动到下一个兄弟节点

    while (node.tag !== HostText && node.tag !== HostComponent) {
      // 向下遍历，找到稳定（noFlags）的 div 或文本节点
      if ((node.flags & Placement) !== NoFlags) {
        // 节点不稳定
        continue findSibling; // 继续查找兄弟节点
      }

      if (node.child === null) {
        continue findSibling; // 如果没有子节点，继续查找兄弟节点
      } else {
        // 向下遍历
        node.child.return = node; // 设置子节点的返回指针
        node = node.child; // 移动到子节点
      }
    }

    if ((node.flags & Placement) === NoFlags) {
      return node.stateNode; // 返回稳定的 DOM 节点
    }
  }
}

/**
 * 获取 Host 父节点
 * @param fiber - Fiber 节点
 * @returns Host 父节点或 null
 */
function getHostParent(fiber: FiberNode): React.Container | null {
  let parent = fiber.return; // 从当前 Fiber 的返回指针开始
  while (parent) {
    const parentTag = parent.tag; // 获取父节点的类型
    // HostComponent  HostRoot
    if (parentTag === HostComponent) {
      return parent.stateNode; // 返回 Host 组件的状态节点
    }
    if (parentTag === HostRoot) {
      return (parent.stateNode as FiberRootNode).container; // 返回根节点的容器
    }
    parent = parent.return; // 移动到父节点
  }
  if (__DEV__) {
    console.warn("未找到 HostParent"); // 开发模式下警告
  }
  return null; // 如果没有找到，返回 null
}

/**
 * 插入或追加节点到容器
 * @param finishedWork - 完成的工作 Fiber
 * @param hostParent - 容器
 * @param before - 可选的兄弟节点
 */
function insertOrAppendPlacementNodeIntoContainer(
  finishedWork: FiberNode,
  hostParent: React.Container,
  before?: React.Instance
) {
  // fiber Host
  if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
    if (before) {
      insertChildToContainer(finishedWork.stateNode, hostParent, before); // 插入到指定位置
    } else {
      appendChildToContainer(hostParent, finishedWork.stateNode); // 追加到容器
    }
    return;
  }

  const child = finishedWork.child; // 获取子节点
  if (child !== null) {
    insertOrAppendPlacementNodeIntoContainer(child, hostParent); // 递归处理子节点

    let sibling = child.sibling; // 获取兄弟节点

    while (sibling !== null) {
      insertOrAppendPlacementNodeIntoContainer(sibling, hostParent); // 递归处理兄弟节点
      sibling = sibling.sibling; // 移动到下一个兄弟节点
    }
  }
  return null; // 返回 null
}
```

### 讲解补充：

1. **React 的 Fiber 架构**：

   - Fiber 是 React 16 引入的一种新的协调算法，旨在提高渲染性能和用户体验。它允许 React 在渲染过程中中断和恢复工作，从而实现更流畅的用户界面。

2. **commit 阶段**：

   - 代码中处理了 React 的 commit 阶段，主要负责将变更应用到 DOM 中。这个阶段包括处理插入、更新、删除等操作。

3. **副作用处理**：

   - `commitEffects` 函数负责处理副作用，包括更新、插入和删除等操作。它使用深度优先搜索 (DFS) 的方式遍历 Fiber 树。

4. **Ref 的处理**：

   - 代码中处理了 Ref 的绑定和解绑，确保在组件更新时正确管理 Ref 的引用。

5. **被动效果**：

   - 代码中处理了函数组件的被动效果，确保在组件卸载时正确清理副作用。

6. **类型安全**：
   - 代码中使用了 TypeScript 的类型注解，确保在编译时捕获潜在的类型错误。这有助于提高代码的可维护性和可靠性。

通过这些注释和讲解，希望能帮助你更好地理解这段代码的结构和功能。如果有任何具体问题或需要进一步的解释，请随时询问！
