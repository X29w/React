/**
 * fiberFlags.ts - React Fiber 节点的副作用（side-effects）标记定义
 * 
 * 作用：
 * 1. 定义所有可能的 Fiber 节点副作用类型
 * 2. 使用二进制位标记实现高效的副作用追踪
 * 3. 通过位运算组合多个副作用
 */

/**
 * Flags 类型定义
 * 用于在 TypeScript 中标识副作用标记的类型
 */
export type Flags = number;

/**
 * 无副作用标记
 * 表示节点不需要进行任何操作
 * 二进制：0000000
 */
export const NoFlags = 0b0000000;

/**
 * 插入/移动标记
 * 表示节点需要插入到 DOM 中或在 DOM 中移动位置
 * 二进制：0000001
 */
export const Placement = 0b0000001;

/**
 * 更新标记
 * 表示节点的属性或内容需要更新
 * 二进制：0000010
 */
export const Update = 0b0000010;

/**
 * 子节点删除标记
 * 表示需要删除子节点
 * 二进制：0000100
 */
export const ChildDeletion = 0b0000100;

/**
 * 被动效果标记（如 useEffect）
 * 表示节点包含需要在提交阶段后异步执行的副作用
 * 二进制：0001000
 */
export const PassiveEffect = 0b0001000;

/**
 * Ref 更新标记
 * 表示节点的 ref 需要更新
 * 二进制：0010000
 */
export const Ref = 0b0010000;

/**
 * 可见性变更标记
 * 表示节点的显示/隐藏状态需要更新
 * 二进制：0100000
 */
export const Visibility = 0b0100000;

/**
 * 已捕获标记
 * 表示错误已经被捕获
 * 二进制：1000000
 */
export const DidCapture = 0b1000000;

/**
 * 应该捕获标记
 * 表示这个节点应该尝试捕获错误
 * 二进制：01000000000
 */
export const ShouldCapture = 0b01000000000;

/**
 * 突变阶段的标记集合
 * 包含了在 DOM 突变阶段需要处理的所有副作用
 * 通过位运算组合多个标记
 * 
 * @example
 * if (fiber.flags & MutationMask) {
 *   // 需要在突变阶段处理这个节点
 * }
 */
export const MutationMask = Placement | Update | ChildDeletion | Ref | Visibility;

/**
 * 布局阶段的标记集合
 * 包含了在 DOM 布局阶段需要处理的所有副作用
 * 目前只包含 Ref 的更新
 */
export const LayoutMask = Ref;

/**
 * 被动效果的标记集合
 * 包含了需要异步处理的副作用
 * 主要用于 useEffect 的处理
 */
export const PassiveMask = PassiveEffect | ChildDeletion;

/**
 * 使用示例：
 * 
 * // 添加副作用标记
 * fiber.flags |= Update;
 * 
 * // 检查是否包含某个副作用
 * if (fiber.flags & Placement) {
 *   // 需要插入或移动节点
 * }
 * 
 * // 在不同阶段检查相关副作用
 * if (fiber.flags & MutationMask) {
 *   // 处理 DOM 突变相关的副作用
 * }
 * 
 * if (fiber.flags & PassiveMask) {
 *   // 处理 useEffect 相关的副作用
 * }
 */