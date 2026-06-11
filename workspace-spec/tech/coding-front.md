# 前端编码约定

## 范本选择

| 场景 | 复制自 |
|------|--------|
| 新业务子应用（默认） | `apps/inventory-front` |
| 与用户中心/登录深度集成 | `apps/user-front` |
| 最小 demo | `apps/hello-front` |

Skill：`.cursor/skills/k-project-subapp-front/SKILL.md`

## 目录与路由

- 路由：`config/routes.ts`（或项目内等价物）
- API：`src/services/*Api.ts` 或 `src/api/`
- wujie：子应用 `base: './'`；与 host 路由同步见 MICROFRONTEND.md

## API 分层（L0–L3）

完整规则在 [.cursor/rules/api-layering-decision.mdc](../../.cursor/rules/api-layering-decision.mdc)。摘要：

| 层 | 含义 |
|----|------|
| L0 | 工具，不发 HTTP |
| L1 | 每个 endpoint 一个函数（必须） |
| L2 | 多步编排（慎用，副作用必须一致） |
| L3 | 一个用户动作一个 export + 步骤注释 |

`*Api.ts` 顶部维护**入口索引**：用户场景 → 函数 → URL → 刷新哪些列表。

## React 可读性

见 [.cursor/rules/react-readability-conventions.mdc](../../.cursor/rules/react-readability-conventions.mdc)：

- 默认不用 `useCallback` / `useMemo`
- 禁止 `useEffect` 串联业务
- 一个按钮对应一个具名 `async function`

## 鉴权

与子应用、host 共用：`localStorage['user-front:access-token']`（键名与 user-front 一致）。

## 验证

```bash
cd apps/<front>
pnpm install
pnpm dev    # 或 pnpm build
pnpm lint   # 若有
```
