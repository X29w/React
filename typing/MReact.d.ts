declare module React {
  /**
   * React 配置对象的类型定义
   * @interface JsxConfig
   * @property {Key} [key] - 可选的 key 属性，用于 React 的 diff 算法
   * @property {Ref} [ref] - 可选的 ref 属性，用于获取 DOM 或组件实例
   * @property {any} [key: string] - 允许任意其他字符串键的属性
   */
  export interface JsxConfig {
    [key: string]: any;
    key?: Key;
    ref?: Ref;
  }

  /**
   * BatchConfig 接口定义
   *
   * @interface BatchConfig
   * @property {number | null} transition - Transition 的标识符
   *
   * 说明：
   * 1. 当 transition 为 null 时，表示普通更新
   * 2. 当 transition 为数字时，表示这是一个 Transition 更新
   *
   * @example
   * // 在 useTransition 中的使用
   * const [isPending, startTransition] = useTransition();
   * startTransition(() => {
   *   // 在这个回调中，ReactCurrentBatchConfig.transition 会被设置为一个数字
   *   setCount(count + 1);
   * });
   */
  export interface BatchConfig {
    transition: number | null;
  }

  /**
   * 函数组件标识
   * 用于标识函数式组件创建的 Fiber 节点
   * @example
   * function App() { return <div>Hello</div> }
   * // App 组件对应的 Fiber 节点的 tag 值为 FunctionComponent (0)
   */
  export type FunctionComponent = 0;

  /**
   * 根节点标识
   * 用于标识应用的根节点（Root）
   * @example
   * ReactDOM.render(<App />, container)
   * // container 对应的 Fiber 节点的 tag 值为 HostRoot (3)
   */
  export type HostRoot = 3;

  /**
   * 原生 DOM 元素标识
   * 用于标识普通 HTML 元素的 Fiber 节点
   * @example
   * <div>Hello</div>
   * // div 对应的 Fiber 节点的 tag 值为 HostComponent (5)
   */
  export type HostComponent = 5;

  /**
   * 文本节点标识
   * 用于标识文本内容的 Fiber 节点
   * @example
   * <div>Hello World</div>
   * // "Hello World" 对应的 Fiber 节点的 tag 值为 HostText (6)
   */
  export type HostText = 6;

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
  export type Fragment = 7;

  /**
   * Context Provider 标识
   * 用于标识 Context.Provider 的 Fiber 节点
   * @example
   * <MyContext.Provider value={value}>
   *   {children}
   * </MyContext.Provider>
   * // Provider 对应的 Fiber 节点的 tag 值为 ContextProvider (11)
   */
  export type ContextProvider = 11;

  /**
   * Suspense 组件标识
   * 用于标识 Suspense 组件的 Fiber 节点
   * @example
   * <Suspense fallback={<Loading />}>
   *   <SomeComponent />
   * </Suspense>
   * // Suspense 对应的 Fiber 节点的 tag 值为 SuspenseComponent (13)
   */
  export type SuspenseComponent = 13;

  /**
   * Offscreen 组件标识
   * 用于标识 Offscreen 组件的 Fiber 节点
   * 通常用于实现一些性能优化相关的功能
   * @example
   * // React 内部使用，用于优化渲染性能
   * // 对应的 Fiber 节点的 tag 值为 OffscreenComponent (14)
   */
  export type OffscreenComponent = 14;

  /**
   * WorkTag 类型定义
   * 联合类型，包含所有可能的 Fiber 节点类型标识
   * 在 FiberNode 的 tag 属性中使用
   */
  export type WorkTag =
    | typeof FunctionComponent // 函数组件
    | typeof HostRoot // 根节点
    | typeof HostComponent // 原生 DOM 元素
    | typeof HostText // 文本节点
    | typeof Fragment // Fragment 片段
    | typeof ContextProvider // Context Provider 组件
    | typeof SuspenseComponent // Suspense 组件
    | typeof OffscreenComponent; // Offscreen 组件
}
