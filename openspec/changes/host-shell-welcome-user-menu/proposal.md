## Why

当前 Host 壳层（`apps/host`）虽已具备顶栏子应用、侧栏与多页签微前端能力，但首屏体验仍像开发模板：默认跳进子应用登录页、内容区重复展示「app · 路由」标题与页签栏、关闭页签后无法停留在中台首页，且顶栏右上角缺少统一的 SaaS 级用户入口。这与「库存管理中台」作为企业级中台产品的定位不符，也影响首次访问与日常登录/退出流程。

## What Changes

- **布局默认展开**：侧栏与顶栏子应用菜单默认均为展开状态（保持可手动收起，但不默认折叠）。
- **移除内容区冗余标题**：删除主内容区 `main-layout__page-head`（红框所示的「user-front · 登录」等 H1/副标题），避免与页签、侧栏重复。
- **页签可全部关闭**：允许关闭最后一个微前端页签；关闭后不再强制打开首个子应用，而是展示 Host 自有欢迎页。
- **欢迎页（中台首页）**：新增 Host 内置欢迎/落地页，视觉精致，介绍本系统为「中台系统」、子应用能力概览与快捷入口；无打开页签时默认展示该页。
- **顶栏用户区**：Header 右侧增加用户插件（头像/下拉菜单）：未登录显示「登录」并跳转 user-front 登录路由；已登录显示昵称/邮箱摘要，支持「个人中心」「退出登录」；图标与样式符合正经 SaaS 产品观感。
- **默认路由调整**：访问 `/` 时进入欢迎页，而非自动 `replace` 到第一个子应用；从欢迎页可进入各子应用。

## Capabilities

### New Capabilities

- `host-shell-layout`: Host 壳层布局行为——默认展开顶栏/侧栏、移除页面标题区、页签全关逻辑与空态路由。
- `host-welcome-home`: Host 内置欢迎/中台首页的内容、视觉与导航入口契约。
- `host-user-menu`: 顶栏用户区鉴权状态展示、登录跳转、退出与个人中心导航契约。

### Modified Capabilities

（无：`openspec/specs/` 尚无既有 capability 需 delta。）

## Impact

- **代码**：`apps/host` — `MainLayout.jsx`、`useMicroPageTabs.js`、新增欢迎页与用户菜单组件、样式（Less/CSS）、路由（可选 `/` 与欢迎态）。
- **跨应用约定**：登录/退出复用 `user-front` 的 `localStorage` token 键 `user-front:access-token`；`/me` 可选用于展示用户信息（与 user-front 同源 API）。
- **导航 API**：不改动 `GET /api/v1/navigation` 契约；欢迎页子应用列表仍来自 `fetchNavigation()`。
- **子应用**：user-front 登录/个人中心路由路径需与 Host 跳转路径一致（导航配置中的 `user` app routes）。
- **文档**：可在 `docs/MICROFRONTEND.md` 补充 Host 欢迎页与用户区说明（实现阶段可选）。
