/**
 * currentBatchConfig.ts - React 批处理配置文件
 *
 * 作用：
 * 1. 存储当前 React 批量更新的配置信息
 * 2. 主要用于 Transition 相关的功能
 * 3. 在并发渲染中控制更新的优先级
 */

/**
 * React 当前批处理配置对象
 *
 * 用途：
 * 1. 在组件更新时标记更新的类型
 * 2. 帮助 React 区分普通更新和 Transition 更新
 * 3. 影响更新的优先级和调度方式
 *
 * @type {React.BatchConfig}
 *
 * @example
 * // React 内部使用示例
 * function scheduleUpdate(fiber, update) {
 *   const transition = ReactCurrentBatchConfig.transition;
 *   if (transition !== null) {
 *     // 这是一个 Transition 更新，使用较低的优先级
 *     scheduleTransitionUpdate(fiber, update);
 *   } else {
 *     // 这是一个普通更新，使用正常优先级
 *     scheduleRegularUpdate(fiber, update);
 *   }
 * }
 */
const ReactCurrentBatchConfig: React.BatchConfig = {
  transition: null,
};

export default ReactCurrentBatchConfig;

/**
 * 实际应用场景：
 *
 * 1. useTransition Hook:
 * function App() {
 *   const [isPending, startTransition] = useTransition();
 *   return (
 *     <button onClick={() => {
 *       startTransition(() => {
 *         // 这里的更新会被标记为 Transition
 *         setLargeList(generateLargeList());
 *       });
 *     }}>
 *       Update List
 *     </button>
 *   );
 * }
 *
 * 2. 并发特性：
 * - 允许 React 中断渲染以处理更高优先级的更新
 * - 帮助实现更流畅的用户体验
 * - 支持可中断的渲染过程
 */
