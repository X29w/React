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
