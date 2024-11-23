/** 在这里集中定义React的类型 */

/** 定义 React 的 Type 类型 */
export type Type = any;

/** 定义 React 的 Key 类型 */
export type Key = string | null;

/** 定义 React 的 Ref 类型 */
export type Ref<T = any> =
  | { current: T | null }
  | ((instance: T | null) => void)
  | null;

/** 定义 React 的 Props 类型 */
export type Props = {
  [key: string]: any;
  children?: any;
};

/** 定义 React 的 ElementType 类型 */
export type ElementType = string | ((props: any) => ReactElementType | null);

/** 定义 React 的 ReactElement 类型 */
export interface ReactElementType {
  $$typeof: symbol | number;
  type: ElementType;
  key: Key;
  ref: Ref;
  props: Props;
  __mark: string;
}
