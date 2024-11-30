```tsx
// 定义与 Hook 相关的副作用标志

/**
 * 被动效果标志
 * @constant
 * @type {number}
 * @default 0b0010
 * @description
 * 该标志用于表示与 useEffect 相关的副作用。
 * 当使用 useEffect 时，React 会在组件更新后执行副作用逻辑。
 */
export const Passive = 0b0010; // useEffect 对应的 effect

/**
 * 当前 effect 本次更新存在副作用的标志
 * @constant
 * @type {number}
 * @default 0b0001
 * @description
 * 该标志用于指示当前 effect 在本次更新中存在副作用。
 * 当一个 effect 被创建或更新时，如果它有副作用，React 会设置这个标志。
 */
export const HookHasEffect = 0b0001; // 当前 effect 本次更新存在副作用
```

### 讲解补充：

1. **副作用的概念**：

   - 在 React 中，副作用是指在组件渲染过程中可能会影响外部系统的操作，例如数据获取、DOM 操作、订阅等。React 使用副作用来处理这些操作，以确保组件在更新时能够正确地管理这些影响。

2. **被动效果标志**：

   - `Passive` 标志用于表示与 `useEffect` 相关的副作用。使用 `useEffect` 时，React 会在组件更新后执行副作用逻辑。这个标志帮助 React 确定哪些副作用需要在渲染后执行。

3. **当前 effect 存在副作用的标志**：

   - `HookHasEffect` 标志用于指示当前 effect 在本次更新中存在副作用。当一个 effect 被创建或更新时，如果它有副作用，React 会设置这个标志。这使得 React 能够在后续的渲染中正确处理这些副作用。

4. **位标志的使用**：

   - 代码中使用位标志（bit flags）来表示不同的副作用状态。这种方式的优点是可以通过位运算（如按位与、按位或）来组合和检查多个标志，从而提高性能和可读性。

5. **性能优化**：
   - 通过使用位标志，React 能够高效地管理和调度副作用，确保在组件更新时能够快速判断哪些副作用需要执行，从而提高整体性能。
