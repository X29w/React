/**
 * 判断当前环境是否支持 Symbol 及其 for 方法
 * 1. typeof Symbol === 'function' 检查 Symbol 是否可用且是函数类型
 * 2. Symbol.for 检查是否支持全局 Symbol 注册表功能
 * 3. 在较老的浏览器中可能不支持 Symbol，此时返回 false
 */
const supportSymbol = typeof Symbol === "function" && Symbol.for;

/**
 * 1. Symbol.for() 是什么：
 *   - 这是 JavaScript 的全局 Symbol 注册表功能
 *   - Symbol.for('react.element') 会创建一个全局唯一的 Symbol
 *   - 如果已经存在同名的 Symbol，则返回已存在的那个
 *   - 这确保了在不同的模块中使用相同的字符串创建的 Symbol 是完全相同的
 * 2.为什么需要降级方案 0xeac7：
 *   - 不是所有 JavaScript 环境都支持 Symbol（比如老版本浏览器）
 *   - 0xeac7 是一个十六进制数字，作为降级后的标识符
 *   - 这个数字是 React 团队选择的一个特定值，用来标识 React 元素
 * 3. 这个值的用途：
 *   - 用来标识一个对象是否是合法的 React 元素
 *   - 在 ReactElement 接口中，我们看到有 $$typeof 属性
 *   - $$typeof 就会被赋值为 REACT_ELEMENT_TYPE
 *   - React 内部会检查这个值来确保元素的合法性 */
export const REACT_ELEMENT_TYPE = supportSymbol
  ? Symbol.for("react.element")
  : 0xeac7;
