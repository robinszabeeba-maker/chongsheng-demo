# MS-AI-Platform API 文档

> **文档版本**：v1.0.0  
> **项目版本**：v1.0.0  
> **更新时间**：2026-06-10  
> **维护人**：MS-AI-Platform Team  
> **适用环境**：开发 / 测试 / 生产

---

## 目录

- [全局说明](#全局说明)
  - [服务信息](#服务信息)
  - [认证方式](#认证方式)
  - [通用请求规范](#通用请求规范)
  - [通用响应格式](#通用响应格式)
  - [错误码说明](#错误码说明)
  - [业务枚举](#业务枚举)
- [用户端 API](#用户端-api)
  - [健康检查](#健康检查)
  - [版本信息](#版本信息)
  - [Chat Completions](#chat-completions)
  - [Completions](#completions)
  - [获取可用模型](#获取可用模型)
- [管理端 API](#管理端-api)
  - [管理员状态检查](#管理员状态检查)
  - [管理员信息](#管理员信息)
  - [API 端点管理](#api-端点管理)
  - [API 池管理](#api-池管理)
  - [API Key 管理](#api-key-管理)
  - [请求日志管理](#请求日志管理)
  - [AI 供应商测试](#ai-供应商测试)
- [附录](#附录)
- [相关文档](#相关文档)

---

## 全局说明

MS-AI-Platform 是一个 AI API 聚合代理平台，基于 FastAPI + SQLAlchemy 2.0 async + MySQL + Redis 构建。平台将多个上游 AI API 端点聚合成可调度的 API 池，并通过平台 API Key 对外提供 OpenAI 兼容代理服务。

### 服务信息

| 项目 | 内容 |
|---|---|
| 用户端应用 | `main:app` |
| 管理端应用 | `main:admin_app` |
| 用户端默认端口 | `.env` 中 `APPLICATION_PORT`，示例为 `8000` |
| 管理端默认端口 | `.env` 中 `APPLICATION_ADMIN_PORT`，未配置时代码默认 `8061` |
| 用户端直连基础路径 | `http://localhost:8000/api/v1` |
| 管理端直连基础路径 | `http://localhost:8001/api/v1` |
| 用户端代理前缀 | `/ms-ai-platform/api/v1` |
| 管理端代理前缀 | `/ms-ai-platform/admin/api/v1` |
| 用户端 Swagger | `http://localhost:8000/docs` |
| 管理端 Swagger | `http://localhost:8001/admin/docs` |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |

> **说明**：`root_path` 主要用于反向代理场景。直接访问 Uvicorn 时，实际路由通常是 `/api/v1/...`；如果前面有 Nginx 或网关转发，则可使用 `/ms-ai-platform/...` 前缀。

### 认证方式

#### 用户端认证

OpenAI 兼容代理接口使用 Bearer Token，Token 为平台生成的 API Key。

```http
Authorization: Bearer sk-your-api-key
```

| 校验项 | 说明 |
|---|---|
| Header 格式 | 必须为 `Bearer <api_key>` |
| Key 格式 | 必须以 `sk-` 开头 |
| Key 状态 | 必须为 `active` |
| 过期时间 | `expire_at` 未过期 |
| 配额 | `quota_type != unlimited` 时校验 `used_quota < total_quota` |
| 限流 | 使用 Redis 校验每分钟和每日请求限制 |
| 最后使用时间 | 请求通过后更新 `last_used_at` |

#### 管理端认证

管理端接口使用 Basic Auth。

```http
Authorization: Basic base64(username:password)
```

| 配置项 | 默认值 |
|---|---|
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `suoweilai123456` |

### 通用请求规范

| 项目 | 说明 |
|---|---|
| `Content-Type` | `application/json`（POST/PUT 请求） |
| `GET` 参数 | Query 或 Path 参数 |
| `POST` / `PUT` 参数 | JSON Body + Query / Path 参数 |
| 时间格式 | ISO 8601，例如 `2026-06-10T10:00:00` |
| 分页参数 | `page` 从 1 开始，`limit` 按接口限制 |

| 标识 | 含义 |
|---|---|
| Header | 请求头参数 |
| Path | 路径参数 |
| Query | URL 查询参数 |
| Body | JSON 请求体 |
| 必填 | 必须传入 |
| 可选 | 可不传入 |
| 默认值 | 不传时服务端使用的默认值 |
| 枚举值 | 固定可选值 |

### 通用响应格式

#### 管理端普通响应

```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

#### 管理端分页响应

```json
{
  "success": true,
  "message": "查询成功",
  "data": [],
  "page_info": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "total_pages": 10
  }
}
```

#### OpenAI 兼容错误响应

用户端 `/chat/completions` 和 `/v1/completions` 发生异常时，返回 OpenAI 风格错误。

```json
{
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error",
    "code": 401
  }
}
```

#### 管理端失败响应

```json
{
  "success": false,
  "message": "资源不存在",
  "data": null
}
```

### 错误码说明

| HTTP 状态码 | 含义 | 常见原因 |
|---|---|---|
| `400` | 请求参数错误 | 参数缺失、格式错误、资源已存在 |
| `401` | 未认证 | API Key 无效、Basic Auth 失败、Key 已禁用 |
| `403` | 无权限 | JWT/API Key 权限不足 |
| `404` | 资源不存在 | 指定 ID 不存在 |
| `422` | 参数校验失败 | Pydantic 参数校验未通过 |
| `429` | 请求过多 | 每分钟限流、每日限流或配额耗尽 |
| `500` | 服务异常 | 数据库、Redis、上游 AI 或服务内部异常 |

### 业务枚举

| 枚举 | 值 | 说明 |
|---|---|---|
| 端点状态 | `active` | 启用 |
| 端点状态 | `disabled` | 禁用 |
| 端点状态 | `error` | 错误 |
| 池状态 | `active` | 启用 |
| 池状态 | `disabled` | 禁用 |
| 调度策略 | `round_robin` | 轮询 |
| 调度策略 | `race` | 竞速 |
| API Key 状态 | `active` | 启用 |
| API Key 状态 | `disabled` | 禁用 |
| API Key 状态 | `expired` | 过期 |
| 配额类型 | `unlimited` | 不限制 |
| 配额类型 | `token` | 按 token 配额 |
| 配额类型 | `request` | 按请求数配额 |
| 日志成功状态 | `true` | 成功 |
| 日志成功状态 | `false` | 失败 |

---

## 用户端 API

| 模块 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 健康检查 | `GET` | `/api/v1/health` | 服务健康检查 |
| 健康检查 | `GET` | `/api/v1/version` | 服务版本信息 |
| OpenAI 兼容代理 | `POST` | `/api/v1/chat/completions` | Chat Completions，支持流式 |
| OpenAI 兼容代理 | `POST` | `/api/v1/v1/completions` | Completions，支持流式 |
| OpenAI 兼容代理 | `GET` | `/api/v1/v1/models` | 获取可用模型 |

---

### 健康检查

#### 1. 接口概述

检查用户端服务是否正常运行。适用于负载均衡健康探测、运维监控、部署后冒烟测试等场景。无需认证，可直接调用。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/health` |
| **完整 URL 示例** | `http://localhost:8000/api/v1/health` |
| **Method** | `GET` |
| **认证方式** | 无 |

**Headers**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| 无 | — | — | 本接口无需特殊请求头 |

**请求参数**

无。

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "服务运行正常",
  "data": {
    "status": "healthy",
    "timestamp": "2026-06-10T10:00:00",
    "service": "MS Scaffold Service"
  }
}
```

**失败响应示例**（HTTP 500）

```json
{
  "success": false,
  "message": "服务异常",
  "data": null
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `success` | boolean | 请求是否成功 |
| `message` | string | 响应消息 |
| `data.status` | string | 服务状态，正常时为 `healthy` |
| `data.timestamp` | string | 当前服务器时间（ISO 8601） |
| `data.service` | string | 服务名称 |

#### 4. 调用示例

**curl**

```bash
curl -X GET "http://localhost:8000/api/v1/health"
```

**JavaScript**

```javascript
const response = await fetch("http://localhost:8000/api/v1/health");
const data = await response.json();
console.log(data);
```

#### 5. 注意事项

- 无需认证，可公开访问。
- 本接口为只读操作，具有幂等性。
- 无限流限制。
- 建议监控端每 30–60 秒轮询一次。

---

### 版本信息

#### 1. 接口概述

获取用户端服务的版本、名称、描述及构建时间。适用于客户端兼容性检查、运维信息展示、版本审计等场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/version` |
| **完整 URL 示例** | `http://localhost:8000/api/v1/version` |
| **Method** | `GET` |
| **认证方式** | 无 |

**Headers**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| 无 | — | — | 本接口无需特殊请求头 |

**请求参数**

无。

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "获取版本信息成功",
  "data": {
    "version": "1.0.0",
    "name": "MS Scaffold Service",
    "description": "微服务脚手架",
    "build_time": "2026-06-10T10:00:00"
  }
}
```

**失败响应示例**（HTTP 500）

```json
{
  "success": false,
  "message": "服务异常",
  "data": null
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `data.version` | string | 服务版本号 |
| `data.name` | string | 服务名称 |
| `data.description` | string | 服务描述 |
| `data.build_time` | string | 构建时间（ISO 8601） |

#### 4. 调用示例

**curl**

```bash
curl -X GET "http://localhost:8000/api/v1/version"
```

**JavaScript**

```javascript
const response = await fetch("http://localhost:8000/api/v1/version");
const { data } = await response.json();
console.log(`Version: ${data.version}`);
```

#### 5. 注意事项

- 无需认证。
- 只读接口，具有幂等性。
- 无限流限制。

---

### Chat Completions

#### 1. 接口概述

OpenAI 兼容的 Chat Completions 接口，支持多轮对话、工具调用、JSON Schema 输出约束及 SSE 流式响应。适用于聊天机器人、智能助手、代码生成、多模态对话等场景。平台会根据 `pool_id` 和 `strategy` 从 API 池中调度上游端点。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `POST /api/v1/chat/completions` |
| **完整 URL 示例** | `http://localhost:8000/api/v1/chat/completions` |
| **Method** | `POST` |
| **认证方式** | Bearer API Key |

**Headers**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `Authorization` | string | 是 | `Bearer sk-xxxx`，平台 API Key |
| `Content-Type` | string | 是 | `application/json` |

**请求 Body 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `model` | string | 是 | — | 请求模型名称 |
| `messages` | array | 是 | — | 聊天消息列表 |
| `temperature` | number | 否 | `1.0` | 温度，范围 0–2 |
| `top_p` | number | 否 | `1.0` | Top P，范围 0–1 |
| `n` | integer | 否 | `1` | 生成数量 |
| `stream` | boolean | 否 | `false` | 是否流式返回 |
| `max_tokens` | integer | 否 | `10000` | 最大 token 数 |
| `presence_penalty` | number | 否 | `0` | 存在惩罚，范围 -2 到 2 |
| `frequency_penalty` | number | 否 | `0` | 频率惩罚，范围 -2 到 2 |
| `user` | string | 否 | `null` | 用户标识 |
| `stop` | string/array | 否 | `null` | 停止序列 |
| `pool_id` | integer | 否 | `1` | 指定 API 池 ID（平台扩展字段） |
| `strategy` | string | 否 | `race` | 调度策略：`round_robin` / `race`（平台扩展字段） |
| `json_schema` | object | 否 | `null` | JSON Schema 输出约束 |

**消息对象（`messages` 数组元素）**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `role` | string | 是 | `system` / `user` / `assistant` / `tool` |
| `content` | string/array | 否 | 文本或多模态内容 |
| `tool_calls` | array | 否 | 工具调用列表 |
| `tool_call_id` | string | 否 | 工具调用 ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200，非流式）

```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 12,
    "total_tokens": 22
  }
}
```

**流式响应示例**（`stream=true`，`Content-Type: text/event-stream`）

```text
data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"Hello"}}]}

data: [DONE]
```

**失败响应示例**（HTTP 401）

```json
{
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error",
    "code": 401
  }
}
```

**失败响应示例**（HTTP 429）

```json
{
  "error": {
    "message": "Rate limit exceeded",
    "type": "rate_limit_error",
    "code": 429
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 本次补全的唯一 ID |
| `object` | string | 对象类型，`chat.completion` 或 `chat.completion.chunk` |
| `created` | integer | 创建时间戳（Unix 秒） |
| `model` | string | 实际使用的模型 |
| `choices[].index` | integer | 选项索引 |
| `choices[].message.role` | string | 角色，通常为 `assistant` |
| `choices[].message.content` | string | 生成的回复内容 |
| `choices[].finish_reason` | string | 结束原因，如 `stop`、`length` |
| `usage.prompt_tokens` | integer | 输入 token 数 |
| `usage.completion_tokens` | integer | 输出 token 数 |
| `usage.total_tokens` | integer | 总 token 数 |

#### 4. 调用示例

**curl（非流式）**

```bash
curl -X POST "http://localhost:8000/api/v1/chat/completions" \
  -H "Authorization: Bearer sk-your-platform-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}],
    "temperature": 0.7,
    "max_tokens": 1000,
    "stream": false,
    "pool_id": 1,
    "strategy": "race"
  }'
```

**JavaScript（非流式）**

```javascript
const response = await fetch("http://localhost:8000/api/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: "Bearer sk-your-platform-key",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello" }],
    temperature: 0.7,
    max_tokens: 1000,
    stream: false,
    pool_id: 1,
    strategy: "race",
  }),
});
const data = await response.json();
console.log(data.choices[0].message.content);
```

**JavaScript（流式）**

```javascript
const response = await fetch("http://localhost:8000/api/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: "Bearer sk-your-platform-key",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello" }],
    stream: true,
    pool_id: 1,
    strategy: "round_robin",
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(decoder.decode(value));
}
```

#### 5. 注意事项

- 认证方式：`Authorization: Bearer sk-xxxx`。
- `pool_id` 和 `strategy` 为平台扩展字段，不会转发给上游 AI。
- 当前 `ChatCompletionRequest` 中 `pool_id` 默认值为 `1`，`strategy` 默认值为 `race`；不传这两个字段时，代码会优先使用 schema 默认值，而非 API Key 的默认池或池默认策略。
- `stream=true` 时返回 SSE，客户端需按事件流解析，以 `data: [DONE]` 结束。
- 受 API Key 的每分钟/每日限流及配额约束，超限返回 HTTP 429。
- 平台会对远程图片 URL 做预处理，尝试转为 Base64，并拦截内网/回环地址。
- 本接口**不具备幂等性**，重复调用会产生不同的 AI 响应并消耗配额。

---

### Completions

#### 1. 接口概述

OpenAI 兼容的 Completions 接口，基于 prompt 文本生成补全，支持 SSE 流式响应。适用于文本续写、简单生成任务等场景。路径为 `/api/v1/v1/completions`（注意双 `v1` 前缀）。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `POST /api/v1/v1/completions` |
| **完整 URL 示例** | `http://localhost:8000/api/v1/v1/completions` |
| **Method** | `POST` |
| **认证方式** | Bearer API Key |

**Headers**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `Authorization` | string | 是 | `Bearer sk-xxxx` |
| `Content-Type` | string | 是 | `application/json` |

**请求 Body 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `model` | string | 是 | — | 请求模型名称 |
| `prompt` | string/array | 是 | — | 提示词 |
| `temperature` | number | 否 | `1.0` | 温度，范围 0–2 |
| `max_tokens` | integer | 否 | `16` | 最大 token 数 |
| `top_p` | number | 否 | `1.0` | Top P，范围 0–1 |
| `n` | integer | 否 | `1` | 生成数量 |
| `stream` | boolean | 否 | `false` | 是否流式返回 |
| `logprobs` | integer | 否 | `null` | 返回概率数量 |
| `echo` | boolean | 否 | `false` | 是否回显 prompt |
| `stop` | string/array | 否 | `null` | 停止序列 |
| `presence_penalty` | number | 否 | `0` | 存在惩罚 |
| `frequency_penalty` | number | 否 | `0` | 频率惩罚 |
| `user` | string | 否 | `null` | 用户标识 |
| `pool_id` | integer | 否 | `null` | 指定 API 池 ID，不传则使用 API Key 默认池 |
| `strategy` | string | 否 | `null` | 调度策略，不传则使用池默认策略 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "id": "cmpl-xxx",
  "object": "text_completion",
  "created": 1710000000,
  "model": "gpt-3.5-turbo-instruct",
  "choices": [
    {
      "text": "Hello! Hope you are having a great day.",
      "index": 0,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 6,
    "completion_tokens": 10,
    "total_tokens": 16
  }
}
```

**失败响应示例**（HTTP 401）

```json
{
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error",
    "code": 401
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 补全唯一 ID |
| `object` | string | 对象类型，`text_completion` |
| `choices[].text` | string | 生成的文本 |
| `choices[].finish_reason` | string | 结束原因 |
| `usage` | object | Token 用量统计 |

#### 4. 调用示例

**curl**

```bash
curl -X POST "http://localhost:8000/api/v1/v1/completions" \
  -H "Authorization: Bearer sk-your-platform-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo-instruct",
    "prompt": "Write a short greeting.",
    "max_tokens": 50,
    "stream": false,
    "pool_id": 1,
    "strategy": "round_robin"
  }'
```

**JavaScript**

```javascript
const response = await fetch("http://localhost:8000/api/v1/v1/completions", {
  method: "POST",
  headers: {
    Authorization: "Bearer sk-your-platform-key",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-3.5-turbo-instruct",
    prompt: "Write a short greeting.",
    max_tokens: 50,
    pool_id: 1,
    strategy: "round_robin",
  }),
});
const data = await response.json();
console.log(data.choices[0].text);
```

#### 5. 注意事项

- 路径为 `/api/v1/v1/completions`，与 OpenAI SDK 默认 `base_url` 拼接习惯不一致，使用 SDK 时需手动指定完整路径。
- `pool_id` 不传时使用 API Key 的 `default_pool_id`（与 Chat Completions 行为不同）。
- 受 API Key 限流和配额约束。
- 不具备幂等性。

---

### 获取可用模型

#### 1. 接口概述

获取当前 API Key 可访问的模型列表，返回 OpenAI 兼容格式。适用于客户端动态展示模型选择器、校验模型可用性等场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/v1/models` |
| **完整 URL 示例** | `http://localhost:8000/api/v1/v1/models` |
| **Method** | `GET` |
| **认证方式** | Bearer API Key |

**Headers**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `Authorization` | string | 是 | `Bearer sk-xxxx` |

**请求参数**

无。

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4",
      "object": "model",
      "created": null,
      "owned_by": "system"
    }
  ]
}
```

**失败响应示例**（HTTP 401）

```json
{
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error",
    "code": 401
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `object` | string | 固定为 `list` |
| `data[].id` | string | 模型 ID |
| `data[].object` | string | 固定为 `model` |
| `data[].created` | integer/null | 模型创建时间戳 |
| `data[].owned_by` | string | 模型归属 |

#### 4. 调用示例

**curl**

```bash
curl -X GET "http://localhost:8000/api/v1/v1/models" \
  -H "Authorization: Bearer sk-your-platform-key"
```

**JavaScript**

```javascript
const response = await fetch("http://localhost:8000/api/v1/v1/models", {
  headers: { Authorization: "Bearer sk-your-platform-key" },
});
const { data } = await response.json();
console.log(data.map((m) => m.id));
```

#### 5. 注意事项

- 路径为 `/api/v1/v1/models`，与 OpenAI SDK 默认路径不一致。
- 当前实现中 `list_models` 读取 `key_info.get("pool_id")` 和池的 `provider_ids`，但模型主要使用 `default_pool_id` 和 `endpoint_ids`，存在字段版本不一致风险。
- 只读接口，具有幂等性。

---

## 管理端 API

| 模块 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 管理员 | `GET` | `/api/v1/status` | 管理端状态检查 |
| 管理员 | `GET` | `/api/v1/info` | 管理端信息 |
| API 端点 | `POST` | `/api/v1/endpoints` | 创建端点 |
| API 端点 | `GET` | `/api/v1/endpoints` | 查询端点列表 |
| API 端点 | `GET` | `/api/v1/endpoints/detail` | 查询端点详情 |
| API 端点 | `PUT` | `/api/v1/endpoints` | 更新端点 |
| API 端点 | `DELETE` | `/api/v1/endpoints` | 删除端点 |
| API 端点 | `GET` | `/api/v1/endpoints/{endpoint_id}/stats` | 获取端点统计 |
| API 端点 | `POST` | `/api/v1/endpoints/{endpoint_id}/test` | 测试端点连接 |
| API 端点 | `GET` | `/api/v1/endpoints/by-provider` | 按供应商查询端点 |
| API 端点 | `GET` | `/api/v1/endpoints/by-model` | 按模型查询端点 |
| API 池 | `POST` | `/api/v1/pools` | 创建 API 池 |
| API 池 | `GET` | `/api/v1/pools` | 查询池列表 |
| API 池 | `GET` | `/api/v1/pools/detail` | 查询池详情 |
| API 池 | `PUT` | `/api/v1/pools` | 更新池 |
| API 池 | `DELETE` | `/api/v1/pools` | 删除池 |
| API 池 | `POST` | `/api/v1/pools/{pool_id}/endpoints` | 向池添加端点 |
| API 池 | `DELETE` | `/api/v1/pools/{pool_id}/endpoints/{endpoint_id}` | 从池移除端点 |
| API 池 | `GET` | `/api/v1/pools/{pool_id}/stats` | 获取池统计 |
| API 池 | `POST` | `/api/v1/pools/{pool_id}/test` | 测试池 |
| API 池 | `GET` | `/api/v1/pools/{pool_id}/endpoints` | 获取池内端点 |
| API Key | `POST` | `/api/v1/keys` | 创建 API Key |
| API Key | `GET` | `/api/v1/keys` | 查询 API Key 列表 |
| API Key | `GET` | `/api/v1/keys/detail` | 查询 API Key 详情 |
| API Key | `PUT` | `/api/v1/keys` | 更新 API Key |
| API Key | `DELETE` | `/api/v1/keys` | 删除 API Key |
| API Key | `POST` | `/api/v1/keys/disable` | 禁用 API Key |
| API Key | `POST` | `/api/v1/keys/enable` | 启用 API Key |
| API Key | `POST` | `/api/v1/keys/reset-quota` | 重置配额 |
| API Key | `GET` | `/api/v1/keys/debug` | 调试 API Key Hash |
| 请求日志 | `GET` | `/api/v1/logs` | 查询请求日志 |
| 请求日志 | `GET` | `/api/v1/logs/detail` | 查询日志详情 |
| 请求日志 | `GET` | `/api/v1/logs/statistics` | 查询统计数据 |
| 请求日志 | `GET` | `/api/v1/logs/recent` | 查询最近日志 |
| 请求日志 | `GET` | `/api/v1/logs/by-pool/{pool_id}` | 按池查询日志 |
| 请求日志 | `GET` | `/api/v1/logs/by-endpoint/{endpoint_id}` | 按端点查询日志 |
| 请求日志 | `GET` | `/api/v1/logs/by-user/{user_id}` | 按用户查询日志 |
| 请求日志 | `GET` | `/api/v1/logs/errors` | 查询错误日志 |
| 请求日志 | `DELETE` | `/api/v1/logs/cleanup` | 清理旧日志 |
| AI 供应商 | `POST` | `/api/v1/ai-providers/test-connection` | 测试供应商连接 |

> 管理端所有接口均需 **Basic Auth** 认证。以下示例默认用户名 `admin`，密码 `suoweilai123456`。

---

### 管理员状态检查

#### 1. 接口概述

检查管理端服务是否正常运行及 Basic Auth 是否有效。适用于管理后台健康探测、部署验证等场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/status` |
| **完整 URL 示例** | `http://localhost:8001/api/v1/status` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Headers**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `Authorization` | string | 是 | `Basic base64(username:password)` |

**请求参数**

无。

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "管理员接口正常",
  "data": {
    "status": "admin_healthy",
    "timestamp": "2026-06-10T10:00:00",
    "authenticated": true
  }
}
```

**失败响应示例**（HTTP 401）

```json
{
  "detail": "Invalid credentials"
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `data.status` | string | 管理端状态 |
| `data.authenticated` | boolean | 是否已通过认证 |
| `data.timestamp` | string | 当前时间 |

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 "http://localhost:8001/api/v1/status"
```

**JavaScript**

```javascript
const credentials = btoa("admin:suoweilai123456");
const response = await fetch("http://localhost:8001/api/v1/status", {
  headers: { Authorization: `Basic ${credentials}` },
});
console.log(await response.json());
```

#### 5. 注意事项

- 需要 Basic Auth，无 Bearer Token。
- 只读接口，具有幂等性。

---

### 管理员信息

#### 1. 接口概述

获取管理端版本、权限列表及服务信息。适用于管理后台关于页面、权限校验展示等场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/info` |
| **完整 URL 示例** | `http://localhost:8001/api/v1/info` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Headers**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `Authorization` | string | 是 | Basic Auth 凭证 |

**请求参数**

无。

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "获取管理员信息成功",
  "data": {
    "admin_version": "1.0.0",
    "permissions": ["read", "write", "delete"],
    "service": "Admin MS Scaffold Service",
    "timestamp": "2026-06-10T10:00:00"
  }
}
```

**失败响应示例**（HTTP 401）

```json
{
  "detail": "Invalid credentials"
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `data.admin_version` | string | 管理端版本 |
| `data.permissions` | array | 当前管理员权限列表 |
| `data.service` | string | 服务名称 |

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 "http://localhost:8001/api/v1/info"
```

**JavaScript**

```javascript
const credentials = btoa("admin:suoweilai123456");
const response = await fetch("http://localhost:8001/api/v1/info", {
  headers: { Authorization: `Basic ${credentials}` },
});
console.log(await response.json());
```

#### 5. 注意事项

- 需要 Basic Auth。
- 只读接口，具有幂等性。

---

## API 端点管理

### 创建 API 端点

#### 1. 接口概述

创建一个上游 AI API 端点。端点是平台最小可调度单元，包含上游 URL、API Key、模型等信息。适用于接入新的 AI 供应商或增加备用 Key 等场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `POST /api/v1/endpoints` |
| **完整 URL 示例** | `http://localhost:8001/api/v1/endpoints` |
| **Method** | `POST` |
| **认证方式** | Basic Auth |

**Headers**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `Authorization` | string | 是 | Basic Auth 凭证 |
| `Content-Type` | string | 是 | `application/json` |

**请求 Body 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `name` | string | 是 | — | 端点名称 |
| `provider_name` | string | 是 | — | 供应商名称，如 `OpenAI`、`DeepSeek`、`vertex_ai` |
| `base_url` | string | 是 | — | 上游 API 基础 URL |
| `api_key` | string | 是 | — | 上游 API Key |
| `model` | string | 是 | — | 上游模型名称 |
| `status` | string | 否 | `active` | `active` / `disabled` / `error` |
| `priority` | integer | 否 | `0` | 优先级，数字越大优先级越高 |
| `weight` | integer | 否 | `1` | 轮询权重 |
| `max_retries` | integer | 否 | `3` | 最大重试次数 |
| `timeout` | integer | 否 | `60` | 请求超时时间（秒） |
| `rate_limit` | integer | 否 | `0` | 端点速率限制，0 表示不限 |
| `headers` | string | 否 | `null` | 自定义请求头 JSON 字符串 |
| `extra_config` | string | 否 | `null` | 额外配置 JSON 字符串 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "创建端点成功",
  "data": {
    "id": 1,
    "name": "OpenAI-GPT4-Key1",
    "provider_name": "OpenAI",
    "base_url": "https://api.openai.com/v1",
    "model": "gpt-4",
    "status": "active",
    "created_at": "2026-06-10T10:00:00"
  }
}
```

**失败响应示例**（HTTP 400）

```json
{
  "success": false,
  "message": "端点名称已存在",
  "data": null
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `data.id` | integer | 新创建的端点 ID |
| `data.name` | string | 端点名称 |
| `data.status` | string | 端点状态 |

#### 4. 调用示例

**curl**

```bash
curl -X POST "http://localhost:8001/api/v1/endpoints" \
  -u admin:suoweilai123456 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "OpenAI-GPT4-Key1",
    "provider_name": "OpenAI",
    "base_url": "https://api.openai.com/v1",
    "api_key": "sk-upstream-key",
    "model": "gpt-4",
    "status": "active"
  }'
```

**JavaScript**

```javascript
const credentials = btoa("admin:suoweilai123456");
const response = await fetch("http://localhost:8001/api/v1/endpoints", {
  method: "POST",
  headers: {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "OpenAI-GPT4-Key1",
    provider_name: "OpenAI",
    base_url: "https://api.openai.com/v1",
    api_key: "sk-upstream-key",
    model: "gpt-4",
  }),
});
console.log(await response.json());
```

#### 5. 注意事项

- 需要 Basic Auth。
- 上游 `api_key` 为敏感信息，请妥善保管。
- 不具备幂等性，重复创建可能因名称冲突失败。

---

### 查询 API 端点列表

#### 1. 接口概述

分页查询 API 端点列表，支持按状态、供应商、模型过滤。适用于管理后台端点列表页、运维巡检等场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/endpoints` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `page` | integer | 否 | `1` | 页码 |
| `limit` | integer | 否 | `10` | 每页数量，最大 100 |
| `status` | string | 否 | — | 状态过滤 |
| `provider_name` | string | 否 | — | 供应商过滤 |
| `model` | string | 否 | — | 模型过滤 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": [
    {
      "id": 1,
      "name": "OpenAI-GPT4-Key1",
      "provider_name": "OpenAI",
      "model": "gpt-4",
      "status": "active"
    }
  ],
  "page_info": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "total_pages": 1
  }
}
```

**失败响应示例**（HTTP 401）

```json
{
  "detail": "Invalid credentials"
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/endpoints?page=1&limit=10&status=active"
```

**JavaScript**

```javascript
const credentials = btoa("admin:suoweilai123456");
const response = await fetch(
  "http://localhost:8001/api/v1/endpoints?page=1&limit=10",
  { headers: { Authorization: `Basic ${credentials}` } }
);
console.log(await response.json());
```

#### 5. 注意事项

- 返回列表中 `api_key` 为脱敏字段。
- 只读接口，具有幂等性。

---

### 查询 API 端点详情

#### 1. 接口概述

根据端点 ID 获取单个端点的完整信息。适用于端点编辑页、详情查看等场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/endpoints/detail` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | integer | 是 | 端点 ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "id": 1,
    "name": "OpenAI-GPT4-Key1",
    "provider_name": "OpenAI",
    "base_url": "https://api.openai.com/v1",
    "model": "gpt-4",
    "status": "active",
    "priority": 1,
    "weight": 1,
    "max_retries": 3,
    "timeout": 60
  }
}
```

**失败响应示例**（HTTP 404）

```json
{
  "success": false,
  "message": "端点不存在",
  "data": null
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/endpoints/detail?id=1"
```

#### 5. 注意事项

- 只读接口，具有幂等性。

---

### 更新 API 端点

#### 1. 接口概述

根据端点 ID 更新端点配置。支持部分更新，所有 Body 字段均为可选。适用于修改端点状态、调整优先级、更换上游 Key 等场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `PUT /api/v1/endpoints` |
| **Method** | `PUT` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | integer | 是 | 端点 ID |

**请求 Body 参数**

支持创建端点中的全部字段，均为可选。

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "更新端点成功",
  "data": { "id": 1, "status": "disabled" }
}
```

**失败响应示例**（HTTP 404）

```json
{
  "success": false,
  "message": "端点不存在",
  "data": null
}
```

#### 4. 调用示例

**curl**

```bash
curl -X PUT "http://localhost:8001/api/v1/endpoints?id=1" \
  -u admin:suoweilai123456 \
  -H "Content-Type: application/json" \
  -d '{"status": "disabled", "priority": 2}'
```

#### 5. 注意事项

- 更新操作不具备幂等性（多次更新结果取决于最后一次请求内容）。

---

### 删除 API 端点

#### 1. 接口概述

根据端点 ID 删除端点。适用于下线不再使用的上游 Key 等场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `DELETE /api/v1/endpoints` |
| **Method** | `DELETE` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | integer | 是 | 端点 ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "删除端点成功",
  "data": null
}
```

**失败响应示例**（HTTP 404）

```json
{
  "success": false,
  "message": "端点不存在",
  "data": null
}
```

#### 4. 调用示例

**curl**

```bash
curl -X DELETE "http://localhost:8001/api/v1/endpoints?id=1" \
  -u admin:suoweilai123456
```

#### 5. 注意事项

- 删除操作不可逆，请确认端点未在被 API 池引用。
- 重复删除同一 ID 可能返回 404。

---

### 获取端点统计

#### 1. 接口概述

获取指定端点在指定时间范围内的请求统计，包括成功率、平均响应时间等。适用于监控面板、端点健康评估等场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/endpoints/{endpoint_id}/stats` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Path 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `endpoint_id` | integer | 是 | 端点 ID |

**Query 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `hours` | integer | 否 | `24` | 统计时间范围，1–168 小时 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "endpoint_id": 1,
    "total_requests": 1000,
    "success_requests": 980,
    "error_requests": 20,
    "success_rate": 0.98,
    "avg_response_time": 850,
    "time_range_hours": 24
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `total_requests` | integer | 总请求数 |
| `success_requests` | integer | 成功请求数 |
| `error_requests` | integer | 错误请求数 |
| `success_rate` | number | 成功率（0–1） |
| `avg_response_time` | integer | 平均响应时间（毫秒） |
| `time_range_hours` | integer | 统计时间范围 |

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/endpoints/1/stats?hours=24"
```

#### 5. 注意事项

- 只读接口，具有幂等性。

---

### 测试端点连接

#### 1. 接口概述

向指定端点的上游发送测试请求，验证连接是否正常。适用于新增端点后的连通性验证、故障排查等场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `POST /api/v1/endpoints/{endpoint_id}/test` |
| **Method** | `POST` |
| **认证方式** | Basic Auth |

**Path 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `endpoint_id` | integer | 是 | 端点 ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "端点测试成功",
  "data": {
    "endpoint_id": 1,
    "status": "success",
    "response_time_ms": 500
  }
}
```

**失败响应示例**（HTTP 200，测试失败）

```json
{
  "success": true,
  "message": "端点测试完成",
  "data": {
    "endpoint_id": 1,
    "status": "failed",
    "error": "Connection timeout"
  }
}
```

#### 4. 调用示例

**curl**

```bash
curl -X POST "http://localhost:8001/api/v1/endpoints/1/test" \
  -u admin:suoweilai123456
```

#### 5. 注意事项

- 接口会向上游 `/v1/chat/completions` 发送简单测试请求。
- 测试成功/失败会更新端点统计。
- 每次调用会消耗上游 API 配额，不具备幂等性。

---

### 按供应商查询端点

#### 1. 接口概述

按供应商名称分页查询端点列表。适用于按 AI 供应商维度管理端点的场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/endpoints/by-provider` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `provider_name` | string | 是 | — | 供应商名称 |
| `page` | integer | 否 | `1` | 页码 |
| `limit` | integer | 否 | `10` | 每页数量 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": [],
  "page_info": { "total": 0, "page": 1, "limit": 10, "total_pages": 0 }
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/endpoints/by-provider?provider_name=OpenAI"
```

#### 5. 注意事项

- 只读接口，具有幂等性。

---

### 按模型查询端点

#### 1. 接口概述

按模型名称分页查询端点列表。适用于查找支持特定模型的所有上游端点。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/endpoints/by-model` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `model` | string | 是 | — | 模型名称 |
| `page` | integer | 否 | `1` | 页码 |
| `limit` | integer | 否 | `10` | 每页数量 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": [],
  "page_info": { "total": 0, "page": 1, "limit": 10, "total_pages": 0 }
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/endpoints/by-model?model=gpt-4"
```

#### 5. 注意事项

- 只读接口，具有幂等性。

---

## API 池管理

### 创建 API 池

#### 1. 接口概述

创建一个 API 池，将多个端点组合在一起进行统一调度。适用于构建高可用模型服务、负载均衡、故障转移等场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `POST /api/v1/pools` |
| **Method** | `POST` |
| **认证方式** | Basic Auth |

**请求 Body 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `name` | string | 是 | — | 池名称，唯一 |
| `endpoint_ids` | array | 是 | — | 端点 ID 列表 |
| `status` | string | 否 | `active` | `active` / `disabled` |
| `fallback_pool_id` | integer | 否 | `null` | 备用池 ID |
| `description` | string | 否 | `null` | 池描述 |
| `default_strategy` | string | 否 | `round_robin` | 默认调度策略 |
| `config` | object | 否 | `null` | 池配置 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "创建池成功",
  "data": {
    "id": 1,
    "name": "default-pool",
    "status": "active",
    "default_strategy": "round_robin"
  }
}
```

**失败响应示例**（HTTP 400）

```json
{
  "success": false,
  "message": "池名称已存在",
  "data": null
}
```

#### 4. 调用示例

**curl**

```bash
curl -X POST "http://localhost:8001/api/v1/pools" \
  -u admin:suoweilai123456 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "default-pool",
    "endpoint_ids": [1, 2],
    "default_strategy": "round_robin"
  }'
```

#### 5. 注意事项

- 池名称必须唯一。
- 不具备幂等性。

---

### 查询 API 池列表

#### 1. 接口概述

分页查询 API 池列表，支持按状态和默认策略过滤。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/pools` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `page` | integer | 否 | `1` | 页码 |
| `limit` | integer | 否 | `10` | 每页数量，最大 100 |
| `status` | string | 否 | — | 状态过滤 |
| `default_strategy` | string | 否 | — | 默认策略过滤 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": [],
  "page_info": { "total": 0, "page": 1, "limit": 10, "total_pages": 0 }
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 "http://localhost:8001/api/v1/pools?page=1&limit=10"
```

#### 5. 注意事项

- 只读接口，具有幂等性。

---

### 查询 API 池详情

#### 1. 接口概述

根据池 ID 获取单个 API 池的完整信息。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/pools/detail` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | integer | 是 | 池 ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "id": 1,
    "name": "default-pool",
    "endpoint_ids": [1, 2],
    "status": "active",
    "default_strategy": "round_robin"
  }
}
```

**失败响应示例**（HTTP 404）

```json
{
  "success": false,
  "message": "池不存在",
  "data": null
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 "http://localhost:8001/api/v1/pools/detail?id=1"
```

#### 5. 注意事项

- 只读接口，具有幂等性。

---

### 更新 API 池

#### 1. 接口概述

根据池 ID 更新 API 池配置，支持部分更新。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `PUT /api/v1/pools` |
| **Method** | `PUT` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | integer | 是 | 池 ID |

**请求 Body 参数**

支持创建池中的全部字段，均为可选。

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "更新池成功",
  "data": { "id": 1, "status": "disabled" }
}
```

#### 4. 调用示例

**curl**

```bash
curl -X PUT "http://localhost:8001/api/v1/pools?id=1" \
  -u admin:suoweilai123456 \
  -H "Content-Type: application/json" \
  -d '{"status": "disabled"}'
```

#### 5. 注意事项

- 更新操作不具备严格幂等性。

---

### 删除 API 池

#### 1. 接口概述

根据池 ID 删除 API 池。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `DELETE /api/v1/pools` |
| **Method** | `DELETE` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | integer | 是 | 池 ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "删除池成功",
  "data": null
}
```

#### 4. 调用示例

**curl**

```bash
curl -X DELETE "http://localhost:8001/api/v1/pools?id=1" \
  -u admin:suoweilai123456
```

#### 5. 注意事项

- 删除前请确认无 API Key 引用该池。
- 操作不可逆。

---

### 向池添加端点

#### 1. 接口概述

向指定 API 池中添加一个端点。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `POST /api/v1/pools/{pool_id}/endpoints` |
| **Method** | `POST` |
| **认证方式** | Basic Auth |

**Path 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `pool_id` | integer | 是 | 池 ID |

**请求 Body 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `endpoint_id` | integer | 是 | 端点 ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "添加端点成功",
  "data": { "pool_id": 1, "endpoint_id": 3 }
}
```

#### 4. 调用示例

**curl**

```bash
curl -X POST "http://localhost:8001/api/v1/pools/1/endpoints" \
  -u admin:suoweilai123456 \
  -H "Content-Type: application/json" \
  -d '{"endpoint_id": 3}'
```

#### 5. 注意事项

- 重复添加同一端点可能返回错误。

---

### 从池移除端点

#### 1. 接口概述

从指定 API 池中移除一个端点。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `DELETE /api/v1/pools/{pool_id}/endpoints/{endpoint_id}` |
| **Method** | `DELETE` |
| **认证方式** | Basic Auth |

**Path 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `pool_id` | integer | 是 | 池 ID |
| `endpoint_id` | integer | 是 | 端点 ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "移除端点成功",
  "data": null
}
```

#### 4. 调用示例

**curl**

```bash
curl -X DELETE "http://localhost:8001/api/v1/pools/1/endpoints/3" \
  -u admin:suoweilai123456
```

#### 5. 注意事项

- 移除后该端点不再参与该池的调度。

---

### 获取池统计

#### 1. 接口概述

获取指定 API 池在指定时间范围内的请求统计。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/pools/{pool_id}/stats` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Path 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `pool_id` | integer | 是 | 池 ID |

**Query 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `hours` | integer | 否 | `24` | 统计时间范围，1–168 小时 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "pool_id": 1,
    "total_requests": 5000,
    "success_rate": 0.99,
    "avg_response_time": 720,
    "time_range_hours": 24
  }
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/pools/1/stats?hours=24"
```

#### 5. 注意事项

- 只读接口，具有幂等性。

---

### 测试池连接

#### 1. 接口概述

测试指定 API 池的调度策略是否正常工作。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `POST /api/v1/pools/{pool_id}/test` |
| **Method** | `POST` |
| **认证方式** | Basic Auth |

**Path 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `pool_id` | integer | 是 | 池 ID |

**请求 Body 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `strategy` | string | 是 | — | `round_robin` / `race` |
| `timeout_ms` | integer | 否 | — | 超时时间，仅竞速模式有效 |
| `max_concurrent` | integer | 否 | — | 最大并发，仅竞速模式有效 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "池测试完成",
  "data": {
    "pool_id": 1,
    "strategy": "race",
    "status": "success"
  }
}
```

#### 4. 调用示例

**curl**

```bash
curl -X POST "http://localhost:8001/api/v1/pools/1/test" \
  -u admin:suoweilai123456 \
  -H "Content-Type: application/json" \
  -d '{"strategy": "race", "timeout_ms": 30000, "max_concurrent": 3}'
```

#### 5. 注意事项

- 当前实现为模拟测试结果，不会像端点测试一样真实请求上游。

---

### 获取池内端点

#### 1. 接口概述

获取指定 API 池中包含的所有端点列表。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/pools/{pool_id}/endpoints` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Path 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `pool_id` | integer | 是 | 池 ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": [
    { "id": 1, "name": "OpenAI-GPT4-Key1", "model": "gpt-4", "status": "active" }
  ]
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/pools/1/endpoints"
```

#### 5. 注意事项

- 只读接口，具有幂等性。

---

## API Key 管理

### 创建 API Key

#### 1. 接口概述

创建平台 API Key，供客户端调用 OpenAI 兼容接口。适用于为新用户/应用发放访问凭证、设置限流和配额等场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `POST /api/v1/keys` |
| **Method** | `POST` |
| **认证方式** | Basic Auth |

**请求 Body 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `key_name` | string | 是 | — | Key 名称 |
| `user_id` | string | 否 | `null` | 关联用户 ID |
| `allowed_pools` | array | 否 | `null` | 允许访问的池 ID 列表，`null` 或空数组表示允许所有池 |
| `default_pool_id` | integer | 否 | `null` | 默认池 ID |
| `rate_limit_per_minute` | integer | 否 | `60` | 每分钟请求限制 |
| `rate_limit_per_day` | integer | 否 | `10000` | 每日请求限制 |
| `quota_type` | string | 否 | `unlimited` | 配额类型 |
| `total_quota` | integer | 否 | `0` | 总配额 |
| `expire_at` | datetime | 否 | `null` | 过期时间 |
| `allowed_models` | array | 否 | `null` | 允许模型列表 |
| `allowed_ips` | array | 否 | `null` | IP 白名单 |
| `key_metadata` | object | 否 | `null` | 元数据 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "创建API Key成功，请妥善保存密钥",
  "data": {
    "id": 1,
    "key_name": "test-key",
    "api_key": "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "status": "active",
    "created_at": "2026-06-10T10:00:00"
  }
}
```

**失败响应示例**（HTTP 400）

```json
{
  "success": false,
  "message": "Key名称已存在",
  "data": null
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `data.api_key` | string | 完整 API Key，**仅创建时返回一次** |
| `data.status` | string | Key 状态 |

#### 4. 调用示例

**curl**

```bash
curl -X POST "http://localhost:8001/api/v1/keys" \
  -u admin:suoweilai123456 \
  -H "Content-Type: application/json" \
  -d '{
    "key_name": "demo-key",
    "user_id": "demo-user",
    "allowed_pools": [1],
    "default_pool_id": 1,
    "rate_limit_per_minute": 60,
    "rate_limit_per_day": 10000,
    "quota_type": "unlimited"
  }'
```

**JavaScript**

```javascript
const credentials = btoa("admin:suoweilai123456");
const response = await fetch("http://localhost:8001/api/v1/keys", {
  method: "POST",
  headers: {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    key_name: "demo-key",
    user_id: "demo-user",
    allowed_pools: [1],
    default_pool_id: 1,
    rate_limit_per_minute: 60,
    rate_limit_per_day: 10000,
    quota_type: "unlimited",
  }),
});
const { data } = await response.json();
console.log("Save this key:", data.api_key);
```

#### 5. 注意事项

- 完整 API Key **仅创建时返回一次**，列表和详情接口返回脱敏字段。
- 默认限流：60 次/分钟，10000 次/天。
- 不具备幂等性。

---

### 查询 API Key 列表

#### 1. 接口概述

分页查询 API Key 列表，支持按用户 ID 和状态过滤。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/keys` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `page` | integer | 否 | `1` | 页码 |
| `limit` | integer | 否 | `10` | 每页数量，最大 100 |
| `user_id` | string | 否 | — | 用户 ID 过滤 |
| `status` | string | 否 | — | 状态过滤 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": [
    {
      "id": 1,
      "key_name": "test-key",
      "api_key_prefix": "sk-xxxx...",
      "status": "active",
      "rate_limit_per_minute": 60
    }
  ],
  "page_info": { "total": 1, "page": 1, "limit": 10, "total_pages": 1 }
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/keys?page=1&limit=10&status=active"
```

#### 5. 注意事项

- 返回的 Key 为脱敏格式。
- 只读接口，具有幂等性。

---

### 查询 API Key 详情

#### 1. 接口概述

根据 API Key ID 获取详细信息。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/keys/detail` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | integer | 是 | API Key ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "id": 1,
    "key_name": "test-key",
    "user_id": "user-001",
    "status": "active",
    "allowed_pools": [1],
    "default_pool_id": 1,
    "rate_limit_per_minute": 60,
    "rate_limit_per_day": 10000,
    "quota_type": "unlimited",
    "used_quota": 0
  }
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/keys/detail?id=1"
```

#### 5. 注意事项

- 不返回完整 API Key。
- 只读接口，具有幂等性。

---

### 更新 API Key

#### 1. 接口概述

更新 API Key 配置，如限流、配额、允许池等。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `PUT /api/v1/keys` |
| **Method** | `PUT` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | integer | 是 | API Key ID |

**请求 Body 参数**

支持创建 API Key 的大部分字段，均为可选，并额外支持 `status`（`active` / `disabled`）。

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "更新API Key成功",
  "data": { "id": 1, "rate_limit_per_minute": 120 }
}
```

#### 4. 调用示例

**curl**

```bash
curl -X PUT "http://localhost:8001/api/v1/keys?id=1" \
  -u admin:suoweilai123456 \
  -H "Content-Type: application/json" \
  -d '{"rate_limit_per_minute": 120}'
```

#### 5. 注意事项

- 无法通过此接口获取完整 Key 明文。

---

### 删除 API Key

#### 1. 接口概述

永久删除指定 API Key。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `DELETE /api/v1/keys` |
| **Method** | `DELETE` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | integer | 是 | API Key ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "删除API Key成功",
  "data": null
}
```

#### 4. 调用示例

**curl**

```bash
curl -X DELETE "http://localhost:8001/api/v1/keys?id=1" \
  -u admin:suoweilai123456
```

#### 5. 注意事项

- 删除后使用该 Key 的所有请求将立即失败（401）。
- 操作不可逆。

---

### 禁用 API Key

#### 1. 接口概述

禁用指定 API Key，使其暂时无法使用，但不删除记录。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `POST /api/v1/keys/disable` |
| **Method** | `POST` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | integer | 是 | API Key ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "禁用API Key成功",
  "data": { "id": 1, "status": "disabled" }
}
```

#### 4. 调用示例

**curl**

```bash
curl -X POST "http://localhost:8001/api/v1/keys/disable?id=1" \
  -u admin:suoweilai123456
```

#### 5. 注意事项

- 禁用后可通过启用接口恢复。
- 具有幂等性（重复禁用同一 Key 结果一致）。

---

### 启用 API Key

#### 1. 接口概述

重新启用已禁用的 API Key。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `POST /api/v1/keys/enable` |
| **Method** | `POST` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | integer | 是 | API Key ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "启用API Key成功",
  "data": { "id": 1, "status": "active" }
}
```

#### 4. 调用示例

**curl**

```bash
curl -X POST "http://localhost:8001/api/v1/keys/enable?id=1" \
  -u admin:suoweilai123456
