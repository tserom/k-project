# 规格：Host 可切换布局

## ADDED Requirements

### Requirement: 布局与逻辑分层

Host 父应用 SHALL 把导航加载、页签管理、wujie 挂载等逻辑放在布局无关的 hooks / 公共组件中；布局组件只负责壳层 JSX 与样式。

#### Scenario: 新增一套自定义布局

- **GIVEN** 维护者想做一套新外观
- **WHEN** 复制 `src/layouts/modern/` 为新目录、修改 JSX/Less、在 `src/layouts/index.js` 注册
- **THEN** 不需要改动任何导航 / 页签 / wujie 逻辑代码即可生效

### Requirement: 布局切换机制

激活布局 SHALL 按优先级解析：`localStorage['host:layout']` > `VITE_HOST_LAYOUT` > 默认 `modern`；未知布局名回退默认并告警。

#### Scenario: 用 env 设默认布局

- **GIVEN** `.env.development` 设置 `VITE_HOST_LAYOUT=classic`
- **WHEN** 启动 host 并打开浏览器
- **THEN** 页面以 classic 布局渲染

#### Scenario: 用 localStorage 临时覆盖

- **GIVEN** 浏览器 `localStorage['host:layout']` 设为 `modern`
- **WHEN** 刷新页面
- **THEN** 页面以 modern 布局渲染（覆盖 env 默认值）

#### Scenario: 布局名不存在

- **WHEN** `localStorage['host:layout']` 是未注册的名字
- **THEN** 回退到默认 modern 布局，控制台输出警告，页面正常可用

### Requirement: classic 布局行为不变

classic 布局 SHALL 保持改造前 MainLayout 的视觉与交互，作为保底可切回的旧外观。

#### Scenario: 切回 classic 回归

- **GIVEN** 激活布局为 classic
- **WHEN** 操作顶栏应用切换、侧栏菜单、多页签开关、子应用加载、登录用户菜单
- **THEN** 全部行为与本次改造前一致

### Requirement: modern 布局 token 化

modern 布局 SHALL 把颜色、圆角、阴影、尺寸全部定义为 `--host-m-*` CSS 变量，集中在 `src/layouts/modern/tokens.less`。

#### Scenario: 一处改主色

- **WHEN** 维护者修改 `modern/tokens.less` 中的主色变量
- **THEN** modern 布局所有用到主色的元素同步变化
- **AND** classic 布局不受影响

### Requirement: 两套布局功能等价

任一注册布局下，Host 的核心功能 SHALL 全部可用。

#### Scenario: 核心功能清单

- **GIVEN** 激活布局为 classic 或 modern 之一
- **WHEN** 用户访问 host 并操作
- **THEN** 顶栏应用切换、侧栏路由菜单、多页签（开/关/激活）、wujie 子应用挂载、登录/退出用户菜单、导航 API 失败降级警告全部正常

### Requirement: 品牌文案可配置

品牌名 SHALL 来自 `VITE_HOST_BRAND` 环境变量，未设置时使用默认值。

#### Scenario: starter 复用时改品牌

- **WHEN** 新项目把 `VITE_HOST_BRAND` 设为自己的产品名
- **THEN** 顶栏品牌区显示新名字，无需改代码
