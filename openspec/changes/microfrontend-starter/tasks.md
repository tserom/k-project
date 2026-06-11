# 任务清单：微前端最简 starter 模板

依赖：`host-layout-extract` 完成后实施。全部改动在工作区根 git 仓库。

## 1. host 精简壳（templates/microfrontend-starter/host/）

- [x] 1.1 从 `apps/host` 复制并裁剪：layouts（modern + 注册表）、MicroWorkspace、micro/、utils/、styles/
- [x] 1.2 新增 `src/config/nav.static.js`：1 个 demo 应用 + 2 条路由（数据形状与导航 API 一致）
- [x] 1.3 `src/api/navigation.js` 改为返回静态导航；删除 mock 降级与后端请求
- [x] 1.4 用户菜单去后端化：顶栏保留未登录占位（无 user 应用时登录按钮 disabled）
- [x] 1.5 端口 6100；`.env.development` 配 `VITE_HOST_LAYOUT` / `VITE_HOST_BRAND` / `VITE_DEMO_FRONT_URL`

## 2. demo 子应用（templates/microfrontend-starter/demo-front/）

- [x] 2.1 最小 Vite + React 17 工程，端口 6101，dev server 带 CORS 头
- [x] 2.2 `main.jsx` 实现 wujie 生命周期（`__WUJIE_MOUNT` / `__WUJIE_UNMOUNT`）+ 独立运行兜底
- [x] 2.3 2 个示例页面 + 父子路由同步桥（`src/bridge/WujieRouteBridge.jsx` + `wujie.js`）

## 3. 文档与可选附录

- [x] 3.1 `templates/microfrontend-starter/README.md`（中文）：5 步清单、全局改名点列表、常见坑、下一步指引
- [x] 3.2 `docker/` 附录：compose + 网关 nginx 示例（标注可选）
- [x] 3.3 根 `README.md` 目录地图登记 `templates/`

## 4. 闭环验证

- [x] 4.1 host 与 demo-front 各自 `pnpm i && pnpm build` 无报错（Node 20.19.5）
- [x] 4.2 dev 起动后 `http://localhost:6100` / `6101` 均 HTTP 200；布局壳与子应用 dev server 正常
- [x] 4.3 复制到 `/tmp/my-new-project`，按 README 安装 + 双 `pnpm dev` 跑通

实施备注：
- 默认端口段为 **6100/6101**（与 k-project 8100 段错开，README 与 vite/env 已统一）。
- wujie 事件名与 k-project 主仓区分：`host-active-page` / `sub-app-route`（避免同机多项目 bus 冲突）。
- 浏览器手测（菜单/页签/父子路由同步）建议在本地打开 `http://localhost:6100` 按 README 第 5 步清单勾选。
