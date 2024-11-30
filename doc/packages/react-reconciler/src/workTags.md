```tsx
/**
 * Fiber 节点对应的 tag 属性
 *
 * 在 React 中，每个 Fiber 节点都有一个 tag 属性，用于标识该节点的类型。
 * 这些类型帮助 React 确定如何处理和渲染不同的组件。
 */

// 函数组件的标识
export const FunctionComponent = 0; // 表示函数组件

// 根节点的标识
export const HostRoot = 3; // 表示根 Fiber 节点，通常是 React 应用的入口

// 主机组件的标识
export const HostComponent = 5; // 表示原生 DOM 元素，例如 <div>、<span> 等

// 主机文本的标识
export const HostText = 6; // 表示文本节点，例如 <div> 中的文本内容 "123"

// Fragment 的标识
export const Fragment = 7; // 表示 React.Fragment，用于分组多个子节点而不添加额外的 DOM 节点

// 上下文提供者的标识
export const ContextProvider = 11; // 表示 Context.Provider 组件，用于提供上下文数据给其子组件

// export const ContextConsumer = 12; // 表示 Context.Consumer 组件，用于消费上下文数据（已注释）

// Suspense 组件的标识
export const SuspenseComponent = 13; // 表示 Suspense 组件，用于处理异步加载的内容

// Offscreen 组件的标识
export const OffscreenComponent = 14; // 表示 Offscreen 组件，用于在不渲染到屏幕上的情况下保持组件的状态
```

### 讲解补充：

1. **Fiber 节点的概念**：

   - 在 React 中，Fiber 是一种用于表示组件的内部数据结构。每个 Fiber 节点对应于一个组件实例，包含了该组件的状态、属性、子节点等信息。通过 Fiber，React 能够高效地管理和调度组件的更新。

2. **Tag 属性的作用**：

   - 每个 Fiber 节点都有一个 tag 属性，用于标识该节点的类型。这个属性帮助 React 确定如何处理和渲染不同类型的组件。例如，函数组件、原生 DOM 元素、文本节点等都有各自的标识。

3. **不同类型的 Fiber 节点**：

   - `FunctionComponent`：表示函数组件，React 会调用该函数来渲染组件。
   - `HostRoot`：表示根 Fiber 节点，通常是 React 应用的入口点。
   - `HostComponent`：表示原生 DOM 元素，例如 `<div>`、`<span>` 等，React 会将这些节点渲染为实际的 DOM 元素。
   - `HostText`：表示文本节点，React 会将这些节点渲染为文本内容。
   - `Fragment`：表示 React.Fragment，允许将多个子节点分组而不添加额外的 DOM 节点。
   - `ContextProvider`：表示上下文提供者组件，用于提供上下文数据给其子组件。
   - `SuspenseComponent`：表示 Suspense 组件，用于处理异步加载的内容，允许在数据加载时显示备用内容。
   - `OffscreenComponent`：表示 Offscreen 组件，用于在不渲染到屏幕上的情况下保持组件的状态，通常用于优化性能。

4. **性能优化**：
   - 通过使用 Fiber 节点和 tag 属性，React 能够高效地管理组件的渲染和更新。不同类型的节点可以使用不同的渲染策略，从而提高性能和用户体验。
