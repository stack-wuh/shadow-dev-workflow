---
name: shadow-dev-ship
description: 完成 Knowledge 闭环后归档、提交和发布。触发词：提交、commit、push、PR、发布、归档。
---
# Shadow Dev Ship — 知识闭环与发布

review 通过后先完成最终知识评估，再归档、提交和发布。

## 1. 检查最终知识评估

brief 必须包含最终结果和理由：新增、更新、废弃或无需变更。新增或更新前按 `domain + keywords + scope` 查重。

### 新增

创建稳定主题卡片，使用 `norms/knowledge-cards.md` 的完整格式，并加入对应 menu 路由。

### 更新

原位更新现有卡片，向 source 追加本次 brief；通过代码或可重复验证确认后更新 verified。

### 废弃

将 status 改为 deprecated，指向替代卡片或明确写明无替代。确认无有效引用后才能删除。

### 无需变更

不创建形式化卡片，只在 brief 记录没有产生长期事实的理由。

Knowledge 不保存一次性实现过程或验证输出。写入和 menu 更新必须在归档或提交前完成。当前 CLI 不负责 Knowledge 文件时使用普通文件编辑，不虚构新 CLI。

## 2. 展示提交预览

```bash
node scripts/shadow-dev.mjs repo inspect
node scripts/shadow-dev.mjs commit plan --name <name> --files <逗号分隔路径> --message "<message>"
```

列出分支、change、明确文件和知识评估结果，使用 AskUserQuestion 确认执行。

## 3. 更新 INDEX

INDEX 只通过 CLI 重建：

```bash
node scripts/shadow-dev.mjs index rebuild plan
node scripts/shadow-dev.mjs index rebuild execute --plan-hash <hash> --confirm
```

## 4. 提交和发布

```bash
node scripts/shadow-dev.mjs commit execute --name <name> --plan-hash <hash> --confirm
node scripts/shadow-dev.mjs publish plan --name <name>
node scripts/shadow-dev.mjs publish execute --name <name> --plan-hash <hash> --confirm
```

禁止原始 Git/GitHub 写命令、`git add .`、`git add -A` 和 `--no-verify`。网络步骤失败立即停止，不换方式重试。

## 5. 归档

只有 GitHub API 已证明 PR merged 后才能归档：

```bash
node scripts/shadow-dev.mjs archive plan --name <name>
node scripts/shadow-dev.mjs archive execute --name <name> --plan-hash <hash> --confirm
```

归档路径为 `shadow-docs/changes/archive/<name>/brief.md`。

## 6. 输出

报告 change、分支、PR、验证结果和最终 Knowledge 动作。
