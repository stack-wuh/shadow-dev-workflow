# API 设计规范

> 跨项目共享，涉及前后端接口的变更必须遵循。

## 路由约定

- 全局前缀 `/v2`，通过 `app.setGlobalPrefix('v2')` 统一注入，不在每个 Controller 上重复写版本号。
- 资源路径用名词复数：`/v2/content`、`/v2/comments`、`/v2/repos`。
- 避免嵌套过深：最多两层嵌套。
- RSS 等非 JSON 资源使用独立的路径和 Content-Type：`/v2/rss.xml`（`application/xml`）。

## 分页

- 统一返回 `PaginatedResult<T>`：`{ data: T[], pagination: { page, limit, total, totalPages, hasNextPage, hasPreviousPage } }`。
- 查询参数 `page`（1-based）和 `limit`，在 Controller 层从字符串转为数字。
- 列表接口默认分页，不给全量返回；分页元数据由 `buildPaginatedResult()` 统一构造。
- `shared-contracts` 中同时存在旧 `PaginatedResponse<T>`（{items, total?, nextCursor?}），仅用于遗留或 cursor 场景，新接口不扩展。

## 请求参数

- 查询参数（Query）使用 camelCase：`pageSize`、`sortBy`、`finishReading`。
- 少数遗留 query 参使用 snake_case（如 `page_size`），新接口只使用 camelCase。
- POST/PUT 请求体使用 JSON，`Content-Type: application/json`。

## 错误响应

- 统一异常过滤器 `HttpExceptionFilter` 将所有异常转换为：
  `{ statusCode, message, error, timestamp }`。
- 非生产环境额外返回 `path` 并记录完整错误栈。
- 生产环境不暴露内部路径和堆栈。
- 4xx 用于客户端错误，5xx 用于服务端错误；404 返回标准 JSON 而非 HTML。

## 接口设计

- 单一职责：一个接口做一件事。
- 新增字段时保持向后兼容，不删旧字段。
- DTO 使用 class-validator 装饰器声明验证规则，同时生成 OpenAPI schema。

## 版本与文档

- 版本通过全局 `/v2` prefix 实现；不兼容变更时升级 prefix。
- OpenAPI/Swagger 文档仅在非生产环境挂载于 `/v2/docs`。
