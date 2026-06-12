# 技术风险评估报告（基于 API 文档 + 数据库扫描）

> **评估依据**：[API_Documentation.md](./API_Documentation.md)、[mysql_scan_report.md](./mysql_scan_report.md)  
> **评估角色**：技术架构 / 系统安全  
> **评估日期**：2026-06-11  
> **说明**：扫描报告仅含表名/行数/大小/注释，不含字段级 DDL；涉及「字段」的风险项中，标注为「文档定义」或「字段未披露」。

---

### 1. 数据安全与隐私风险

| 风险点定位 | 风险描述 | 可能影响 | 建议补救措施 |
|------------|----------|----------|--------------|
| 配置项 `ADMIN_USERNAME` / `ADMIN_PASSWORD`（文档默认值 `admin` / `suoweilai123456`） | 管理端全站 Basic Auth，文档公开默认弱口令 | 管理端 40+ 接口（端点/池/Key/日志）可被未授权访问；上游 Key 泄露、日志含 Prompt 被批量导出 | 生产强制改密；禁用默认凭证；管理端改 JWT/OAuth2 + RBAC + MFA；凭证不入文档/示例 |
| 全部管理端 API（如 `POST /api/v1/endpoints`、`GET /api/v1/logs/detail`） | 仅 Basic Auth，无角色分级、无操作审计字段说明 | 任意持有管理口令者可创建/删除端点、重置配额、清理日志 | 引入 RBAC；敏感操作（`DELETE /api/v1/logs/cleanup`、`POST /api/v1/keys/reset-quota`）二次确认 + 审计落库 |
| `api_endpoints.api_key`（文档定义，对应表 `api_endpoints`） | 创建/更新端点需明文传入上游 Key；存储加密方式文档未说明 | 数据库泄露即上游 AI 账号沦陷；管理端被攻破可读取全部上游 Key | 应用层加密（KMS）；详情/列表确保持续脱敏；轮换机制 |
| `POST /api/v1/endpoints` Body.`api_key` | 上游 Key 经 HTTP Body 传输，依赖 TLS；无字段级掩码 | 中间人/日志代理/APM 可能截获 | 强制 HTTPS；禁止 access log 记录 Body；考虑 Vault 引用代替明文 |
| `POST /api/v1/ai-providers/test-connection` Body.`api_key` | 临时传入上游 Key 做连通测试；文档称勿记录日志但未说明实现保障 | 测试 Key 残留于应用日志或 `request_logs` | 测试接口独立短 TTL 凭证；响应不落盘 Key；审计谁测了什么 |
| `request_logs.request_body` / `request_logs.response_body`（文档定义） | 日志详情含完整请求/响应体；`GET /api/v1/logs/detail?request_id=` 直接返回 | 用户 Prompt、PII、商业机密长期存库；管理端可读即数据泄露面 | 默认不存全文；仅存 hash/摘要；字段级脱敏；保留期 + 删除 API |
| `GET /api/v1/logs` / `GET /api/v1/logs/recent` / `GET /api/v1/logs/by-user/{user_id}` | 多维度日志查询，Basic Auth 即可按 `user_id` 拉取 | 横向查看任意用户全部调用历史 | 按管理员角色限制可见 `user_id` 范围；查询审计 |
| `GET /api/v1/keys/debug?id=` 响应 `stored_hash` / `calculated_hash` | 调试接口暴露 Key 哈希材料，文档仅写「生产谨慎」无硬禁用 | 离线哈希碰撞/辅助还原；扩大 Key 泄露攻击面 | 生产环境关闭或 IP 白名单 + 超管角色；不返回 `stored_hash` |
| `POST /api/v1/keys` 响应 `data.api_key` | 完整平台 Key 仅创建时返回一次 | 创建响应被代理/前端日志缓存则 Key 永久泄露 | 创建后只显示一次 UI；禁止服务端 access log；支持主动轮换 |
| `api_keys.allowed_ips`（文档定义） | IP 白名单为可选字段，Chat/Completions 路径是否强制校验文档未说明 | 白名单配置形同虚设，Key 被盗后可异地滥用 | 在中间件强制校验 `allowed_ips`；拒绝时返回 403 |
| `GET /api/v1/health` / `GET /api/v1/version` | 无需认证，返回 `service`、`timestamp` 等 | 攻击面探测、版本指纹；与 `GET /api/v1/status` 组合推断部署拓扑 | 生产关闭或仅内网；最小化响应字段 |
| 用户端 Swagger `/docs`、管理端 `/admin/docs`（文档服务信息） | OpenAPI 全量暴露接口与参数 | 攻击者获完整 API 地图（含 `pool_id`、`strategy` 扩展字段） | 生产禁用 Swagger 或鉴权保护 |
| `ms-api-prod.user_auth_info`（1,674 行，注释「用户认证信息表」） | 字段结构未披露；名称暗示凭证/Token 类数据 | 若明文存 Token/密码则批量账户接管 | `DESCRIBE` 审查；敏感列加密/HMAC；最小权限 DB 账号 |
| `ms-api-prod.customer_consultation_info`（2,183 行） | 注释「客户咨询信息」；字段未披露 | 姓名/电话/公司等 PII 泄露；合规（PIPL/GDPR）风险 | 字段分级；访问审计；脱敏展示；保留期限 |
| `ms-api-prod.user`（2,505 行） | 用户信息表；与文档 `api_keys.user_id` 可能关联 | 用户画像与 API 调用日志可关联定位个人 | 最小化采集；伪匿名化 `user_id` |
| `ms-api-prod.admin_record_login`（294 行） | 管理端登录记录 | 若含 IP/UA/失败次数可辅助撞库；亦可能暴露管理员行为 | 登录失败锁定；日志脱敏；与弱 Basic Auth 叠加风险高 |
| `ms-api-prod.product_trial` / `product_trial_logs` | 产品试用/API Key 类业务表（24,312 / 3,813 行） | 试用 Key 或令牌若可逆则未付费滥用 | 确认 Key 存储为哈希；试用额度硬限制 |
| `ms-api-dev-03-24.user_auth_info`（1,344 行）等 dev 快照库 | 与 prod 同结构，行量级接近生产 | dev 库常权限松、含生产拷贝数据 → 更大泄露面 | dev 库脱敏/隔离；禁止 prod 凭证访问 dev |
| `ms-api-dev-3-20.user_auth_info`（1,331 行） | 同上，2024-03-20 快照 | 同上 | 下线无用快照或 anonymize |
| `ms-api-dev-09.user_auth_info`（376 行） | 同上 | 同上 | 同上 |
| `ms_ai.medical_record`（153,189 行，1,556 MB） | 注释「病历记录」；宠物医疗敏感数据 | 医疗/健康类数据泄露；监管与品牌风险 | 加密存储；严格 ACL；与 API 网关数据流需隔离确认 |
| `ms_ai.session_record`（216,060 行） | 会话记录，体积 68 MB | 对话内容、症状描述等敏感信息 | 保留策略；访问最小化 |
| `ms_ai.report_content`（289,033 行，349 MB） | 报告内容大表 | 诊断/建议全文泄露 | 同 medical_record 治理 |
| `ms_ai.pet_profile` / `pet_profile_content` | 宠物档案及具体内容 | 宠物 + 主人关联信息 | 分类分级 |
| `ms_ai.magnum_key_record`（5,288 行） | 名称含 key_record | 可能存 API Key 或授权记录 | 字段审查确认是否明文 Key |
| `ms_ai_international.*` / `ms-ai-en.*` / `ms-ai-c.*` | 多区域/语言问诊库并行，含 `medical_record`、`session_record` | 跨境数据驻留边界不清；同一用户数据可能分散多库 | 建立数据地图；跨境合规评估 |
| `cy-robot.ai_agent_prompt`（107 行） | AI 智能体 Prompt 表 | 系统 Prompt 泄露可辅助越狱/逆向 | 访问控制；Prompt 视为机密配置 |
| `cy-robot.ai_message`（77 行，2.52 MB） | AI 消息表，单行体积大 | 用户对话内容 | 脱敏与 retention |
| `cy-robot.community_post`（10,764 行） | 社区 UGC | 用户发布内容 PII | 内容审核 + 举报删除机制 |
| `ms-human.model_connection`（6 行） | 注释「外部模型连接池」 | 极可能存上游模型 URL/Key | 移出业务库至 Secret 管理 |
| `ms-human.session_record`（8,685 行） | 人类健康问诊测试库 | 测试库名但数据量不小，可能含真实试验数据 | 与生产隔离；非必要则清空 |
| `ms-mairui.dicom_extraction` / `dicom_extraction_copy1` | DICOM 医疗影像提取 | 高敏感医疗影像元数据 | 独立实例 + 加密 + 访问审批 |
| `iot.device_auth_code`（100 行） / `device_credential`（1 行） | IoT 设备认证 | 设备接管、视频流未授权访问 | 凭证轮换；一设备一密 |
| `pet_smart.app_credentials`（1 行） | App 凭证表 | 应用级密钥泄露 | Secret Manager |
| `fish-recg-jd.fish_detection_raw`（273,007 行，1,071 MB） | 原始检测数据 | 可能含用户鱼缸视频帧/图像特征 | 确认是否含可识别图像；存储加密 |
| `ms-multi-recog.logs`（9,717 行，14.52 MB） | 多模态识别日志 | 上传文件/识别输入可能落日志 | 日志脱敏；短期 retention |
| `ms-multi-recog.profile`（1,409 行） | 用户 profile | PII | 最小化 |
| `petturex-net.wp_*`（WordPress，14 MB） | 官网 CMS 与用户表在同一扫描范围 | WP 历史漏洞面；与管理库同实例时连带风险 | WP 独立实例； hardened 配置 |
| `new-api.two_fa_backup_codes` / `user_oauth_bindings`（表存在，0 行） | 2FA 备份码与 OAuth 绑定表结构设计 | 若启用后存储不当，备份码泄露即 2FA 绕过 | 备份码加密/hash；一次性展示 |
| `POST /api/v1/chat/completions` Body.`messages[].content` | 用户 Prompt 经平台转发上游，并可能写入 `request_logs` | 第三方 AI 供应商也可见全文 | DPA；可选「不记录 Prompt」模式；企业版私有部署 |
| `POST /api/v1/chat/completions` 远程图片 URL 预处理 | 文档称转 Base64 并拦截内网/回环 | SSRF 防护若不全可探测内网；图片内容过平台 | 审查 URL 白名单/解析逻辑；限制尺寸与域名 |

