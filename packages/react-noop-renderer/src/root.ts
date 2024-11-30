/**
 * ReactDom.createRoot(root).render(<App />)
 *
 * 该模块实现了 React 的根容器创建和渲染功能。
 * 主要功能包括创建根容器、更新容器、获取子元素等。
 */

import {
  createContainer,
  updateContainer,
} from "react-reconciler/src/filerReconciler"; // 导入创建和更新容器的函数
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from "shared/ReactSymbols"; // 导入 React 元素和片段的类型标识符
import * as Scheduler from "scheduler"; // 导入调度器，用于调度任务

let idCounter = 0; // 用于生成唯一的根 ID

// 创建根容器的函数
export const createRoot = () => {
  // 定义一个容器对象，包含唯一的 rootID 和子元素
  const container: REactNoop.Container = {
    rootID: idCounter++, // 生成唯一的 rootID
    children: [], // 初始化子元素为空数组
  };

  // 创建根容器
  // @ts-ignore 忽略 TypeScript 的类型检查
  const root = createContainer(container);

  // 获取父容器的子元素
  const getChildren = (parent: REactNoop.Container | REactNoop.Instance) => {
    if (parent) {
      return parent.children; // 返回子元素
    }
    return null; // 如果父容器不存在，返回 null
  };

  // 将子元素转换为 JSX 格式
  const getChildrenAsJsx = (root: REactNoop.Container) => {
    const children = childToJSX(getChildren(root)); // 获取子元素并转换为 JSX
    if (Array.isArray(children)) {
      return {
        $$typeof: REACT_ELEMENT_TYPE, // 设置元素类型为 React 元素
        type: REACT_FRAGMENT_TYPE, // 设置类型为片段
        key: null, // 片段的 key
        ref: null, // 片段的 ref
        props: { children }, // 片段的属性，包含子元素
        __mark: "x-react", // 标记，用于识别
      };
    }
    return children; // 如果不是数组，直接返回子元素
  };

  // 将子元素转换为 JSX 的递归函数
  const childToJSX = (child: any): any => {
    // 处理基本类型（字符串或数字）
    if (typeof child === "string" || typeof child === "number") {
      return child; // 直接返回基本类型
    }

    // 处理数组类型
    if (Array.isArray(child)) {
      if (child.length === 0) {
        return null; // 如果数组为空，返回 null
      }
      if (child.length === 1) {
        return childToJSX(child[0]); // 如果数组只有一个元素，递归处理
      }
      const children = child.map(childToJSX); // 递归处理数组中的每个元素

      // 如果所有子元素都是基本类型，连接成字符串返回
      if (
        children.every(
          (child) => typeof child === "string" || typeof child === "number"
        )
      ) {
        return children.join(""); // 连接字符串
      }
      // 返回处理后的子元素数组
      return children;
    }

    // 处理 Instance 类型
    if (Array.isArray(child.children)) {
      const instance: REactNoop.Instance = child; // 将 child 视为实例
      const children = childToJSX(instance.children); // 递归处理实例的子元素
      const props = instance.props; // 获取实例的属性

      if (children !== null) {
        props.children = children; // 如果子元素不为 null，设置实例的子元素
      }
      return {
        $$typeof: REACT_ELEMENT_TYPE, // 设置元素类型为 React 元素
        type: instance.type, // 设置元素类型为实例的类型
        key: null, // 元素的 key
        ref: null, // 元素的 ref
        props, // 元素的属性
        __mark: "x-react", // 标记，用于识别
      };
    }

    // 处理 TextInstance 类型
    return child.text; // 返回文本实例的文本内容
  };

  // 返回一个包含渲染和获取子元素的方法的对象
  return {
    render(element: React.ReactElementType) {
      return updateContainer(element, root); // 更新容器，渲染元素
    },
    getChildren() {
      return getChildren(container); // 获取容器的子元素
    },
    getChildrenAsJsx() {
      return getChildrenAsJsx(container); // 获取容器的子元素并转换为 JSX
    },
    _Scheduler: Scheduler, // 暴露调度器
  };
};
