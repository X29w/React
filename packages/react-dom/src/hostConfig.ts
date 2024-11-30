// 导入必要的模块和类型
import { FiberNode } from "react-reconciler/src/fiber"; // 导入 FiberNode 类型
import { HostComponent, HostText } from "react-reconciler/src/workTags"; // 导入工作标签
import { updateFiberProps } from "./SyntheticEvent"; // 导入更新 Fiber 属性的函数

// 创建一个 DOM 实例的函数
export const createInstance = (
  type: string, // 元素类型，例如 'div'、'span' 等
  props: React.Props // 元素的属性
): React.Instance => {
  const element = document.createElement(type) as unknown; // 创建一个 DOM 元素
  updateFiberProps(element as React.DOMElement, props); // 更新元素的属性
  return element as React.DOMElement; // 返回创建的 DOM 元素
};

// 将子元素添加到父元素的初始子元素
export const appendInitialChild = (
  parent: React.Instance | React.Container, // 父元素，可以是实例或容器
  child: React.Instance // 子元素
) => {
  parent.appendChild(child); // 将子元素添加到父元素
};

// 创建文本实例的函数
export const createTextInstance = (content: string) => {
  return document.createTextNode(content); // 创建并返回文本节点
};

// 将子元素添加到容器，使用初始子元素的函数
export const appendChildToContainer = appendInitialChild;

// 提交更新的函数
export const commitUpdate = (fiber: FiberNode) => {
  switch (
    fiber.tag // 根据 Fiber 的标签进行不同的处理
  ) {
    case HostText: // 如果是文本节点
      const text = fiber.memoizedProps?.content; // 获取文本内容
      return commitTextUpdate(fiber.stateNode, text); // 提交文本更新
    case HostComponent: // 如果是主机组件
      updateFiberProps(fiber.stateNode, fiber.memoizedProps!); // 更新组件的属性
      return;
    default: // 其他情况
      if (__DEV__) {
        // 如果是开发模式
        console.warn("未实现的update", fiber); // 输出警告信息
      }
      break;
  }
};

// 提交文本更新的函数
export const commitTextUpdate = (
  textInstance: React.TestInstance, // 文本实例
  content: string // 新的文本内容
) => {
  textInstance.textContent = content; // 更新文本内容
};

// 移除子元素的函数
export const removeChild = (
  child: React.Instance | React.TestInstance, // 要移除的子元素
  container: React.Container // 容器
) => {
  container.removeChild(child); // 从容器中移除子元素
};

// 在容器中插入子元素的函数
export const insertChildToContainer = (
  child: React.Instance, // 要插入的子元素
  container: React.Container, // 容器
  before: React.Instance // 插入位置的参考元素
) => {
  container.insertBefore(child, before); // 在参考元素之前插入子元素
};

// 调度微任务的函数
export const scheduleMicroTask = (() => {
  // 检查是否支持 queueMicrotask
  if (typeof queueMicrotask === "function") {
    return queueMicrotask; // 如果支持，使用它
  }

  // 检查是否支持 Promise
  if (typeof Promise === "function") {
    return (callback: (...args: any) => void) =>
      Promise.resolve().then(callback); // 使用 Promise 解决
  }

  // 如果都不支持，使用 setTimeout
  return setTimeout;
})();

// 隐藏实例的函数
export const hideInstance = (instance: React.Instance) => {
  const style = (instance as HTMLElement).style; // 获取实例的样式
  style.setProperty("display", "none", "important"); // 设置 display 为 none，隐藏元素
};

// 取消隐藏实例的函数
export const unhideInstance = (instance: React.Instance) => {
  const style = (instance as HTMLElement).style; // 获取实例的样式
  style.display = ""; // 恢复元素的显示
};

// 隐藏文本实例的函数
export const hideTextInstance = (textInstance: React.TestInstance) => {
  textInstance.nodeValue = ""; // 清空文本节点的值
};

// 取消隐藏文本实例的函数
export const unhideTextInstance = (
  textInstance: React.TestInstance, // 文本实例
  text: string // 要显示的文本
) => {
  textInstance.nodeValue = text; // 设置文本节点的值
};
