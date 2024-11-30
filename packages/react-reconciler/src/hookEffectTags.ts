// 定义与 Hook 相关的副作用标志

/**
 * 被动效果标志
 * @constant
 * @type {number}
 * @default 0b0010
 * @description
 * 该标志用于表示与 useEffect 相关的副作用。
 * 当使用 useEffect 时，React 会在组件更新后执行副作用逻辑。
 */
export const Passive = 0b0010; // useEffect 对应的 effect

/**
 * 当前 effect 本次更新存在副作用的标志
 * @constant
 * @type {number}
 * @default 0b0001
 * @description
 * 该标志用于指示当前 effect 在本次更新中存在副作用。
 * 当一个 effect 被创建或更新时，如果它有副作用，React 会设置这个标志。
 */
export const HookHasEffect = 0b0001; // 当前 effect 本次更新存在副作用
