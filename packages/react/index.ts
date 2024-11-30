// 导入 React 相关的模块和函数
import {
  Fragment as fragment, // Fragment 是 React 中用于分组子元素的组件
  isValidElement as isValidElementFn, // 用于检查一个元素是否是有效的 React 元素
  jsx, // JSX 转换函数
} from "./src/jsx";
import currentDispatcher, {
  resolveDispatcher, // 解析当前的调度器
} from "./src/currentDispatcher";
import currentBatchConfig from "./src/currentBatchConfig"; // 当前批处理配置

// 导出 Suspense 类型
export { REACT_SUSPENSE_TYPE as Suspense } from "shared/ReactSymbols";

// 导出创建上下文的函数
export { createContext } from "./src/context";

// useState Hook 的实现
export const useState: React.Dispatcher["useState"] = (initialState: any) => {
  const dispatcher = resolveDispatcher(); // 获取当前的调度器
  return dispatcher.useState(initialState); // 调用调度器的 useState 方法
};

// useEffect Hook 的实现
export const useEffect: React.Dispatcher["useEffect"] = (create, deps) => {
  const dispatcher = resolveDispatcher(); // 获取当前的调度器
  return dispatcher.useEffect(create, deps); // 调用调度器的 useEffect 方法
};

// useTransition Hook 的实现
export const useTransition: React.Dispatcher["useTransition"] = () => {
  const dispatcher = resolveDispatcher(); // 获取当前的调度器
  return dispatcher.useTransition(); // 调用调度器的 useTransition 方法
};

// useRef Hook 的实现
export const useRef: React.Dispatcher["useRef"] = (initialValue) => {
  const dispatcher = resolveDispatcher(); // 获取当前的调度器
  return dispatcher.useRef(initialValue); // 调用调度器的 useRef 方法
};

// useContext Hook 的实现
export const useContext: React.Dispatcher["useContext"] = (context) => {
  const dispatcher = resolveDispatcher(); // 获取当前的调度器
  return dispatcher.useContext(context); // 调用调度器的 useContext 方法
};

// use Hook 的实现
export const use: React.Dispatcher["use"] = (usable) => {
  const dispatcher = resolveDispatcher(); // 获取当前的调度器
  return dispatcher.use(usable); // 调用调度器的 use 方法
};

// 内部使用的对象，包含当前调度器和批处理配置
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
  currentDispatcher,
  currentBatchConfig,
};

// 导出 isValidElement 函数
export const isValidElement = isValidElementFn;
// 导出版本号
export const version = "0.0.0";
// TODO 根据环境区分使用jsx/jesDEV
export const createElement = jsx; // 创建元素的函数
export const Fragment = fragment; // 导出 Fragment 组件
