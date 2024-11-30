// 定义同步回调队列和状态
let syncQueue: ((...args: []) => void)[] | null = null; // 存储待执行的同步回调队列
let isFlushingSyncQueue = false; // 标记当前是否正在刷新同步回调队列

/**
 * 安排一个同步回调
 * @param {(...args: []) => void} callback - 要安排的回调函数
 */
export const scheduleSyncCallback = (callback: (...args: []) => void) => {
  // 如果同步队列为空，初始化队列并添加回调
  if (syncQueue === null) {
    syncQueue = [callback]; // 创建新的队列并添加回调
  } else {
    syncQueue.push(callback); // 将回调添加到现有队列
  }
};

/**
 * 刷新并执行所有同步回调
 */
export const flushSyncCallbacks = () => {
  // 如果当前没有正在刷新队列且队列不为空
  if (!isFlushingSyncQueue && syncQueue) {
    isFlushingSyncQueue = true; // 设置标记为正在刷新
    try {
      // 遍历并执行所有回调
      syncQueue.forEach((callback) => callback());
    } catch (e) {
      // 捕获并处理错误
      if (__DEV__) {
        console.error("flushSyncCallbacks报错", e); // 在开发环境中输出错误信息
      }
    } finally {
      // 重置状态
      isFlushingSyncQueue = false; // 设置标记为未刷新
      syncQueue = null; // 清空队列
    }
  }
};
