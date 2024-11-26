## jsx

### 基本介绍

`React` 主要是将页面的结构通过 `jsx` 进行描述，在调和后，每一个 `React element` 对象的子节点都会形成一个对应的 `fiberNode`

本节内容主要是实现 `jsx` 的生成。在 `React` 的源码中，`jsx` 的代码逻辑存在 `packages` 下面的 react 包中。为了兼容 React 的旧版本，我们主要是实现最后导出三个文件。

`index.js: import React from 'react'` 这样使用
`jsx-runtime.js`: 新版通过 babel 导入
`jsx-dev-runtime.js`: 开发环境的包

为了开发者方便，`React` 提供一种类似于 html 的方式去书写代码，然后 `React` 通过 `babel` 去进行转义。在 `React` 的新版本中，我们不再需要手动去引入 `React`, `plugin-syntax-jsx` 已经向文件中提前注入了 `_jsxRuntime api`。

```html
<div className="x">
  123
  <span>yx</span>
</div>
```

```jsx 新版Automatic
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
/*#__PURE__*/ _jsxs("div", {
  className: "x",
  children: [
    "123",
    /*#__PURE__*/ _jsx("span", {
      children: "yx",
    }),
  ],
});
```

```jsx 旧版Classic
/*#__PURE__*/ React.createElement(
  "div",
  {
    className: "x",
  },
  "123",
  /*#__PURE__*/ React.createElement("span", null, "yx")
);
```

> 主要是分为三部分：1. 对应的 `tag` 字段， 2. 属性和 `children，` 3. `key` 等一些特殊字段。

### 实现 JSX

#### 声明类型

在 `packages/shared/ReactTypes.ts` 文件中，我们声明了 `JSX` 相关的类型。

```typescript
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
export type ElementType = string | ((props: any) => ReactElementType | null);

/** 定义 React 的 ReactElement 类型 */
export interface ReactElementType {
  $$typeof: symbol | number;
  type: ElementType;
  key: Key;
  ref: Ref;
  props: Props;
  __mark: string;
}
```

在 `packages/shared/ReactSymbols.ts` 文件中，我们声明了 `JSX` 相关的 `symbol。`

```typescript
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
```

#### 实现 JSX

在 `packages/react/src/jsx.ts` 文件中，我们实现 `JSX` 的逻辑。

```typescript
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

  /* 返回的对象形如：
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
   } */
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
```

**整体 jsx 函数的调用流程**

1.  JSX 代码：

```jsx
function App() {
  return (
    <div className="container">
      <span>Hello</span>
    </div>
  );
}
```

2.  Babel 转义后的代码：

```js
function App() {
  return jsx("div", { className: "container" }, jsx("span", null, "Hello"));
}
```

jsx 函数的作用就是接收 Babel 转换后的参数，并创建出 React 元素（虚拟 DOM 节点）

3.  最终生成的 React 元素结构：

```js
{
$$typeof: Symbol(react.element),
type: 'div',
key: null,
ref: null,
props: {
    className: 'container',
    children: [
      {
        $$typeof: Symbol(react.element),
        type: 'span',
        props: { children: 'Hello' },
        // ...
      }
    ]
}
}
```

4. 所以整个流程是：

- 开发者写 JSX 代码
- Babel 在编译时将 JSX 语法转换为 jsx() 函数调用
- 运行时，jsx() 函数被调用，创建 React 元素
- React 使用这些元素来渲染实际的 DOM 5.简单来说：Babel 的工作是：转换语法（<div> → jsx('div')）,jsx 函数的工作是：创建虚拟 DOM 节点（jsx('div') → { type: 'div', props: {...} }）,这就是为什么在 React 17 之后的版本中，我们不需要手动引入 React（import React from 'react'），因为 Babel 会自动帮我们引入 jsx 函数。

5. 那么为什么还存在 jsxDev 函数呢？

jsxDev 函数的作用是为了开发环境的 JSX 转换，它的作用和 jsx 函数一样，只是它不处理 children 子元素，所以它的返回值和生产环境的 jsx 函数返回值是一样的。

`区别的具体体现：`

- Babel 的转换会根据环境不同选择不同的函数：

```js
// 开发环境下，Babel 会转换成：
jsxDev("div", { className: "container" });

// 生产环境下，Babel 会转换成：
jsx("div", { className: "container" });
```

- 实际应用场景：

```js
function App() {
  // 开发环境下，如果你这样写：
  return <div>{undefined.toString()}</div>;

  // jsxDev 可以提供更友好的错误信息：
  // "Cannot read property 'toString' of undefined at App"
  // 并显示具体的组件栈信息

  // 而在生产环境下，jsx 函数会简单地抛出错误，
  // 没有这些额外的调试信息
}
```

- 性能考虑：

```js
// 开发环境：更多的检查，更多的警告
jsxDev("div", {
  // 可以检查 props 类型
  // 可以检查废弃的 API 使用
  // 可以添加更多的调试信息
});

// 生产环境：更简洁的代码，更好的性能
jsx("div", {
  // 只进行必要的转换
  // 没有额外的检查和警告
  // 代码体积更小，运行更快
});
```

`Summary：`

- `开发体验`：提供更好的错误信息和警告
- `调试能力`：支持 React DevTools 等开发工具
- `性能优化`：生产环境可以移除开发时的检查代码
- `包体积`：生产环境的代码更精简

这就是为什么 `React` 需要维护两个版本的 `JSX` 转换函数，它们服务于不同的目的：
`jsx`: 注重性能和包体积
`jsxDev`: 注重开发体验和调试能力
