下面是对您提供的 `react.config.js` 文件的详细讲解和注释。我们将逐行分析代码，并在每个重要部分添加注释，以帮助理解其功能和目的。

```javascript
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
```

### 讲解

1. **导入模块**：

   - 代码开始时导入了一些工具函数和插件，这些是构建过程中的基础组件。`getBaseRollupPlugins` 提供了一些常用的 Rollup 插件，`getPackageJSON` 用于读取 `package.json` 文件，`resolvePkgPath` 用于解析包的路径。

2. **获取包信息**：

   - 使用 `getPackageJSON` 函数获取 `react` 包的名称和模块路径。这是构建过程中的重要步骤，因为后续的输入和输出路径都依赖于这些信息。

3. **路径解析**：

   - `resolvePkgPath` 函数用于获取实际的文件路径，分为两个部分：一个是源文件路径，另一个是构建产物的输出路径。

4. **Rollup 配置**：

   - 该文件导出了一个数组，包含了两个对象，每个对象代表一个构建配置。
   - 第一个对象是针对 `react` 包的配置，指定了输入文件、输出文件及其格式，并使用了插件来生成 `package.json` 文件。
   - 第二个对象是针对 `jsx-runtime` 的配置，指定了输入和输出文件。

5. **UMD 格式**：
   - 所有输出都采用 UMD 格式，这种格式兼容多种模块系统（如 CommonJS 和 AMD），使得构建的库可以在不同的环境中使用。

### 补充说明

- **Rollup** 是一个 JavaScript 模块打包工具，适用于构建库和应用程序。它通过将多个模块打包成一个文件来优化加载性能。
- **UMD（Universal Module Definition）** 是一种模块定义模式，允许模块在多种环境中使用，包括浏览器和 Node.js。
- **生成 `package.json`**：使用 `rollup-plugin-generate-package-json` 插件可以自动生成 `package.json` 文件，确保构建的库包含必要的元数据。

通过这些注释和讲解，希望能帮助您更好地理解这段代码的功能和结构。如果您有任何具体问题或需要进一步的解释，请随时告诉我！
