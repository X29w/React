import { FiberNode } from "react-reconciler/src/fiber"; // 导入 FiberNode 类型，用于表示 React 的 Fiber 结构
import { HostText } from "react-reconciler/src/workTags"; // 导入 HostText 标签，用于标识文本节点

let instanceCounter = 0; // 实例计数器，用于生成唯一的实例 ID

// 创建一个新的实例
export const createInstance = (
  type: string, // 元素类型，例如 'div'、'span' 等
  props: React.Props // 元素的属性
): REactNoop.Instance => {
  const instance = {
    id: instanceCounter++, // 生成唯一的 ID
    type, // 元素类型
    children: [], // 子元素数组
    parent: -1, // 父元素 ID，初始为 -1 表示没有父元素
    props, // 元素的属性
  };
  return instance; // 返回创建的实例
};

// 将子元素添加到父元素的初始子元素
export const appendInitialChild = (
  parent: REactNoop.Instance | REactNoop.Container, // 父元素，可以是实例或容器
  child: REactNoop.Instance // 子元素
) => {
  const prevParentID = child.parent; // 获取子元素的前一个父元素 ID
  const parentID = "rootID" in parent ? parent.rootID : parent.id; // 获取父元素的 ID

  // 检查子元素是否已经挂载到其他父元素
  if (prevParentID !== -1 && prevParentID !== parentID) {
    throw new Error("不能重复挂载child"); // 抛出错误
  }
  child.parent = parentID; // 更新子元素的父元素 ID
  parent.children.push(child); // 将子元素添加到父元素的子元素数组中
};

// 创建文本实例的函数
export const createTextInstance = (content: string) => {
  const instance = {
    text: content, // 文本内容
    id: instanceCounter++, // 生成唯一的 ID
    parent: -1, // 父元素 ID，初始为 -1 表示没有父元素
  };
  return instance; // 返回创建的文本实例
};

// 将子元素添加到容器
export const appendChildToContainer = (
  parent: REactNoop.Container, // 容器
  child: REactNoop.Instance // 子元素
) => {
  const prevParentID = child.parent; // 获取子元素的前一个父元素 ID

  // 检查子元素是否已经挂载到其他父元素
  if (prevParentID !== -1 && prevParentID !== parent.rootID) {
    throw new Error("不能重复挂载child"); // 抛出错误
  }
  child.parent = parent.rootID; // 更新子元素的父元素 ID
  parent.children.push(child); // 将子元素添加到容器的子元素数组中
};

// 提交更新的函数
export const commitUpdate = (fiber: FiberNode) => {
  const updateActions: { [key: number]: () => void } = {
    [HostText]: () => {
      const text = fiber.memoizedProps!.content; // 获取文本内容
      commitTextUpdate(fiber.stateNode, text); // 提交文本更新
    },
  };

  // 执行对应的更新操作，如果没有匹配的标签，则输出警告
  const updateAction = updateActions[fiber.tag];
  if (updateAction) {
    updateAction(); // 执行更新操作
  } else if (__DEV__) {
    console.warn("未实现的update", fiber); // 输出警告信息
  }
};

// 提交文本更新的函数
export const commitTextUpdate = (
  textInstance: REactNoop.TestInstance, // 文本实例
  content: string // 新的文本内容
) => {
  textInstance.text = content; // 更新文本内容
};

// 移除子元素的函数
export const removeChild = (
  child: REactNoop.Instance | REactNoop.TestInstance, // 要移除的子元素
  container: REactNoop.Container // 容器
) => {
  const index = container.children.indexOf(child); // 查找子元素在容器中的索引
  if (index === -1) {
    throw new Error("child不存在"); // 抛出错误
  }
  container.children.splice(index, 1); // 从容器中移除子元素
};

// 在容器中插入子元素的函数
export const insertChildToContainer = (
  child: REactNoop.Instance, // 要插入的子元素
  container: REactNoop.Container, // 容器
  before: REactNoop.Instance // 插入位置的参考元素
) => {
  const beforeIndex = container.children.indexOf(before); // 查找参考元素的索引
  if (beforeIndex === -1) {
    throw new Error("before不存在"); // 抛出错误
  }
  const index = container.children.indexOf(child); // 查找子元素的索引
  if (index !== -1) {
    container.children.splice(index, 1); // 如果子元素已经存在，则先移除
  }
  container.children.splice(beforeIndex, 0, child); // 在参考元素之前插入子元素
};

// 调度微任务的函数
export const scheduleMicroTask = (() => {
  // 检查是否支持 queueMicrotask
  if (typeof queueMicrotask === "function") {
    return queueMicrotask; // 如果支持，返回 queueMicrotask
  }

  // 检查是否支持 Promise
  if (typeof Promise === "function") {
    return (callback: (...args: any) => void) =>
      Promise.resolve().then(callback); // 使用 Promise 解决
  }

  // 如果都不支持，使用 setTimeout
  return setTimeout;
})();
