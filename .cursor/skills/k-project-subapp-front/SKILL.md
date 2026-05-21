---
name: k-project-subapp-front
description: >-
  k-project 微前端子应用标准：以 user-front 为范本的目录结构、config/routes 约定、
  wujie 父子路由同步与 API 客户端。在改 apps/user-front、apps/hello-front、
  apps/inventory-front、新建子应用页面/路由/布局，或接入 Host 无界时使用。
---

# k-project 子应用前端（结构 + 微前端）

工作区根打开时读本 skill；单独打开子仓库时读各 app 下同名 skill（内容一致或含 app 特例）。

参考文档：[`docs/MICROFRONTEND.md`](../../../docs/MICROFRONTEND.md)、[`docs/WORKSPACE.md`](../../../docs/WORKSPACE.md)（端口唯一信息源）。

## 标准目录（以 `apps/user-front` 为范本）

```
apps/<subapp>/
├── config/
│   └── routes.ts              # 路由唯一真源（RouteConfig[]）
├── src/
│   ├── App.tsx                # BrowserRouter + WujieRouteBridge + Routes
│   ├── main.tsx               # 区分 wujie 与独立运行（见下文）
│   ├── vite-env.d.ts          # Window.$wujie、__WUJIE_* 类型
│   ├── api/                   # client.ts + 按域拆分 auth.ts、*.ts
│   ├── assets/
│   ├── components/            # <Name>/index.tsx（含 WujieRouteBridge）
│   ├── layouts/               # <Name>/index.tsx + index.less，内用 <Outlet />
│   ├── pages/                 # <name>/index.tsx + index.less
│   ├── styles/                # global.less、variables.less
│   └── utils/                 # router.tsx、wujie.ts、authToken.ts
├── vite.config.ts             # base: './'；@ → src；端口见 WORKSPACE.md
├── tsconfig.json              # include: src, config（或 tsconfig.app.json）
└── package.json
```

### 路由约定

| 字段 | 含义 |
|------|------|
| `path` | 相对父级的路径 |
| `component` | `'./login'` → `src/pages/login/index.tsx`；`'./layouts/BasicLayout'` → `src/layouts/BasicLayout/index.tsx` |
| `children` | 子路由 |
| `index` | index 路由 |
| `redirect` | `<Navigate replace />` |

`src/utils/router.tsx` 用 `import.meta.glob` 收集 `pages/**/index.tsx` 与 `layouts/**/index.tsx`，**不要**在 `App.tsx` 手写 `<Route />`。

**新增页面**：`src/pages/foo/index.tsx` + 在 `config/routes.ts` 增加 `{ path: 'foo', component: './foo' }`。

### 路径别名

统一 `@/` → `src`。`config/` 在 src 外，从 `App.tsx`：`import routesConfig from '../config/routes'`。

### 样式

- 全局：`src/styles/global.less`（在 `App.tsx` import）
- 变量：`src/styles/variables.less`
- 页面/布局：同目录 `index.less`
- user-front / inventory-front：Less + `javascriptEnabled: true`

## 微前端（wujie）适配

### Vite

```ts
export default defineConfig({
  base: './',  // 必须，子应用资源相对路径
  // ...
});
```

### main.tsx 生命周期

在 `window.__POWERED_BY_WUJIE__` 时只注册钩子，由父应用触发挂载/卸载；否则直接渲染。

- **React 17**（user-front）：`ReactDOM.render` / `unmountComponentAtNode`
- **React 18+**（hello-front、inventory-front）：`createRoot` / `root.unmount()`

```ts
if (IS_WUJIE) {
  window.__WUJIE_MOUNT = renderApp;
  window.__WUJIE_UNMOUNT = unmountApp;
} else {
  renderApp();
}
```

### 子应用常量（每个子应用一份 `src/utils/wujie.ts`）

| 常量 | user-front | inventory-front | hello-front |
|------|------------|-----------------|-------------|
| `SUB_APP_NAME` | `user-front` | `inventory-front` | `hello-front` |
| 父→子 bus 事件 | `user-front-route` | `inventory-front-route` | （若接 Host 需对齐） |
| 子→父 bus 事件 | `sub-route-change`（共用） | 同左 | 同左 |

Host 按导航项 `subAppBusName` 派发 **`{subAppBusName}-route`**（如 `inventory-front-route`）。`instanceId` 用于多实例 tab，子应用只处理匹配自己的 payload。

### WujieRouteBridge（无 UI，挂在 BrowserRouter 内）

1. 读 `$wujie.props.initialPath`，启动时 `navigate` 一次（含 0/50/200ms 重试）
2. `bus.$on(<APP>-route, …)` 被动跳转
3. 子路由变化时 `bus.$emit('sub-route-change', SUB_APP_NAME, { path, instanceId })`；首次挂载跳过 emit 防循环

独立运行时 bus/props 为空，**无副作用**。

### 鉴权 token（跨子应用）

| 应用 | localStorage 键 | 说明 |
|------|-----------------|------|
| user-front | `user-front:access-token` | 登录写入 |
| inventory-front | **同上** | 与 Host 顶栏、user 子应用统一登录 |
| Host 顶栏 | 读同一键 | 见 `docs/MICROFRONTEND.md` |

### API 基址

| 应用 | `VITE_API_BASE` | 请求前缀 |
|------|-----------------|----------|
| user-front | 空（同源） | `/api/v1/...` |
| inventory-front | `/api/inventory` | `/api/inventory/v1/...` |
| hello-front | 通常无 API | — |

Docker/网关下同源；多端口 dev 可在 `vite.config` 配 proxy（inventory 已示例）。

### 入口 URL

| 模式 | inventory |
|------|-----------|
| 同源 | `/micro/inventory/` |
| 多端口 dev | `http://localhost:8103/` |

导航 `entryUrl` 由 user-backend env merge，不在路由 config 里写死。

## 各子应用差异（改代码前确认）

| 应用 | React | 路由配置 | 备注 |
|------|-------|----------|------|
| user-front | 17 + antd v4 | `config/routes.ts` + TS | **结构范本** |
| inventory-front | 19 + antd v5 | 同 user-front | 跟范本对齐 |
| hello-front | 17 + JSX | `App.jsx` 内手写 Route | 试验 app，逐步可对齐 config/routes |

## 前端实现原则（与 `.agents/skills/frontend-design` 配合）

子应用 UI 应**业务清晰、可维护**，不必套用 marketing 页夸张视觉：

- 布局：`layouts` + Ant Design（或项目既有组件库）
- 表单/表格：跟 antd 版本一致（v4 vs v5 勿混用）
- 新页先走路由 config + `pages/<name>/index.tsx` 流程，再写业务
- 避免在子应用重复实现 Host 顶栏登录；用共享 token + Host 菜单

## 禁止事项

- 不要 `base: '/'` 部署子应用静态资源
- 不要删除 `WujieRouteBridge` 或改乱 `SUB_APP_NAME` / bus 事件名（须与 Host、导航 `subAppBusName` 一致）
- 不要在 `pages` 外放路由组件（glob 扫不到）
- 不要为 inventory 单独造登录 token 键（除非产品明确要求独立账号体系）

## 相关 skill

- 工作区：[`k-project-workspace`](../k-project-workspace/SKILL.md)
- user-front 工具链：[`apps/user-front/.cursor/skills/project-environment`](../../../apps/user-front/.cursor/skills/project-environment/SKILL.md)
