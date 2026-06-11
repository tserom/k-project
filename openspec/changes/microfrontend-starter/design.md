# 设计：微前端最简 starter 模板

## Context

- k-project 现有完整链路：gateway → host（导航 API 驱动）→ wujie 子应用 → Go 后端。对「new 一个全新项目」来说太重：要数据库、后端、网关全套。
- `host-layout-extract` 完成后，host 的布局/逻辑已分层：`useNavigation` + `MicroWorkspace` + `layouts/` 注册表，starter 可以低成本复用。

## Goals / Non-Goals

**Goals：**

- 复制即跑：不装数据库、不起后端、不配网关，2 个 `pnpm dev` 见到闭环。
- 中文 README 是第一公民：5 步清单 + 常见坑，照着做不需要懂英文。
- 与主工作区演进解耦：starter 是快照式模板，不强求与 apps/host 实时同步。

**Non-Goals：**

- 不做 CLI 生成器；不做 monorepo workspace 共享依赖（两个目录各自独立 `package.json`）。

## 目标结构

```text
templates/microfrontend-starter/
  README.md                     # 中文上手文档（5 步清单 + 常见坑 + 下一步指引）
  host/                         # 精简父应用（端口 6100）
    package.json                # name: starter-host
    vite.config.js              # 6100 + /micro/demo 代理到 6101
    .env.development            # VITE_HOST_LAYOUT=modern、VITE_HOST_BRAND、VITE_DEMO_FRONT_URL
    src/
      config/nav.static.js      # 静态导航：1 个 demo 应用 + 2 条路由
      api/navigation.js         # 直接 resolve 静态导航（保留与正式版相同的数据形状）
      hooks/ components/ layouts/ micro/ utils/ styles/   # 从 apps/host 复制并裁剪
  demo-front/                   # 最小子应用（端口 6101）
    package.json                # name: starter-demo-front
    vite.config.js              # 6101 + CORS 头（wujie iframe 需要）
    src/
      main.jsx                  # wujie 生命周期适配（__WUJIE_MOUNT/UNMOUNT）
      App.jsx                   # HashRouter + 2 个示例页面（首页/关于）
      bridge/wujieBridge.js     # 父子路由同步桥（从范本精简）
  docker/                       # 可选附录
    docker-compose.yml
    gateway-nginx.conf
```

## Decisions

| # | 决策 | 选择 | 理由 |
|---|------|------|------|
| 1 | 模板位置 | 工作区根 `templates/`（进根 git） | 与 `apps/`（运行中业务）区分；复制出去即新项目 |
| 2 | 导航来源 | `nav.static.js` 静态配置，但保持与 `GET /api/v1/navigation` 相同数据形状 | 闭环不依赖后端；将来接后端只换 `api/navigation.js` 实现 |
| 3 | 端口段 | host 6100、demo-front 6101 | 避开主工作区 8100/8500 段，复制后与 k-project 并行起动不冲突 |
| 4 | 登录/用户菜单 | 去掉后端依赖，顶栏保留「未登录」占位 | 最简闭环不含鉴权；README 指引接入方式 |
| 5 | 同步策略 | 快照式模板（不与 apps/host 自动同步） | 自动同步成本高；README 标注模板基线版本日期 |
| 6 | demo-front 技术栈 | React 17 + Vite + JSX（与 host 一致） | 同栈最简，避免 React 19 / TS 额外配置噪音 |
| 7 | Docker | 附录可选，不进 5 步清单 | 闭环走 dev 模式；正式部署再看 docker/ |

## 5 步清单（README 主体）

1. 复制 `templates/microfrontend-starter/` 到新位置并 `git init`。
2. 全局改名：搜索替换 `starter-host` / `starter-demo-front` / 品牌名（README 列出所有出现点）。
3. `nvm use 20` 后分别 `pnpm i`。
4. 两个终端分别 `pnpm dev`（host 6100、demo-front 6101）。
5. 浏览器开 `http://localhost:6100`：看到 modern 布局壳 → 点侧栏菜单 → demo 子应用在页签中加载 → 闭环成立。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 模板与 apps/host 演进脱节 | README 标注「模板基线：apps/host @ 日期」；重大架构变化时手动刷新模板 |
| 复制后忘改 wujie 实例名导致与 k-project 冲突 | README 常见坑第一条；实例名集中在 `nav.static.js` 一处 |
| 裁剪 host 时漏文件导致跑不起来 | 实施最后按 5 步清单完整走一遍验证 |

## Migration Plan

新增目录，不影响任何现有服务；回滚 = 删除 `templates/`。

## 验证

- 按 README 5 步清单从零执行一遍（包括复制到临时目录验证「可整体复制」）。
- `host` 与 `demo-front` 在 Node 20.19.x 下 `pnpm i && pnpm dev` 无报错。
- 浏览器手测：布局壳渲染、菜单点击、子应用页签加载、父子路由同步。
