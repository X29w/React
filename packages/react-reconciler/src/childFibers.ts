import {
  createFiberFromElement,
  createFiberFromFragment,
  createWorkInProgress,
  FiberNode,
} from "./fiber"; // 导入与 Fiber 相关的函数和类型
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from "shared/ReactSymbols"; // 导入 React 元素和片段的类型标识符
import { Fragment, HostText } from "./workTags"; // 导入不同类型的工作标签
import { ChildDeletion, Placement } from "./fiberFlags"; // 导入不同的 Fiber 标志

type ExistingChildren = Map<string | number, FiberNode>; // 定义现有子节点的类型

/**
 * ChildReconciler 函数用于处理子节点的协调逻辑。
 * @param shouldTrackEffects - 是否跟踪效果标志
 */
export function ChildReconciler(shouldTrackEffects: boolean) {
  /**
   * 删除指定的子节点。
   * @param returnFiber - 返回的 Fiber 节点
   * @param childToDelete - 要删除的子节点
   */
  function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
    if (!shouldTrackEffects) {
      return; // 如果不跟踪效果，直接返回
    }
    const deletions = returnFiber.deletions; // 获取当前 Fiber 的删除列表
    if (deletions === null) {
      // 当前父 Fiber 还没有需要删除的子 Fiber
      returnFiber.deletions = [childToDelete]; // 初始化删除列表
      returnFiber.flags |= ChildDeletion; // 标记为删除
    } else {
      deletions.push(childToDelete); // 添加到删除列表
    }
  }

  /**
   * 删除剩余的子节点。
   * @param returnFiber - 返回的 Fiber 节点
   * @param currentFirstChild - 当前第一个子节点
   */
  function deleteRemainingChildren(
    returnFiber: FiberNode,
    currentFirstChild: FiberNode | null
  ) {
    if (!shouldTrackEffects) {
      return; // 如果不跟踪效果，直接返回
    }

    let childToDelete = currentFirstChild; // 从当前第一个子节点开始
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete); // 删除子节点
      childToDelete = childToDelete.sibling; // 移动到下一个兄弟节点
    }
  }

  /**
   * 根据 ReactElement 对象创建 Fiber 并返回。
   * @param returnFiber - 返回的 Fiber 节点
   * @param currentFiber - 当前 Fiber 节点
   * @param element - ReactElement 对象
   * @returns 创建的 Fiber 节点
   */
  function reconcileSingleElement(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    element: React.ReactElementType
  ) {
    const key = element.key; // 获取元素的 key
    while (currentFiber !== null) {
      // key 相同
      if (currentFiber.key === key) {
        // 是 React 元素
        if (element.$$typeof === REACT_ELEMENT_TYPE) {
          // type 相同
          if (currentFiber.type === element.type) {
            let props = element.props; // 获取元素的 props
            if (element.type === REACT_FRAGMENT_TYPE) {
              props = element.props.children; // 如果是片段，获取子元素
            }
            const existing = useFiber(currentFiber, props); // 复用当前 Fiber
            existing.return = returnFiber; // 设置返回指针
            // 当前节点可以复用，需要标记剩下节点
            deleteRemainingChildren(returnFiber, currentFiber.sibling); // 删除其他兄弟节点
            return existing; // 返回复用的 Fiber
          }
          // 删除旧的（key 相同，type 不同）
          deleteRemainingChildren(returnFiber, currentFiber); // 删除所有旧的
          break;
        } else {
          if (__DEV__) {
            console.warn("还未实现的 React 类型", element); // 开发模式下警告
            break;
          }
        }
      } else {
        // key 不同
        deleteChild(returnFiber, currentFiber); // 删除当前子节点
        currentFiber = currentFiber.sibling; // 移动到下一个兄弟节点
      }
    }

    // 根据 element 创建 Fiber
    let fiber;
    if (element.type === REACT_FRAGMENT_TYPE) {
      fiber = createFiberFromFragment(element.props.children, key); // 创建片段 Fiber
    } else {
      fiber = createFiberFromElement(element); // 创建元素 Fiber
    }
    fiber.return = returnFiber; // 设置返回指针
    return fiber; // 返回创建的 Fiber
  }

  /**
   * 处理单一文本节点的协调。
   * @param returnFiber - 返回的 Fiber 节点
   * @param currentFiber - 当前 Fiber 节点
   * @param content - 文本内容
   * @returns 创建的 Fiber 节点
   */
  function reconcileSingleTextNode(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    content: string | number
  ): FiberNode {
    // update
    while (currentFiber !== null) {
      // 类型没有变，可以复用
      if (currentFiber.tag === HostText) {
        const existing = useFiber(currentFiber, { content }); // 复用当前文本节点
        existing.return = returnFiber; // 设置返回指针
        deleteRemainingChildren(returnFiber, currentFiber.sibling); // 标记其他兄弟节点删除
        return existing; // 返回复用的 Fiber
      }
      // 删掉之前的（之前的 div，现在是 hostText）
      deleteChild(returnFiber, currentFiber); // 删除当前子节点
      currentFiber = currentFiber.sibling; // 移动到下一个兄弟节点
    }
    const fiber = new FiberNode(HostText, { content }, null); // 创建新的文本节点
    fiber.return = returnFiber; // 设置返回指针
    return fiber; // 返回创建的 Fiber
  }

  /**
   * 插入单一的节点。
   * @param fiber - 要插入的 Fiber 节点
   * @returns 插入的 Fiber 节点
   */
  function placeSingleChild(fiber: FiberNode) {
    if (shouldTrackEffects && fiber.alternate === null) {
      // 首屏渲染的情况
      fiber.flags |= Placement; // 标记为插入
    }
    return fiber; // 返回插入的 Fiber
  }

  /**
   * 处理子节点数组的协调。
   * @param returnFiber - 返回的 Fiber 节点
   * @param currentFirstChild - 当前第一个子节点
   * @param newChild - 新的子节点数组
   * @returns 创建的第一个新 Fiber 节点
   */
  function reconcileChildrenArray(
    returnFiber: FiberNode,
    currentFirstChild: FiberNode | null,
    newChild: any[]
  ) {
    // 最后一个可复用 Fiber 在 current 中的 index
    let lastPlacedIndex = 0;
    // 创建的最后一个 Fiber
    let lastNewFiber: FiberNode | null = null;
    // 创建的第一个 Fiber
    let firstNewFiber: FiberNode | null = null;

    // 1. 将 current 保存在 map 中
    const existingChildren: ExistingChildren = new Map();
    let current = currentFirstChild;
    while (current !== null) {
      const keyToUse = current.key !== null ? current.key : current.index; // 获取 key
      existingChildren.set(keyToUse, current); // 将当前子节点存入 map
      current = current.sibling; // 移动到下一个兄弟节点
    }

    for (let i = 0; i < newChild.length; i++) {
      // 2. 遍历 newChild，寻找是否可复用
      const after = newChild[i];
      const newFiber = updateFromMap(returnFiber, existingChildren, i, after); // 更新或创建新的 Fiber

      // 更新后节点删除 newFiber 就是 null，此时就不用处理下面逻辑了
      if (newFiber === null) {
        continue; // 如果不能复用，跳过
      }

      // 3. 标记移动还是插入
      newFiber.index = i; // 设置索引
      newFiber.return = returnFiber; // 设置返回指针
      if (lastNewFiber === null) {
        lastNewFiber = newFiber; // 第一个新 Fiber
        firstNewFiber = newFiber; // 记录第一个新 Fiber
      } else {
        lastNewFiber.sibling = newFiber; // 设置兄弟关系
        lastNewFiber = lastNewFiber.sibling; // 更新最后一个新 Fiber
      }

      if (!shouldTrackEffects) {
        continue; // 如果不跟踪效果，跳过
      }

      const current = newFiber.alternate; // 获取当前 Fiber
      if (current !== null) {
        // update
        const oldIndex = current.index; // 获取旧的索引
        if (oldIndex < lastPlacedIndex) {
          // 移动
          newFiber.flags |= Placement; // 标记为插入
          continue; // 继续处理下一个
        } else {
          // 不移动
          lastPlacedIndex = oldIndex; // 更新最后放置的索引
        }
      } else {
        // mount
        newFiber.flags |= Placement; // 标记为插入
      }
    }

    // 4. 将 Map 中剩下的标记为删除
    existingChildren.forEach((fiber) => {
      deleteChild(returnFiber, fiber); // 删除剩余的子节点
    });
    return firstNewFiber; // 返回第一个新 Fiber
  }

  /**
   * 是否可复用（reconcileChildrenArray 中的第二步）
   * @param returnFiber - 返回的 Fiber 节点
   * @param existingChildren - 现有子节点的 Map
   * @param index - 当前索引
   * @param element - 新的子节点
   * @returns 可复用的 Fiber 节点或 null
   */
  function updateFromMap(
    returnFiber: FiberNode,
    existingChildren: ExistingChildren,
    index: number,
    element: any
  ): FiberNode | null {
    let keyToUse = element && element.key !== null ? element.key : index; // 获取 key
    // 兼容数组的情况，key 为 undefined，取索引
    if (Array.isArray(element)) {
      keyToUse = index; // 如果是数组，使用索引作为 key
    }
    const before = existingChildren.get(keyToUse); // 获取现有子节点

    if (typeof element === "string" || typeof element === "number") {
      // hostText 类型
      if (before) {
        if (before.tag === HostText) {
          // 证明可以复用
          existingChildren.delete(keyToUse); // 从 Map 中删除
          return useFiber(before, { content: element + "" }); // 复用文本节点
        }
      }
      return new FiberNode(HostText, { content: element + "" }, null); // 创建新的文本节点
    }

    // ReactElement 类型
    if (typeof element === "object" && element !== null) {
      switch (element.$$typeof) {
        case REACT_ELEMENT_TYPE:
          if (element.type === REACT_FRAGMENT_TYPE) {
            return updateFragment(
              returnFiber,
              before,
              element,
              keyToUse,
              existingChildren
            ); // 更新片段
          }
          if (before) {
            if (before.type === element.type) {
              // key 相同，type 相同可以复用
              existingChildren.delete(keyToUse); // 从 Map 中删除
              return useFiber(before, element.props); // 复用 Fiber
            }
          }
          return createFiberFromElement(element); // 创建新的 Fiber
      }

      // 数组类型 / fragment
      if (Array.isArray(element)) {
        return updateFragment(
          returnFiber,
          before,
          element,
          keyToUse,
          existingChildren
        ); // 更新片段
      }
    }
    return null; // 无法复用
  }

  /**
   * 协调子节点的主函数。
   * @param returnFiber - 返回的 Fiber 节点
   * @param currentFiber - 当前 Fiber 节点
   * @param newChild - 新的子节点
   * @returns 创建的第一个新 Fiber 节点
   */
  return function reconcileChildFibers(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    newChild?: any
  ) {
    // 判断 Fragment <></> 顶部根节点包裹
    const isUnkeyedTopLevelFragment =
      typeof newChild === "object" &&
      newChild !== null &&
      newChild.type === REACT_FRAGMENT_TYPE &&
      newChild.key === null;
    if (isUnkeyedTopLevelFragment) {
      newChild = newChild?.props.children; // 获取子元素
    }

    // 判断当前 Fiber 的类型
    if (typeof newChild === "object" && newChild !== null) {
      // 多节点的情况 ul > li * 3
      if (Array.isArray(newChild)) {
        return reconcileChildrenArray(returnFiber, currentFiber, newChild); // 处理子节点数组
      }
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFiber, newChild) // 处理单一元素
          );
        default:
          if (__DEV__) {
            console.warn("未实现的 reconcile 类型", newChild); // 开发模式下警告
          }
          break;
      }
    }
    // HostText
    if (typeof newChild === "string" || typeof newChild === "number") {
      return placeSingleChild(
        reconcileSingleTextNode(returnFiber, currentFiber, newChild) // 处理单一文本节点
      );
    }

    // 兜底操作
    if (currentFiber !== null) {
      deleteRemainingChildren(returnFiber, currentFiber); // 删除剩余的子节点
    }
    if (__DEV__) {
      console.warn("未实现的 reconcile 类型", newChild); // 开发模式下警告
    }
    return null; // 返回 null
  };
}