---

### 2. 数据完整性与扩展性风险

| 风险点定位 | 风险描述 | 可能影响 | 建议补救措施 |
|------------|----------|----------|--------------|
| 文档 `api_endpoints` ↔ `ms-api-prod` 实际表 | 文档核心四表（`api_endpoints`/`api_pools`/`api_keys`/`request_logs`）在 prod 库中**不存在**；实际为 `product_usage_record`、`product_trial`、`user` 等 | 按文档建迁移/对接脚本全部失效；双系统并行无单一事实源 | 发布权威数据字典；标注文档适用代码库/环境 |
| 文档 `request_logs` ↔ `ms-api-prod.product_usage_record` | 语义可能对应（115,972 行，占库 89%），但字段映射未定义 | 日志字段缺失/类型不一致导致统计错误 | 字段级 mapping；迁移脚本加校验 |
| 文档 `api_keys` ↔ `ms-api-prod.product_trial` | 24,312 行试用表，疑似 Key/试用载体，结构未知 | Key 生命周期（过期、配额）可能在不同表实现，逻辑分裂 | 统一 Key 模型或文档分册 |
| `init_tables.sql` vs ORM（文档全局注意事项 #9） | 初始化 SQL 与模型字段不一致 | 新环境部署表结构漂移；应用读写报错 | Alembic 单一来源；CI schema diff |
| `ms-api-prod` + 7 个 API 相关库（dev/快照/test/portal/早期 `ms-api`） | 8 库同属「API 开放平台」，schema 高度相似，快照含 8 万+ usage 行 | 写错 DSN 即污染 prod 或读 stale 数据；schema 版本分叉 | 环境命名/网络隔离；仅保留必要 dev 库 |
| `ms-api-dev-03-24.product_usage_record`（92,340 行） | 2024-03 快照仍保留完整 usage | 与 prod 数据重复，备份/合规范围扩大 | 归档或删除快照库 |
| `new-api` 库（25 表，7 行） vs 文档 MS-AI-Platform | 文档描述的聚合平台数据层几乎为空 | 功能与数据脱节；验收标准无据 | 明确 new-api 状态（未上线/废弃） |
| `ms-ai-international.pet_info` + `pet_info_copy1` | 同库重复表名带 copy | 双写/迁移半成品；读哪张表不确定 | 合并或删除 copy 表；应用单源 |
| `ms-mairui.report_content_test` / `report_content_test_copy1` / `gpt_config_item_copy2` | 测试/复制表在生产规模库中（676+604 行） | 应用误连测试表；数据不一致 | 清理 `*_test*`、`*_copy*` |
| `ms-human.report_content_test`（164 行） | 测试表在人类问诊库 | 同上 | 删除或迁出 |
| 33 业务库 / 约 4.9 GB 同扫描范围 | AI 问诊、API、鱼缸、IoT、WP、机器人等混扫 | 无统一 `tenant_id`/分库策略文档；扩展靠加库，运维复杂度指数上升 | 数据域 registry；新能力先定归属库 |
| `ms_ai`（957,591 行，2.1 GB）+ `ms_ai_dev`（380,977 行）+ `ms_ai_international`（349,355 行） | 三套问诊库并行，dev 库数据量接近 prod 级 | dev 变更影响面被低估；国际/国内数据同步策略不明 | dev 数据减量；明确各库 master 关系 |
| `fish-recg-jd`（922,375 行，1.48 GB） | 单库占全实例约 30% 存储 | 备份/恢复窗口拉长；单库故障影响京东合作线 | 分区/归档 `fish_detection_raw`；冷热分离 |
| `product_usage_record` 无分区/归档说明（115,972 行 → 持续增长） | 单行日志 + 全文 body 时膨胀更快 | 主库 IO 瓶颈；`GET /api/v1/logs` 慢查询 | 按月分区；冷存对象存储；聚合表 |
| `api_pools.endpoint_ids`（文档）数组字段 | 池-端点多对多存 JSON 数组，非关系表 | 并发更新丢端点；无法 FK 约束；查询 `WHERE endpoint_id=?` 难索引 |  junction 表 `pool_endpoints` |
| `api_keys.allowed_pools` 默认 `null` = 允许所有池 | 空/null 语义宽松 | 新池创建后所有 Key 自动可访问；隔离失败 | 默认 deny；显式授权 |
| `POST /api/v1/chat/completions` Body.`pool_id` 默认 `1` | Schema 默认覆盖 Key.`default_pool_id` | 所有未传参请求打到 pool 1，配置失效 | 默认值改为 null；解析顺序 Key > Pool |
| `DELETE /api/v1/endpoints?id=` | 删除端点，文档未说明池内 `endpoint_ids` 级联行为 | 池引用悬空 ID；调度 runtime 错误 | 软删除 + 引用检查；或级联移除 |
| `DELETE /api/v1/pools?id=` | 删除池，Key.`default_pool_id` / `allowed_pools` 引用未说明 | Key 指向不存在池 → 500 | 删除前引用检查 |
| `POST /api/v1/pools` Body.`fallback_pool_id` | 备用池可链式配置 | 配置环 → 调度死循环 | 创建/更新时环检测 |
| `ms-api-test.user_roles` / `user_role_permissions`（0 行） | RBAC 表结构存在但未使用 | 权限模型半成品，与文档 Basic Auth 不一致 | 要么启用 RBAC 要么删表减迷惑 |
| `platform-test` 空库 | 占位库 | 误配连接串风险低但增加管理噪音 | 清理 |
| `ms-api.admin_system_settings` / 多库 `admin_system_settings` | 系统配置分散在多 API 库 | 配置漂移：dev 与 prod 行为不一致 | 配置中心化或 GitOps |
| `order_detail`（ms-api-prod 10,277 行） | 订单明细无注释 | 计费与 `product_usage_record` 对账关系不明 | 文档化计费链路；对账 job |

