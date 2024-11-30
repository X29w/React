import { FiberNode } from "react-reconciler/src/fiber";
import { HostText } from "react-reconciler/src/workTags";



let instanceCounter = 0;
export const createInstance = (type: string, props: React.Props): REactNoop.Instance => {
  const instance = {
    id: instanceCounter++,
    type,
    children: [],
    parent: -1,
    props,
  };
  return instance;
};

export const appendInitialChild = (
  parent: REactNoop.Instance | REactNoop.Container,
  child: REactNoop.Instance
) => {
  const prevParentID = child.parent;
  const parentID = "rootID" in parent ? parent.rootID : parent.id;

  if (prevParentID !== -1 && prevParentID !== parentID) {
    throw new Error("不能重复挂载child");
  }
  child.parent = parentID;
  parent.children.push(child);
};

export const createTextInstance = (content: string) => {
  const instance = {
    text: content,
    id: instanceCounter++,
    parent: -1,
  };
  return instance;
};

export const appendChildToContainer = (parent: REactNoop.Container, child: REactNoop.Instance) => {
  const prevParentID = child.parent;

  if (prevParentID !== -1 && prevParentID !== parent.rootID) {
    throw new Error("不能重复挂载child");
  }
  child.parent = parent.rootID;
  parent.children.push(child);
};

export function commitUpdate(fiber: FiberNode) {
  switch (fiber.tag) {
    case HostText:
      const text = fiber.memoizedProps!.content;
      return commitTextUpdate(fiber.stateNode, text);
    default:
      if (__DEV__) {
        console.warn("未实现的update", fiber);
      }
      break;
  }
}

export function commitTextUpdate(textInstance: REactNoop.TestInstance, content: string) {
  textInstance.text = content;
}

export function removeChild(
  child: REactNoop.Instance | REactNoop.TestInstance,
  container: REactNoop.Container
) {
  const index = container.children.indexOf(child);
  if (index === -1) {
    throw new Error("child不存在");
  }
  container.children.splice(index, 1);
}

export function insertChildToContainer(
  child: REactNoop.Instance,
  container: REactNoop.Container,
  before: REactNoop.Instance
) {
  const beforeIndex = container.children.indexOf(before);
  if (beforeIndex === -1) {
    throw new Error("before不存在");
  }
  const index = container.children.indexOf(child);
  if (index !== -1) {
    container.children.splice(index, 1);
  }
  container.children.splice(beforeIndex, 0, child);
}

export const scheduleMicroTask =
  typeof queueMicrotask === "function"
    ? queueMicrotask
    : typeof Promise === "function"
    ? (callback: (...args: any) => void) => Promise.resolve(null).then(callback)
    : setTimeout;
