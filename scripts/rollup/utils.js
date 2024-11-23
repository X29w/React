import path from "path";
import fs from "fs";
import ts from "rollup-plugin-typescript2";
import cjs from "@rollup/plugin-commonjs";

// 包路径
const pkgPath = path.resolve(__dirname, "../../packages");
// 打包产物路径
const distPath = path.resolve(__dirname, "../../dist/node_modules");

/**
 * @name 获取包路径或者是打包产物路径
 * @param pkgName
 * @param isDist 是否是打包
 */
export const resolvePkgPath = (pkgName, isDist) => {
  return isDist ? `${distPath}/${pkgName}` : `${pkgPath}/${pkgName}`;
};

/**
 * @name 解析包对应的package.json文件
 * @param pkgName
 */
export const getPackageJSON = (pkgName, isDist) => {
  //1. 包路径 + Package.json
  const path = `${resolvePkgPath(pkgName, isDist)}/package.json`;
  const str = fs.readFileSync(path, { encoding: "utf-8" });
  return JSON.parse(str);
};

export const getBaseRollupPlugins = ({ typeScriptConfig = {} } = {}) => [
  cjs(),
  ts(typeScriptConfig),
];
