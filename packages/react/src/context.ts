import { REACT_CONTEXT_TYPE, REACT_PROVIDER_TYPE } from "shared/ReactSymbols";

export function createContext<T>(defaultValue: T): React.ReactContext<T> {
  const context: React.ReactContext<T> = {
    $$typeof: REACT_CONTEXT_TYPE,
    Provider: null,
    _currentValue: defaultValue,
  };
  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context,
  };
  return context;
}
