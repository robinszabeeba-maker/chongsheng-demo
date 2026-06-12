# D2 部署指南 · Railway + Vercel

> 目标：老板可公网访问 Demo  
> 预计耗时：**30～45 分钟**（含注册/绑卡）

---

## 架构

```text
用户浏览器
    → Vercel（apps/web）  宠生万象官网 + 控制台
    → Railway（apps/api）  FastAPI + Postgres
```

---

## 第 0 步：代码推送到 GitHub

Railway / Vercel 均从 Git 部署最稳。

```bash
cd "/Users/chongzhilingkfb/Desktop/API Platform"
git init   # 若尚未 init
git add .
git commit -m "宠生万象 Demo：Web + API 可部署"
# 在 GitHub 新建空仓库后：
git remote add origin https://github.com/你的账号/chongsheng-api-demo.git
git branch -M main
git push -u origin main
```

---

## 第 1 步：Railway 部署 API + Postgres

### 1.1 创建项目

1. 打开 https://railway.app 登录  
2. **New Project** → **Deploy from GitHub repo** → 选你的仓库  
3. 进入服务 **Settings → Root Directory** → 填：`apps/api`  
4. **Save**

### 1.2 添加 Postgres

1. 项目页 **+ New** → **Database** → **PostgreSQL**  
2. 点 Postgres 服务 → **Variables** → 复制 `DATABASE_URL`

### 1.3 配置 API 环境变量

点 **API 服务**（不是 Postgres）→ **Variables** → 添加：

| 变量 | 值 |
|------|-----|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}`（Railway 引用变量） |
| `JWT_SECRET` | 随机字符串，如 `openssl rand -hex 32` 输出 |
| `CORS_ORIGINS` | 先填 `http://localhost:3000`（Vercel 域名稍后补） |
| `AI_PROVIDER` | `mock` |
| `RUN_SEED_ON_STARTUP` | `true` |

> 参考 [`apps/api/.env.railway.example`](apps/api/.env.railway.example)

### 1.4 部署与验证

1. **Deploy** 完成后，**Settings → Networking → Generate Domain**  
2. 得到 API 地址，如：`https://chongsheng-api-production.up.railway.app`  
3. 浏览器打开：`https://你的-api域名/health`  
   应返回：`{"status":"ok","provider":"mock"}`

### 1.5 常见问题

| 问题 | 处理 |
|------|------|
| Build 失败 | 确认 Root Directory = `apps/api` |
| DB 连接失败 | 确认 `DATABASE_URL` 引用 Postgres |
| 502 | 看 Deploy Logs；healthcheck 路径 `/health` |

---

## 第 2 步：Vercel 部署 Web

### 2.1 导入项目

1. 打开 https://vercel.com 登录  
2. **Add New → Project** → 选同一 GitHub 仓库  
3. **Root Directory** → `apps/web`  
4. Framework 应自动识别 **Next.js**

### 2.2 环境变量

| 变量 | 值 |
|------|-----|
| `NEXT_PUBLIC_API_URL` | `https://你的-railway-api域名`（**不要**末尾 `/`） |

### 2.3 部署

Deploy 完成后得到 Web 地址，如：  
`https://chongsheng-api-demo.vercel.app`

### 2.4 验证

1. 打开 Vercel 网址 → 首页正常  
2. 登录 `demo@chongsheng.demo` / `Demo123!`  
3. 控制台能看到 **10,000 点**

---

## 第 3 步：回写 CORS（重要）

Vercel 域名确定后，回到 **Railway API 服务 → Variables**：

```text
CORS_ORIGINS=https://你的项目.vercel.app,http://localhost:3000
```

保存后会自动重新部署。  
然后刷新 Vercel 页面再试登录 / Playground。

---

## 第 4 步：生产冒烟测试

把下面 `API` 换成你的 Railway 地址：

```bash
chmod +x scripts/verify-demo.sh
API_URL=https://你的-api.up.railway.app ./scripts/verify-demo.sh
```

或在 Playground：

1. 控制台创建 API Key  
2. 识图成功 → 点数 -15  
3. 空 body 请求 → 失败且不扣点  

---

## 第 5 步：给老板的链接

| 项 | 内容 |
|----|------|
| **演示 URL** | Vercel 首页 |
| **个人账号** | demo@chongsheng.demo / Demo123! |
| **企业账号** | org@chongsheng.demo / Org123! |
| **管理后台** | admin@chongsheng.demo / Admin123! |

---

## CLI 可选（与本指南等效）

```bash
# Railway CLI
npm i -g @railway/cli
cd apps/api && railway login && railway init && railway up

# Vercel CLI
npm i -g vercel
cd apps/web && vercel --prod
```

---

## D2 完成 checklist

- [ ] Railway `/health` 200  
- [ ] Vercel 首页可开  
- [ ] 登录 + 点数显示  
- [ ] Playground 识图扣点  
- [ ] CORS 已含 Vercel 域名  
- [ ] `verify-demo.sh` 通过  

---

**下一步 D3**：UI 打磨（Playground 失败样例按钮、移动端、favicon）
