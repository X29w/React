"use strict";

// 导入 Jest React 库
const JestReact = require("jest-react");
// 导入调度器匹配器
const SchedulerMatchers = require("./schedulerTestMatchers");

/**
 * captureAssertion 函数
 *
 * 该函数用于捕获在 Jest 匹配器内部抛出的错误
 *
 * 参数:
 * - fn: 一个函数，包含了要执行的断言
 *
 * 返回值:
 * - 如果断言成功，返回 { pass: true }
 * - 如果断言失败，捕获错误并返回 { pass: false, message: () => error.message }
 */
function captureAssertion(fn) {
  try {
    fn(); // 执行传入的断言函数
  } catch (error) {
    return {
      pass: false,
      message: () => error.message, // 返回错误信息
    };
  }
  return { pass: true }; // 断言成功
}

/**
 * assertYieldsWereCleared 函数
 *
 * 该函数用于验证调度器的 yield 日志是否已被清空
 *
 * 参数:
 * - Scheduler: 调度器实例
 *
 * 抛出错误:
 * - 如果 yield 日志不为空，抛出错误，提示用户先调用 expect(Scheduler).toHaveYielded(...)
 */
function assertYieldsWereCleared(Scheduler) {
  const actualYields = Scheduler.unstable_clearYields(); // 清空 yield 日志并获取实际的 yield 值
  if (actualYields.length !== 0) {
    throw new Error(
      "Log of yielded values is not empty. " +
        "Call expect(Scheduler).toHaveYielded(...) first."
    ); // 抛出错误，提示用户
  }
}

/**
 * toMatchRenderedOutput 函数
 *
 * 自定义 Jest 匹配器，用于验证 React 组件的渲染输出
 *
 * 参数:
 * - ReactNoop: React 组件的无操作渲染器
 * - expectedJSX: 预期的 JSX 输出
 *
 * 返回值:
 * - 如果 ReactNoop.getChildrenAsJSX() 返回的结果与 expectedJSX 匹配，返回 { pass: true }
 * - 否则，返回 { pass: false } 和错误信息
 */
function toMatchRenderedOutput(ReactNoop, expectedJSX) {
  if (typeof ReactNoop.getChildrenAsJSX === "function") {
    const Scheduler = ReactNoop._Scheduler; // 获取调度器实例
    assertYieldsWereCleared(Scheduler); // 验证 yield 日志是否已清空
    return captureAssertion(() => {
      expect(ReactNoop.getChildrenAsJSX()).toEqual(expectedJSX); // 断言渲染输出是否匹配
    });
  }
  return JestReact.unstable_toMatchRenderedOutput(ReactNoop, expectedJSX); // 使用默认的匹配器
}

// 导出自定义匹配器
module.exports = {
  ...SchedulerMatchers, // 合并调度器匹配器
  toMatchRenderedOutput, // 导出自定义的渲染输出匹配器
};
