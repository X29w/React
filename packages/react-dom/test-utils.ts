//@ts-ignore
import { createRoot } from "react-dom"; // 从 react-dom 导入 createRoot 函数，用于创建 React 根节点

// 定义一个函数 renderIntoDocument，用于将 React 元素渲染到文档中
export const renderIntoDocument = (element: React.ReactElementType) =>
  // 创建一个新的 div 元素作为容器
  createRoot(document.createElement("div")) // 使用 createRoot 创建一个根节点
    .render(element); // 调用 render 方法将传入的 React 元素渲染到该根节点