```

#### 5. 注意事项

- 启用前请确认 Key 未过期且配额未耗尽。

---

### 重置 API Key 配额

#### 1. 接口概述

将指定 API Key 的已用配额重置为零。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `POST /api/v1/keys/reset-quota` |
| **Method** | `POST` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | integer | 是 | API Key ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "重置配额成功",
  "data": { "id": 1, "used_quota": 0 }
}
```

#### 4. 调用示例

**curl**

```bash
curl -X POST "http://localhost:8001/api/v1/keys/reset-quota?id=1" \
  -u admin:suoweilai123456
```

#### 5. 注意事项

- 仅对 `quota_type` 为 `token` 或 `request` 的 Key 有意义。
- 具有幂等性。

---

### 调试 API Key Hash

#### 1. 接口概述

调试 API Key 的哈希存储是否正确，用于排查认证失败问题。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/keys/debug` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | integer | 是 | API Key ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "id": 1,
  "key_name": "test-key",
  "api_key_prefix": "sk-xxxx...",
  "stored_hash": "hash-from-db",
  "calculated_hash": "hash-calculated",
  "hash_match": true
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `hash_match` | boolean | 存储哈希与计算哈希是否一致 |

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/keys/debug?id=1"
```

#### 5. 注意事项

- 仅用于调试，生产环境谨慎使用。
- 只读接口，具有幂等性。

