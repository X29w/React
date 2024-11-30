// ReactElement

import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from "shared/ReactSymbols";

// 创建 ReactElement 的函数
const ReactElement = (
  type: React.Type,
  key: React.Key,
  ref: React.Ref,
  props: React.Props
): React.ReactElementType => ({
  $$typeof: REACT_ELEMENT_TYPE, // 指定元素的类型
  type, // 元素的类型
  key, // 元素的唯一标识
  ref, // 引用
  props, // 元素的属性
  __mark: "x-react", // 标记
});

// 检查对象是否为有效的 React 元素
export const isValidElement = (object: any): boolean =>
  typeof object === "object" &&
  object !== null &&
  object.$$typeof === REACT_ELEMENT_TYPE;

// 处理 JSX 的函数
export const jsx = (
  type: React.ElementType,
  config: any,
  ...maybeChildren: any
) => {
  const { key = null, ref = null, ...props } = config; // 解构 config，提取 key 和 ref，剩余属性作为 props

  // 处理 children
  if (maybeChildren.length) {
    props.children =
      maybeChildren.length === 1 ? maybeChildren[0] : maybeChildren;
  }

  return ReactElement(type, key, ref, props); // 返回创建的 ReactElement
};

// Fragment 用于表示 React 片段
export const Fragment = REACT_FRAGMENT_TYPE;

// 开发环境下的 JSX 处理函数
export const jsxDEV = (
  type: React.ElementType,
  config: any,
  key: any = null
) => {
  const { ref = null, ...props } = config; // 解构 config，提取 ref，剩余属性作为 props
  return ReactElement(type, key, ref, props); // 返回创建的 ReactElement
};
