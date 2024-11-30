```javascript:scripts/jest/jest.config.js
/**
 * Jest 配置文件
 *
 * 这个文件用于配置 Jest 测试框架的行为和选项
 * Jest 是一个流行的 JavaScript 测试框架，广泛用于测试 React 应用
 */

/**
 * 导入 Jest 默认配置
 * defaults: Jest 提供的默认配置选项
 * 通过解构赋值获取默认配置，便于后续自定义
 */
const { defaults } = require("jest-config");

/**
 * 导出 Jest 配置
 * 使用 module.exports 导出配置对象
 * 该对象包含了 Jest 的所有配置选项
 */
module.exports = {
  // 合并默认配置
  ...defaults,

  /**
   * rootDir: 指定项目的根目录
   * process.cwd() 返回当前工作目录
   * Jest 将在此目录下查找测试文件和模块
   */
  rootDir: process.cwd(),

  /**
   * modulePathIgnorePatterns: 指定 Jest 忽略的模块路径
   * 这里忽略了 .history 目录
   * 这通常是为了避免测试历史文件或临时文件
   */
  modulePathIgnorePatterns: ["<rootDir>/.history"],

  /**
   * moduleDirectories: 指定模块查找的目录
   * 这里添加了 "dist/node_modules" 目录
   * 允许 Jest 在构建后的目录中查找模块
   */
  moduleDirectories: [...defaults.moduleDirectories, "dist/node_modules"],

  /**
   * testEnvironment: 指定测试环境
   * "jsdom" 表示使用 JSDOM 模拟浏览器环境
   * 适用于测试与 DOM 相关的代码
   */
  testEnvironment: "jsdom",

  /**
   * moduleNameMapper: 用于模块名的映射
   * 这里将 "scheduler" 映射到特定的 mock 文件
   * 这有助于在测试中使用模拟实现
   */
  moduleNameMapper: {
    "^scheduler$": "<rootDir>/node_modules/scheduler/unstable_mock.js",
  },

  /**
   * fakeTimers: 配置 Jest 的假定时器
   * enableGlobally: 全局启用假定时器
   * legacyFakeTimers: 启用旧版假定时器
   * 这对于测试异步代码和定时器相关的逻辑非常有用
   */
  fakeTimers: {
    enableGlobally: true,
    legacyFakeTimers: true,
  },

  /**
   * setupFilesAfterEnv: 指定在测试环境设置后执行的文件
   * 这里指定了一个自定义的 Jest 设置文件
   * 该文件可以用于配置测试环境或引入全局设置
   */
  setupFilesAfterEnv: ["./scripts/jest/setupJest.js"],
};
```

# Jest 配置文件详细解析

## 1. 文件概述

### 目的

- 配置 Jest 测试框架的行为
- 定义测试环境和模块解析方式
- 设置测试运行时的选项

### 重要性

- Jest 是 React 应用中常用的测试框架
- 通过配置文件可以定制测试行为
- 确保测试的可重复性和一致性

## 2. 默认配置的导入

### defaults

- **来源**：从 `jest-config` 模块导入
- **功能**：提供 Jest 的默认配置选项
- **使用方式**：通过解构赋值获取，便于后续自定义

## 3. 配置选项详解

### rootDir

- **定义**：指定项目的根目录
- **获取方式**：使用 `process.cwd()` 获取当前工作目录
- **作用**：Jest 在此目录下查找测试文件和模块

### modulePathIgnorePatterns

- **定义**：指定 Jest 忽略的模块路径
- **示例**：忽略 `.history` 目录
- **作用**：避免测试历史文件或临时文件，减少干扰

### moduleDirectories

- **定义**：指定模块查找的目录
- **示例**：添加 `dist/node_modules` 目录
- **作用**：允许 Jest 在构建后的目录中查找模块，支持构建后的测试

### testEnvironment

- **定义**：指定测试环境
- **示例**：使用 `jsdom` 模拟浏览器环境
- **作用**：适用于测试与 DOM 相关的代码，提供浏览器 API

### moduleNameMapper

- **定义**：用于模块名的映射
- **示例**：将 `scheduler` 映射到特定的 mock 文件
- **作用**：在测试中使用模拟实现，便于控制依赖

### fakeTimers

- **定义**：配置 Jest 的假定时器
- **选项**：
  - `enableGlobally`: 全局启用假定时器
  - `legacyFakeTimers`: 启用旧版假定时器
- **作用**：测试异步代码和定时器相关的逻辑，确保定时器行为可控

### setupFilesAfterEnv

- **定义**：指定在测试环境设置后执行的文件
- **示例**：指定自定义的 Jest 设置文件
- **作用**：用于配置测试环境或引入全局设置，确保测试一致性

## 4. 开发建议

### 最佳实践

- 定期检查和更新配置
- 确保测试环境与生产环境一致
- 使用模块映射简化测试依赖

### 调试技巧

- 使用 `--verbose` 选项查看详细测试输出
- 检查测试环境是否正确配置
- 验证模块路径是否正确解析

## 5. 注意事项

### 潜在问题

- 忽略不必要的文件可能导致测试遗漏
- 模块路径配置错误可能导致测试失败
- 假定时器配置不当可能影响异步测试结果

### 解决方案

- 定期审查和清理测试文件
- 使用 Jest 提供的调试工具
- 参考官方文档获取最新配置建议

这个 Jest 配置文件是确保测试顺利进行的关键部分，理解每个配置选项的作用对于编写高质量的测试至关重要。
