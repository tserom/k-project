# vendor/wujie/ 目录（上游参考）

`vendor/wujie/` 是从 GitHub 拉取的**无界（wujie）官方源码仓库**，包含：

- 框架适配与核心包
- React / Vue 等**演示与文档用示例**

## 使用建议

- **学习与查 API**：结合 [官方文档](https://wujie-micro.github.io/doc/) 阅读本仓库示例。
- **业务代码**：写在 `apps/host`（父）、`apps/user-front` / `apps/hello-front`（子），不要依赖在 `vendor/wujie` 内改业务。
- **同步上游**：在 `vendor/wujie` 内执行 `git pull` 前提交或暂存本地修改，避免与上游冲突。

## 与本工作区集成的关系

父应用通过 npm 包 `wujie-react` 使用无界运行时，**不**需要把 `vendor/wujie` 打进业务构建；该目录仅作源码与示例参考。
