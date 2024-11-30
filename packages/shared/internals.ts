/**
 * React 内部实现文件
 *
 * 这个文件的主要作用是:
 * 1. 导入 React 的内部实现细节
 * 2. 访问 React 的私有 API
 * 3. 导出这些内部实现供其他模块使用
 *
 * 警告: 这些 API 不应该在普通应用开发中使用,仅供 React 内部或特殊工具使用
 */

import * as React from "react";

/**
 * 访问 React 的内部实现
 *
 * __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:
 * - 这是 React 的私有属性
 * - 包含了 React 的内部实现细节
 * - 名字本身就是一个警告,表示这些 API 不应该被使用
 * - 如果使用这些 API,可能会在未来的 React 版本中破坏
 */
const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

/**
 * 导出内部实现
 * 这样其他模块就可以通过这个文件访问 React 的内部实现
 */
export default internals;