---

### 3. API 设计健壮性风险（含幂等、校验、分页等）

| 风险点定位 | 风险描述 | 可能影响 | 建议补救措施 |
|------------|----------|----------|--------------|
| `POST /api/v1/chat/completions` | 文档明确**不具备幂等性**；无 `Idempotency-Key` | 客户端/SDK 超时重试 → 重复 AI 调用、重复计费、重复日志 | 支持幂等键；或文档强制 `max_retries=0` |
| `POST /api/v1/v1/completions` | 同上，且无 Chat 的 `json_schema` 约束说明 | 同上 | 同上 |
| `POST /api/v1/endpoints` | 不具备幂等性；仅名称冲突失败 | 网络重试可能重复创建（若名称不同则重复端点） | Idempotency-Key 或 `name` 唯一 + UPSERT |
| `POST /api/v1/pools` | 不具备幂等性 | 重复池、重复调度 | 池名唯一已有；加重试安全语义 |
| `POST /api/v1/keys` | 不具备幂等性 | 重复发放 Key | 客户端 token 或 `key_name` 幂等 |
| `POST /api/v1/endpoints/{id}/test` | 每次真实请求上游；不具备幂等性 | 自动化巡检耗尽上游配额 | 限频；缓存短时测试结果 |
| `POST /api/v1/ai-providers/test-connection` | 不具备幂等性；消耗上游配额 | 同上 | 同上 |
| `DELETE /api/v1/logs/cleanup?days=` | **不可逆**；不具备幂等性（重复执行继续删） | 误操作 `days=1` 即丢几乎全部审计证据 | 软删除；dry-run；二次确认 token；最小 `days` 下限 |
| `PUT /api/v1/endpoints?id=` | 部分更新，不具备幂等性（文档 #5） | 并发更新覆盖 | ETag/版本号乐观锁 |
| `POST /api/v1/chat/completions` Body.`pool_id` | 客户端可传任意池 ID；文档有 `allowed_pools` 但未声明服务端强制校验 | 越权访问高成本池/其他租户池 | 中间件校验 `pool_id ∈ allowed_pools` |
| `POST /api/v1/chat/completions` Body.`strategy=race`（默认） | 与 Key/池默认策略不一致（文档 #4/#5） | 行为不可预测；竞速放大 | 统一默认值解析链 |
| `POST /api/v1/v1/completions` Body.`pool_id` | 默认 null，走 Key.`default_pool_id`（与 Chat **行为不同**） | 同一客户端混用两接口路由不一致 | 统一两接口 pool 解析逻辑 |
| `GET /api/v1/v1/models` | 读 `pool_id`/`provider_ids`，实际模型绑 `default_pool_id`/`endpoint_ids` | 返回模型列表与可调用模型不一致 → 404/400 | 统一字段；集成测试覆盖 |
| `GET /api/v1/v1/models` 路径 | `/api/v1/v1/models` 双 `v1` | OpenAI SDK 默认 `base_url+/models` 失败 | 改为 `/api/v1/models`；旧路径兼容 |
| `POST /api/v1/v1/completions` 路径 | `/api/v1/v1/completions` | SDK 集成失败 | 改为 `/api/v1/completions` |
| `api_keys.allowed_models`（文档） | 可选数组，Chat 接口是否校验未说明 | 限制模型名不生效 | 在 proxy 层校验 `model` |
| `POST /api/v1/chat/completions` Body.`max_tokens` 默认 `10000` | 单次请求 token 上限高 | 恶意/误配置单次打满上游配额 | 按 Key 级别上限；与 `total_quota` 联动 |
| `POST /api/v1/keys` Body.`rate_limit_per_day` 默认 `10000` | 日限流偏高 | 盗 Key 后单日大量调用 | 按客户 tier 默认值；异常检测 |
| `POST /api/v1/pools/{pool_id}/test` | 文档：**模拟测试结果**，非真实上游 | 运维误判池健康；故障迟发现 | 改为真实探测或 UI 标注 simulated |
| `ai_providers.py` vs `api_endpoints.py` 重复 `/endpoints` 路由（文档 #8） | 同路径双注册，匹配顺序依赖注册序 | 更新/查询行为不确定；一侧 bug 隐蔽 | 删除重复；单一路由模块 |
| `GET /api/v1/endpoints/detail?id=` 响应 | 示例未含 `api_key`（脱敏），但更新可传 `api_key` | 若实现疏漏返回明文 Key → 泄露 | 代码审查；响应 schema 固定排除 |
| `GET /api/v1/logs` Query.`limit` 最大 `200` | 大页拉取 | 单次响应过大、DB 压力 | 默认 limit 降低；游标分页 |
| `GET /api/v1/logs/recent` Query.`limit` 最大 `500` | 同上 | 同上 | cursor-based pagination |
| `GET /api/v1/logs` Query.`success` | 类型为 string `true`/`false` 非 boolean | 客户端传参错误静默失效 | 严格类型校验 422 |
| `GET /api/v1/endpoints` Query.`limit` 最大 `100` | 分页上限 | 管理端批量导出仍可能多次打库 | 导出异步任务 |
| 管理端 `page` 从 1 开始，各接口 `limit` 上限不统一（10/50/100/200/500） | 分页规范不一致 | 客户端封装困难；某些接口易 OOM | 统一分页 contract |
| `POST /api/v1/pools/{pool_id}/test` Body.`max_concurrent` | 竞速测试可选并发，无文档上限 | 测试接口打满上游 | 硬上限 + 权限 |
| `POST /api/v1/chat/completions` Body.`n` 默认 `1` | OpenAI 兼容多候选 | n>1 成倍成本 | 按 Key 限制 n |
| `POST /api/v1/keys/reset-quota?id=` | 无审计参数、无审批流 | 内部误操作恢复已耗尽 Key | 审计日志 + 双人复核 |
| `GET /api/v1/health` | 无限流（文档 #5） | 轻量 DDoS/扫描 | 网关限频 |
| 错误响应 OpenAI 风格 `error.code` 为数字混在 JSON | 与 OpenAI 字符串 code 可能不一致 | SDK 错误处理异常 | 对齐 OpenAI 规范或文档声明差异 |