---

## 请求日志管理

### 查询请求日志

#### 1. 接口概述

分页查询 API 请求日志，支持多维度过滤。适用于运维监控、用量分析、故障排查等场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/logs` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `page` | integer | 否 | `1` | 页码 |
| `limit` | integer | 否 | `50` | 每页数量，最大 200 |
| `user_id` | string | 否 | — | 用户 ID |
| `pool_id` | integer | 否 | — | 池 ID |
| `endpoint_id` | integer | 否 | — | 端点 ID |
| `model` | string | 否 | — | 模型 |
| `strategy_used` | string | 否 | — | 调度策略 |
| `success` | string | 否 | — | `true` / `false` |
| `start_date` | datetime | 否 | — | 开始时间 |
| `end_date` | datetime | 否 | — | 结束时间 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": [
    {
      "request_id": "req-abc123",
      "user_id": "user-001",
      "pool_id": 1,
      "endpoint_id": 1,
      "endpoint_name": "OpenAI-GPT4-Key1",
      "provider_name": "OpenAI",
      "model": "gpt-4",
      "strategy_used": "race",
      "success": "true",
      "response_time_ms": 850,
      "first_byte_time_ms": 120,
      "stream": "false",
      "status_code": 200,
      "request_tokens": 10,
      "response_tokens": 12,
      "total_tokens": 22,
      "cost": 0.001
    }
  ],
  "page_info": { "total": 100, "page": 1, "limit": 50, "total_pages": 2 }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `request_id` | string | 请求唯一 ID |
| `response_time_ms` | integer | 总响应时间（毫秒） |
| `first_byte_time_ms` | integer | 首字节时间（毫秒） |
| `total_tokens` | integer | 总 token 数 |
| `cost` | number | 成本 |

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/logs?page=1&limit=50&success=true"
```

