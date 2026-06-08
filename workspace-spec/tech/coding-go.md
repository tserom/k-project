# Go 后端编码约定

适用于 `apps/user-backend`、`apps/inventory-backend` 及未来同模式 API 服务。

## 分层

```
cmd/server          # 入口：config、DB、migrate、listen
internal/router     # 路由与中间件顺序
internal/handler    # HTTP 绑定、校验、状态码
internal/service    # 业务规则、JWT、bcrypt
internal/repository # GORM 查询
internal/model      # 结构体与 tag
internal/middleware # JWT、请求日志
internal/config     # env（godotenv 可选）
pkg/logger          # Zap
```

**禁止**：handler 里写复杂 SQL；repository 里返回 HTTP 类型。

## 配置与安全

- 必填：`DB_NAME`、`JWT_SECRET`（各服务 README / `.env.example`）
- **勿提交** `.env`、密钥、`MYSQL` 明文文件
- 密码仅存 bcrypt hash；敏感字段 `json:"-"`

## Auth

- 保护路由：`middleware.JWTAuth`
- 用户 id：`middleware.UserIDKey`
- 导航写操作：JWT + `role=admin`（user-backend）

## 质量门禁

```bash
cd apps/<backend>
go test ./...
make lint
```

## 详细 Skill

`apps/user-backend/.cursor/skills/go-gin-gorm-service/SKILL.md` — 以根打开工作区时 Agent 应主动 Read。

## 新后端服务

1. 复制 user-backend 或 inventory-backend 结构
2. 分配新端口（见 docs/WORKSPACE.md）
3. 在 gateway 增加 `/api/<domain>/v1/` location
4. 独立 MySQL 库名（避免与 `app` / `inventory` 冲突）