---

### 4. 性能隐患（基于表结构及接口定义可推断部分）

| 风险点定位 | 风险描述 | 可能影响 | 建议补救措施 |
|------------|----------|----------|--------------|
| `ms-api-prod.product_usage_record`（115,972 行，90.61 MB，89% 库空间） | 高频 append；文档 `request_logs` 若存 body 则行宽极大 | 插入/查询变慢；备份膨胀；全表 scan | 分区；异步写；body 外置对象存储 |
| `GET /api/v1/logs` / `GET /api/v1/logs/statistics?hours=168` | 统计接口最大 7 天窗口，默认扫 `request_logs` | 高峰 DB CPU；管理端超时 | 预聚合表（小时/天 rollup）；只查汇总 |
| `GET /api/v1/logs/recent?hours=24&limit=500` | 最近日志倒序 + 大 limit | 慢查询 | 强制 `(created_at, id)` 索引；游标 |
| `GET /api/v1/logs/by-pool/{pool_id}` / `by-endpoint/{id}` / `by-user/{user_id}` | 多维过滤，文档提醒「大量日志可能较慢」 | 运维面板卡顿 | 复合索引 `(pool_id, created_at)` 等 |
| `POST /api/v1/chat/completions` Body.`strategy=race` | 并发多路上游，取最快 | 上游 QPS × 并发倍数；race 失败路径仍可能计费 | 默认 round_robin；race 限并发 |
| `api_endpoints.max_retries` 默认 `3` | 单请求最多 4 次上游尝试 | 故障时流量放大 4x | 指数退避；熔断 |
| `api_endpoints.timeout` 默认 `60`s + `stream=true` | SSE 长连接占用 worker | 并发连接耗尽 Uvicorn worker | 调 worker/连接池；网关超时 |
| `POST /api/v1/chat/completions` Body.`max_tokens=10000` | 大 completion 内存与上游延迟 | 单请求占满 worker 数十秒 | 按 Key 限制；队列化 |
| `ms_ai.medical_record`（153k 行，1.5 GB） | 大行宽医疗记录 | 全表扫描类报表极慢 | 垂直拆分；归档 |
| `ms_ai.report_content`（289k 行，350 MB） | 报告正文 | 同上 | 冷存储 |
| `fish-recg-jd.fish_detection_raw`（273k 行，1 GB） | 原始检测 blob 类数据 | 磁盘与备份压力 | 对象存储 + 表内只存 URI |
| `fish-recg-jd.board_ingest_log`（49,945 行，256 MB） | 板端接入日志 | 写入热点 | 分表/时序库 |
| `fish-recg-jd.fish_trajectory_point`（321k 行） | 轨迹点高频写入 | 插入索引维护成本 | 时序分区 |
| `ms_ai.page_buriedpoint`（27,752 行） | 埋点表 | 与分析查询争资源 | 迁 ClickHouse/ES |
| `ms-cockpit.pet_behavior`（28,237 行，35 MB） | 行为数据大行 | 查询慢 | 索引 + 归档 |
| `pet_smart.operation_logs`（47,818 行，7.5 MB） | 操作日志占库 96% | 单表热点 | 日志专用存储 |
| `ms-multi-recog.logs`（9,717 行，14.5 MB） | 单行体积大（~1.5KB/行 均） | 多模态日志膨胀 | 压缩/外链 |
| Redis 限流（文档用户端认证说明） | 依赖 Redis；故障模式未文档化 | Redis  down 时 fail-open 或全拒 | 明确 fail-close；本地降级 |
| `POST /api/v1/chat/completions` 图片 URL → Base64 | CPU/内存密集型预处理 | 大图拖慢 worker | 大小限制；异步拉取 |
| `GET /api/v1/endpoints/{id}/stats?hours=168` | 端点级统计 | 与 logs 表竞争 | 指标进 Prometheus，DB 仅兜底 |
| 管理端与用户端分端口（8000/8001/8061 文档不一致） | 双进程资源 | 部署不当只启用户端（Docker 默认）→ 管理端缺失或端口冲突 | 统一 runbook |

