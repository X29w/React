/**
 * workTags.ts - React Fiber 节点类型定义文件
 * 
 * 作用：
 * 1. 定义所有可能的 Fiber 节点类型
 * 2. 用于在 Fiber 树中标识不同类型的节点
 * 3. 帮助 React 在协调过程中正确处理不同类型的组件
 */

/**
 * 函数组件标识
 * 用于标识函数式组件创建的 Fiber 节点
 * @example
 * function App() { return <div>Hello</div> }
 * // App 组件对应的 Fiber 节点的 tag 值为 FunctionComponent (0)
 */
export const FunctionComponent:React.FunctionComponent = 0;

/**
 * 根节点标识
 * 用于标识应用的根节点（Root）
 * @example
 * ReactDOM.render(<App />, container)
 * // container 对应的 Fiber 节点的 tag 值为 HostRoot (3)
 */
export const HostRoot:React.HostRoot = 3;

/**
 * 原生 DOM 元素标识
 * 用于标识普通 HTML 元素的 Fiber 节点
 * @example
 * <div>Hello</div>
 * // div 对应的 Fiber 节点的 tag 值为 HostComponent (5)
 */
export const HostComponent:React.HostComponent = 5;

/**
 * 文本节点标识
 * 用于标识文本内容的 Fiber 节点
 * @example
 * <div>Hello World</div>
 * // "Hello World" 对应的 Fiber 节点的 tag 值为 HostText (6)
 */
export const HostText:React.HostText = 6;

/**
 * Fragment 标识
 * 用于标识 React.Fragment 的 Fiber 节点
 * @example
 * <React.Fragment>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </React.Fragment>
 * // Fragment 对应的 Fiber 节点的 tag 值为 Fragment (7)
 */
export const Fragment:React.Fragment = 7;

/**
 * Context Provider 标识
 * 用于标识 Context.Provider 的 Fiber 节点
 * @example
 * <MyContext.Provider value={value}>
 *   {children}
 * </MyContext.Provider>
 * // Provider 对应的 Fiber 节点的 tag 值为 ContextProvider (11)
 */
export const ContextProvider:React.ContextProvider = 11;

/**
 * Suspense 组件标识
 * 用于标识 Suspense 组件的 Fiber 节点
 * @example
 * <Suspense fallback={<Loading />}>
 *   <SomeComponent />
 * </Suspense>
 * // Suspense 对应的 Fiber 节点的 tag 值为 SuspenseComponent (13)
 */
export const SuspenseComponent:React.SuspenseComponent = 13;

/**
 * Offscreen 组件标识
 * 用于标识 Offscreen 组件的 Fiber 节点
 * 通常用于实现一些性能优化相关的功能
 * @example
 * // React 内部使用，用于优化渲染性能
 * // 对应的 Fiber 节点的 tag 值为 OffscreenComponent (14)
 */
export const OffscreenComponent:React.OffscreenComponent = 14;

/**
 * 使用示例：
 * 
 * function processFiber(fiber: FiberNode) {
 *   switch (fiber.tag) {
 *     case FunctionComponent:
 *       // 处理函数组件
 *       updateFunctionComponent(fiber);
 *       break;
 *     case HostComponent:
 *       // 处理 DOM 元素
 *       updateHostComponent(fiber);
 *       break;
 *     case HostText:
 *       // 处理文本节点
 *       updateTextContent(fiber);
 *       break;
 *     // ... 处理其他类型
 *   }
 * }
 */