# 后端代码风格约定

> 适用于 `packages/wuh.site.nest` 的 NestJS API 和服务端脚本。先遵守 [code-style.md](code-style.md) 共同底线，再遵守本规范。

## 模块分层

- 业务模块按 `Module → Controller → Service → DTO/Schema` 组织，模块边界按领域划分。
- Module 负责依赖注册和模块组合；Controller 负责协议适配、参数接收和响应组织；Service 负责业务流程与持久化协调。
- Controller 不直接操作 Mongoose Model，不承载复杂业务判断或外部 API 编排。
- DTO、Schema 和 API 响应类型分别表达请求校验、持久化结构和对外契约，不能因为字段相似而混为同一类型。

## Controller 与 DTO

- 路由、HTTP 方法、参数来源和响应语义必须清晰；路由资源遵守 [api-design.md](api-design.md)。
- 请求参数使用 DTO 和 class-validator 声明校验规则；不要只依赖 Service 内部的手工判断。
- Controller 负责把字符串 query/path 参数转换为业务需要的类型，转换失败返回明确的客户端错误。
- 认证、授权和输入校验应在对应 Guard、Pipe 或 DTO 边界处理，不在业务方法中重复散落。

## Service 与异常

- Service 对业务失败使用 NestJS 标准异常，异常信息应能帮助调用方定位问题但不泄露内部实现。
- 不捕获后又忽略异常；需要补充上下文时记录结构化日志后继续抛出或转换为合适的标准异常。
- 全局异常格式由 `HttpExceptionFilter` 统一处理，模块不自行返回另一套错误结构。
- 外部 GitHub、微信读书等请求集中在对应服务或适配层，明确超时、有限重试、鉴权和失败映射。

## 日志与配置

- 使用项目既有 Pino/Nest Logger 方式记录日志，避免直接使用 `console.log` 作为服务运行日志。
- 日志不记录 token、密码、完整 Cookie 或其他敏感凭据；必要上下文使用结构化字段。
- 环境变量通过配置边界读取并校验，不在业务代码中到处直接访问 `process.env`。
- 开发、测试和生产配置的差异必须显式，不以默认值静默连接错误的数据库或外部服务。

## 脚本

- seed、同步和维护脚本放在所属模块或服务端脚本目录，复用正式 Schema/Service 的数据约束时必须明确复用关系。
- 脚本必须处理连接建立、失败退出和连接释放；重复执行语义要么幂等，要么明确限制执行范围。
- 脚本不应被 Controller 或生产请求路径反向依赖。
