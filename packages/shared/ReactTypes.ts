/** 定义 React 的类型 */
export type Type = any
/** 定义 React 的 key 类型 */
export type Key = any

/** 定义 React 的 ref 类型 */
export type Ref = any

/** 定义 React 的 props 类型 */
export type Props = any

/** 定义 React 的 element 类型 */
export type ElementType = any

/** 定义 React 的 element 类型 */
export interface ReactElement {
  $$typeof: symbol | number
  type: ElementType
  key: Key
  ref: Ref
  props: Props
  __mark: string
}