#### 5. 注意事项

- 只读接口，具有幂等性。
- 大量日志查询可能较慢，建议加时间范围过滤。

---

### 查询日志详情

#### 1. 接口概述

根据 `request_id` 获取单条请求日志的完整详情。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/logs/detail` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `request_id` | string | 是 | 请求唯一 ID |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "request_id": "req-abc123",
    "model": "gpt-4",
    "success": "true",
    "error_message": null,
    "request_body": {},
    "response_body": {}
  }
}
```

**失败响应示例**（HTTP 404）

```json
{
  "success": false,
  "message": "日志不存在",
  "data": null
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/logs/detail?request_id=req-abc123"
```

#### 5. 注意事项

- 只读接口，具有幂等性。

---

### 查询日志统计

#### 1. 接口概述

获取指定时间范围内的请求统计数据，支持按用户、池、端点、模型过滤。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/logs/statistics` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `hours` | integer | 否 | `24` | 统计时间范围，1–168 小时 |
| `user_id` | string | 否 | — | 用户 ID |
| `pool_id` | integer | 否 | — | 池 ID |
| `endpoint_id` | integer | 否 | — | 端点 ID |
| `model` | string | 否 | — | 模型 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "total_requests": 10000,
    "success_requests": 9800,
    "error_requests": 200,
    "success_rate": 0.98,
    "total_tokens": 500000,
    "avg_response_time_ms": 750
  }
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/logs/statistics?hours=24&pool_id=1"
```

