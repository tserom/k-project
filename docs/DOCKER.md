# Docker 约定（k-project）

## 目标

- 一条命令拉起：**MySQL + user-backend + 三个前端静态站点（nginx）**，端口与本地开发保持一致，便于父应用通过无界加载子应用。
- 配置集中在 `infra/docker/docker-compose.yml`；各应用自带 `Dockerfile`（位于 `apps/<name>/`）。

## 浏览器可访问 URL（关键）

无界在**浏览器**里加载子应用 `entry`，因此父应用镜像构建时写入的 `VITE_HELLO_FRONT_URL` / `VITE_USER_FRONT_URL` 必须是宿主机访问地址（默认 compose 映射为 `http://localhost:8100/`、`http://localhost:8101/`）。

若部署到域名或反向代理路径前缀变化，需**重新构建父应用镜像**（compose 服务名 **`host`**，上下文 `apps/host`）并传入对应 build args。

## 子应用 API（user-front）

镜像构建默认设置 `VITE_API_BASE=http://localhost:8080`，即浏览器直接请求宿主机上的后端端口。若以后前面加统一网关，应改为同域前缀或完整 API 域名并重建 `user-front` 镜像。

## 环境变量与安全

- **不要**把真实 `JWT_SECRET`、数据库密码提交进 Git。
- 本地 compose 可使用 `infra/docker/.env`（文件需自建）；勿提交。

## 常用命令

```bash
# 在 k-project 根目录
docker compose -f infra/docker/docker-compose.yml up --build

# 后台运行
docker compose -f infra/docker/docker-compose.yml up -d --build
```

## 故障排查

1. **子应用白屏**：检查父应用构建时的 `VITE_*` 与浏览器实际访问的 host/port 是否一致。
2. **user-front 无法登录/调 API**：检查 `VITE_API_BASE` 与后端是否可从浏览器访问（CORS、端口映射）。
3. **后端连不上库**：确认 `user-backend` 服务中 `DB_HOST=mysql` 与 compose 服务名一致，且 MySQL 已 healthy。
