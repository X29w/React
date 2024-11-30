import {
  Fragment as fragment,
  isValidElement as isValidElementFn,
  jsx,
} from "./src/jsx";
import currentDispatcher, {
  resolveDispatcher,
} from "./src/currentDispatcher";
import currentBatchConfig from "./src/currentBatchConfig";

export { REACT_SUSPENSE_TYPE as Suspense } from "shared/ReactSymbols";

export { createContext } from "./src/context";

export const useState: React.Dispatcher["useState"] = (initialState: any) => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
};

export const useEffect: React.Dispatcher["useEffect"] = (create, deps) => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, deps);
};

export const useTransition: React.Dispatcher["useTransition"] = () => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useTransition();
};

export const useRef: React.Dispatcher["useRef"] = (initialValue) => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useRef(initialValue);
};

export const useContext: React.Dispatcher["useContext"] = (context) => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useContext(context);
};

export const use: React.Dispatcher["use"] = (usable) => {
  const dispatcher = resolveDispatcher();
  return dispatcher.use(usable);
};
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
  currentDispatcher,
  currentBatchConfig,
};

export const isValidElement = isValidElementFn;
export const version = "0.0.0";
// TODO 根据环境区分使用jsx/jesDEV
export const createElement = jsx;
export const Fragment = fragment;
