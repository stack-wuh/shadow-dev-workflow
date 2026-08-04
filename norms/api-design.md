# API 设计规范

> 跨项目共享，涉及前后端接口的变更必须遵循。

## RESTful 约定

- 资源路径用名词复数：`GET /posts`、`POST /posts`、`GET /posts/:id`
- 查询参数用 camelCase：`?pageSize=10&sortBy=createTime`
- 分页接口返回 `{ data, total, page, pageSize }` 统一格式
- POST/PUT 请求体使用 JSON，Content-Type: application/json

## 错误响应

- 使用统一错误格式：`{ statusCode, message, error }`
- 4xx 用于客户端错误（校验、权限），5xx 用于服务端错误
- 404 返回标准 JSON 而非 HTML 页面
- 生产环境不在错误消息中暴露内部堆栈

## 接口设计

- 单一职责：一个接口做一件事
- 避免嵌套过深：最多两层嵌套（如 `/posts/:id/comments`）
- 列表接口默认分页，不给 `pageSize=0` 返回全量
- 新增字段时保持向后兼容，不删旧字段

## 版本策略

- URL 路径版本：`/v2/posts`
- 加版本只在确实有不兼容变更时
- 新版本上线后旧版本标记 deprecated，至少保留两个版本周期