#### 5. 注意事项

- 只读接口，具有幂等性。

---

### 查询最近日志

#### 1. 接口概述

查询最近 N 小时内的请求日志，按时间倒序排列。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/logs/recent` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `hours` | integer | 否 | `24` | 最近多少小时 |
| `page` | integer | 否 | `1` | 页码 |
| `limit` | integer | 否 | `100` | 每页数量，最大 500 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": [],
  "page_info": { "total": 0, "page": 1, "limit": 100, "total_pages": 0 }
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/logs/recent?hours=1&limit=100"
```

#### 5. 注意事项

- 只读接口，具有幂等性。

---

### 按池查询日志

#### 1. 接口概述

查询指定 API 池的请求日志。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/logs/by-pool/{pool_id}` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Path / Query 参数**

| 参数 | 位置 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `pool_id` | Path | integer | 是 | — | 池 ID |
| `page` | Query | integer | 否 | `1` | 页码 |
| `limit` | Query | integer | 否 | `50` | 每页数量 |
| `hours` | Query | integer | 否 | `24` | 时间范围 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": [],
  "page_info": { "total": 0, "page": 1, "limit": 50, "total_pages": 0 }
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/logs/by-pool/1?hours=24"
```

#### 5. 注意事项

- 只读接口，具有幂等性。

