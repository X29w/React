```javascript:scripts/jest/reactTestMatchers.js
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
```

# React Test Matchers 详细解析

## 1. 文件概述

### 目的

- 提供自定义的 Jest 匹配器，用于测试 React 组件的渲染输出
- 通过捕获和处理错误，增强测试的可读性和可维护性

### 重要性

- 测试是确保代码质量的关键环节
- 自定义匹配器可以提高测试的灵活性和准确性
- 使得测试代码更具可读性，便于团队协作

## 2. 主要函数解析

### captureAssertion 函数

- **功能**：捕获在执行断言时抛出的错误
- **参数**：一个函数 `fn`，包含要执行的断言
- **返回值**：
  - `{ pass: true }`：表示断言成功
  - `{ pass: false, message: () => error.message }`：表示断言失败，并返回错误信息
- **使用场景**：在自定义匹配器中执行断言时，确保错误信息能够被捕获并返回

### assertYieldsWereCleared 函数

- **功能**：验证调度器的 yield 日志是否已被清空
- **参数**：调度器实例 `Scheduler`
- **抛出错误**：如果 yield 日志不为空，抛出错误，提示用户先调用 `expect(Scheduler).toHaveYielded(...)`
- **使用场景**：在测试异步操作时，确保调度器的状态是正确的，避免测试结果不一致

### toMatchRenderedOutput 函数

- **功能**：自定义 Jest 匹配器，用于验证 React 组件的渲染输出
- **参数**：
  - `ReactNoop`：无操作渲染器，用于获取组件的渲染结果
  - `expectedJSX`：预期的 JSX 输出
- **返回值**：
  - 如果渲染输出与预期匹配，返回 `{ pass: true }`
  - 否则，返回 `{ pass: false }` 和错误信息
- **使用场景**：在测试中验证组件的渲染结果是否符合预期，确保组件的行为正确

## 3. 导出模块

### 模块导出

- **合并调度器匹配器**：通过 `...SchedulerMatchers` 合并调度器相关的匹配器
- **导出自定义匹配器**：将 `toMatchRenderedOutput` 导出，以便在测试中使用

## 4. 开发建议

### 最佳实践

- 在测试中使用自定义匹配器，提高可读性
- 确保捕获错误信息，便于调试
- 定期审查和更新匹配器，确保与 React 版本兼容

### 调试技巧

- 使用 `console.log` 输出调试信息，帮助定位问题
- 在捕获错误时，提供详细的上下文信息，便于理解错误原因

## 5. 发散性思维与补充

### 测试的重要性

- 测试是软件开发中的重要环节，能够确保代码的正确性和稳定性
- 自定义匹配器可以帮助开发者更好地表达测试意图，提高代码的可维护性

### React 测试的挑战

- 测试异步操作和状态管理可能会比较复杂
- 需要确保测试环境与生产环境一致，以避免潜在问题

### 未来的扩展

- 可以考虑添加更多自定义匹配器，以支持不同的测试场景
- 结合 TypeScript 提供类型安全，增强代码的可读性和可维护性

这个文件是 React 测试框架中的重要组成部分，通过自定义匹配器，开发者可以更灵活地编写测试，确保组件的行为符合预期。理解这些概念对于编写高质量的测试至关重要。
