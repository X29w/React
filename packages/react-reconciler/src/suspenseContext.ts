import { FiberNode } from "./fiber"; // 导入 FiberNode 类型

// 用于存储当前的 Suspense 处理器的栈
const suspenseHandlerStack: FiberNode[] = [];

/**
 * 获取当前的 Suspense 处理器
 * @returns {FiberNode | undefined} - 返回栈顶的 FiberNode，如果栈为空则返回 undefined
 */
export const getSuspenseHandler = () =>
  suspenseHandlerStack[suspenseHandlerStack.length - 1]; // 返回栈顶的 Suspense 处理器

/**
 * 将新的 Suspense 处理器推入栈中
 * @param {FiberNode} fiber - 要推入的 FiberNode
 */
export const pushSuspenseHandler = (fiber: FiberNode) =>
  suspenseHandlerStack.push(fiber); // 将新的 FiberNode 推入栈中

/**
 * 从栈中弹出当前的 Suspense 处理器
 * @returns {FiberNode | undefined} - 返回弹出的 FiberNode，如果栈为空则返回 undefined
 */
export const popSuspenseHandler = () => suspenseHandlerStack.pop(); // 从栈中弹出并返回栈顶的 FiberNode
