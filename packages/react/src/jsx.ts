import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { Key, Props, ReactElementType, Ref, Type } from "shared/ReactTypes";

/**
 * 创建 React 元素的核心函数
 * @param type 元素类型 - 可以是字符串(原生 DOM 元素)或函数(组件)
 * @param key 用于标识元素的唯一键值，帮助 React 进行高效的 DOM diff
 * @param ref 引用对象，用于访问 DOM 节点或组件实例
 * @param props 元素的属性对象，包含所有传入的属性和子元素
 * @returns 返回一个 React 元素对象
 */
const ReactElement = (
  type: Type,
  key: Key,
  ref: Ref,
  props: Props
): ReactElementType => ({
  // 标识这是一个 React 元素的内部类型标记
  $$typeof: REACT_ELEMENT_TYPE,
  // 元素类型（div, p, 或自定义组件等）
  type,
  // 用于优化更新的 key 值
  key,
  // DOM 或组件实例的引用
  ref,
  // 元素的所有属性
  props,
  // 自定义标记，用于标识这是我们的 React 实现
  __mark: "x-react",
});

export default {
  ReactElement,
};