---

### 按端点查询日志

#### 1. 接口概述

查询指定端点的请求日志。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/logs/by-endpoint/{endpoint_id}` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Path / Query 参数**

| 参数 | 位置 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `endpoint_id` | Path | integer | 是 | — | 端点 ID |
| `page` | Query | integer | 否 | `1` | 页码 |
| `limit` | Query | integer | 否 | `50` | 每页数量 |
| `hours` | Query | integer | 否 | `24` | 时间范围 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": [],
  "page_info": { "total": 0, "page": 1, "limit": 50, "total_pages": 0 }
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/logs/by-endpoint/1?hours=24"
```

#### 5. 注意事项

- 只读接口，具有幂等性。

---

### 按用户查询日志

#### 1. 接口概述

查询指定用户的请求日志。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/logs/by-user/{user_id}` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Path / Query 参数**

| 参数 | 位置 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `user_id` | Path | string | 是 | — | 用户 ID |
| `page` | Query | integer | 否 | `1` | 页码 |
| `limit` | Query | integer | 否 | `50` | 每页数量 |
| `hours` | Query | integer | 否 | `24` | 时间范围 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": [],
  "page_info": { "total": 0, "page": 1, "limit": 50, "total_pages": 0 }
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/logs/by-user/demo-user?hours=24"
```

