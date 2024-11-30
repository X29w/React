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
