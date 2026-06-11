# 任务清单：Host 布局拆层 + 新默认皮肤

全部在 `apps/host`（独立 git 仓库，单独 commit）。

## 1. 逻辑下沉（行为不变）

- [x] 1.1 新增 `src/hooks/useNavigation.js`：迁入导航加载 + navWarning 状态
- [x] 1.2 新增 `src/components/MicroWorkspace.jsx`：迁入欢迎页/Spin/Tabs+SubAppView 与 `useMicroPageTabs`、wujie bus 接线（forwardRef 暴露 `clearAllTabs` 供退出登录调用）
- [x] 1.3 `SubAppView` 容器类名改为 `micro-workspace__wujie-host`，对应样式迁到 `src/styles/micro-workspace.less`（含 MicroNotFound 改 `micro-workspace__not-found`）
- [x] 1.4 布局改为调用 useNavigation + MicroWorkspace，`pnpm dev` 验证行为与改前一致（与 2.x 合并完成）

## 2. 布局注册表 + classic 迁移

- [x] 2.1 MainLayout JSX/Less 原样迁入 `src/layouts/classic/`（ClassicLayout.jsx + classic.less，仅改 import 与调用点；用户菜单样式按 `.main-layout` 命名空间限定）
- [x] 2.2 新增 `src/layouts/index.js`：注册表 + `getActiveLayoutName/getActiveLayout`（localStorage > env > 默认 modern；未知名回退并 console.warn）
- [x] 2.3 `config/routes/index.jsx` 改为从注册表取布局组件
- [x] 2.4 `.env.development` 增加 `VITE_HOST_LAYOUT=modern`、`VITE_HOST_BRAND=库存管理中台`；品牌名硬编码改读 `src/config/brand.js`（顶栏 + 欢迎页）
- [x] 2.5 classic 跑通回归（菜单/页签/子应用/用户菜单按钮渲染）

## 3. modern 新布局

- [x] 3.1 新增 `src/layouts/modern/tokens.less`（`--host-m-*` 全套视觉变量，文件即换皮入口）
- [x] 3.2 新增 `ModernLayout.jsx` + `modern.less`：白顶栏（pill 选中态）+ 可收起侧栏 + 卡片化内容区，靛蓝主色
- [x] 3.3 默认布局切为 modern；localStorage 覆盖切 classic、未知名回退 modern 均验证通过

## 4. 文档与回归

- [x] 4.1 编写 `apps/host/docs/layout-guide.md`（中文）：架构总览、切换方式、token 修改入口、新增布局四步、回归清单
- [x] 4.2 浏览器回归（modern + classic 各一遍）：顶栏应用切换、侧栏菜单、多页签开/切/关、hello-front 子应用 iframe 挂载与 bus 通信、导航降级警告 Alert、未知布局名回退
- [ ] 4.3 `apps/host` 内 commit（feat: 布局拆层与 modern 默认布局）— 待用户确认后提交

实施备注：
- 登录/退出完整链路依赖 user-backend 运行，本次后端未启动；登录按钮渲染与 `clearAllTabs` 接线已验证（HostUserMenu 组件本身未改动）。
- `pnpm lint`、`pnpm build` 均通过（Node 20.19.5）。
