// scripts/rollup/react-dom.config.js

// 导入所需的工具函数和插件
import {
  getBaseRollupPlugins, // 获取基础的 Rollup 插件
  getPackageJSON, // 获取 package.json 文件内容
  resolvePkgPath, // 解析包路径
} from "./utils.js";

import generatePackageJson from "rollup-plugin-generate-package-json"; // 生成 package.json 的插件
import alias from "@rollup/plugin-alias"; // 用于处理模块别名的插件

// 获取 package.json 中的 name 字段，module 字段和 peerDependencies 字段
const { name, module, peerDependencies } = getPackageJSON("react-dom"); // 获取 react-dom 包的信息
// 解析 react-dom 包的路径
const pkgPath = resolvePkgPath(name); // 获取 react-dom 的路径
// 解析 react-dom 产物的路径
const pkgDistPath = resolvePkgPath(name, true); // 获取 react-dom 产物的路径

// 导出 Rollup 配置
export default [
  // 第一个配置项，针对 react 包
  {
    input: `${pkgPath}/${module}`, // 输入文件路径
    output: [
      {
        file: `${pkgDistPath}/index.js`, // 输出文件路径
        name: "ReactDOM", // UMD 模块的名称
        format: "umd", // 输出格式为 UMD
      },
      {
        file: `${pkgDistPath}/client.js`, // 输出文件路径
        name: "client", // UMD 模块的名称
        format: "umd", // 输出格式为 UMD
      },
    ],
    // 标记外部依赖，不进行打包
    external: [...Object.keys(peerDependencies), "scheduler"], // 将 peerDependencies 和 scheduler 标记为外部依赖
    plugins: [
      // webpack resolve alias
      alias({
        entries: {
          hostConfig: `${pkgPath}/src/hostConfig.ts`, // 设置模块别名
        },
      }),
      ...getBaseRollupPlugins(), // 使用基础的 Rollup 插件
      generatePackageJson({
        inputFolder: pkgPath, // 输入文件夹
        outputFolder: pkgDistPath, // 输出文件夹
        baseContents: ({ name, description, version }) => ({
          name, // 包名
          description, // 包描述
          peerDependencies: {
            react: version, // 设置 peerDependencies 中的 react 版本
          },
          version, // 包版本
          main: "index.js", // 指定主入口文件
        }),
      }),
    ],
  },
  // 第二个配置项，针对 test-utils.ts 文件
  {
    input: `${pkgPath}/test-utils.ts`, // 输入文件路径
    output: [
      {
        file: `${pkgDistPath}/test-utils.js`, // 输出文件路径
        name: "testUtils", // UMD 模块的名称
        format: "umd", // 输出格式为 UMD
      },
    ],
    // 标记外部依赖，不进行打包
    external: ["react", "react-dom"], // 将 react 和 react-dom 标记为外部依赖
    plugins: [...getBaseRollupPlugins()], // 使用基础的 Rollup 插件
  },
];
