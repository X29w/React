import { FiberRootNode } from "./fiber";
import { markRootPinged } from "./fiberLanes";
import { ensureRootIsScheduled, markRootUpdated } from "./workLoop";
import { getSuspenseHandler } from "./suspenseContext";
import { ShouldCapture } from "./fiberFlags";

export function throwException(root: FiberRootNode, value: any, lane: React.Lane) {
  // Error Boundary

  // thenable
  if (
    value !== null &&
    typeof value === "object" &&
    typeof value.then === "function"
  ) {
    const awakened: React.Awakened<any> = value;

    const suspenseBoundary = getSuspenseHandler();
    if (suspenseBoundary) {
      suspenseBoundary.flags |= ShouldCapture;
    }

    attachPingListener(root, awakened, lane);
  }
}

/**
 * 缓存的作用： 多次进入attachPingListener的时候，只会执行一次 awakened.then(ping, ping);
 * 这样就不会多次插入ping
 * @param root
 * @param wakeable
 * @param lane
 */
function attachPingListener(
  root: FiberRootNode,
  awakened: React.Awakened<any>,
  lane: React.Lane
) {
  // awakened.then(ping, ping);
  let pingCache = root.pingCache;

  // WeakMap { promise: Set<Lane> }
  let threadIDS: Set<React.Lane> | undefined;

  if (pingCache === null) {
    threadIDS = new Set<React.Lane>();
    pingCache = root.pingCache = new WeakMap<React.Awakened<any>, Set<React.Lane>>();
    pingCache.set(awakened, threadIDS);
  } else {
    // 查找是否可以找到可以唤醒的 theadIDS
    threadIDS = pingCache.get(awakened);
    if (threadIDS === undefined) {
      threadIDS = new Set<React.Lane>();
      pingCache.set(awakened, threadIDS);
    }
  }

  // 第一次进入
  if (!threadIDS.has(lane)) {
    threadIDS.add(lane);

    // 触发新的更新
    // eslint-disable-next-line no-inner-declarations
    function ping() {
      if (pingCache !== null) {
        pingCache.delete(awakened);
      }

      // fiberRootNode
      markRootPinged(root, lane);
      markRootUpdated(root, lane);
      ensureRootIsScheduled(root);
    }

    awakened.then(ping, ping);
  }
}