#### 5. 注意事项

- 只读接口，具有幂等性。

---

### 查询错误日志

#### 1. 接口概述

查询失败的请求日志，用于故障排查。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `GET /api/v1/logs/errors` |
| **Method** | `GET` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `page` | integer | 否 | `1` | 页码 |
| `limit` | integer | 否 | `50` | 每页数量 |
| `hours` | integer | 否 | `24` | 时间范围 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "查询成功",
  "data": [
    {
      "request_id": "req-err001",
      "model": "gpt-4",
      "success": "false",
      "status_code": 500,
      "error_message": "Upstream timeout"
    }
  ],
  "page_info": { "total": 1, "page": 1, "limit": 50, "total_pages": 1 }
}
```

#### 4. 调用示例

**curl**

```bash
curl -u admin:suoweilai123456 \
  "http://localhost:8001/api/v1/logs/errors?hours=24"
```

#### 5. 注意事项

- 只读接口，具有幂等性。

---

### 清理旧日志

#### 1. 接口概述

删除指定保留天数之前的旧日志记录。适用于日志归档、磁盘空间管理等场景。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `DELETE /api/v1/logs/cleanup` |
| **Method** | `DELETE` |
| **认证方式** | Basic Auth |

**Query 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `days` | integer | 否 | `30` | 保留天数，删除更早日志，范围 1–365 |

#### 3. 响应信息

**成功响应示例**（HTTP 200）

```json
{
  "success": true,
  "message": "清理完成",
  "data": {
    "deleted_count": 100,
    "cutoff_date": "2026-05-11T10:00:00",
    "retention_days": 30
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `deleted_count` | integer | 删除的记录数 |
| `cutoff_date` | string | 截止日期 |
| `retention_days` | integer | 保留天数 |

#### 4. 调用示例

**curl**

```bash
curl -X DELETE "http://localhost:8001/api/v1/logs/cleanup?days=30" \
  -u admin:suoweilai123456
```

#### 5. 注意事项

- **生产环境谨慎使用**，会永久删除数据库记录。
- 操作不可逆，不具备幂等性（重复执行可能继续删除更多记录）。

---

## AI 供应商测试

### 测试 AI 供应商连接

#### 1. 接口概述

使用传入的供应商配置测试上游 AI 连接，避免前端直接请求上游导致 CORS 问题。适用于管理后台新增端点前的连通性预检。

#### 2. 请求信息

| 项目 | 内容 |
|---|---|
| **URL** | `POST /api/v1/ai-providers/test-connection` |
| **Method** | `POST` |
| **认证方式** | Basic Auth |

**Headers**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `Authorization` | string | 是 | Basic Auth 凭证 |
| `Content-Type` | string | 是 | `application/json` |

**请求 Body 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `base_url` | string | 是 | — | 上游基础 URL |
| `api_key` | string | 是 | — | 上游 API Key |
| `model` | string | 否 | `gpt-3.5-turbo` | 测试模型 |
| `provider_name` | string | 否 | `""` | 供应商名称 |
| `timeout` | integer | 否 | `30` | 超时时间（秒） |

#### 3. 响应信息

**成功响应示例**（HTTP 200，连接成功）

```json
{
  "success": true,
  "message": "测试完成",
  "data": {
    "success": true,
    "status_code": 200,
    "response_time_ms": 500,
    "message": "连接测试成功",
    "model": "gpt-4",
    "provider": "openai",
    "api_response": "API响应格式正确"
  }
}
```

**失败响应示例**（HTTP 200，连接失败）

```json
{
  "success": true,
  "message": "测试完成",
  "data": {
    "success": false,
    "status_code": 401,
    "message": "API Key 无效",
    "provider": "openai"
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `data.success` | boolean | 连接是否成功 |
| `data.status_code` | integer | 上游 HTTP 状态码 |
| `data.response_time_ms` | integer | 响应时间（毫秒） |

#### 4. 调用示例

**curl**

```bash
curl -X POST "http://localhost:8001/api/v1/ai-providers/test-connection" \
  -u admin:suoweilai123456 \
  -H "Content-Type: application/json" \
  -d '{
    "base_url": "https://api.openai.com/",
    "api_key": "sk-upstream-key",
    "model": "gpt-4",
    "provider_name": "openai",
    "timeout": 30
  }'
```

**JavaScript**

```javascript
const credentials = btoa("admin:suoweilai123456");
const response = await fetch(
  "http://localhost:8001/api/v1/ai-providers/test-connection",
  {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      base_url: "https://api.openai.com/",
      api_key: "sk-upstream-key",
      model: "gpt-4",
      provider_name: "openai",
      timeout: 30,
    }),
  }
);
console.log(await response.json());
```

#### 5. 注意事项

- 每次测试会消耗上游 API 配额。
- 上游 `api_key` 为敏感信息，请勿记录到日志。
- 不具备幂等性。

---

## 附录

### 核心业务流程

```text
创建 API 端点
 -> 创建 API 池并加入端点
 -> 创建平台 API Key
 -> 客户端携带 Bearer sk-xxx 调用 OpenAI 兼容接口
 -> 校验 Key、配额和限流
 -> 根据 pool_id 获取 API 池
 -> 根据 round_robin 或 race 调度上游端点
 -> 返回 OpenAI 兼容响应
 -> 写入 request_logs
