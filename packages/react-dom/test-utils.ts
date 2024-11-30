//@ts-ignore
import { createRoot } from "react-dom";

export function renderIntoDocument(element: React.ReactElementType) {
  const div = document.createElement("div");
  return createRoot(div).render(element);
}