/**
 * 双缓存树原理：基于当前的 FiberNode 创建一个新的 FiberNode，而不用去调用 new FiberNode
 * @param {FiberNode} fiber 正在展示的 FiberNode
 * @param {Props} pendingProps 新的 Props
 * @returns {FiberNode} 新的 FiberNode
 */
function useFiber(fiber: FiberNode, pendingProps: React.Props): FiberNode {
  const clone = createWorkInProgress(fiber, pendingProps); // 创建工作中的 Fiber
  clone.index = 0; // 设置索引
  clone.sibling = null; // 清空兄弟关系
  return clone; // 返回新的 Fiber
}

/**
 * 更新片段的逻辑。
 * @param returnFiber - 返回的 Fiber 节点
 * @param current - 当前 Fiber 节点
 * @param elements - 片段中的元素
 * @param key - 片段的 key
 * @param existingChildren - 现有子节点的 Map
 * @returns 创建的 Fiber 节点
 */
function updateFragment(
  returnFiber: FiberNode,
  current: FiberNode | undefined,
  elements: any[],
  key: React.Key,
  existingChildren: ExistingChildren
) {
  let fiber;
  if (!current || current.tag !== Fragment) {
    // 不存在/更新前的 tag 不是 Fragment
    fiber = createFiberFromFragment(elements, key); // 创建新的片段 Fiber
  } else {
    // 存在并且类型还是 Fragment
    existingChildren.delete(key!); // 从 Map 中删除
    fiber = useFiber(current, elements); // 复用当前片段
  }
  fiber.return = returnFiber; // 设置返回指针
  return fiber; // 返回创建的 Fiber
}

// 创建 ChildReconciler 的实例，跟踪效果
export const reconcileChildFibers = ChildReconciler(true);
// 创建 ChildReconciler 的实例，不跟踪效果
export const mountChildFibers = ChildReconciler(false);

/**
 * 克隆子 Fiber 节点。
 * @param wip - 正在工作的 Fiber 节点
 */
export function cloneChildFibers(wip: FiberNode) {
  // child sibling
  if (wip.child === null) {
    return; // 如果没有子节点，直接返回
  }
  let currentChild = wip.child; // 获取当前子节点
  let newChild = createWorkInProgress(currentChild, currentChild.pendingProps); // 创建新的工作 Fiber
  wip.child = newChild; // 设置新的子节点
  newChild.return = wip; // 设置返回指针

  while (currentChild.sibling !== null) {
    currentChild = currentChild.sibling; // 移动到下一个兄弟节点
    newChild = newChild.sibling = createWorkInProgress(
      newChild,
      newChild.pendingProps // 创建新的工作 Fiber
    );
    newChild.return = wip; // 设置返回指针
  }
}
