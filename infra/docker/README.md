# Docker 编排（infra/docker）

在 **`k-project` 根目录**执行：

```bash
# 常驻网关（本地 dev 默认，上游为宿主机进程）
docker compose -f infra/docker/docker-compose.yml up gateway -d --build

# 全栈容器联调
GATEWAY_UPSTREAM_MODE=docker docker compose -f infra/docker/docker-compose.yml up --build
```

浏览器访问：**http://k-project.com/**（需先在 `/etc/hosts` 添加 `127.0.0.1 k-project.com`）。

网关可独立启动，其他服务按需在本机 `pnpm dev` 或 `docker compose up <service>`。见 [SINGLE_DOMAIN.md §4](../docs/SINGLE_DOMAIN.md#4-本地开发gateway-常驻--服务按需) 与 `infra/gateway/README.md`。

## 服务与端口

端口以 [docs/WORKSPACE.md](../../docs/WORKSPACE.md) 为准。Compose 内各服务按该端口监听；**仅对外暴露**：

| 服务 | 宿主端口 | 说明 |
|------|-----------|------|
| `gateway` | **80** | 唯一浏览器入口，按路径转发 |
| `mysql` | **3307**→3306 | 可选，本机直连库用 `127.0.0.1:3307` |

`host`、`hello-front`、`user-front`、`user-backend` **不映射宿主端口**，只经 `gateway` 访问。

## 路径（同源）

| URL | 服务 |
|-----|------|
| `/` | 父应用 `host` |
| `/micro/hello/` | `hello-front` |
| `/micro/user/` | `user-front` |
| `/api/v1/...` | `user-backend` |

## 环境变量

敏感信息勿提交 Git。示例见 `env.example`；自建 `infra/docker/.env` 时可覆盖 `MYSQL_HOST_PORT`、`MYSQL_IMAGE`。

## 局限

- 网关仅 HTTP 80；生产 TLS 见 [docs/SINGLE_DOMAIN.md](../../docs/SINGLE_DOMAIN.md)。
- `vendor/wujie/` 不参与镜像构建。
