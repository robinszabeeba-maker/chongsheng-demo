# 宠生万象 · Vibe Coding 验证 Demo · PRD（v1.0）

> **目的**：向老板验证「MRD/PRD → Cursor → 可访问产品」的可信性  
> **不是**：生产级宠生万象 v1 上线承诺  
> **部署**：Vercel（Web）+ Railway（API + Postgres）  
> **演示**：界面优先 · 邮箱登录 · 固定 Demo 账号  

---

## 1. 成功标准

| # | 标准 | 验收 |
|---|------|------|
| 1 | 老板可公网访问 | HTTPS URL，手机/电脑可开 |
| 2 | 5 分钟演示脚本走通 | 见 §8 |
| 3 | 与文档一致 | 目录、点数、失败不扣费对齐 Pricing/API Catalog 草案 |
| 4 | 代码可延续 | 清晰分层；AiProvider 可换真 API |
| 5 | 视觉像正式 ToB 产品 | 宠生万象品牌；蓝绿科技风；非裸工程师 UI |

---

## 2. 范围：必做（P0+）

### 2.1 用户端（Vercel · Next.js）

| 页面 | 功能 |
|------|------|
| `/` | 官网：卖点、CTA、品牌 |
| `/catalog` | 五类 API 卡片（来自 API_Catalog 草案） |
| `/docs/[sku]` | 各 SKU 简版文档 |
| `/login` `/register` | 邮箱 + 密码 |
| `/console` | 总览：剩余点数 |
| `/console/keys` | API Key；企业 **子 Key** |
| `/console/billing` | 购点数包（**模拟支付**） |
| `/console/usage` | 用量明细（按 API 类型） |
| `/playground` | 五类 API 可调（Mock 默认） |

### 2.2 管理后台

| 页面 | 功能 |
|------|------|
| `/admin` | 仪表盘：用户数、今日调用 |
| `/admin/users` | 用户列表、停用 |
| `/admin/pricing` | 点数换算表、套餐价（可改） |
| `/admin/usage` | 全平台用量 |

### 2.3 后端（Railway · FastAPI）

| 模块 | 功能 |
|------|------|
| Auth | JWT；邮箱注册/登录 |
| Orgs | 企业主体；子 Key 归属 |
| Keys | 主 Key / 子 Key；哈希存储；停用 |
| Points | 购包、扣点、余额 |
| Billing | **仅成功扣费** |
| Open API | `/v1/vision` `/v1/audio` `/v1/video` `/v1/health` `/v1/chat` |
| AiProvider | `MockProvider` 默认；`HttpProvider` 预留 env 配置 |
| Admin API | 定价配置、用户管理 |
| Seed | 固定 Demo 账号 |

---

## 3. 明确不做（Demo 期）

- 真支付（微信/支付宝/Stripe）
- 真发票流程
- 手机验证码 / 企业工商认证
- 五类 API 全部接真模型（预留 HttpProvider）
- 英文全站 / GDPR
- 现网 ms-api-prod / ms-ai 任何写入

---

## 4. 技术栈

| 层 | 选型 |
|----|------|
| Web | Next.js 14 · TypeScript · Tailwind · shadcn/ui |
| API | FastAPI · SQLAlchemy · Alembic |
| DB | PostgreSQL（Railway） |
| 部署 | Vercel + Railway |
| 品牌色 | 主 `#0D9488` 青绿 · 辅 `#2563EB` 蓝 · 背景 slate |

---

## 5. Demo 账号（Seed）

| 邮箱 | 密码 | 角色 | 初始点数 |
|------|------|------|----------|
| `demo@chongsheng.demo` | `Demo123!` | 个人开发者 | 10,000 |
| `org@chongsheng.demo` | `Org123!` | 企业管理员 | 50,000 |
| `admin@chongsheng.demo` | `Admin123!` | 平台超管 | — |

---

## 6. 扣点规则（实例，可后台改）

见 `Pricing_Example_v1_draft.md`：图像 15 点/次，视频 350 点/分钟，等。

---

## 7. AiProvider 预留

```env
AI_PROVIDER=mock          # mock | http
AI_HTTP_BASE_URL=         # 未来填内部推理网关
AI_HTTP_API_KEY=
```

---

## 8. 老板 5 分钟演示脚本

1. 打开首页 → 「宠物场景最全的商用 AI API」  
2. `/catalog` → 五类能力一览  
3. 登录 `demo@chongsheng.demo` → 控制台 10,000 点  
4. Playground 识图 → 成功 → 点数减少  
5. Playground 故意坏参数 → 失败 → 点数不变  
6. 登录 `org@chongsheng.demo` → 子 Key 页  
7. 登录 `admin@chongsheng.demo` → 改刊例价 / 看全站用量  

---

## 9. 里程碑（越快越好 · 质量底线）

| 天 | 交付 |
|----|------|
| D1 | 仓库骨架、DB 模型、Auth、Seed |
| D2 | 控制台 + 目录 + 品牌 UI |
| D3 | 扣点 + Playground（Mock） |
| D4 | 子 Key + 管理后台 |
| D5 | 联调、单测、部署 Vercel+Railway |
| D6 | UI 打磨、演示彩排 |

---

**版本**：Demo PRD v1.0 · 2026-06-10  
