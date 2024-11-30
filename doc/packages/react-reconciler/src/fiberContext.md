```tsx
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
```

### 讲解补充：

1. **上下文的概念**：

   - 在 React 中，上下文（Context）是一种用于在组件树中传递数据的方式，而不必通过每个组件的 props 逐层传递。上下文通常用于共享全局数据，如主题、用户信息等。

2. **上下文提供者**：

   - 上下文提供者（Provider）是一个组件，它允许其子组件访问上下文中的数据。通过 `pushProvider` 和 `popProvider` 函数，可以在组件树中动态地管理上下文的值。

3. **状态管理**：

   - `prevContextValue` 用于存储当前上下文的值，以便在需要时恢复。`prevContextValueStack` 是一个栈，用于存储嵌套上下文的值，支持多个上下文提供者的嵌套使用。

4. **推送和弹出上下文**：

   - `pushProvider` 函数用于将新的上下文值推入栈中，并更新当前上下文的值。`popProvider` 函数用于恢复上一个上下文值，并从栈中弹出。

5. **类型安全**：
   - 使用 TypeScript 的泛型（`<T>`）来确保上下文的类型安全，允许在不同上下文中使用不同的数据类型。

通过这些注释和讲解，希望能帮助你更好地理解这段代码的结构和功能。如果有任何具体问题或需要进一步的解释，请随时询问！
