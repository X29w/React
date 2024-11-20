/** 判断是否支持 Symbol */
const supportSymbol = typeof Symbol === 'function' && Symbol.for

/** React 元素的类型 */
export const REACT_ELEMENT_TYPE = supportSymbol
  ? Symbol.for('react.element')
    : 0xeac7

