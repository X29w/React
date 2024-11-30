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
      __DEV__: true, // 设置开发环境标志
      preventAssignment: true, // 防止意外赋值
    }),
  ],
  resolve: {
    // 别名配置：简化导入路径
    alias: [
      {
        find: "react", // 将 'react' 导入重定向到本地包
        replacement: resolvePkgPath("react"),
      },
      {
        find: "react-dom", // 重定向 react-dom
        replacement: resolvePkgPath("react-dom"),
      },
      {
        find: "react-noop-renderer", // 重定向测试渲染器
        replacement: resolvePkgPath("react-noop-renderer"),
      },
      {
        find: "hostConfig", // 重定向宿主配置
        replacement: path.resolve(
          resolvePkgPath("react-dom"),
          "./src/hostConfig.ts"
        ),
      },
      {
        find: "react-reconciler", // 重定向协调器
        replacement: resolvePkgPath("react-reconciler"),
      },
      {
        find: "shared", // 重定向共享模块
        replacement: resolvePkgPath("shared"),
      },
    ],
  },
});
