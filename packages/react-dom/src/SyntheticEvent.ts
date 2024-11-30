// 导入调度优先级相关的模块
import {
  unstable_ImmediatePriority, // 立即优先级
  unstable_NormalPriority, // 正常优先级
  unstable_runWithPriority, // 以特定优先级运行函数
  unstable_UserBlockingPriority, // 用户阻塞优先级
} from "scheduler";

export const elementPropsKey = "__props"; // 定义元素属性的键
const validEventTypeList = ["click"]; // 定义支持的事件类型列表

// 合成事件

// 更新 Fiber 节点的属性
export const updateFiberProps = (
  node: React.DOMElement, // DOM 元素
  props: React.Props // 需要更新的属性
) => {
  node[elementPropsKey] = props; // 将属性存储在 DOM 元素上
};

// 初始化事件处理
export const initEvent = (container: React.Container, eventType: string) => {
  // 检查事件类型是否有效
  if (!validEventTypeList.includes(eventType)) {
    console.warn("当前不支持", eventType, "事件"); // 输出警告信息
    return; // 退出函数
  }

  if (__DEV__) {
    console.log("初始化事件：", eventType); // 在开发模式下输出初始化信息
  }

  // 为容器添加事件监听器
  container.addEventListener(eventType, (e: Event) => {
    dispatchEvent(container, eventType, e); // 调用 dispatchEvent 处理事件
  });
};

// 创建合成事件
const createSyntheticEvent = (e: Event) => {
  const syntheticEvent = e as React.SyntheticEvent; // 将原生事件转换为合成事件
  syntheticEvent.__stopPropagation = false; // 初始化停止传播标志
  const originStopPropagation = e.stopPropagation.bind(e); // 保存原生 stopPropagation 方法

  // 自定义 stopPropagation 方法
  syntheticEvent.stopPropagation = () => {
    syntheticEvent.__stopPropagation = true; // 设置停止传播标志
    if (originStopPropagation) {
      originStopPropagation(); // 调用原生 stopPropagation
    }
  };
  return syntheticEvent; // 返回合成事件
};

/**
 * 处理事件的分发
 * @param container - 事件容器
 * @param eventType - 事件类型
 * @param e - 原生事件
 */
const dispatchEvent = (
  container: React.Container,
  eventType: string,
  e: Event
) => {
  const targetElement = e.target; // 获取事件目标元素

  if (targetElement === null) {
    console.warn("事件不存在target", e); // 输出警告信息
  }
  // 1. 收集沿途的事件
  const { bubble, capture } = collectPaths(
    targetElement as React.DOMElement,
    container,
    eventType
  );
  // 2. 构造合成事件
  const se = createSyntheticEvent(e);
  // 3. 遍历捕获阶段的回调
  triggerEventFlow(capture, se);
  // 4. 冒泡阶段
  if (!se.__stopPropagation) {
    triggerEventFlow(bubble, se);
  }
};

// 遍历并触发事件流
const triggerEventFlow = (
  paths: React.EventCallback[], // 事件回调路径
  se: React.SyntheticEvent // 合成事件
) => {
  for (let i = 0; i < paths.length; i++) {
    const callback = paths[i]; // 获取当前回调
    unstable_runWithPriority(eventTypeToSchedulePriority(se.type), () => {
      callback.call(null, se); // 以特定优先级调用回调
    });
    if (se.__stopPropagation) {
      break; // 如果停止传播，退出循环
    }
  }
};

// 根据事件类型获取回调名称
const getEventCallbackNameFromEventType = (
  eventType: string
): string[] | undefined => {
  return {
    click: ["onClickCapture", "onClick"], // 映射事件类型到回调名称
  }[eventType];
};

// 收集事件回调路径
const collectPaths = (
  targetElement: React.DOMElement, // 目标元素
  container: React.Container, // 容器
  eventType: string // 事件类型
) => {
  const paths: React.Paths = {
    capture: [], // 捕获阶段的回调
    bubble: [], // 冒泡阶段的回调
  };

  // 收集事件回调路径
  while (targetElement && targetElement !== container) {
    const elementProps = targetElement[elementPropsKey]; // 获取元素属性
    const callbackNameList =
      elementProps && getEventCallbackNameFromEventType(eventType); // 获取回调名称列表

    // 如果没有找到元素属性或回调名称列表，继续到父节点
    if (!callbackNameList) {
      targetElement = targetElement.parentNode as React.DOMElement;
      continue;
    }

    // 遍历回调名称列表
    callbackNameList.forEach((callbackName, index) => {
      const eventCallback = elementProps[callbackName]; // 获取事件回调
      if (eventCallback) {
        // 根据索引决定是捕获还是冒泡
        index === 0
          ? paths.capture.unshift(eventCallback) // 捕获阶段
          : paths.bubble.push(eventCallback); // 冒泡阶段
      }
    });

    // 移动到父节点
    targetElement = targetElement.parentNode as React.DOMElement;
  }

  return paths; // 返回收集到的路径
};

/**
 * 不同事件产生的不同的优先级
 * @param eventType - 事件类型
 */
const eventTypeToSchedulePriority = (eventType: string) => {
  const priorityMap: { [key: string]: any } = {
    click: unstable_ImmediatePriority, // 点击事件的优先级
    keydown: unstable_ImmediatePriority, // 按键按下事件的优先级
    keyup: unstable_ImmediatePriority, // 按键抬起事件的优先级
    scroll: unstable_UserBlockingPriority, // 滚动事件的优先级
  };

  // 返回对应的优先级，如果没有匹配的事件类型，则返回默认优先级
  return priorityMap[eventType] !== undefined
    ? priorityMap[eventType]
    : unstable_NormalPriority;
};
