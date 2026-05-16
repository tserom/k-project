# Docker 约定（k-project）

## 目标

一条命令拉起 **MySQL + 后端 + 三个前端 + 网关**，浏览器只访问 **`http://k-project.com/`**（同源、无 CORS）。

编排：`infra/docker/docker-compose.yml`（已内含 `gateway` 服务）。

## 启动

```bash
# hosts: 127.0.0.1 k-project.com
docker compose -f infra/docker/docker-compose.yml up --build
```

## 构建变量（同源）

| 服务 | 变量 | Docker 默认值 |
|------|------|----------------|
| `host` | `VITE_HELLO_FRONT_URL` | `/micro/hello/` |
| `host` | `VITE_USER_FRONT_URL` | `/micro/user/` |
| `user-front` | `VITE_API_BASE` | （空，请求 `/api/v1/...`） |

修改后需 `docker compose build` 对应服务。

## 端口

见 [WORKSPACE.md](./WORKSPACE.md) 端口名单。容器内 nginx / Go 监听端口须与网关 `infra/gateway/nginx.conf` upstream 一致。

## 环境变量与安全

- 勿将真实 `JWT_SECRET`、数据库密码提交 Git。
- 本地 compose 示例值在 `docker-compose.yml`；外置可用 `infra/docker/.env`（勿提交）。

## 故障排查

1. **子应用白屏**：确认父应用构建时 `VITE_*` 为 `/micro/hello/`、`/micro/user/`，且通过 **k-project.com** 访问（非多端口 localhost）。
2. **API 失败**：浏览器 Network 里 API 的 Host 应为 `k-project.com`，路径 `/api/v1/...`。
3. **后端连不上库**：`DB_HOST=mysql`，等 MySQL healthy。
4. **80 被占用**：改 compose 中 `gateway` 的 `ports` 为 `"8080:80"`，访问 `http://k-project.com:8080/`。
5. **镜像拉取超时**：见下文 Hub 加速说明（与原 README 相同）。

### 构建时报 `auth.docker.io` 超时

配置 Docker Desktop **Settings → Docker Engine** 的 `registry-mirrors`，或走代理后重试 `docker pull nginx:alpine`。