```

### 核心数据模型

| 模型 | 表名 | 说明 |
|---|---|---|
| `ApiEndpoint` | `api_endpoints` | 上游 AI API 端点 |
| `ApiPool` | `api_pools` | 端点组合池 |
| `ApiKey` | `api_keys` | 平台访问凭证 |
| `RequestLog` | `request_logs` | 请求日志 |

### 调度策略说明

| 策略 | 说明 | 适用场景 |
|---|---|---|
| `round_robin` | 按权重轮询池内端点，失败后尝试下一个 | 负载均衡、成本控制 |
| `race` | 并发请求多个端点，返回最快有效响应 | 低延迟、高可用 |

### OpenAI SDK 集成示例

**Python（非流式）**

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/api/v1",
    api_key="sk-your-platform-key",
    max_retries=0,
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello"}],
    temperature=0.7,
    max_tokens=1000,
    extra_body={"pool_id": 1, "strategy": "race"},
)
print(response.choices[0].message.content)
```

**Python（流式）**

```python
stream = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello"}],
    stream=True,
    extra_body={"pool_id": 1, "strategy": "round_robin"},
)
for chunk in stream:
    delta = chunk.choices[0].delta
    if delta.content:
        print(delta.content, end="")
```

### 全局注意事项

1. 管理端接口全部需要 **Basic Auth**。
2. 用户端代理接口使用 `Authorization: Bearer sk-xxxx`。
3. `stream=true` 时返回 SSE，客户端需要按事件流处理。
4. `pool_id` 指定请求使用哪个池；不传时理论上使用 API Key 的 `default_pool_id`，但当前 Chat schema 默认 `pool_id=1`，实际会优先使用 `1`。
5. `strategy` 指定调度策略；不传时理论上使用池默认策略，但当前 Chat schema 默认 `race`。
6. API Key 创建后完整密钥只返回一次，请调用方保存。
7. 日志清理接口会删除数据库记录，生产环境需谨慎使用。
8. 当前 `ai_providers.py` 和 `api_endpoints.py` 中存在重复的 `/endpoints` CRUD 路由，实际路由匹配顺序以注册顺序为准。
9. 当前 `init_tables.sql` 与模型字段存在差异，初始化数据库前建议校准。
10. Dockerfile 默认只启动用户端 `main:app`；如需双端运行，建议使用 `python run_servers.py`。
11. OpenAI 兼容路径存在不完全一致：`/api/v1/chat/completions` 与 SDK 一致；但 `completions` 和 `models` 当前路径为 `/api/v1/v1/completions`、`/api/v1/v1/models`，建议后续统一为 `/api/v1/completions` 和 `/api/v1/models`。
