```javascript:scripts/vite/vite.config.js
/**
 * Vite 配置文件
 * 用于配置开发服务器和构建选项
 */

/**
 * 导入必要的依赖
 * defineConfig: Vite 的配置函数，提供类型提示
 * react: React 插件，用于处理 JSX
 * replace: 用于替换代码中的变量
 * resolvePkgPath: 自定义工具函数，用于解析包路径
 * path: Node.js 的路径处理模块
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import replace from "@rollup/plugin-replace";
import { resolvePkgPath } from "../rollup/utils";
import path from "path";

/**
 * Vite 配置导出
 * 配置开发环境和构建选项
 */
export default defineConfig({
  plugins: [
    // React 插件：处理 JSX 转换
    react(),
    // 替换插件：在代码中替换变量
    replace({
      __DEV__: true,  // 设置开发环境标志
      preventAssignment: true,  // 防止意外赋值
    }),
  ],
  resolve: {
    // 别名配置：简化导入路径
    alias: [
      {
        find: "react",  // 将 'react' 导入重定向到本地包
        replacement: resolvePkgPath("react"),
      },
      {
        find: "react-dom",  // 重定向 react-dom
        replacement: resolvePkgPath("react-dom"),
      },
      {
        find: "react-noop-renderer",  // 重定向测试渲染器
        replacement: resolvePkgPath("react-noop-renderer"),
      },
      {
        find: "hostConfig",  // 重定向宿主配置
        replacement: path.resolve(
          resolvePkgPath("react-dom"),
          "./src/hostConfig.ts"
        ),
      },
      {
        find: "react-reconciler",  // 重定向协调器
        replacement: resolvePkgPath("react-reconciler"),
      },
      {
        find: "shared",  // 重定向共享模块
        replacement: resolvePkgPath("shared"),
      },
    ],
  },
});
```

# Vite 配置详细解析

## 1. 配置文件的作用

### 基本功能

- 配置开发服务器
- 设置构建选项
- 管理项目依赖
- 处理模块别名

### 重要性

- 是项目构建的核心配置
- 影响开发和生产环境
- 决定项目的模块解析方式

## 2. 插件配置详解

### React 插件

- **作用**：
  - 处理 JSX 语法转换
  - 启用 React 特性支持
  - 优化开发体验

### Replace 插件

- **功能**：
  - 在代码中替换变量
  - 设置环境标志
  - 用于条件编译

## 3. 别名配置深度解析

### 目的

- 简化模块导入路径
- 确保使用本地开发版本
- 便于调试和开发

### 具体配置

1. **React 核心库**

   - 重定向到本地包
   - 便于源码调试
   - 支持实时修改

2. **React DOM**

   - 包含渲染相关代码
   - 自定义渲染器配置
   - 平台特定实现

3. **测试渲染器**

   - 用于测试环境
   - 不产生实际 DOM
   - 验证渲染逻辑

4. **宿主配置**

   - 定义平台特定行为
   - 自定义渲染规则
   - 处理平台差异

5. **协调器**

   - React 核心算法
   - Fiber 架构实现
   - 调度和更新逻辑

6. **共享模块**
   - 公共工具函数
   - 共享类型定义
   - 通用常量

## 4. 开发建议

### 最佳实践

- 根据需要调整别名配置
- 确保路径解析正确
- 注意开发环境标志

### 调试技巧

- 使用 sourcemap
- 检查模块解析
- 验证环境变量

## 5. 注意事项

### 潜在问题

- 路径解析冲突
- 环境变量设置
- 插件兼容性

### 解决方案

- 仔细检查路径配置
- 测试不同环境
- 保持依赖更新

这个配置文件虽然看起来简单，但它是整个项目构建系统的核心，对于理解和开发 React 源码项目至关重要。
