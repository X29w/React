```javascript
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
```

### 讲解

1. **导入模块**：

   - 代码开始时导入了一些工具函数和插件，这些是构建过程中的基础组件。`getBaseRollupPlugins` 提供了一些常用的 Rollup 插件，`getPackageJSON` 用于读取 `package.json` 文件，`resolvePkgPath` 用于解析包的路径。

2. **获取包信息**：

   - 使用 `getPackageJSON` 函数获取 `react-dom` 包的相关信息，包括包名、模块路径和外部依赖。这样可以确保在构建时使用正确的路径和依赖。

3. **路径解析**：

   - `pkgPath` 和 `pkgDistPath` 分别用于获取源代码和构建产物的路径。这是构建工具中常见的做法，以便于管理不同环境下的文件路径。

4. **Rollup 配置**：

   - 该文件导出了一个数组，包含两个配置项。每个配置项都定义了输入文件、输出文件、外部依赖和使用的插件。

5. **UMD 格式**：

   - 输出格式设置为 UMD（Universal Module Definition），这使得生成的模块可以在多种环境中使用，包括 CommonJS、AMD 和浏览器全局变量。

6. **外部依赖**：

   - 在配置中，使用 `external` 属性标记了一些依赖，这些依赖不会被打包到最终的构建中，而是期望在运行时由外部提供。这有助于减小打包后的文件体积。

7. **生成 package.json**：

   - 使用 `generatePackageJson` 插件生成新的 `package.json` 文件，确保构建产物的元数据是最新的。

8. **模块别名**：

   - 使用 `alias` 插件设置模块别名，方便在代码中引用特定的文件路径，提升代码的可读性和可维护性。

9. **第二个配置项**：
   - 针对 `test-utils.ts` 文件的配置，类似于第一个配置项，但只输出一个文件，并且标记了不同的外部依赖。

### 总结

这个配置文件是一个典型的 Rollup 配置示例，展示了如何构建一个库（如 `react-dom`），并处理模块的输入、输出、外部依赖和插件的使用。通过详细的注释和讲解，可以帮助理解每一部分的作用和重要性。
