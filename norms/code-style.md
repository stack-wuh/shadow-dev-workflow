# 代码风格约定

> 跨项目共享，所有代码变更遵循。

## 文件约束

- 单文件不超过 300 行
- 导出函数必须有 JSDoc
- 禁止 `any`，必要时用 `unknown`
- Import 按类型分组（外部库 → 内部包 → 相对路径）

## 命名

- 组件用 PascalCase，文件名和组件名一致
- 函数/变量用 camelCase
- 常量用 UPPER_SNAKE
- 布尔变量用 `is/has/should` 前缀

## 不要做的事

- 不添加未使用的 import
- 不留下注释掉的代码
- 不用 TODO/FIXME 注释（要么做，要么记到 brief 里）
- 不要无理由的 `as` 类型断言

## 错误处理

- 不吞异常，不用空 catch
- Promise 必须有 reject 处理
- 网络请求必须有超时和重试策略
