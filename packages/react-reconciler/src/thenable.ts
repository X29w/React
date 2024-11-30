function noop() {} // 空函数，用于处理 thenable 的未处理状态

// 定义一个特殊的错误，用于 Suspense 机制
export const SuspenseException = new Error(
  "这不是真实的错误, 是 Suspense 工作的一部分, 如果你捕获到这个错误，请将它继续抛出去"
);

// 用于存储当前挂起的 thenable
let suspendedThenable: React.Thenable<any> | null = null;

/**
 * 获取当前挂起的 thenable
 * @returns {React.Thenable<any>} - 返回挂起的 thenable
 * @throws {Error} - 如果没有挂起的 thenable，则抛出错误
 */
export function getSuspenseThenable(): React.Thenable<any> {
  if (suspendedThenable === null) {
    throw new Error("应该存在 suspendedThenable，这是一个 bug"); // 抛出错误，表示存在问题
  }
  const thenable = suspendedThenable; // 获取当前挂起的 thenable
  suspendedThenable = null; // 清空挂起的 thenable
  return thenable; // 返回挂起的 thenable
}

/**
 * 处理并跟踪 thenable 的状态
 * @param {React.Thenable<T>} thenable - 要跟踪的 thenable
 * @returns {T} - 返回 thenable 的值
 * @throws {any} - 如果 thenable 被拒绝，则抛出拒绝的原因
 */
export function trackUsedThenable<T>(thenable: React.Thenable<T>) {
  switch (thenable.status) {
    case "fulfilled":
      return thenable.value; // 如果已完成，返回值
    case "rejected":
      throw thenable.reason; // 如果被拒绝，抛出拒绝的原因
    default:
      if (typeof thenable.status === "string") {
        thenable.then(noop, noop); // 如果状态是字符串，调用 then 方法
      } else {
        // untracked
        // 处理 pending 状态
        const pending = thenable as unknown as React.PendingThenable<
          T,
          void,
          any
        >;
        pending.status = "pending"; // 设置状态为 pending
        pending.then(
          (val) => {
            if (pending.status === "pending") {
              // @ts-ignore
              const fulfilled: FulfilledThenable<T, void, any> = pending;
              fulfilled.status = "fulfilled"; // 设置状态为 fulfilled
              fulfilled.value = val; // 存储值
            }
          },
          (err) => {
            // @ts-ignore
            const rejected: RejectedThenable<T, void, any> = pending;
            rejected.status = "rejected"; // 设置状态为 rejected
            rejected.reason = err; // 存储拒绝的原因
          }
        );
      }
      break;
  }
  suspendedThenable = thenable; // 将当前 thenable 设置为挂起状态
  throw SuspenseException; // 抛出 SuspenseException
}
