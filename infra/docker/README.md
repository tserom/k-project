# Docker 编排（infra/docker）

Compose 文件假设在 **`k-project` 仓库根目录** 执行（与各子项目 `Dockerfile` 中的路径约定一致）：

```bash
cd /path/to/k-project
docker compose -f infra/docker/docker-compose.yml up --build
```

## 包含的服务

| 服务 | 宿主端口 | 说明 |
|------|-----------|------|
| `mysql` | 3306 | 开发数据；root 密码见 compose（勿用于生产） |
| `user-backend` | 8080 | Go API，连接 `mysql` 服务名 |
| `hello-front` | 8100 | 试验子应用静态资源 |
| `user-front` | 8101 | 用户中心子应用 |
| `host` | 8000 | 无界**父应用**（源码目录 `apps/host`） |

浏览器打开：`http://localhost:8000/`。

## 环境变量

当前示例把 MySQL 与 JWT 写在 `docker-compose.yml` 中便于上手。若要外置敏感信息，可改为 `env_file` 并自建 `infra/docker/.env`（勿提交 Git；根 `.gitignore` 已忽略该文件路径时可按需添加）。

## 局限与后续

- 未配置 HTTPS、统一网关与路径前缀；生产需单独设计反向代理与父应用 `VITE_*` 重建策略。
- `vendor/wujie/` 官方仓库不参与镜像构建。
