# 设计：Host 布局拆层 + 新默认皮肤

## Context

现状（2026-06-10 摸底）：

- `src/layouts/MainLayout.jsx` 是唯一布局，耦合导航加载（`loadNavigation`）、页签（`useMicroPageTabs`）、wujie bus、antd `ConfigProvider` 主题、欢迎页。
- 样式：antd 4 + 手写 Less（BEM 类名 `main-layout__*`），token 在 `src/styles/tokens.less`（CSS 变量），布局样式在 `src/styles/layout.less`。
- 路由：`config/routes/index.jsx` 用 `createHashRouter`，`/*` 写死指向 `MainLayout`。
- `SubAppView.jsx` 使用 `main-layout__wujie-host` 类名，与 MainLayout 样式绑定。

## Goals / Non-Goals

**Goals：**

- 布局层（JSX + Less）与逻辑层（导航/页签/微前端）彻底分开；新增一套布局不碰逻辑代码。
- modern 新默认布局，视觉独立 token 化；classic 原样保留。
- 切换机制简单可靠：env 默认 + localStorage 覆盖。

**Non-Goals：**

- 不做布局插件化/动态远程加载；注册表静态 import 即可。
- 不抽象「布局 Props 协议」之外的过度设计——两套布局共享 hooks 与公共组件，JSX 各写各的。

## 改哪些 / 不改哪些

| 范围 | 说明 |
|------|------|
| 改 | `apps/host/src/layouts/`（新结构）、`src/hooks/useNavigation.js`（新）、`src/components/MicroWorkspace.jsx`（新）、`config/routes/index.jsx`（从注册表取布局）、`src/styles/`（token 拆分）、`.env.development`（`VITE_HOST_LAYOUT`、`VITE_HOST_BRAND`）、`docs/layout-guide.md`（新） |
| 只读 | `src/micro/`（页签模型与 hook 逻辑不动，仅调用方迁移）、`src/api/`、`src/config/wujie.js`、`src/utils/`、子应用、网关 |

## 目标结构

```text
apps/host/src/
  hooks/
    useNavigation.js          # nav + navWarning + loading（从 MainLayout 抽出）
  components/
    MicroWorkspace.jsx        # 欢迎页 / Spin / Tabs+SubAppView；内部用 useMicroPageTabs + bus
    SubAppView.jsx            # 不变（类名改为布局无关的 micro-workspace__wujie-host）
    HostUserMenu.jsx          # 不变，被各布局引用
  layouts/
    index.js                  # LAYOUTS 注册表 + getActiveLayout()
    classic/
      ClassicLayout.jsx       # 现 MainLayout JSX 原样迁入
      classic.less            # 现 layout.less 原样迁入
    modern/
      ModernLayout.jsx        # 新布局 JSX
      modern.less             # 新布局样式（只引用 --host-m-* token）
      tokens.less             # modern 专属 token（--host-m-*）
  styles/
    tokens.less               # 全局基础 token（classic 沿用）
```

## Decisions

| # | 决策 | 选择 | 理由 |
|---|------|------|------|
| 1 | 布局选择机制 | `localStorage['host:layout']` > `VITE_HOST_LAYOUT` > `'modern'` | 运行时可切（开发/演示方便），env 做部署默认 |
| 2 | 布局组件接口 | 布局组件零 props，自己调 `useNavigation()` + 渲染 `<MicroWorkspace />` 等公共件 | 避免设计一套「布局 Props 协议」的过度抽象；公共逻辑都在 hooks/组件里 |
| 3 | classic 处理 | JSX/Less 原样搬运仅改 import 路径与逻辑调用点 | 保底可切回，降低回归风险 |
| 4 | modern 样式隔离 | 独立 `--host-m-*` token + `modern-layout__*` 类名前缀 | 两套布局样式互不污染；用户改 modern token 不影响 classic |
| 5 | `SubAppView` 类名 | `main-layout__wujie-host` → `micro-workspace__wujie-host`，样式随 MicroWorkspace 走 | wujie 容器尺寸样式属于内容区公共件，不属于某套布局 |
| 6 | antd ConfigProvider | 每套布局自带主题常量并自行包裹 | modern 与 classic 主色可不同；切布局即切主题 |
| 7 | 品牌文案 | `VITE_HOST_BRAND`，默认「K 中台」 | 摘掉「库存管理中台」硬编码，starter 复用时只改 env |

## modern 布局视觉要点

- 浅色简洁：白色顶栏 + 浅灰工作区背景，主色可由 token 一处修改（默认靛蓝系，与 classic 的 teal 区分）。
- 顶栏：左品牌 + 应用切换；右用户菜单。侧栏：当前应用内路由菜单，可收起。
- 内容区：页签条 + 卡片化子应用容器（圆角 + 轻阴影），由 token 控制。
- 全部尺寸/颜色/圆角/阴影走 `--host-m-*` 变量，`modern/tokens.less` 一个文件就是「换皮入口」。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 搬运 MainLayout 时遗漏状态/effect 导致页签或 bus 行为回归 | classic 布局逐行对照搬运；两套布局共用同一 `MicroWorkspace`，bus 逻辑只有一份 |
| `useMicroPageTabs` 依赖 `navigate`/`pathname`，迁入 MicroWorkspace 后重复实例化 | MicroWorkspace 全局只渲染一份（每套布局恰好渲染一次） |
| localStorage 写了不存在的布局名 | `getActiveLayout()` 找不到时回退 modern 并 console.warn |
| antd 4 主题能力有限（ConfigProvider 仅 primaryColor 等） | 视觉差异主要靠自有 Less token 实现，不依赖 antd 主题系统 |

## Migration Plan

1. 抽 `useNavigation` + `MicroWorkspace`（MainLayout 暂时改为调用它们，行为不变，先验证）。
2. MainLayout → `layouts/classic/`，`config/routes` 接注册表（此时默认仍 classic，验证无回归）。
3. 新增 `layouts/modern/`，默认切到 modern；手测两套布局。
4. 写 `docs/layout-guide.md`。

回滚：`VITE_HOST_LAYOUT=classic` 一行切回旧外观；代码层面 git revert。

## 验证

- `apps/host`：`pnpm dev`（Node 20.19.x）
- 手测清单（两套布局各跑一遍）：顶栏应用切换、侧栏路由点击、多页签开/关/激活、子应用 iframe 挂载、登录/退出用户菜单、`/404`、导航 API 失败降级警告
