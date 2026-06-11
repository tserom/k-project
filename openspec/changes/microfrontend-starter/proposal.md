# 微前端最简 starter 模板

## Why

维护者很喜欢当前的微前端架构（wujie 父子 + 导航驱动 + 多页签），希望以后开新项目时不必从 k-project 里手工剥离：现有 `docs/SCAFFOLD_MICROFRONTEND.md` 只解决「在本工作区加子应用」，没有解决「整体起一个全新项目」。需要一个**可整体复制、开箱即跑的最小闭环模板**，并配中文文档。

## What Changes

- 新增 `templates/microfrontend-starter/`，内含：
  - **`host/`**：精简父应用。复用 `host-layout-extract` 抽好的布局架构（modern 布局 + 注册表 + MicroWorkspace），导航改为**本地静态配置** `src/config/nav.static.js`，不依赖任何后端；去掉登录用户菜单的后端依赖（保留占位）。
  - **`demo-front/`**：最小子应用。1 个页面 + wujie 路由桥（从现有子应用范本精简），证明父子通信与页签闭环。
  - **`README.md`**（中文）：「new 一个新项目的 5 步清单」（复制 → 全局改名 → pnpm i → 起动 → 验证）+ 常见坑（端口冲突、wujie 实例名冲突、Node 版本）。
  - **`docker/`**（可选附录）：compose + nginx 网关示例，不是闭环必经。
- 根 `README.md` 目录地图中登记 `templates/`。

**最简闭环定义**：两条 `pnpm dev` 分别起 host 与 demo-front，浏览器打开 host 端口能看到 modern 布局壳、顶栏/侧栏菜单可点、demo 子应用在页签中加载成功。**不含** Go 后端、数据库、登录鉴权。

**Non-goals**：

- 不做 CLI 脚手架（`create-xxx` 命令）；v1 就是「复制目录」。
- 不含后端导航 API（README 注明要接后端时看 `docs/NAVIGATION_CONFIG.md`）。
- 不替代 `docs/SCAFFOLD_MICROFRONTEND.md`（那是「本工作区加子应用」场景）。
- starter 内不引入 TypeScript 改造、不升级依赖版本（与 host 现状保持一致，降低维护成本）。

## Capabilities

### New Capabilities

- `microfrontend-starter-template`：可复制的微前端最小闭环模板（host 壳 + demo 子应用 + 静态导航 + 中文上手文档）。

## Impact

- **目录**：新增 `templates/microfrontend-starter/`（属于工作区根 git 仓库）；根 `README.md` 加一行登记
- **依赖**：复用 Change `host-layout-extract` 的布局架构，必须在其完成后实施
- **不涉及**：现有 `apps/*`、`infra/`、网关、端口表（starter 用独立端口段，README 内自述）
- **验证**：按 starter README 从零走一遍 5 步清单，闭环跑通
