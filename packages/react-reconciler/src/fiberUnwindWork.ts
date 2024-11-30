import { FiberNode } from "./fiber"; // 导入 FiberNode 类型
import { ContextProvider, SuspenseComponent } from "./workTags"; // 导入工作标签
import { popSuspenseHandler } from "./suspenseContext"; // 导入处理 Suspense 的函数
import { DidCapture, NoFlags, ShouldCapture } from "./fiberFlags"; // 导入 Fiber 标志
import { popProvider } from "./fiberContext"; // 导入处理上下文的函数

/**
 * unwind 的每一个 FiberNode 的具体操作
 * @param wip - 当前正在处理的 FiberNode
 * @returns 处理后的 FiberNode 或 null
 */
export const unwindWork = (wip: FiberNode) => {
  const flags = wip.flags; // 获取当前 FiberNode 的标志

  // 定义处理函数映射
  const unwindHandlers: Record<number, () => FiberNode | null> = {
    [SuspenseComponent]: () => {
      popSuspenseHandler(); // 弹出当前的 Suspense 处理器
      // 检查是否需要捕获异常
      if (
        (flags & ShouldCapture) !== NoFlags && // 如果需要捕获
        (flags & DidCapture) === NoFlags // 并且尚未捕获
      ) {
        // 找到了距离我们最近的 suspense
        wip.flags = (flags & ~ShouldCapture) | DidCapture; // 移除 ShouldCapture、添加 DidCapture
        return wip; // 返回当前 FiberNode
      }
      return null; // 如果不需要捕获，返回 null
    },
    [ContextProvider]: () => {
      const context = wip.type._context; // 获取上下文
      popProvider(context); // 弹出当前的上下文提供者
      return null; // 返回 null
    },
  };

  // 调用对应的处理函数，如果没有匹配则返回 null
  return unwindHandlers[wip.tag]?.() || null; // 使用可选链调用处理函数
};
