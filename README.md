# 宠生万象 · API Platform Demo

> Vibe Coding 验证项目：MRD/PRD → 可访问 Demo（**非生产上线**）

## 结构

```
apps/web/     Next.js → Vercel
apps/api/     FastAPI → Railway
docs/         商业文档（MRD/PRD/API Catalog）
Demo_PRD_v1.md  Demo 范围冻结
```

## Demo v2 丰富数据

首次升级 v2 后，请 **重启 API** 并删除旧库以加载 30 天调用、合同、订单等演示数据：

```bash
rm -f apps/api/chongsheng.db
./scripts/dev-api.sh
```

新增账号：`enterprise@chongsheng.demo` / `Ent123!`


**需要两个终端窗口**，不要整段粘贴到同一个终端。

**终端 1 — API：**

```bash
cd "/Users/chongzhilingkfb/Desktop/API Platform"
chmod +x scripts/dev-api.sh scripts/dev-web.sh
./scripts/dev-api.sh
```

**终端 2 — Web：**

```bash
cd "/Users/chongzhilingkfb/Desktop/API Platform"
./scripts/dev-web.sh
```

打开 http://localhost:3000

> macOS 没有 `python` 命令，脚本已改用 `python3`。  
> 默认 **SQLite** 文件库，无需 Docker。要用 Postgres 请先启动 Docker Desktop，再 `docker compose up -d` 并改 `apps/api/.env` 里的 `DATABASE_URL`。

### 手动步骤（等价于上面脚本）

```bash
cd "/Users/chongzhilingkfb/Desktop/API Platform/apps/api"
python3 -m venv .venv && source .venv/bin/activate
pip3 install -r requirements.txt
cp -n .env.example .env
python3 -m app.seed
python3 -m uvicorn app.main:app --reload --port 8000
```

```bash
cd "/Users/chongzhilingkfb/Desktop/API Platform/apps/web"
cp -n .env.example .env.local
npm run dev
```

### 可选：Postgres（需 Docker Desktop 已启动）

```bash
cd "/Users/chongzhilingkfb/Desktop/API Platform"
docker compose up -d
# 编辑 apps/api/.env → DATABASE_URL=postgresql://...
```

## Demo 账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| demo@chongsheng.demo | Demo123! | 个人 |
| org@chongsheng.demo | Org123! | 企业 |
| admin@chongsheng.demo | Admin123! | 超管 |

## 部署（D2）

详见 **[DEPLOY_D2.md](./DEPLOY_D2.md)** — Railway（API+Postgres）+ Vercel（Web）

快速验证生产 API：

```bash
API_URL=https://你的-railway域名 ./scripts/verify-demo.sh
```

## 文档

- [Demo PRD](./Demo_PRD_v1.md)
- [Commercial MRD](./Commercial_Platform_MRD_v1.md)
