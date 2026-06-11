# 规格：微前端最简 starter 模板

## ADDED Requirements

### Requirement: 复制即跑的最小闭环

`templates/microfrontend-starter/` SHALL 在不依赖后端、数据库、网关的前提下，仅用两条 `pnpm dev` 跑通微前端闭环。

#### Scenario: 最简闭环

- **GIVEN** Node 20.19.x 环境，已在 host/ 与 demo-front/ 分别执行 `pnpm i`
- **WHEN** 两个终端分别执行 `pnpm dev`（host 6100、demo-front 6101）并打开 `http://localhost:6100`
- **THEN** 浏览器显示 modern 布局壳（顶栏 + 侧栏 + 内容区）
- **AND** 点击侧栏菜单后 demo 子应用在页签中加载成功
- **AND** 子应用内切换页面时父应用地址栏路径同步变化

#### Scenario: 整体复制到新位置

- **GIVEN** 把 `templates/microfrontend-starter/` 整目录复制到工作区外任意路径
- **WHEN** 按 README 5 步清单执行（改名 → 安装 → 起动）
- **THEN** 闭环行为与在模板原位置一致

### Requirement: 静态导航与正式契约同形

starter 的导航数据 SHALL 来自本地静态配置，且数据形状与 `GET /api/v1/navigation` 响应一致。

#### Scenario: 将来接入后端导航

- **GIVEN** 新项目要从静态导航升级为后端导航
- **WHEN** 维护者把 `src/api/navigation.js` 的实现从「返回静态配置」换成「请求后端」
- **THEN** 布局、菜单、页签代码无需任何修改

### Requirement: 中文上手文档

starter SHALL 提供中文 README，包含 5 步清单、全局改名点列表与常见坑说明。

#### Scenario: 照文档新建项目

- **GIVEN** 维护者只阅读 `templates/microfrontend-starter/README.md`
- **WHEN** 按 5 步清单操作
- **THEN** 不需要查阅其它英文资料即可完成新项目初始化与闭环验证

#### Scenario: 常见坑提示

- **WHEN** 阅读 README 常见坑章节
- **THEN** 至少覆盖：端口冲突的改法、wujie 实例名冲突的改名点、Node 版本要求（nvm use 20）

### Requirement: 与主工作区端口不冲突

starter 默认端口 SHALL 使用 6100/6101 段，避开 k-project 的 8100/8500 段。

#### Scenario: 与 k-project 并行起动

- **GIVEN** k-project 的 host(8100) 与子应用正在运行
- **WHEN** starter 的 host(6100) 与 demo-front(6101) 同时起动
- **THEN** 两套服务互不冲突，浏览器可分别访问
