/**
 * ReactDom.createRoot(root).render(<App />)
 */
import {
  createContainer,
  updateContainer,
} from "react-reconciler/src/filerReconciler";
import { initEvent } from "./SyntheticEvent";

export function createRoot(container: React.Container) {
  const root = createContainer(container);

  return {
    render(element: React.ReactElementType) {
      initEvent(container, "click");
      return updateContainer(element, root);
    },
  };
}
