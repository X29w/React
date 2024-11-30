// 定义不同的副作用标志
export const NoFlags = 0b0000000; // 没有副作用
export const Placement = 0b0000001; // 插入操作
export const Update = 0b0000010; // 更新操作
export const ChildDeletion = 0b0000100; // 删除操作
export const PassiveEffect = 0b0001000; // 当前 Fiber 上本次更新存在副作用
export const Ref = 0b0010000; // ref 操作

/**
 * Offscreen 组件的可见度标志
 * current Offscreen mode 和 wip Offscreen mode 的对比
 */
export const Visibility = 0b0100000; // Offscreen 的可见度发生变化（hide/visibility 的切换）

// 需要 unwind 的 suspense 标志
export const DidCapture = 0b1000000; // 捕获到的状态

export const ShouldCapture = 0b01000000000; // 在 render 阶段，捕获到一些东西（如 Error Bound / 抛出的挂载的数据）

/**
 * mutation 阶段要执行的标志
 * 包含插入、更新、删除、ref 和可见度的标志
 */
export const MutationMask =
  Placement | Update | ChildDeletion | Ref | Visibility; // mutation 阶段要执行的标志

/**
 * layout 阶段要执行的标志
 * 目前只包含 ref 操作
 */
export const LayoutMask = Ref; // layout 阶段要执行的标志

/**
 * 是否需要触发 useEffect 回调
 * 包含被动效果和子删除的标志
 */
export const PassiveMask = PassiveEffect | ChildDeletion; // passive 阶段要执行的标志
