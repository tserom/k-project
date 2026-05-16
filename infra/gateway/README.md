# 单域名网关（k-project.com）

Nginx 按路径把 **`k-project.com`** 转发到各 Docker 服务，**同源、无 CORS**。

配置：`nginx.conf`。镜像由 **`infra/docker/docker-compose.yml`** 中的 `gateway` 服务构建（不再单独叠加 compose 文件）。

## 路径

| URL | 上游服务 | 端口 |
|-----|----------|------|
| `/` | `host` | 8100 |
| `/micro/hello/` | `hello-front` | 8101 |
| `/micro/user/` | `user-front` | 8102 |
| `/api/` | `user-backend` | 8500 |

端口以 [docs/WORKSPACE.md](../../docs/WORKSPACE.md) 为准。

## 启动

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

访问 **http://k-project.com/**（hosts：`127.0.0.1 k-project.com`）。

## 构建变量

- `apps/host/.env.k-project.com` — 子应用 entry 同源路径  
- `apps/user-front/.env.k-project.com` — `VITE_API_BASE` 留空  

详见 [docs/SINGLE_DOMAIN.md](../../docs/SINGLE_DOMAIN.md)。
