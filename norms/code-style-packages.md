# 共享包代码风格约定

> 适用于 `packages/components`、`packages/hooks`、`packages/shared-contracts`、`packages/config` 和 `packages/docs`。先遵守 [code-style.md](code-style.md) 共同底线。

## 包边界

- 每个共享包通过 `package.json` 声明名称、入口和 workspace 依赖；消费者使用公开入口，不导入其他包的 `src` 内部路径。
- 应用包可以依赖共享包；共享包禁止依赖 `wuh.site.next`、`wuh.site.console` 或 `wuh.site.nest` 等应用实现。
- 共享包之间只建立必要依赖，避免为了复用单个工具形成反向或循环依赖。
- 修改共享包必须检查所有 workspace 消费者的类型检查、构建和运行时影响。

## shared-contracts

- `@wuh.site/shared-contracts` 只放跨端共享的数据契约、DTO 类型、枚举和可序列化结构。
- 不放 React、Next.js、NestJS、Mongoose Document 或浏览器/Node 专属运行时逻辑。
- 契约变更优先保持向后兼容；删除、重命名或改变字段语义前，检查前端、后端和脚本的全部消费者。
- API 响应类型和数据库内部类型即使字段相似也要明确边界，必要时在服务端或客户端做转换。

## config

- `@wuh.site/types` 只放稳定的共享类型和配置声明，不放业务流程、网络请求或副作用。
- 配置类型与运行时读取分离；不能在纯类型包中读取环境变量。
- 导出的类型应能被前后端独立消费，不引入任一端的实现依赖。

## components 与 hooks

- `components` 保持通用 UI 能力，不依赖业务页面、API 模块或具体路由；详见 [code-style-frontend.md](code-style-frontend.md)。
- `hooks` 保持可复用的状态和副作用封装，不包含具体页面流程或后端实现。
- 公共组件、Hook、类型和工具从稳定公开入口导出，并保持接口变更可追踪。

## 构建产物

- `src` 是共享包源码；`dist` 是构建产物，是否提交遵循各包现有发布配置，不在消费者中直接编辑或依赖未声明产物。
- 不提交 `node_modules`、临时构建缓存或本机生成文件。
- 变更导出入口、构建配置或 `exports` 时，同时验证开发环境、构建环境和实际消费者解析结果。

## 验证

- 类型包变更执行 workspace 类型检查或对应包构建。
- 组件/Hooks 变更至少检查其直接消费者和相关前端构建。
- 契约变更检查前后端编译，以及受影响的请求/响应边界。
