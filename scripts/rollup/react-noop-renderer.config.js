// 导入所需的工具函数
import {
  getBaseRollupPlugins, // 获取基本的 Rollup 插件
  getPackageJSON, // 获取 package.json 文件内容
  resolvePkgPath, // 解析包路径
} from "./utils.js";

// 导入生成 package.json 的插件
import generatePackageJson from "rollup-plugin-generate-package-json";
// 导入 Rollup 的别名插件
import alias from "@rollup/plugin-alias";

// 从 package.json 中获取所需的字段
const { name, module, peerDependencies } = getPackageJSON(
  "react-noop-renderer" // 获取 react-noop-renderer 包的信息
);

// 解析 react-noop-renderer 包的路径
const pkgPath = resolvePkgPath(name);
// 解析 react-noop-renderer 产物的路径
const pkgDistPath = resolvePkgPath(name, true);

// 导出 Rollup 配置
export default [
  // 对应 react-noop-renderer 包的配置
  {
    input: `${pkgPath}/${module}`, // 输入文件路径
    output: [
      {
        file: `${pkgDistPath}/index.js`, // 输出文件路径
        name: "reactNoopRenderer", // UMD 格式的全局变量名称
        format: "umd", // 输出格式为 UMD
      },
    ],
    // 标记外部依赖，不进行打包
    external: [...Object.keys(peerDependencies), "scheduler"], // 外部依赖列表
    plugins: [
      // 使用别名插件来处理模块路径
      alias({
        entries: {
          hostConfig: `${pkgPath}/src/hostConfig.ts`, // 定义 hostConfig 的别名
        },
      }),
      // 获取基本的 Rollup 插件配置
      ...getBaseRollupPlugins({
        typescript: {
          tsconfigOverride: {
            compilerOptions: {
              paths: {
                hostConfig: [`./${name}/src/hostConfig.ts`], // TypeScript 路径映射
              },
            },
          },
        },
      }),
      // 生成 package.json 文件
      generatePackageJson({
        inputFolder: pkgPath, // 输入文件夹
        outputFolder: pkgDistPath, // 输出文件夹
        baseContents: ({ name, description, version }) => ({
          name, // 包名
          description, // 包描述
          peerDependencies: {
            react: version, // 依赖的 React 版本
          },
          version, // 包版本
          main: "index.js", // 入口文件
        }),
      }),
    ],
  },
];
