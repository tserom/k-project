# 导航配置（Host 菜单 / 无界 entry）

> **状态**：已实现（v1）。  
> **关联**：`apps/host` 导航 Mock、`apps/user-backend` API、`apps/user-front` 管理页。

## 背景

父应用 `host` 通过 `fetchNavigation()` 加载 `{ apps: [...] }`，用于顶栏子应用、侧栏 routes、无界 `entryUrl`、默认落地页。当前数据来自 `apps/host/src/mock/navigation.js`（`NAVIGATION_MOCK`），需改为 **MySQL 持久化 + 后端 API**，并在 **user-front** 提供管理页。

## 已定决策（2026-05）

| 项 | 决策 |
|----|------|
| 写权限 | **仅管理员**（方案 B）；当前无 `role` 字段，见下文「权限演进」 |
| `entryUrl` | **不入库**，仅环境变量；`GET` 时由后端 merge |
| 更新粒度 | v1 **整份 PUT**（替换可编辑 payload） |
| Host 读失败 | **严格失败**，展示 Ant Design `Result` 错误页，**不**回退 Mock |
| 读接口鉴权 | `GET /api/v1/navigation` **公开**（Host 启动即可拉菜单） |

## 数据契约（Host 消费）

接口返回须与现有 Mock **形状一致**：

```json
{
  "apps": [
    {
      "key": "user",
      "title": "user-front",
      "microAppKey": "user",
      "entryUrl": "/micro/user/",
      "subAppBusName": "user-front",
      "routes": [
        { "key": "login", "path": "/login", "label": "登录" }
      ]
    }
  ]
}
```

字段说明见 `apps/host/src/mock/navigation.js` 文件头注释。

### 入库 vs 运行时合并

**入库（`payload` JSON）** — 可编辑：

```json
{
  "apps": [
    {
      "key": "user",
      "title": "user-front",
      "microAppKey": "user",
      "subAppBusName": "user-front",
      "routes": [
        { "key": "login", "path": "/login", "label": "登录" }
      ]
    }
  ]
}
```

**不入库** — 由后端环境变量在 `GET` 时注入：

| app `key` | 环境变量 | 默认（同源网关） |
|-----------|----------|------------------|
| `hello` | `MICRO_HELLO_ENTRY_URL` | `/micro/hello/` |
| `user` | `MICRO_USER_ENTRY_URL` | `/micro/user/` |

多端口本地 dev 时，后端 `.env` 与 host 的 `VITE_HELLO_FRONT_URL` / `VITE_USER_FRONT_URL` 应对齐（见 `docs/MICROFRONTEND.md`）。

若某 `app.key` 在 env 中无映射，`GET` 可返回该 app 且 `entryUrl` 为空；Host 侧会将对应页签标为 `invalid`（与现逻辑一致）。

## 数据库

### 表 `navigation_configs`（v1 单行）

| 列 | 类型 | 说明 |
|----|------|------|
| `id` | uint PK | 固定使用 `1`（或 `config_key='default'`） |
| `payload` | JSON / longtext | 可编辑结构，见上 |
| `updated_at` | timestamp | |

- `AutoMigrate` 后若不存在记录，**seed** 为当前 `NAVIGATION_MOCK` 的可编辑部分（去掉 `entryUrl`）。
- seed 中应为 **user** 应用增加管理页 route（实现时路径与 `user-front` 路由一致，例如 `/navigation-admin`）。

## API（`/api/v1`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| `GET` | `/navigation` | 无 | 返回完整 Host 结构（payload + merge `entryUrl`） |
| `PUT` | `/navigation` | JWT + **管理员** | Body 为可编辑 payload，整份替换 |

### 校验（service 层）

- `apps` 为非空数组（若允许空，Host 会显示「暂无子应用」；seed 默认非空）。
- `app.key`、`microAppKey` 在列表内唯一。
- 每个 app 内 `routes[].key` 唯一。
- `routes[].path` 以 `/` 开头。
- 数组顺序 = 顶栏 / 侧栏排序。

