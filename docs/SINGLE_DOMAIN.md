# 单域名入口（正式域名：k-project.com）

目标：浏览器只访问 **`k-project.com`**，父应用、子应用、API **同源，无需 CORS**。

实现：**`infra/gateway/nginx.conf`** 按路径转发；Compose 已内置 `gateway` 服务（见 `infra/docker/docker-compose.yml`）。

---

## 1. 域名解析

| 环境 | 做法 |
|------|------|
| 本机 | `/etc/hosts`：`127.0.0.1 k-project.com` |
| 线上 | DNS A/AAAA → 网关机器 |

```bash
sudo sh -c 'echo "127.0.0.1 k-project.com" >> /etc/hosts'
```

---

## 2. URL 与路径

| 地址 | 服务 | 容器端口 |
|------|------|----------|
| `http://k-project.com/` | `apps/host` | 8100 |
| `http://k-project.com/micro/hello/` | `apps/hello-front` | 8101 |
| `http://k-project.com/micro/user/` | `apps/user-front` | 8102 |
| `http://k-project.com/micro/inventory/` | `apps/inventory-front` | 8103 |
| `http://k-project.com/api/v1/...` | `apps/user-backend` | 8500 |
| `http://k-project.com/api/inventory/v1/...` | `apps/inventory-backend` | 8501 |

---

## 3. 构建环境变量

### 父应用 `apps/host`

```env
VITE_HELLO_FRONT_URL=/micro/hello/
VITE_USER_FRONT_URL=/micro/user/
```

示例：[apps/host/.env.k-project.com](../apps/host/.env.k-project.com)

### 子应用 `apps/user-front`

```env
VITE_API_BASE=
```

示例：[apps/user-front/.env.k-project.com](../apps/user-front/.env.k-project.com)

子应用 Vite `base: './'`，网关对 `/micro/*` 做 rewrite（见 `infra/gateway/nginx.conf`）。

---

## 4. 本机 Docker 一键起

```bash
# hosts 已配置 k-project.com
docker compose -f infra/docker/docker-compose.yml up --build
```

浏览器：**http://k-project.com/**

80 被占用时，在 compose 里把 `gateway` 的 `ports` 改为 `"8080:80"`，访问 **http://k-project.com:8080/**。

---

## 5. 与多端口 dev 对比

| 模式 | 入口 | CORS |
|------|------|------|
| 多端口 `pnpm dev` | `localhost:8100` / `8101` / `8102` + API `8500` | 可能跨域 |
| 单域名 gateway | **`k-project.com`** | 不需要 |

---

## 6. K8s Ingress 示例

```yaml
spec:
  rules:
    - host: k-project.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend: { service: { name: user-backend, port: { number: 8500 } } }
          - path: /micro/hello
            pathType: Prefix
            backend: { service: { name: hello-front, port: { number: 8101 } } }
          - path: /micro/user
            pathType: Prefix
            backend: { service: { name: user-front, port: { number: 8102 } } }
          - path: /
            pathType: Prefix
            backend: { service: { name: host, port: { number: 8100 } } }
```

TLS：`tls.hosts: [k-project.com]` + cert-manager 等。

---

## 7. 实施顺序

1. 配置 **k-project.com** 解析。  
2. 父/子应用使用上文 **构建环境变量**。  
3. `docker compose up`（含 gateway）。  
4. 验证：无界加载 `/micro/user/`、登录走 `/api/v1/...`，Host 均为 **k-project.com**。
