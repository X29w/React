let prevContextValue: any = null; // 存储上一个上下文的当前值
const prevContextValueStack: any[] = []; // 存储上下文值的栈，用于支持嵌套的上下文提供者

/**
 * 将新的上下文值推入上下文栈
 * @param context - 要推送的上下文对象
 * @param newValue - 新的上下文值
 * @template T - 上下文的类型
 */
export function pushProvider<T>(context: React.ReactContext<T>, newValue: T) {
  prevContextValueStack.push(prevContextValue); // 将当前上下文值推入栈中
  prevContextValue = context._currentValue; // 保存当前上下文的值
  context._currentValue = newValue; // 更新上下文的当前值为新的值
}

/**
 * 从上下文栈中弹出上一个上下文值
 * @param context - 要弹出的上下文对象
 * @template T - 上下文的类型
 */
export function popProvider<T>(context: React.ReactContext<T>) {
  /** 上一个上下文的当前值 */
  context._currentValue = prevContextValue; // 恢复上下文的当前值为上一个值
  prevContextValue = prevContextValueStack.pop(); // 从栈中弹出上一个值
}
