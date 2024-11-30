/**
 当前使用的hook集合
 */
const currentDispatcher: {
  current: React.Dispatcher | null;
} = {
  current: null,
};

export const resolveDispatcher = (): React.Dispatcher => {
  const dispatcher = currentDispatcher.current;

  if (dispatcher === null) {
    throw new Error("hook只能在函数中执行");
  }
  return dispatcher;
};

export default currentDispatcher;
