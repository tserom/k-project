# 单域名网关（k-project.com）

Nginx 按路径把 **`k-project.com`** 转发到各服务，**同源、无 CORS**。

镜像内有两份配置，由环境变量 **`GATEWAY_UPSTREAM_MODE`** 选择：

| 模式 | 配置文件 | 上游 | 适用场景 |
|------|----------|------|----------|
| **`host`**（默认） | `nginx.host.conf` | `host.docker.internal:端口` | 本地开发：网关常驻 Docker，各服务在本机 `pnpm dev` / `go run` 按需启动 |
| **`docker`** | `nginx.docker.conf` | Compose 服务名 | 按需 `docker compose up <service>`，服务跑在容器网络内 |

## 本地开发（推荐）

### 1. 常驻 gateway

```bash
# k-project 根目录
docker compose -f infra/docker/docker-compose.yml up gateway -d --build
```

默认 `GATEWAY_UPSTREAM_MODE=host`，**不依赖**其他 Compose 服务。未启动的上游返回 **502**（网关本身保持运行）。

### 2. 按需启动本机服务

在对应目录启动 dev 进程（端口见 [docs/WORKSPACE.md](../../docs/WORKSPACE.md)）：

```bash
cd apps/host && pnpm dev          # 8100
cd apps/hello-front && pnpm dev   # 8101
cd apps/user-front && pnpm dev    # 8102
cd apps/user-backend && go run .  # 8500
```

浏览器访问 **http://k-project.com/**（hosts：`127.0.0.1 k-project.com`）。

父/子应用 env 使用同源路径，见 [docs/SINGLE_DOMAIN.md](../../docs/SINGLE_DOMAIN.md)（如 `apps/host/.env.k-project.com`）。

### 3. 按需启动 Docker 服务

若希望上游走容器而非宿主机进程：

```bash
GATEWAY_UPSTREAM_MODE=docker docker compose -f infra/docker/docker-compose.yml up gateway -d --build
docker compose -f infra/docker/docker-compose.yml up user-backend -d   # 按需
```

## 路径

| URL | 端口（host / docker 模式相同） |
|-----|--------------------------------|
| `/` | 8100 |
| `/micro/hello/` | 8101 |
| `/micro/user/` | 8102 |
| `/micro/inventory/` | 8103 |
| `/api/` | 8500 |
| `/api/inventory/` | 8501 |

## 一键全栈（可选）

仍可用完整 Compose 启动所有服务；全容器联调时建议 `GATEWAY_UPSTREAM_MODE=docker`：

```bash
GATEWAY_UPSTREAM_MODE=docker docker compose -f infra/docker/docker-compose.yml up --build
```
