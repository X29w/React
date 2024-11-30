/**
 * React 内部符号定义文件
 *
 * 详细讲解：
 * 1. 这是 React 的核心类型系统文件
 * 2. 定义了所有 React 内部组件和元素的唯一标识符
 * 3. 这些标识符用于类型检查和验证
 */

/**
 * Symbol 支持检测
 *
 * 详细讲解：
 * 1. 首先检查 Symbol 是否作为函数存在
 * 2. 然后检查是否支持 Symbol.for 方法
 * 3. Symbol.for 用于全局符号注册表，确保跨模块使用相同的 Symbol
 */
const supportSymbol = typeof Symbol === "function" && Symbol.for;

/**
 * REACT_ELEMENT_TYPE
 *
 * 详细讲解：
 * 1. 这是最基础的 React 元素类型标识
 * 2. 每个通过 React.createElement() 创建的元素都会带有此标识
 * 3. React 内部会通过这个标识来验证元素的合法性
 * 4. 当使用 JSX 时，babel 会将 JSX 转换为使用这个标识的函数调用
 */
export const REACT_ELEMENT_TYPE = supportSymbol
  ? Symbol.for("react.element")
  : 0xeac7;

/**
 * REACT_FRAGMENT_TYPE
 *
 * 详细讲解：
 * 1. Fragment 是一个特殊的组件类型
 * 2. 它允许返回多个子元素而无需添加额外的 DOM 节点
 * 3. 在 JSX 中可以使用 <></> 或 <Fragment> 语法
 * 4. React 内部通过此标识识别 Fragment 组件
 */
export const REACT_FRAGMENT_TYPE = supportSymbol
  ? Symbol.for("react.fragment")
  : 0xeacb;

/**
 * REACT_CONTEXT_TYPE 和 REACT_PROVIDER_TYPE
 *
 * 详细讲解：
 * 1. Context 是 React 的依赖注入系统
 * 2. Provider 组件负责提供值
 * 3. Consumer 组件或 useContext 用于获取值
 * 4. 这两个标识用于标记 Context 系统的不同部分
 */
export const REACT_CONTEXT_TYPE = supportSymbol
  ? Symbol.for("react.context")
  : 0xea5e;

export const REACT_PROVIDER_TYPE = supportSymbol
  ? Symbol.for("react.provider")
  : 0xea51;

/**
 * REACT_SUSPENSE_TYPE
 *
 * 详细讲解：
 * 1. Suspense 用于处理异步加载场景
 * 2. 可以在加载时显示 fallback 内容
 * 3. 常用于代码分割和数据获取
 * 4. React 通过此标识识别 Suspense 边界
 */
export const REACT_SUSPENSE_TYPE = supportSymbol
  ? Symbol.for("react.suspense")
  : 0xea4c;
