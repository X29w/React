// 导入 React 相关的符号
import { REACT_CONTEXT_TYPE, REACT_PROVIDER_TYPE } from "shared/ReactSymbols";

// 创建一个上下文的函数，接受一个默认值
export function createContext<T>(defaultValue: T): React.ReactContext<T> {
  // 定义上下文对象，包含类型和当前值
  const context: React.ReactContext<T> = {
    $$typeof: REACT_CONTEXT_TYPE, // 指定上下文的类型
    Provider: null, // 初始化 Provider 为 null，稍后会赋值
    _currentValue: defaultValue, // 设置当前值为传入的默认值
  };

  // 定义 Provider 对象，提供给上下文使用
  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE, // 指定 Provider 的类型
    _context: context, // 将上下文对象赋值给 Provider
  };

  // 返回创建的上下文对象
  return context;
}
