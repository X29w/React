```tsx
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
```

### 讲解补充：

1. **Thenable 的概念**：

   - Thenable 是一种具有 `then` 方法的对象，通常用于表示异步操作的结果。在 React 中，thenable 主要用于处理异步数据加载的情况，特别是在 Suspense 机制中。

2. **Suspense 的作用**：

   - Suspense 是 React 提供的一种机制，用于处理异步操作的加载状态。它允许开发者在等待异步操作完成时显示备用内容。通过使用 thenable，React 可以在数据加载时暂停渲染，直到数据准备好。

3. **挂起的 Thenable**：

   - `suspendedThenable` 用于存储当前挂起的 thenable。当一个 thenable 被跟踪并且处于 pending 状态时，它会被设置为挂起状态，以便在后续的渲染中可以获取到。

4. **获取挂起的 Thenable**：

   - `getSuspenseThenable` 函数用于获取当前挂起的 thenable。如果没有挂起的 thenable，则抛出错误。这确保了在使用 Suspense 时，开发者能够正确地处理异步数据。

5. **跟踪 Thenable 的状态**：

   - `trackUsedThenable` 函数用于处理 thenable 的状态。它根据 thenable 的状态（fulfilled、rejected 或 pending）执行相应的操作：
     - 如果已完成，返回其值。
     - 如果被拒绝，抛出拒绝的原因。
     - 如果处于 pending 状态，调用 `then` 方法并设置状态。

6. **错误处理**：

   - 在处理 pending 状态时，thenable 的 `then` 方法会被调用，传入 `noop` 作为回调函数。这是为了确保即使没有处理逻辑，thenable 也会被正确地跟踪。

7. **性能优化**：
   - 通过使用状态管理和异常处理，React 能够高效地管理异步操作，确保在数据加载完成后能够正确地恢复渲染状态，从而提高用户体验。