---

### 5. 可从文档推断的架构与依赖风险

| 风险点定位 | 风险描述 | 可能影响 | 建议补救措施 |
|------------|----------|----------|--------------|
| 扫描架构关系：`ms-api-prod` → `ms_ai` / `ms-fish` / `ms-api-portal` | 网关与问诊/鱼缸/门户库关联（**推断，非代码证实**） | API 调用链跨库；故障传播；数据驻留难解释 | 代码级 tracing 证实；绘制序列图 |
| `ms-api-prod` 与 `new-api` 双轨 | prod 库用 product_* 模型；new-api 几乎空 | 两套「API 平台」叙事；升级路径不明 | 确定 canonical 系统 |
| `ms-api`（早期版，31 表）+ `ms-api-portal` + `ms-api-prod` | 三代 API 库并存 | 应用连错库；历史债务 | 退役 `ms-api`；连接串审计 |
| `cy-robot` → `ms_ai` 问诊能力（扫描架构图） | 机器人 App 依赖问诊库 | ms_ai 故障影响机器人 AI 功能 | 熔断；缓存；SLA 分级 |
| FastAPI + SQLAlchemy async + MySQL + Redis（文档全局） | 与 `ms-api-prod` 实际表不匹配 | 文档代码可能非 prod 运行体 | 确认 prod 技术栈与 repo |
| 用户端 `main:app` / 管理端 `main:admin_app` 双应用 | Dockerfile 仅启用户端（文档 #10） | 生产缺管理端或双份部署不一致 | `run_servers.py` 或 K8s 双 Deployment |
| 管理端端口 `8061` vs 文档示例 `8001` | 配置不一致 | 健康检查/网关路由错误 | 统一 env 文档 |
| 反向代理前缀 `/ms-ai-platform/api/v1` vs 直连 `/api/v1` | 双路径 | 路径重写错误导致 404 | 网关测试矩阵 |
| 上游多供应商（OpenAI/DeepSeek/vertex_ai）经 `api_endpoints` | 单点平台依赖多家 SLA | 某上游宕机影响池可用性 | 多池 fallback_pool_id + 健康检查 |
| `POST /api/v1/pools/{pool_id}/test` 模拟 vs `POST .../endpoints/{id}/test` 真实 | 测试能力分裂 | 池级健康误判 | 统一真实探测 |
| WordPress `petturex-net` 与业务库同扫描实例 | 官网与 API/医疗同 MySQL 范围 | WP 漏洞横向移动 | 实例隔离 |
| IoT `iot` 库与 API 网关同范围 | 设备认证与开放平台毗邻 | 设备密钥与 API Key 同攻陷面 | 网络/账号隔离 |
| `ms-license.license`（265 行） | 许可证管理独立小库 | 授权逻辑与 API 配额 `quota_type` 关系不明 | 文档化授权链路 |
| 扫描工具需 `MYSQL_DSN=user:pass@host:3306` | 扫描脚本使用高权限 DSN 样式 | 暗示扫描账号权限可能过大 | 只读从库扫描；最小权限 |
| 文档流程：调用 → 写 `request_logs` | 同步写日志 | 写库失败是否影响响应未说明 | 异步队列写日志；失败降级 |
| `strategy=race` 文档：失败请求可能仍计费 | 成本模型复杂 | 客户对账争议 | race 冗余请求成本入账规则 |
| `GET /api/v1/version` 暴露版本 | 与 CVE 关联 | 已知漏洞针对性攻击 | 最小披露 |

