/**
 * 当前使用的hook集合
 */
const currentDispatcher: {
  current: React.Dispatcher | null; // 定义一个对象，包含一个可为 React.Dispatcher 或 null 的 current 属性
} = {
  current: null, // 初始化 current 属性为 null，表示当前没有激活的 dispatcher
};

// 定义一个函数 resolveDispatcher，用于获取当前的 dispatcher
export const resolveDispatcher = (): React.Dispatcher => {
  const dispatcher = currentDispatcher.current; // 从 currentDispatcher 中获取当前的 dispatcher

  // 检查 dispatcher 是否为 null
  if (dispatcher === null) {
    // 如果为 null，抛出错误，提示 hook 只能在函数中执行
    throw new Error("hook只能在函数中执行");
  }
  return dispatcher; // 返回当前的 dispatcher
};

// 导出 currentDispatcher 以便在其他模块中使用
export default currentDispatcher;
