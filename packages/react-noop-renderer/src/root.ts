/**
 * ReactDom.createRoot(root).render(<App />)
 */
import {
  createContainer,
  updateContainer,
} from "react-reconciler/src/filerReconciler";
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from "shared/ReactSymbols";
import * as Scheduler from "scheduler";

let idCounter = 0;

export function createRoot() {
  const container: REactNoop.Container = {
    rootID: idCounter++,
    children: [],
  };
  // @ts-ignore
  const root = createContainer(container);

  function getChildren(parent: REactNoop.Container | REactNoop.Instance) {
    if (parent) {
      return parent.children;
    }
    return null;
  }

  function getChildrenAsJsx(root: REactNoop.Container) {
    const children = childToJSX(getChildren(root));
    if (Array.isArray(children)) {
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type: REACT_FRAGMENT_TYPE,
        key: null,
        ref: null,
        props: { children },
        __mark: "x-react",
      };
    }
    return children;
  }

  function childToJSX(child: any): any {
    if (typeof child === "string" || typeof child === "number") {
      return child;
    }
    if (Array.isArray(child)) {
      if (child.length === 0) {
        return null;
      }
      if (child.length === 1) {
        return childToJSX(child[0]);
      }
      const children = child.map(childToJSX);

      if (
        children.every(
          (child) => typeof child === "string" || typeof child === "number"
        )
      ) {
        return children.join("");
      }
      // [Instance, TextInstance, Instance]
      return children;
    }

    // Instance
    if (Array.isArray(child.children)) {
      const instance: REactNoop.Instance = child;
      const children = childToJSX(instance.children);
      const props = instance.props;

      if (children !== null) {
        props.children = children;
      }
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type: instance.type,
        key: null,
        ref: null,
        props,
        __mark: "x-react",
      };
    }

    // TextInstance
    return child.text;
  }

  return {
    render(element: React.ReactElementType) {
      return updateContainer(element, root);
    },
    getChildren() {
      return getChildren(container);
    },
    getChildrenAsJsx() {
      return getChildrenAsJsx(container);
    },
    _Scheduler: Scheduler,
  };
}
