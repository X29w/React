import { FiberRootNode } from "./fiber"; // 导入 FiberRootNode 类型
import { markRootPinged } from "./fiberLanes"; // 导入标记根节点为 ping 状态的函数
import { ensureRootIsScheduled, markRootUpdated } from "./workLoop"; // 导入确保根节点被调度和标记根节点更新的函数
import { getSuspenseHandler } from "./suspenseContext"; // 导入获取 Suspense 处理器的函数
import { ShouldCapture } from "./fiberFlags"; // 导入捕获标志

/**
 * 处理异常情况
 * @param root - FiberRootNode，表示根节点
 * @param value - 异常值，可以是任何类型
 * @param lane - 当前的 lane
 */
export function throwException(
  root: FiberRootNode,
  value: any,
  lane: React.Lane
) {
  // Error Boundary 处理

  // 检查是否为 thenable 对象
  if (
    value !== null &&
    typeof value === "object" &&
    typeof value.then === "function"
  ) {
    const awakened: React.Awakened<any> = value; // 将 value 视为可唤醒的对象

    const suspenseBoundary = getSuspenseHandler(); // 获取当前的 Suspense 处理器
    if (suspenseBoundary) {
      suspenseBoundary.flags |= ShouldCapture; // 设置捕获标志
    }

    attachPingListener(root, awakened, lane); // 附加 ping 监听器
  }
}

/**
 * 附加 ping 监听器
 * 缓存的作用：多次进入 attachPingListener 的时候，只会执行一次 awakened.then(ping, ping);
 * 这样就不会多次插入 ping
 * @param root - FiberRootNode，表示根节点
 * @param awakened - 可唤醒的对象
 * @param lane - 当前的 lane
 */
function attachPingListener(
  root: FiberRootNode,
  awakened: React.Awakened<any>,
  lane: React.Lane
) {
  // awakened.then(ping, ping); // 触发 ping 监听
  let pingCache = root.pingCache; // 获取根节点的 ping 缓存

  // WeakMap { promise: Set<Lane> }
  let threadIDS: Set<React.Lane> | undefined; // 用于存储唤醒的 lane 集合

  if (pingCache === null) {
    // 如果 pingCache 为空，初始化
    threadIDS = new Set<React.Lane>(); // 创建新的 Set
    pingCache = root.pingCache = new WeakMap<
      React.Awakened<any>,
      Set<React.Lane>
    >(); // 创建新的 WeakMap
    pingCache.set(awakened, threadIDS); // 将 awakened 和对应的 threadIDS 存入 pingCache
  } else {
    // 查找是否可以找到可以唤醒的 threadIDS
    threadIDS = pingCache.get(awakened); // 从 pingCache 中获取对应的 threadIDS
    if (threadIDS === undefined) {
      // 如果没有找到，初始化新的 Set
      threadIDS = new Set<React.Lane>();
      pingCache.set(awakened, threadIDS); // 存入 pingCache
    }
  }

  // 第一次进入
  if (!threadIDS.has(lane)) {
    threadIDS.add(lane); // 将当前 lane 添加到 threadIDS

    // 触发新的更新
    // eslint-disable-next-line no-inner-declarations
    function ping() {
      if (pingCache !== null) {
        pingCache.delete(awakened); // 从 pingCache 中删除 awakened
      }

      // fiberRootNode
      markRootPinged(root, lane); // 标记根节点为 ping 状态
      markRootUpdated(root, lane); // 标记根节点为更新状态
      ensureRootIsScheduled(root); // 确保根节点被调度
    }

    awakened.then(ping, ping); // 当 awakened 被解决时，触发 ping
  }
}
