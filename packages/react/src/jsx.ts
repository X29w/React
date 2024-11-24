import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import {
  ElementType,
  Key,
  Props,
  ReactElementType,
  Ref,
  Type,
} from "shared/ReactTypes";

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

/**
 * 从配置对象中提取并处理 key、ref 和其他 props
 * @param {Config} Jsx.JsxConfig - React 元素的配置对象
 * @returns {[Key, Ref, Props]} 返回一个元组，包含处理后的 key、ref 和 props
 *
 * @description
 * 1. 通过解构获取 key 和 ref，设置默认值为 null
 * 2. 将 key 转换为字符串（如果存在）
 * 3. 使用 reduce 处理剩余的 props，确保只包含对象自身的属性
 * 4. 返回处理后的 [key, ref, props] 元组
 */
const extractPropsFromConfig = (config: Jsx.JsxConfig): [Key, Ref, Props] => {
  const { key = null, ref = null, ...props } = config;
  return [
    key != null ? String(key) : null,
    ref,
    Object.keys(props).reduce((acc, prop) => {
      if ({}.hasOwnProperty.call(config, prop)) {
        acc[prop] = props[prop];
      }
      return acc;
    }, {} as Props),
  ];
};

/**
 * 处理并合并 children 到 props 中
 * @param {Props} props - 原始的 props 对象
 * @param {any[]} children - 子元素数组
 * @returns {Props} 返回合并了 children 的新 props 对象
 *
 * @description
 * 1. 如果没有 children，直接返回原始 props
 * 2. 如果只有一个 child，直接使用该 child
 * 3. 如果有多个 children，保持数组形式
 * 4. 使用展开运算符创建新的 props 对象，确保不修改原始对象
 */
const processChildren = (props: Props, children: any[]): Props => {
  if (children.length === 0) return props;

  return {
    ...props,
    children: children.length === 1 ? children[0] : children,
  };
};

/**
 * JSX 转换函数 - 将 JSX 语法转换为 React 元素
 * @param {ElementType} type - 元素类型（可以是字符串或组件函数）
 * @param {Config} Jsx.JsxConfig - 元素的配置对象，包含 props、key、ref 等
 * @param {...any} children - 子元素列表
 * @returns {ReactElementType} 返回创建的 React 元素
 *
 * @description
 * 1. 首先从配置中提取必要的属性
 * 2. 处理并添加 children
 * 3. 使用这些处理后的值创建 React 元素
 *
 * @description
 * * 完整的处理流程：
 * 1. jsx('div', { className: 'container' }, child1, child2) 被调用
 * 2. extractPropsFromConfig 处理配置对象：
 *    - 提取 key 和 ref（如果有）
 *    - 处理其余属性（如 className, onClick 等）
 * 3. processChildren 处理子元素：
 *    - 将所有子元素规范化处理
 *    - 添加到 props.children 中
 * 4. ReactElement 创建最终的 React 元素对象
 * 5. 返回的元素对象将被 React 用于后续的渲染流程
 * 
 * 返回的对象形如：
   {
     $$typeof: Symbol(react.element),
     type: 'div',
     props: {
       className: 'container',
       children: {
         $$typeof: Symbol(react.element),
         type: 'span',
         props: { children: 'Hello' }
       }
     }
   }
 */
export const jsx = (
  type: ElementType,
  config: Jsx.JsxConfig,
  ...children: any
) => {
  // 第一步：提取和处理配置
  const [key, ref, props] = extractPropsFromConfig(config);
  // 第二步：处理子元素
  const propsWithChildren = processChildren(props, children);

  // 第三步：创建 React 元素
  return ReactElement(type, key, ref, propsWithChildren);
};

/**
 * 开发环境使用的 JSX 转换函数
 * @param {ElementType} type - 元素类型
 * @param {Config} Jsx.JsxConfig - 元素配置对象
 * @returns {ReactElementType} 返回创建的 React 元素
 *
 * @description
 * 1. 开发环境版本，不处理 children
 * 2. 用于开发工具和调试
 * 3. 保持与生产版本相同的基本结构，但可能包含额外的开发时检查
 *
 * @description 开发环境的 JSX 转换函数
 * 与生产版本的主要区别：
 * 1. 可以进行额外的类型检查
 * 2. 可以提供更好的错误信息
 * 3. 可以进行开发时的警告提示
 * 4. 可以添加开发工具所需的调试信息
 */
export const jsxDev = (type: ElementType, config: Jsx.JsxConfig) => {
  const [key, ref, props] = extractPropsFromConfig(config);
  return ReactElement(type, key, ref, props);
};