---

### 6. 超出当前文档覆盖、必须补充评估的风险盲区

| 盲区主题 | 为什么无法从现有文档评估 | 建议从何处获取答案 |
|----------|--------------------------|--------------------|
| 各表字段级 DDL、索引、约束 | 扫描报告仅有表名/行数/大小，无 `DESCRIBE`/`SHOW INDEX` | DBA 导出 schema；`information_schema` |
| `user_auth_info` / `product_usage_record` 等是否加密 | 无字段定义 | 抽样行 + 应用代码加密模块 |
| 生产 API 实际运行哪套代码（文档 FastAPI vs ms-api-prod 遗留栈） | 文档与 prod 表结构严重不一致 | 部署清单、git 仓库、APM 服务名 |
| `ms-api-prod` ↔ 文档四表的运行时映射 | 仅能从名称推测 | 研发/DBA 数据字典 |
| 33 库是否同一 MySQL 实例/主机/账号 | 扫描未说明拓扑 | 基础设施 CMDB、DSN 清单 |
| prod/dev 数据库账号权限是否隔离 | 无连接串与 GRANT 信息 | 安全审计 `SHOW GRANTS` |
| 实际 QPS、P99 延迟、错误率 | 无 APM/监控数据 | Prometheus/Grafana、网关 access log |
| `product_usage_record` 日增量与磁盘增长曲线 | 仅单点快照 115,972 行 | 时序监控；`SELECT COUNT(*) BY day` |
| Redis 限流配置与故障策略 | 文档仅提及使用 Redis | Redis 配置、fail-open/close 代码 |
| TLS 终止点与证书管理 | 文档 localhost HTTP 示例 | 网关/Nginx 配置 |
| 密钥管理（KMS/Vault） | 文档直接 POST 明文 Key | 运维 Secret 方案 |
| WAF / DDoS / IP 黑名单 | 未提及 | 云安全组、WAF 规则 |
| 备份 RPO/RTO 与恢复演练 | 无 | DBA 备份策略、演练记录 |
| 跨库调用（ms-api-prod → ms_ai）是否真实发生 | 架构图为推断 | 分布式 tracing、应用日志 |
| API 客户数据是否进入 `medical_record` | 无链路证据 | 全链路 trace + 数据分类 |
| 日志跨境传输与存储区域 | 多国际库但无合规说明 | 法务 DPA、云区域配置 |
| 管理端是否暴露公网 | 文档 localhost | 安全组、 penetration test |
| Swagger `/docs` 生产是否关闭 | 仅文档端口说明 | 生产 curl 探测 |
| 历史漏洞与依赖 CVE（FastAPI/SQLAlchemy/MySQL） | 无 SBOM | 依赖扫描、镜像扫描 |
| 竞态/race 上游冗余计费的财务规则 | 文档一句带过 | 财务/产品计费规范 |
| `allowed_ips` / `allowed_models` 是否已实现 | API 文档有字段无校验说明 | 代码 review + 黑盒测试 |
| 单点故障：MySQL/Redis/上游 AI | 无 HA 描述 | 架构图、K8s replica |
| 变更发布与数据库 migration 流程 | init_tables 与 ORM 不一致 | CI/CD、Alembic 历史 |
|  incident 响应与日志保留合规要求 | 仅 `logs/cleanup` 接口 | 合规政策、运维 SOP |

---

**报告说明**：本评估严格基于两份引用文档及其中可验证/可推断内容；「字段未披露」项需补充 DDL 后复评。需求明确后可在此基础上输出改造设计方案。
