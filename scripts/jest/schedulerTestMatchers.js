// scripts/jest/schedulerTestMatchers.js
"use strict"; // 严格模式，帮助捕获潜在的错误

/**
 * 捕获断言的函数
 * @param {Function} fn - 传入的断言函数
 * @returns {Object} - 返回一个对象，包含断言结果和错误信息（如果有的话）
 */
function captureAssertion(fn) {
  // 尝试执行传入的断言函数
  try {
    fn(); // 执行断言
  } catch (error) {
    // 如果断言抛出错误，捕获错误并返回
    return {
      pass: false, // 断言未通过
      message: () => error.message, // 返回错误信息
    };
  }
  return { pass: true }; // 断言通过
}

/**
 * 断言调度器的已产生值被清除
 * @param {Object} Scheduler - 调度器对象
 * @throws {Error} - 如果已产生值不为空，则抛出错误
 */
function assertYieldsWereCleared(Scheduler) {
  const actualYields = Scheduler.unstable_clearYields(); // 清除已产生的值并获取
  if (actualYields.length !== 0) {
    throw new Error(
      "Log of yielded values is not empty. " +
        "Call expect(Scheduler).toHaveYielded(...) first."
    ); // 如果不为空，抛出错误
  }
}

/**
 * 断言调度器已刷新并产生预期的值
 * @param {Object} Scheduler - 调度器对象
 * @param {Array} expectedYields - 预期的已产生值
 * @returns {Object} - 断言结果
 */
function toFlushAndYield(Scheduler, expectedYields) {
  assertYieldsWereCleared(Scheduler); // 确保已产生值被清除
  Scheduler.unstable_flushAllWithoutAsserting(); // 刷新所有内容
  const actualYields = Scheduler.unstable_clearYields(); // 清除并获取实际已产生的值
  return captureAssertion(() => {
    expect(actualYields).toEqual(expectedYields); // 断言实际值与预期值相等
  });
}

/**
 * 断言调度器已刷新并产生预期的值（通过数量）
 * @param {Object} Scheduler - 调度器对象
 * @param {Array} expectedYields - 预期的已产生值
 * @returns {Object} - 断言结果
 */
function toFlushAndYieldThrough(Scheduler, expectedYields) {
  assertYieldsWereCleared(Scheduler); // 确保已产生值被清除
  Scheduler.unstable_flushNumberOfYields(expectedYields.length); // 刷新指定数量的已产生值
  const actualYields = Scheduler.unstable_clearYields(); // 清除并获取实际已产生的值
  return captureAssertion(() => {
    expect(actualYields).toEqual(expectedYields); // 断言实际值与预期值相等
  });
}

/**
 * 断言调度器已刷新直到下一个绘制
 * @param {Object} Scheduler - 调度器对象
 * @param {Array} expectedYields - 预期的已产生值
 * @returns {Object} - 断言结果
 */
function toFlushUntilNextPaint(Scheduler, expectedYields) {
  assertYieldsWereCleared(Scheduler); // 确保已产生值被清除
  Scheduler.unstable_flushUntilNextPaint(); // 刷新直到下一个绘制
  const actualYields = Scheduler.unstable_clearYields(); // 清除并获取实际已产生的值
  return captureAssertion(() => {
    expect(actualYields).toEqual(expectedYields); // 断言实际值与预期值相等
  });
}

/**
 * 断言调度器已刷新但不产生任何值
 * @param {Object} Scheduler - 调度器对象
 * @returns {Object} - 断言结果
 */
function toFlushWithoutYielding(Scheduler) {
  return toFlushAndYield(Scheduler, []); // 调用toFlushAndYield，传入空数组
}

/**
 * 断言调度器已刷新过期的值
 * @param {Object} Scheduler - 调度器对象
 * @param {Array} expectedYields - 预期的已产生值
 * @returns {Object} - 断言结果
 */
function toFlushExpired(Scheduler, expectedYields) {
  assertYieldsWereCleared(Scheduler); // 确保已产生值被清除
  Scheduler.unstable_flushExpired(); // 刷新过期的值
  const actualYields = Scheduler.unstable_clearYields(); // 清除并获取实际已产生的值
  return captureAssertion(() => {
    expect(actualYields).toEqual(expectedYields); // 断言实际值与预期值相等
  });
}

/**
 * 断言调度器已产生预期的值
 * @param {Object} Scheduler - 调度器对象
 * @param {Array} expectedYields - 预期的已产生值
 * @returns {Object} - 断言结果
 */
function toHaveYielded(Scheduler, expectedYields) {
  return captureAssertion(() => {
    const actualYields = Scheduler.unstable_clearYields(); // 清除并获取实际已产生的值
    expect(actualYields).toEqual(expectedYields); // 断言实际值与预期值相等
  });
}

/**
 * 断言调度器已刷新并抛出错误
 * @param {Object} Scheduler - 调度器对象
 * @param {...*} rest - 其他参数
 * @returns {Object} - 断言结果
 */
function toFlushAndThrow(Scheduler, ...rest) {
  assertYieldsWereCleared(Scheduler); // 确保已产生值被清除
  return captureAssertion(() => {
    expect(() => {
      Scheduler.unstable_flushAllWithoutAsserting(); // 断言刷新时抛出错误
    }).toThrow(...rest); // 断言抛出的错误与预期相符
  });
}

// 导出所有的断言函数
module.exports = {
  toFlushAndYield,
  toFlushAndYieldThrough,
  toFlushUntilNextPaint,
  toFlushWithoutYielding,
  toFlushExpired,
  toHaveYielded,
  toFlushAndThrow,
};
