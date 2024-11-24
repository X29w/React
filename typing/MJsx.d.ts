declare module Jsx {
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
}
