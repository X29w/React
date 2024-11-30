```ts
// 定义不同的副作用标志
export const NoFlags = 0b0000000; // 没有副作用
export const Placement = 0b0000001; // 插入操作
export const Update = 0b0000010; // 更新操作
export const ChildDeletion = 0b0000100; // 删除操作
export const PassiveEffect = 0b0001000; // 当前 Fiber 上本次更新存在副作用
export const Ref = 0b0010000; // ref 操作

/**
 * Offscreen 组件的可见度标志
 * current Offscreen mode 和 wip Offscreen mode 的对比
 */
export const Visibility = 0b0100000; // Offscreen 的可见度发生变化（hide/visibility 的切换）

// 需要 unwind 的 suspense 标志
export const DidCapture = 0b1000000; // 捕获到的状态

export const ShouldCapture = 0b01000000000; // 在 render 阶段，捕获到一些东西（如 Error Bound / 抛出的挂载的数据）

/**
 * mutation 阶段要执行的标志
 * 包含插入、更新、删除、ref 和可见度的标志
 */
export const MutationMask =
  Placement | Update | ChildDeletion | Ref | Visibility; // mutation 阶段要执行的标志

/**
 * layout 阶段要执行的标志
 * 目前只包含 ref 操作
 */
export const LayoutMask = Ref; // layout 阶段要执行的标志

/**
 * 是否需要触发 useEffect 回调
 * 包含被动效果和子删除的标志
 */
export const PassiveMask = PassiveEffect | ChildDeletion; // passive 阶段要执行的标志
```

### 讲解补充：

1. **副作用的概念**：

   - 在 React 中，副作用是指在组件渲染过程中可能会影响外部系统的操作，例如 DOM 操作、数据获取、订阅等。React 使用标志来跟踪这些副作用，以便在更新时能够正确处理。

2. **位标志的使用**：

   - 代码中使用位标志（bit flags）来表示不同的副作用。这种方式的优点是可以通过位运算（如按位与、按位或）来组合和检查多个标志，从而提高性能和可读性。

3. **不同的副作用标志**：

   - `NoFlags`：表示没有副作用。
   - `Placement`：表示需要插入新的节点。
   - `Update`：表示需要更新现有节点。
   - `ChildDeletion`：表示需要删除子节点。
   - `PassiveEffect`：表示当前 Fiber 上存在被动效果。
   - `Ref`：表示需要处理 ref。
   - `Visibility`：表示 Offscreen 组件的可见度发生变化。
   - `DidCapture` 和 `ShouldCapture`：用于处理 Suspense 组件的状态捕获。

4. **Mutation 和 Layout 阶段**：

   - `MutationMask` 和 `LayoutMask` 分别定义了在不同阶段需要执行的副作用标志。Mutation 阶段主要处理 DOM 的插入、更新和删除，而 Layout 阶段主要处理与布局相关的操作（如 ref）。

5. **PassiveMask**：
   - `PassiveMask` 用于标识需要触发 `useEffect` 回调的情况，确保在组件更新后能够正确执行副作用。

通过这些注释和讲解，希望能帮助你更好地理解这段代码的结构和功能。如果有任何具体问题或需要进一步的解释，请随时询问！
