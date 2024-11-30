/**
 * ReactDom.createRoot(root).render(<App />)
 */
import {
  createContainer, // 导入创建容器的函数
  updateContainer, // 导入更新容器的函数
} from "react-reconciler/src/filerReconciler"; // 从 react-reconciler 导入相关函数
import { initEvent } from "./SyntheticEvent"; // 导入初始化事件的函数

// 创建一个根节点的函数
export function createRoot(container: React.Container) {
  // 使用 createContainer 函数创建一个新的容器
  const root = createContainer(container);

  // 返回一个对象，包含 render 方法
  return {
    // 渲染方法，接受一个 React 元素作为参数
    render(element: React.ReactElementType) {
      // 初始化事件，设置容器的点击事件
      initEvent(container, "click");
      // 更新容器，渲染传入的元素
      return updateContainer(element, root);
    },
  };
}