### 错误响应

沿用现有：`{"error": "..."}`，HTTP 4xx/5xx。

## 权限演进（当前无 role）

### v1 实现（过渡）

在 `users` 表增加字段（实现时二选一，文档推荐 **A**）：

| 方案 | 字段 | 说明 |
|------|------|------|
| **A** | `role` varchar，默认 `user` | 值：`user` \| `admin`；首个 seed 用户或指定邮箱为 `admin` |
| B | `is_admin` bool | 简单，扩展性差 |

中间件：`middleware.RequireAdmin()`，在 `JWTAuth` 之后检查 `role == admin`（或 `is_admin`），否则 `403`。

`PUT /navigation` 挂在 `protected + RequireAdmin` 下。

### 二期（正式 role）

- 可拆 `roles` / `user_roles` 或权限点；`PUT /navigation` 改为权限码如 `navigation:write`。
- 本文档 v1 的 `role=admin` 可映射为超级管理员角色。

## 各端改动清单（实现时）

### user-backend

- `model.NavigationConfig`、`repository`、`service`（校验 + merge entryUrl）、`handler`
- `config`：`MICRO_HELLO_ENTRY_URL`、`MICRO_USER_ENTRY_URL`
- `router`：注册 GET/PUT；`main.go`：Migrate + seed
- Swagger 注解
- `.env.example` 补充 env 与 `role` 说明

### host

- `src/api/navigation.js`：`fetch('/api/v1/navigation')`，失败抛错 / 返回错误状态
- `MainLayout`：加载失败时 `Result`（status error），**不**使用 Mock
- `vite.config.js`：dev 时 `proxy '/api' -> http://127.0.0.1:8500`（多端口 dev 不调网关时必需）
- `mock/navigation.js`：保留注释与类型参考，不作为运行时数据源

### user-front

- `api/client.ts`：增加 `apiPutJson`
- `api/navigation.ts`：GET（可选，编辑前拉最新）、PUT
- `pages/navigation-admin/`：表单编辑 apps + routes，保存整份 PUT
- `config/routes.ts`：注册管理页路由；需登录；仅管理员可进（前端根据 `/me` 返回的 role 隐藏入口，后端仍 403 兜底）
- `BasicLayout`：管理员可见「导航配置」链接

### 网关 / 文档

- 无需改 `infra/gateway/nginx.conf`（已有 `/api/` → backend）
- 实现后更新 `docs/MICROFRONTEND.md` 一句「导航来自 `/api/v1/navigation`」

## 实施顺序

1. user-backend：表、role 字段、GET/PUT、seed、env merge  
2. host：fetch + 严格错误 UI + vite proxy  
3. user-front：PUT client + 管理页 + `/me` 暴露 role  

## 验证清单

- [ ] `curl GET /api/v1/navigation` 含 `entryUrl`
- [ ] 非 admin JWT `PUT` → 403
- [ ] admin `PUT` 后刷新 host，菜单变化
- [ ] 停 backend 或 500 时 host 显示错误页，无 Mock
- [ ] Docker `k-project.com` 同源路径正常

## 变更记录

| 日期 | 说明 |
|------|------|
| 2026-05-18 | 初稿：确认 admin 写、entryUrl 仅 env、整份 PUT、host 严格失败 |
| 2026-05-18 | v1 实现：backend + host + user-front 管理页 |

## 本地验证

1. `user-backend`：`.env` 设置 `ADMIN_EMAIL=你的邮箱`，启动后注册/登录该邮箱。
2. `user-backend` + `host`（或网关）同时运行；host dev 依赖 `vite` proxy `/api`。
3. 打开父应用，菜单来自接口；停 backend 应看到错误 Result。
4. 管理员登录 user-front →「导航配置」→ 修改保存 → 刷新 host。
