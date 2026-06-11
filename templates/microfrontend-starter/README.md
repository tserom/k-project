# 微前端最简 Starter（复制即跑）

> 一个可整体复制的最小微前端项目：**host 父应用壳**（无界 wujie + 可切换布局 + 多页签）+ **demo-front 子应用**。
> 不需要后端、不需要数据库、不需要网关，两条 `pnpm dev` 就能看到完整闭环。
>
> 模板基线：k-project `apps/host` @ 2026-06-10（布局拆层版）。

## 目录结构

```text
microfrontend-starter/
├── README.md          ← 你正在读的文档
├── host/              ← 父应用壳（端口 6100）：布局、顶栏/侧栏菜单、多页签、无界挂载
│   └── src/
│       ├── config/nav.static.js   ← ★ 导航配置（加子应用、改菜单都在这）
│       ├── config/brand.js        ← 品牌名（读 .env 的 VITE_HOST_BRAND）
│       ├── layouts/               ← 可切换布局（modern 默认 / classic）
│       ├── components/            ← MicroWorkspace（页签+子应用）、用户菜单等
│       └── micro/ utils/ api/     ← 页签模型、路径工具、导航加载
├── demo-front/        ← 示例子应用（端口 6101）：2 个页面 + 父子路由同步桥
│   └── src/
│       ├── main.jsx               ← wujie 生命周期 + 独立运行兜底
│       ├── bridge/                ← 父子通信桥（事件名约定都在 bridge/wujie.js）
│       └── pages/                 ← 业务页面从这里长出来
└── docker/            ← 可选附录：同源网关部署示例（闭环不需要它）
```

## new 一个新项目：5 步

### 第 1 步：复制目录

```bash
cp -r templates/microfrontend-starter ~/my-new-project
cd ~/my-new-project
git init
```

### 第 2 步：全局改名（所有改名点都列在这）

| 改什么 | 在哪改 | 默认值 |
|--------|--------|--------|
| 品牌名（顶栏+欢迎页） | `host/.env.development` 的 `VITE_HOST_BRAND` | 我的微前端项目 |
| host 包名 | `host/package.json` 的 `name` | starter-host |
| 子应用包名 | `demo-front/package.json` 的 `name` | starter-demo-front |
| 子应用标识 | `host/src/config/nav.static.js` 的 `key` / `microAppKey` / `title` | demo / demo / 示例应用 |
| 路由同步标识 | `nav.static.js` 的 `subAppBusName` 与 `demo-front/src/bridge/wujie.js` 的 `SUB_APP_NAME`（**两边必须一致**） | demo-front |
| 页面标题 | `host/index.html`、`demo-front/index.html` 的 `<title>` | starter-host / starter-demo-front |

> 只是先跑起来看看？这一步可以全部跳过，默认值能直接用。

### 第 3 步：安装依赖（Node 20）

```bash
nvm use 20
cd host && pnpm install && cd ..
cd demo-front && pnpm install && cd ..
```

### 第 4 步：起动（两个终端）

```bash
# 终端 1
cd demo-front && pnpm dev    # http://localhost:6101

# 终端 2
cd host && pnpm dev          # http://localhost:6100
```

### 第 5 步：浏览器验证闭环

打开 `http://localhost:6100`，依次确认：

- [ ] 看到布局壳：顶栏品牌名 + 「示例应用」菜单，欢迎页有子应用入口卡片
- [ ] 点顶栏「示例应用」→ 左侧出现「首页 / 关于」菜单，内容区打开页签，子应用加载成功
- [ ] 点子应用里的「关于」→ 父应用地址栏变成 `#/demo/about`（子 → 父同步 ✓）
- [ ] 点父应用侧栏「首页」→ 子应用回到首页（父 → 子同步 ✓）
- [ ] 开两个页签互相切换、关闭页签正常

全部打勾 = 闭环成立，开始长业务代码。

## 常见坑（先看这里再排查）

| 现象 | 原因与解法 |
|------|-----------|
| 子应用页签里一直转圈/加载失败 | demo-front 没起来，或 `host/.env.development` 的 `VITE_DEMO_FRONT_URL` 端口跟实际不一致 |
| 端口被占用 | 改 `host/vite.config.js`（6100）与 `demo-front/vite.config.js`（6101）；同时改 `.env.development` 里的 URL 和 host vite proxy 的 6101 |
| 和别的项目（如 k-project）同机同跑互相串台 | 无界实例名全局唯一：把 `nav.static.js` 的 `microAppKey` 改成本项目专属值 |
| 改了 `SUB_APP_NAME` 后地址栏不同步了 | `nav.static.js` 的 `subAppBusName` 必须和它保持一致，两边一起改 |
| `pnpm install` 报 Node 版本错误 | 先 `nvm use 20`（host 的 engines 限定 Node 20.19.x） |
| 样式想换颜色 | 改 `host/src/layouts/modern/tokens.less`（一处改主色全局生效） |

## 下一步（按需）

| 想做什么 | 看哪里 |
|----------|--------|
| 再加一个子应用 | 复制 `demo-front/` 改名改端口 → `nav.static.js` 的 `apps` 数组加一项 → host vite proxy 加一条 |
| 换布局 / 定制皮肤 | k-project 的 `apps/host/docs/layout-guide.md`（布局架构与本模板一致） |
| 导航改成后端下发 | 把 `host/src/api/navigation.js` 换成请求实现；接口契约参考 k-project 的 `docs/NAVIGATION_CONFIG.md` |
| 单域名部署 | `docker/` 目录的 compose + nginx 示例（先 `pnpm build`，并把 `VITE_DEMO_FRONT_URL` 改为 `/micro/demo/`） |
| 登录 / 用户中心 | 顶栏用户菜单是占位（无后端时显示禁用的登录按钮）；接入方式参考 k-project 的 user-front + user-backend |
