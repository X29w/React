// scripts/rollup/react.config.js

// 导入所需的工具函数
import {
  getBaseRollupPlugins, // 获取基础的 Rollup 插件
  getPackageJSON, // 获取 package.json 文件内容
  resolvePkgPath, // 解析包路径
} from "./utils.js"; // 从 utils.js 文件中导入这些函数

import generatePackageJson from "rollup-plugin-generate-package-json"; // 导入生成 package.json 的插件

// 获取 package.json 中的 name 和 module 字段
const { name, module } = getPackageJSON("react"); // 这里获取的是 "react" 包的名称和模块路径
// 解析 react 包的路径
const pkgPath = resolvePkgPath(name); // 解析出 react 包的实际路径
// 解析 react 产物的路径
const pkgDistPath = resolvePkgPath(name, true); // 解析出 react 产物的输出路径

// 导出 Rollup 配置
export default [
  // 对应 react 包的配置
  {
    input: `${pkgPath}/${module}`, // 输入文件为 react 包的模块路径
    output: {
      file: `${pkgDistPath}/index.js`, // 输出文件为产物路径下的 index.js
      name: "React", // UMD 格式下的全局变量名
      format: "umd", // 输出格式为 UMD（通用模块定义）
    },
    plugins: [
      ...getBaseRollupPlugins(), // 使用基础的 Rollup 插件
      generatePackageJson({
        inputFolder: pkgPath, // 输入文件夹为 react 包的路径
        outputFolder: pkgDistPath, // 输出文件夹为产物路径
        baseContents: ({ name, description, version }) => ({
          name, // 包名
          description, // 包描述
          version, // 包版本
          main: "index.js", // 指定主入口文件
        }),
      }),
    ],
  },
  // jsx-runtime 包的配置
  {
    input: `${pkgPath}/src/jsx.ts`, // 输入文件为 jsx-runtime 的源文件
    output: [
      // jsx-runtime 的输出配置
      {
        file: `${pkgDistPath}/jsx-runtime.js`, // 输出文件为 jsx-runtime.js
        name: "jsx-runtime", // UMD 格式下的全局变量名
        format: "umd", // 输出格式为 UMD
      },
      {
        file: `${pkgDistPath}/jsx-dev-runtime.js`, // 输出文件为 jsx-dev-runtime.js
        name: "jsx-dev-runtime", // UMD 格式下的全局变量名
        format: "umd", // 输出格式为 UMD
      },
    ],
    plugins: getBaseRollupPlugins(), // 使用基础的 Rollup 插件
  },
];
