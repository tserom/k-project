## Context

Host（`apps/host`）是 wujie 微前端父应用，通过 `fetchNavigation()` 驱动顶栏子应用、侧栏 routes 与 `useMicroPageTabs` 多页签。当前实现要点：

- `MainLayout.jsx`：`topNavVisible` / `siderCollapsed` 默认已为 `true` / `false`，但根路径 `/` 会在 `useLayoutEffect` 中 `replace` 到 `nav.apps[0]`，用户永远看不到中台首页。
- 内容区含 `main-layout__page-head`（H1「app · route」）+ Ant Design `Tabs`；关闭最后一个页签时 `onTabEdit` 会重建首个子应用页签。
- 无 Host 级用户组件；鉴权 token 由子应用 `user-front` 写入 `localStorage` 键 `user-front:access-token`。

约束：Hash 路由、导航 API 形状不变、同源网关 `/api/v1`。

## Goals / Non-Goals

**Goals:**

- 首屏与中台品牌：欢迎页 + 顶栏用户区，SaaS 级视觉（与现有 teal 主题 `HOST_THEME` 协调，避免紫色渐变模板感）。
- 壳层信息架构简化：去掉重复页面标题；页签可零个；`/ ` 落地欢迎页。
- 登录/退出/个人中心从 Host 统一入口完成，跳转路径来自导航配置。

**Non-Goals:**

- 不改 user-backend API、导航 PUT/GET 契约。
- 不在 Host 内重做登录表单（仍由 user-front 子应用承载）。
- 不实现跨子应用 SSO 或新 token 存储方案（继续共享 `user-front:access-token`）。
- 不改造子应用内部 BasicLayout 的二级导航条（截图中米色条为 user-front 自有布局，本变更仅 Host 壳层）。

## Decisions

### 1. 欢迎页为 Host 原生路由态，而非子应用

**选择**：当 `routePrefix === null`（pathname `/` 或空）且 `pageTabs.length === 0` 时渲染 `WelcomeHome` 组件；移除「无 prefix 则 redirect 到 `apps[0]`」逻辑。

**理由**：欢迎页不应占用 wujie 实例，避免关闭页签后又加载子应用；加载更快、样式完全可控。

**备选**：把欢迎页做成 `inventory` 或 `user` 的一个 route —— 拒绝，会污染导航配置且依赖 entry 可用。

### 2. 页签全关与路由同步

**选择**：`onTabEdit` 在关闭最后一签时：`setPageTabs([])`、`setActiveTabId(null)`、`navigate('/', { replace: true })`，不再 `buildPageTab` 回退首应用。

**理由**：满足「页签可全部关掉」；与欢迎页路由态一致。

**同步**：从侧栏/顶栏点击进入子应用时，仍由现有 `useLayoutEffect` + pathname 逻辑打开/追加页签。

### 3. 移除 `main-layout__page-head`，保留 Tabs 栏

**选择**：删除 H1/副标题区块；页签 label 仍显示「app · route」供识别。若后续需更简，可再隐藏单页签时的 tabs 条（本阶段保留 tabs 以利多任务）。

**理由**：红框区域即重复信息；用户明确要求去掉。

### 4. 顶栏用户菜单组件 `HostUserMenu`

**选择**：新建 `src/components/HostUserMenu.jsx`（或 `.tsx` 若后续迁移），置于 Header 右侧 `main-layout__header-end`。

**状态**：

| 状态 | UI | 行为 |
|------|-----|------|
| 无 token | 图标按钮 +「登录」 | `navigate(buildMicroPath('user', '/login'))`，并确保打开对应页签 |
| 有 token | Avatar + 下拉 | 展示 email（`/me`）或占位；菜单项：个人中心、退出登录 |
| 退出 | — | `clearToken()` + `storage` 事件通知刷新；可选 `navigate('/')` 回欢迎页 |

**鉴权读取**：Host 内小模块 `hostAuth.js` 复用与 user-front 相同的 `STORAGE_KEY`（常量单一来源，注释标明须与 user-front 同步），`window.addEventListener('storage')` + 自定义 `host-auth-changed` 事件在登录成功后由子应用或 Host 派发（实现时若子应用已写 token，Host 轮询一次 `/me` 即可）。

**`/me`**：`GET /api/v1/me`（与 user-front 相同 base）；开发环境 Vite proxy 已指向 user-backend。

**路径解析**：`loginPath`、`profilePath` 从 `nav.apps` 中 `key === 'user'` 的 routes 解析 `login`、`profile`（或 `personal`）的 path，避免硬编码。

**图标**：Ant Design Icons — `UserOutlined`、`LoginOutlined`、`LogoutOutlined`、`IdcardOutlined`；Avatar 用首字母或 `UserOutlined`；下拉用 `Dropdown` + `theme="dark"` 适配顶栏。

**备选**：在 wujie 内嵌 user-front 顶栏 —— 拒绝，各子应用顶栏不一致，无法作为中台统一入口。

### 5. 欢迎页视觉方向

**选择**：「精炼企业中台」— 深色顶栏延续，内容区浅色卡片 + 微妙网格/渐变背景；主色 `#0d9488`（现有 primary）；字体沿用 `Plus Jakarta Sans` + 中文系统栈；分区：Hero（中台定位文案）、能力卡片（来自 `nav.apps` 动态生成快捷入口）、简要说明/footer。

**实现**：`WelcomeHome.jsx` + `welcome-home.less`；不引入新 npm 依赖（不新增 Motion 包 unless host 已有）。

### 6. 默认展开

**选择**：确认初始 state 保持 `topNavVisible: true`、`siderCollapsed: false`；移除误导性「隐藏顶栏」为默认交互的任何 effect（无代码变更则文档化即可）。

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Token 键与 user-front 漂移 | 常量 `USER_FRONT_TOKEN_KEY` 双端注释同步；tasks 含对照检查 |
| 关闭页签后子应用 wujie 实例仍占内存 | `destroyInactiveTabPane` 可在欢迎态卸载所有 tab children；或保持 false 换更快切回（实现时优先 welcome 态不渲染 Tabs） |
| `/me` 失败仍显示已登录 | 401 时 `clearToken` 并切未登录态 |
| 深链接 `/user/login` 仍有效 | 仅取消 `/` → 首应用的自动跳转 |

## Migration Plan

1. 部署 Host 前端即可；无 DB/API 迁移。
2. 用户书签若依赖「打开根路径即进 user-front」，将改为欢迎页 —— 属预期行为变更，可在 README 一句说明。
3. 回滚：还原 `MainLayout` 重定向与 `onTabEdit` 回退逻辑。

## Open Questions

- user-front 个人中心 route key 是 `profile` 还是其他 —— 实现时读 `navigation` seed / mock 中 `routes` 的 key，Host 按 key 匹配。
- 欢迎页是否需要展示「库存」子应用以外的静态文案 —— 默认动态 `nav.apps` 即可。
