# Host 布局拆层 + 新默认皮肤

## Why

`apps/host/src/layouts/MainLayout.jsx`（约 310 行）目前同时承担：布局 JSX（顶栏/侧栏/内容区）、导航 API 加载、多页签管理、wujie bus 接线、antd 主题、欢迎页渲染。布局与业务逻辑完全耦合，导致：

- 想换一套外观必须改动业务逻辑代码，风险大；
- 无法保留多套布局互相切换（维护者明确需要「以后定制各式各样的布局」）；
- 当前外观不满意，但不敢直接在唯一布局上动刀。

## What Changes

- **逻辑下沉**（布局无关，所有布局共享）：
  - 新增 `src/hooks/useNavigation.js`：从 MainLayout 抽出导航加载 + 降级警告状态。
  - 新增 `src/components/MicroWorkspace.jsx`：内容区整体（欢迎页 / Loading / 多页签 + SubAppView），内部消化 `useMicroPageTabs` 与 wujie bus。
- **布局注册表**：新增 `src/layouts/index.js`，集中注册所有布局；激活布局由 `VITE_HOST_LAYOUT`（默认值）+ `localStorage['host:layout']`（运行时覆盖）决定。
- **classic 布局**：现 MainLayout 的 JSX 与样式原样迁入 `src/layouts/classic/`，行为不变，保底可切回。
- **modern 布局（新默认）**：`src/layouts/modern/`，浅色简洁风；布局样式全部走独立命名空间的 CSS 变量 token，改色/换字体只动 token 文件。
- **文案配置化**：品牌名「库存管理中台」等硬编码改为 `VITE_HOST_BRAND` 环境变量（带默认值）。
- **中文定制指南**：`apps/host/docs/layout-guide.md`，讲清楚怎么复制布局目录做定制、token 在哪改、怎么切换布局。

**Non-goals**：

- 不升级 antd 4 / React 17 版本。
- 不改导航 API 契约、wujie 挂载方式、页签模型逻辑。
- 不改子应用、网关、端口。
- classic 布局不做任何视觉调整。

## Capabilities

### New Capabilities

- `host-switchable-layouts`：Host 父应用可切换布局架构（注册表 + 逻辑下沉 + classic/modern 双布局）。

## Impact

- **应用**：仅 `apps/host`（独立 git 仓库，单独 commit）
- **文件**：`src/layouts/`、`src/hooks/`、`src/components/`、`config/routes/index.jsx`、`src/styles/`、`.env.development`、`docs/layout-guide.md`
- **行为**：默认外观变为 modern；设置 `VITE_HOST_LAYOUT=classic` 或 `localStorage['host:layout']='classic'` 可切回旧外观
- **验证**：`pnpm dev` 起 host，两套布局下手测顶栏菜单 / 侧栏 / 多页签 / 子应用挂载 / 登录用户菜单
