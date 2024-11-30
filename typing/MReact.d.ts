declare module React {
  /** 在这里集中定义React的类型 */

  /** 定义 React 的 Type 类型 */
  export type Type = any;

  /** 定义 React 的 Key 类型 */
  export type Key = string | null;

  /** 定义 React 的 Ref 类型 */
  export type Ref<T = any> =
    | { current: T | null }
    | ((instance: T | null) => void)
    | null;

  /** 定义 React 的 Props 类型 */
  export type Props = {
    [key: string]: any;
    children?: any;
  };

  /** 定义 React 的 ElementType 类型 */
  export type ElementType = number | symbol;

  /** 定义 React 的 ReactElement 类型 */
  export interface ReactElementType {
    $$typeof: symbol | number;
    type: ElementType;
    key: Key;
    ref: Ref;
    props: Props;
    __mark: string;
  }

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

  export type Flags = number;

  export type Lane = number;
  // 集合
  export type Lanes = number;

  export interface PendingPassiveEffects {
    unmount: Effect[];
    update: Effect[];
  }

  export interface OffscreenProps {
    mode: "hidden" | "visible";
    children: any;
  }

  export type Container = Element;

  export interface Dispatcher {
    useState: <T>(initialState: (() => T) | T) => [T, Dispatch<T>];
    useEffect: (callback: () => void, deps: any[] | void) => void;
    useTransition: () => [boolean, (callback: () => void) => void];
    useRef: <T>(initialValue: T) => { current: T };
    useContext: <T>(context: ReactContext<T>) => T;
    use: <T>(usable: Usable<T>) => T;
  }

  export type Dispatch<State> = (action: Action<State>) => void;

  export type Container = Element;
  export type Instance = Element;
  export type TestInstance = Text;

  export type Action<State> = State | ((prevState: State) => State);

  export type ReactContext<T> = {
    $$typeof: symbol | number;
    Provider: ReactProviderType<T> | null;
    _currentValue: T;
  };

  export type ReactProviderType<T> = {
    $$typeof: symbol | number;
    _context: ReactContext<T>;
  };

  export type Usable<T> = Thenable<T> | ReactContext<T>;

  // 1. untracked: 没有追踪到的状态
  // 2. pending: promise的pending状态
  // 3. fulfilled: promise的resolved状态
  // 4. rejected: promise的rejected状态
  export type Thenable<T, Result = void, Err = any> =
    | UntrackedThenable<T, Result, Err>
    | PendingThenable<T, Result, Err>
    | FulfilledThenable<T, Result, Err>
    | RejectedThenable<T, Result, Err>;

  /**
   * 唤起更新的意思
   */
  export interface Awakened<Result = any> {
    then(
      onFulfill: () => Result,
      onReject: () => Result
    ): void | Awakened<Result>;
  }

  export interface ThenableImpl<T, Result, Err> {
    then(
      onFulfill: (value: T) => Result,
      onReject: (error: Err) => Result
    ): void | Awakened<Result>;
  }

  interface UntrackedThenable<T, Result, Err>
    extends ThenableImpl<T, Result, Err> {
    status?: void;
  }

  export interface PendingThenable<T, Result, Err>
    extends ThenableImpl<T, Result, Err> {
    status: "pending";
  }

  export interface FulfilledThenable<T, Result, Err>
    extends ThenableImpl<T, Result, Err> {
    status: "fulfilled";
    value: T;
  }

  export interface RejectedThenable<T, Result, Err>
    extends ThenableImpl<T, Result, Err> {
    status: "rejected";
    reason: Err;
  }

  export interface SyntheticEvent extends Event {
    __stopPropagation: boolean;
  }

  export interface Paths {
    capture: EventCallback[];
    bubble: EventCallback[];
  }

  export interface DOMElement extends Element {
    [elementPropsKey]: Props;
    __props: Props;
  }

  export interface Hook {
    memoizedState: any;
    updateQueue: unknown;
    next: Hook | null;
    baseState: any;
    baseQueue: Update<any> | null;
  }

  export type EffectCallback = () => void;
  export type EffectDeps = any[] | null;

  export interface Effect {
    tag: React.Flags;
    create: EffectCallback | void;
    destroy: EffectCallback | void;
    deps: EffectDeps;
    next: Effect | null;
  }

  export interface FCUpdateQueue<State> extends UpdateQueue<State> {
    lastEffect: Effect | null;
  }


  /**
 * 更新方式
 * this.setState(xxx) / this.setState(x => xx)
 */
export interface Update<State> {
  action: React.Action<State>;
  lane: React.Lane;
  next: Update<any> | null;
}

export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null;
  };
  dispatch: React.Dispatch<State> | null;
}

}
