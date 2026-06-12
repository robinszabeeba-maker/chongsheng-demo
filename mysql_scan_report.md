# MySQL 库表扫描报告

> 生成时间：2026-06-11 09:38:54  
> 业务库数量：33  
> 数据总量（估）：4940.44 MB

---

## 一、总览

### 数据量 Top 10


| 排名  | 库名                  | 表数  | 行数(估)   | 大小(MB)  | 分类          |
| --- | ------------------- | --- | ------- | ------- | ----------- |
| 1   | ms_ai               | 67  | 957,591 | 2167.59 | AI 宠物问诊     |
| 2   | fish-recg-jd        | 46  | 922,375 | 1486.02 | 智能鱼缸 / 鱼种识别 |
| 3   | ms_ai_dev           | 58  | 380,977 | 391.72  | AI 宠物问诊     |
| 4   | ms_ai_international | 60  | 349,355 | 376.14  | AI 宠物问诊     |
| 5   | ms-api-prod         | 63  | 171,137 | 101.8   | API 开放平台    |
| 6   | ms-api-dev-03-24    | 63  | 128,910 | 90.02   | API 开放平台    |
| 7   | ms-api-dev-3-20     | 62  | 126,419 | 88.83   | API 开放平台    |
| 8   | ms-api-dev-09       | 59  | 65,205  | 52.73   | API 开放平台    |
| 9   | ms-cockpit          | 6   | 35,631  | 37.2    | 宠物行为分析      |
| 10  | ms-mairui           | 15  | 3,401   | 20.61   | AI 宠物问诊     |


### 按业务分类

- **AI 宠物问诊**：9 个库，合计 2994.47 MB
  - `ms_ai` — 宠物 AI 问诊主生产库：病历、会话、报告、宠物档案
  - `ms_ai_dev` — 宠物 AI 问诊开发环境
  - `ms_ai_international` — 宠物 AI 问诊国际版
  - `ms-mairui` — 迈瑞医疗合作（DICOM/报告）
  - `ms-ai-international` — 宠物 AI 国际版（小环境）
  - `ms-ai-c` — 宠物 AI 中文版（小环境）
  - `ms-ai-en` — 宠物 AI 英文版（小环境）
  - `ms-human` — 人类健康问诊测试
  - `ms_ai_service` — AI 服务配置与积分
- **AI 聚合平台 (New API)**：1 个库，合计 0.39 MB
  - `new-api` — New API AI 聚合平台（几乎未使用）
- **API 开放平台**：8 个库，合计 343.16 MB
  - `ms-api-prod` — API 网关生产环境：用户、API Key、订单、产品试用、调用日志
  - `ms-api-dev-03-24` — API 平台开发快照 (2024-03-24)
  - `ms-api-dev-3-20` — API 平台开发快照 (2024-03-20)
  - `ms-api-dev-09` — API 平台开发快照 (2024-09)
  - `ms-api-dev` — API 平台开发环境
  - `ms-api-portal` — API 开放平台门户站点
  - `ms-api` — API 平台早期版本
  - `ms-api-test` — API 平台测试库
- **IoT 设备**：1 个库，合计 0.30 MB
  - `iot` — IoT 设备认证与视频监控
- **WordPress 站点**：1 个库，合计 14.22 MB
  - `petturex-net` — Petturex WordPress 官网
- **多模态识别**：1 个库，合计 15.39 MB
  - `ms-multi-recog` — 多模态识别试用与日志
- **官网 CMS**：1 个库，合计 4.91 MB
  - `petturex` — Petturex 官网 CMS
- **宠物智能舱**：1 个库，合计 7.80 MB
  - `pet_smart` — 宠物智能舱设备与情绪记录
- **宠物机器人 App**：1 个库，合计 10.02 MB
  - `cy-robot` — 宠物机器人 App：AI 智能体、社区、商城、设备
- **宠物行为分析**：2 个库，合计 37.29 MB
  - `ms-cockpit` — 宠物行为分析驾驶舱
  - `ms-cockpit-geely` — 吉利合作版驾驶舱（几乎空）
- **智能鱼缸 / 鱼种识别**：3 个库，合计 1511.88 MB
  - `fish-recg-jd` — 京东合作鱼种识别，原始检测数据量最大
  - `ms-fish-dev` — 智养鱼缸开发环境
  - `ms-fish` — 智养鱼缸生产环境
- **流媒体 / 脚手架**：1 个库，合计 0.19 MB
  - `ms-streams` — 流媒体服务管理后台脚手架
- **测试脚手架**：1 个库，合计 0.25 MB
  - `ms-test` — 通用测试脚手架
- **空库 / 测试**：1 个库，合计 0.00 MB
  - `platform-test` — 空库
- **许可证管理**：1 个库，合计 0.17 MB
  - `ms-license` — 软件许可证管理

---

## 二、各库详情

### cy-robot

- **分类**：宠物机器人 App
- **用途**：宠物机器人 App：AI 智能体、社区、商城、设备
- **表数量**：48
- **行数(估)**：20,822
- **数据大小**：10.02 MB


| 表名                     | 行数(估)  | 大小(MB) | 注释             |
| ---------------------- | ------ | ------ | -------------- |
| community_post         | 10,764 | 3.52   | 社区帖子表          |
| ai_message             | 77     | 2.52   | AI消息表          |
| ai_agent_prompt        | 107    | 1.52   | AI智能体Prompt表   |
| notification_record    | 1,874  | 0.38   | 通知记录表          |
| mall_product           | 146    | 0.19   | 商城商品表          |
| admin_config_audit_log | 1,123  | 0.17   | 管理后台配置与操作审计日志表 |
| mall_product_sku       | 394    | 0.16   | 商城商品SKU表       |
| mall_order_item        | 327    | 0.12   | 商城订单项表         |
| report                 | 17     | 0.12   | AI业务报告表        |
| user                   | 452    | 0.11   | 用户信息表          |


### fish-recg-jd

- **分类**：智能鱼缸 / 鱼种识别
- **用途**：京东合作鱼种识别，原始检测数据量最大
- **表数量**：46
- **行数(估)**：922,375
- **数据大小**：1486.02 MB


| 表名                       | 行数(估)   | 大小(MB) | 注释          |
| ------------------------ | ------- | ------ | ----------- |
| fish_detection_raw       | 273,007 | 1071.0 | 鱼种原始检测数据表   |
| board_ingest_log         | 49,945  | 255.81 | 板端数据接入日志表   |
| fish_species_hourly      | 42,101  | 86.59  | 鱼种小时聚合表     |
| fish_trajectory_point    | 321,448 | 29.56  | 鱼只轨迹点位表     |
| health_report            | 1,007   | 14.52  | 健康评估报告主表    |
| tank_heatmap_cell_hourly | 189,495 | 14.52  | 鱼缸小时热力网格聚合表 |
| eia                      | 39,439  | 7.52   | -           |
| ai_qa_message            | 100     | 1.52   | AI智养问答消息表   |
| ai_qa_session            | 54      | 1.52   | AI智养问答会话表   |
| tank_mixed_analysis      | 37      | 1.52   | 鱼缸AI混养智能分析  |


### iot

- **分类**：IoT 设备
- **用途**：IoT 设备认证与视频监控
- **表数量**：17
- **行数(估)**：193
- **数据大小**：0.3 MB


| 表名                    | 行数(估) | 大小(MB) | 注释  |
| --------------------- | ----- | ------ | --- |
| device_auth_code      | 100   | 0.05   | -   |
| admin_user_role       | 0     | 0.02   | -   |
| video_record          | 0     | 0.02   | -   |
| video_device          | 0     | 0.02   | -   |
| video_callback_log    | 0     | 0.02   | -   |
| nvr_recording_segment | 0     | 0.02   | -   |
| nvr_event             | 0     | 0.02   | -   |
| nvr_camera            | 0     | 0.02   | -   |
| device_credential     | 1     | 0.02   | -   |
| admin_config          | 5     | 0.02   | -   |


### ms-ai-c

- **分类**：AI 宠物问诊
- **用途**：宠物 AI 中文版（小环境）
- **表数量**：44
- **行数(估)**：10,297
- **数据大小**：11.2 MB


| 表名                | 行数(估) | 大小(MB) | 注释      |
| ----------------- | ----- | ------ | ------- |
| session_record    | 6,967 | 4.52   | -       |
| report_content    | 1,377 | 2.52   | -       |
| img_generate_task | 315   | 1.52   | -       |
| gpt_config_item   | 229   | 1.45   | 配置项     |
| pet_info          | 158   | 0.31   | -       |
| medical_record    | 729   | 0.27   | 问诊记录    |
| pet_profile       | 212   | 0.05   | 宠物档案    |
| user_advice       | 4     | 0.02   | 用户反馈意见表 |
| product           | 0     | 0.02   | 产品表     |
| question_set      | 0     | 0.02   | -       |


### ms-ai-en

- **分类**：AI 宠物问诊
- **用途**：宠物 AI 英文版（小环境）
- **表数量**：44
- **行数(估)**：10,992
- **数据大小**：10.59 MB


| 表名                | 行数(估) | 大小(MB) | 注释   |
| ----------------- | ----- | ------ | ---- |
| session_record    | 6,291 | 3.52   | -    |
| report_content    | 1,708 | 2.52   | -    |
| gpt_config_item   | 226   | 1.52   | 配置项  |
| img_generate_task | 336   | 1.52   | -    |
| medical_record    | 1,227 | 0.45   | 问诊记录 |
| pet_info          | 158   | 0.31   | -    |
| ai_meme           | 46    | 0.08   | 表情包  |
| pet_profile       | 436   | 0.08   | 宠物档案 |
| user              | 210   | 0.06   | -    |
| question_set      | 0     | 0.02   | -    |


### ms-ai-international

- **分类**：AI 宠物问诊
- **用途**：宠物 AI 国际版（小环境）
- **表数量**：45
- **行数(估)**：10,005
- **数据大小**：12.33 MB


| 表名                | 行数(估) | 大小(MB) | 注释   |
| ----------------- | ----- | ------ | ---- |
| session_record    | 5,631 | 3.52   | -    |
| report_content    | 1,539 | 2.52   | -    |
| img_generate_task | 343   | 1.52   | -    |
| gpt_config_item   | 201   | 1.52   | 配置项  |
| gpt_config_item_2 | 158   | 1.52   | 配置项  |
| medical_record    | 1,015 | 0.39   | 问诊记录 |
| pet_info_copy1    | 158   | 0.31   | -    |
| pet_info          | 158   | 0.31   | -    |
| ai_meme           | 46    | 0.08   | 表情包  |
| pet_profile       | 372   | 0.06   | 宠物档案 |


### ms-api

- **分类**：API 开放平台
- **用途**：API 平台早期版本
- **表数量**：31
- **行数(估)**：244
- **数据大小**：0.77 MB


| 表名                    | 行数(估) | 大小(MB) | 注释           |
| --------------------- | ----- | ------ | ------------ |
| admin_record_login    | 62    | 0.23   | 登录记录表        |
| admin_system_settings | 32    | 0.08   | 系统配置表        |
| order_detail          | 0     | 0.02   | -            |
| alembic_version       | 0     | 0.02   | -            |
| apikey                | 19    | 0.02   | 用户API key信息表 |
| enterprise            | 1     | 0.02   | 企业开发者        |
| interface_info        | 6     | 0.02   | 接口信息表        |
| interface_usage       | 13    | 0.02   | 接口用量统计表      |
| order                 | 0     | 0.02   | -            |
| user_roles            | 0     | 0.02   | -            |


### ms-api-dev

- **分类**：API 开放平台
- **用途**：API 平台开发环境
- **表数量**：67
- **行数(估)**：7,581
- **数据大小**：5.2 MB


| 表名                    | 行数(估) | 大小(MB) | 注释      |
| --------------------- | ----- | ------ | ------- |
| article               | 37    | 1.52   | 菜单表     |
| admin_record_login    | 334   | 1.52   | 登录记录表   |
| order_detail          | 2,589 | 0.33   | -       |
| product_usage_record  | 505   | 0.2    | 产品使用统计表 |
| product_trial         | 1,683 | 0.19   | 产品试用表   |
| user_system_settings  | 32    | 0.08   | 系统配置表   |
| admin_system_settings | 34    | 0.08   | 系统配置表   |
| product_trial_logs    | 676   | 0.08   | 产品试用表   |
| product_out           | 56    | 0.06   | 产品信息表   |
| user                  | 144   | 0.06   | 用户信息表   |


### ms-api-dev-03-24

- **分类**：API 开放平台
- **用途**：API 平台开发快照 (2024-03-24)
- **表数量**：63
- **行数(估)**：128,910
- **数据大小**：90.02 MB


| 表名                         | 行数(估)  | 大小(MB) | 注释      |
| -------------------------- | ------ | ------ | ------- |
| product_usage_record       | 92,340 | 80.61  | 产品使用统计表 |
| product_trial              | 20,770 | 2.52   | 产品试用表   |
| order_detail               | 6,420  | 1.52   | -       |
| admin_record_login         | 423    | 1.52   | 登录记录表   |
| article                    | 39     | 1.52   | 菜单表     |
| user                       | 1,975  | 0.41   | 用户信息表   |
| customer_consultation_info | 1,578  | 0.27   | 客户咨询信息  |
| user_auth_info             | 1,344  | 0.2    | 用户认证信息表 |
| product_trial_logs         | 1,616  | 0.14   | 产品试用表   |
| tracker_event              | 931    | 0.12   | -       |


### ms-api-dev-09

- **分类**：API 开放平台
- **用途**：API 平台开发快照 (2024-09)
- **表数量**：59
- **行数(估)**：65,205
- **数据大小**：52.73 MB


| 表名                         | 行数(估)  | 大小(MB) | 注释      |
| -------------------------- | ------ | ------ | ------- |
| product_usage_record       | 55,580 | 47.58  | 产品使用统计表 |
| article                    | 36     | 1.52   | 菜单表     |
| admin_record_login         | 234    | 1.52   | 登录记录表   |
| product_trial              | 4,921  | 0.48   | 产品试用表   |
| order_detail               | 1,431  | 0.2    | -       |
| user                       | 796    | 0.19   | 用户信息表   |
| customer_consultation_info | 435    | 0.11   | 客户咨询信息  |
| user_auth_info             | 376    | 0.09   | 用户认证信息表 |
| user_system_settings       | 32     | 0.08   | 系统配置表   |
| admin_system_settings      | 32     | 0.08   | 系统配置表   |


### ms-api-dev-3-20

- **分类**：API 开放平台
- **用途**：API 平台开发快照 (2024-03-20)
- **表数量**：62
- **行数(估)**：126,419
- **数据大小**：88.83 MB


| 表名                         | 行数(估)  | 大小(MB) | 注释      |
| -------------------------- | ------ | ------ | ------- |
| product_usage_record       | 91,233 | 79.61  | 产品使用统计表 |
| product_trial              | 20,782 | 2.52   | 产品试用表   |
| order_detail               | 6,106  | 1.52   | -       |
| article                    | 39     | 1.52   | 菜单表     |
| admin_record_login         | 399    | 1.52   | 登录记录表   |
| user                       | 1,896  | 0.39   | 用户信息表   |
| customer_consultation_info | 1,495  | 0.25   | 客户咨询信息  |
| user_auth_info             | 1,331  | 0.2    | 用户认证信息表 |
| product_trial_logs         | 1,551  | 0.14   | 产品试用表   |
| user_system_settings       | 32     | 0.08   | 系统配置表   |


### ms-api-portal

- **分类**：API 开放平台
- **用途**：API 开放平台门户站点
- **表数量**：58
- **行数(估)**：1,726
- **数据大小**：3.08 MB


| 表名                    | 行数(估) | 大小(MB) | 注释      |
| --------------------- | ----- | ------ | ------- |
| article               | 35    | 1.47   | 菜单表     |
| admin_record_login    | 160   | 0.39   | 登录记录表   |
| product_usage_record  | 140   | 0.14   | 产品使用统计表 |
| admin_system_settings | 32    | 0.08   | 系统配置表   |
| user_system_settings  | 32    | 0.08   | 系统配置表   |
| product               | 46    | 0.06   | 产品信息表   |
| order_detail          | 188   | 0.06   | -       |
| package               | 5     | 0.02   | 流量包套餐表  |
| payment               | 99    | 0.02   | 产品信息表   |
| user_auth_info        | 35    | 0.02   | 用户认证信息表 |


### ms-api-prod

- **分类**：API 开放平台
- **用途**：API 网关生产环境：用户、API Key、订单、产品试用、调用日志
- **表数量**：63
- **行数(估)**：171,137
- **数据大小**：101.8 MB


| 表名                         | 行数(估)   | 大小(MB) | 注释      |
| -------------------------- | ------- | ------ | ------- |
| product_usage_record       | 115,972 | 90.61  | 产品使用统计表 |
| product_trial              | 24,312  | 2.52   | 产品试用表   |
| order_detail               | 10,277  | 1.52   | -       |
| tracker_event              | 8,251   | 1.52   | -       |
| article                    | 37      | 1.52   | 菜单表     |
| admin_record_login         | 294     | 1.52   | 登录记录表   |
| user                       | 2,505   | 0.47   | 用户信息表   |
| customer_consultation_info | 2,183   | 0.34   | 客户咨询信息  |
| product_trial_logs         | 3,813   | 0.3    | 产品试用表   |
| user_auth_info             | 1,674   | 0.25   | 用户认证信息表 |


### ms-api-test

- **分类**：API 开放平台
- **用途**：API 平台测试库
- **表数量**：29
- **行数(估)**：239
- **数据大小**：0.73 MB


| 表名                     | 行数(估) | 大小(MB) | 注释    |
| ---------------------- | ----- | ------ | ----- |
| admin_record_login     | 62    | 0.23   | 登录记录表 |
| admin_system_settings  | 32    | 0.08   | 系统配置表 |
| admin_system_dict_type | 6     | 0.02   | 字典类型表 |
| user_roles             | 0     | 0.02   | -     |
| user_role_permissions  | 0     | 0.02   | -     |
| user_role              | 0     | 0.02   | 用户角色表 |
| user_permission        | 0     | 0.02   | 用户权限表 |
| user                   | 2     | 0.02   | 用户信息表 |
| order_detail           | 0     | 0.02   | -     |
| order                  | 0     | 0.02   | -     |


### ms-cockpit

- **分类**：宠物行为分析
- **用途**：宠物行为分析驾驶舱
- **表数量**：6
- **行数(估)**：35,631
- **数据大小**：37.2 MB


| 表名           | 行数(估)  | 大小(MB) | 注释  |
| ------------ | ------ | ------ | --- |
| pet_behavior | 28,237 | 35.56  | -   |
| report       | 7,236  | 1.52   | -   |
| video_result | 147    | 0.08   | -   |
| command      | 1      | 0.02   | -   |
| pet_profile  | 10     | 0.02   | -   |
| sys_settings | 0      | 0.02   | -   |


### ms-cockpit-geely

- **分类**：宠物行为分析
- **用途**：吉利合作版驾驶舱（几乎空）
- **表数量**：6
- **行数(估)**：10
- **数据大小**：0.09 MB


| 表名           | 行数(估) | 大小(MB) | 注释  |
| ------------ | ----- | ------ | --- |
| command      | 0     | 0.02   | -   |
| pet_behavior | 0     | 0.02   | -   |
| pet_profile  | 10    | 0.02   | -   |
| report       | 0     | 0.02   | -   |
| sys_settings | 0     | 0.02   | -   |
| video_result | 0     | 0.02   | -   |


### ms-fish

- **分类**：智能鱼缸 / 鱼种识别
- **用途**：智养鱼缸生产环境
- **表数量**：30
- **行数(估)**：43,979
- **数据大小**：9.16 MB


| 表名                       | 行数(估)  | 大小(MB) | 注释          |
| ------------------------ | ------ | ------ | ----------- |
| eia                      | 43,363 | 8.52   | -           |
| system_settings          | 47     | 0.08   | 系统配置表       |
| health_report            | 46     | 0.08   | 健康评估报告主表    |
| tank_metric_hourly       | 168    | 0.05   | 鱼缸小时级指标与趋势表 |
| ai_qa_message            | 11     | 0.05   | AI智养问答消息表   |
| event                    | 31     | 0.02   | -           |
| variety_profile          | 1      | 0.02   | -           |
| user                     | 2      | 0.02   | 用户信息表       |
| tank_profile             | 4      | 0.02   | -           |
| tank_heatmap_cell_hourly | 0      | 0.02   | 鱼缸小时热力网格聚合表 |


### ms-fish-dev

- **分类**：智能鱼缸 / 鱼种识别
- **用途**：智养鱼缸开发环境
- **表数量**：42
- **行数(估)**：103,271
- **数据大小**：16.7 MB


| 表名                       | 行数(估)  | 大小(MB) | 注释          |
| ------------------------ | ------ | ------ | ----------- |
| eia                      | 38,610 | 7.52   | -           |
| fish_trajectory_point    | 30,287 | 3.52   | 鱼只轨迹点位表     |
| tank_heatmap_cell_hourly | 31,382 | 2.52   | 鱼缸小时热力网格聚合表 |
| fish_detection_raw       | 395    | 1.52   | 鱼种原始检测数据表   |
| health_report            | 78     | 0.41   | 健康评估报告主表    |
| fish_species_hourly      | 1,495  | 0.2    | 鱼种小时聚合表     |
| assessment_detail        | 13     | 0.14   | 评估明细表       |
| event                    | 211    | 0.12   | 事件中心V2事实表   |
| system_settings          | 64     | 0.08   | 系统配置表       |
| ai_qa_message            | 10     | 0.06   | AI智养问答消息表   |


### ms-human

- **分类**：AI 宠物问诊
- **用途**：人类健康问诊测试
- **表数量**：7
- **行数(估)**：9,145
- **数据大小**：3.27 MB


| 表名                  | 行数(估) | 大小(MB) | 注释      |
| ------------------- | ----- | ------ | ------- |
| report_content_test | 164   | 1.52   | -       |
| session_record      | 8,685 | 1.52   | -       |
| gpt_config_item     | 20    | 0.14   | 配置项     |
| gpt_config          | 270   | 0.05   | -       |
| articles            | 0     | 0.02   | -       |
| logs                | 0     | 0.02   | -       |
| model_connection    | 6     | 0.02   | 外部模型连接池 |


### ms-license

- **分类**：许可证管理
- **用途**：软件许可证管理
- **表数量**：1
- **行数(估)**：265
- **数据大小**：0.17 MB


| 表名      | 行数(估) | 大小(MB) | 注释  |
| ------- | ----- | ------ | --- |
| license | 265   | 0.17   | -   |


### ms-mairui

- **分类**：AI 宠物问诊
- **用途**：迈瑞医疗合作（DICOM/报告）
- **表数量**：15
- **行数(估)**：3,401
- **数据大小**：20.61 MB


| 表名                        | 行数(估) | 大小(MB) | 注释  |
| ------------------------- | ----- | ------ | --- |
| report_content_test       | 676   | 5.52   | -   |
| report_content_test_copy1 | 604   | 4.52   | -   |
| report_data               | 148   | 3.52   | -   |
| gpt_config_item           | 252   | 2.52   | 配置项 |
| gpt_config_item_copy2     | 318   | 2.52   | 配置项 |
| case_record               | 210   | 1.52   | -   |
| dicom_extraction          | 293   | 0.19   | -   |
| dicom_extraction_copy1    | 270   | 0.17   | -   |
| session_record            | 316   | 0.06   | -   |
| gpt_config                | 261   | 0.02   | -   |


### ms-multi-recog

- **分类**：多模态识别
- **用途**：多模态识别试用与日志
- **表数量**：4
- **行数(估)**：13,483
- **数据大小**：15.39 MB


| 表名      | 行数(估) | 大小(MB) | 注释  |
| ------- | ----- | ------ | --- |
| logs    | 9,717 | 14.52  | -   |
| user    | 1,154 | 0.5    | -   |
| profile | 1,409 | 0.3    | -   |
| trials  | 1,203 | 0.08   | -   |


### ms-streams

- **分类**：流媒体 / 脚手架
- **用途**：流媒体服务管理后台脚手架
- **表数量**：12
- **行数(估)**：104
- **数据大小**：0.19 MB


| 表名                     | 行数(估) | 大小(MB) | 注释             |
| ---------------------- | ----- | ------ | -------------- |
| admin_config           | 5     | 0.02   | 管理后台模块配置表      |
| admin_config_audit_log | 0     | 0.02   | 管理后台配置与操作审计日志表 |
| admin_menu             | 12    | 0.02   | 管理后台菜单表        |
| admin_permission       | 34    | 0.02   | 管理后台权限表        |
| admin_role             | 0     | 0.02   | 管理后台角色表        |
| admin_role_menu        | 12    | 0.02   | 角色与菜单关联表       |
| admin_role_permission  | 34    | 0.02   | 角色与权限关联表       |
| admin_user             | 0     | 0.02   | 管理后台用户表        |
| admin_user_role        | 0     | 0.02   | 管理员与角色关联表      |
| scheduled_task         | 2     | 0.02   | 定时任务表          |


### ms-test

- **分类**：测试脚手架
- **用途**：通用测试脚手架
- **表数量**：12
- **行数(估)**：210
- **数据大小**：0.25 MB


| 表名                     | 行数(估) | 大小(MB) | 注释             |
| ---------------------- | ----- | ------ | -------------- |
| system_settings        | 64    | 0.08   | 系统配置表          |
| admin_config           | 8     | 0.02   | 管理后台模块配置表      |
| admin_config_audit_log | 8     | 0.02   | 管理后台配置与操作审计日志表 |
| admin_menu             | 13    | 0.02   | 管理后台菜单表        |
| admin_permission       | 34    | 0.02   | 管理后台权限表        |
| admin_role             | 2     | 0.02   | 管理后台角色表        |
| admin_role_menu        | 19    | 0.02   | 角色与菜单关联表       |
| admin_role_permission  | 56    | 0.02   | 角色与权限关联表       |
| admin_user             | 2     | 0.02   | 管理后台用户表        |
| admin_user_role        | 0     | 0.02   | 管理员与角色关联表      |


### ms_ai

- **分类**：AI 宠物问诊
- **用途**：宠物 AI 问诊主生产库：病历、会话、报告、宠物档案
- **表数量**：67
- **行数(估)**：957,591
- **数据大小**：2167.59 MB


| 表名                  | 行数(估)   | 大小(MB)  | 注释       |
| ------------------- | ------- | ------- | -------- |
| medical_record      | 153,189 | 1556.59 | 病历记录     |
| report_content      | 289,033 | 349.83  | -        |
| ai_birds            | 44,523  | 105.62  | 表情包      |
| session_record      | 216,060 | 68.59   | -        |
| pet_profile         | 89,663  | 25.55   | 宠物档案     |
| pet_profile_content | 60,903  | 13.52   | 宠物档案具体内容 |
| ai_meme             | 5,776   | 8.52    | 表情包      |
| user                | 19,709  | 5.52    | -        |
| magnum_key_record   | 5,288   | 4.52    | -        |
| page_buriedpoint    | 27,752  | 3.52    | -        |


### ms_ai_dev

- **分类**：AI 宠物问诊
- **用途**：宠物 AI 问诊开发环境
- **表数量**：58
- **行数(估)**：380,977
- **数据大小**：391.72 MB


| 表名                  | 行数(估)   | 大小(MB) | 注释       |
| ------------------- | ------- | ------ | -------- |
| report_content      | 120,474 | 165.67 | -        |
| ai_birds            | 49,966  | 115.64 | 表情包      |
| medical_record      | 62,748  | 43.56  | 病历记录     |
| pet_profile         | 30,788  | 13.52  | 宠物档案     |
| pet_profile_content | 8,418   | 10.52  | 宠物档案具体内容 |
| session_record      | 24,509  | 9.52   | -        |
| ai_meme             | 5,910   | 8.52   | 表情包      |
| magnum_key_record   | 5,322   | 4.52   | -        |
| page_buriedpoint    | 27,915  | 3.52   | -        |
| articles            | 88      | 2.52   | -        |


### ms_ai_international

- **分类**：AI 宠物问诊
- **用途**：宠物 AI 问诊国际版
- **表数量**：60
- **行数(估)**：349,355
- **数据大小**：376.14 MB


| 表名                  | 行数(估)   | 大小(MB) | 注释       |
| ------------------- | ------- | ------ | -------- |
| report_content      | 108,371 | 156.67 | -        |
| ai_birds            | 47,174  | 110.62 | 表情包      |
| medical_record      | 56,763  | 41.56  | 病历记录     |
| pet_profile         | 30,737  | 13.52  | 宠物档案     |
| pet_profile_content | 8,450   | 10.52  | 宠物档案具体内容 |
| ai_meme             | 5,961   | 8.52   | 表情包      |
| session_record      | 13,547  | 5.52   | -        |
| magnum_key_record   | 5,209   | 4.52   | -        |
| page_buriedpoint    | 27,907  | 3.52   | -        |
| articles            | 88      | 2.52   | -        |


### ms_ai_service

- **分类**：AI 宠物问诊
- **用途**：AI 服务配置与积分
- **表数量**：35
- **行数(估)**：267
- **数据大小**：1.02 MB


| 表名                | 行数(估) | 大小(MB) | 注释               |
| ----------------- | ----- | ------ | ---------------- |
| gpt_config_item   | 110   | 0.44   | 配置项              |
| session_record    | 48    | 0.06   | -                |
| user              | 0     | 0.02   | -                |
| point_task        | 0     | 0.02   | 积分任务表            |
| policy            | 0     | 0.02   | 存储用户协议、免责条款和隐私政策 |
| product           | 0     | 0.02   | 产品表              |
| question_set      | 0     | 0.02   | -                |
| report_content    | 0     | 0.02   | -                |
| session_summary   | 0     | 0.02   | -                |
| token_comsumption | 0     | 0.02   | token消耗          |


### new-api

- **分类**：AI 聚合平台 (New API)
- **用途**：New API AI 聚合平台（几乎未使用）
- **表数量**：25
- **行数(估)**：7
- **数据大小**：0.39 MB


| 表名                  | 行数(估) | 大小(MB) | 注释  |
| ------------------- | ----- | ------ | --- |
| setups              | 0     | 0.02   | -   |
| vendors             | 0     | 0.02   | -   |
| users               | 1     | 0.02   | -   |
| user_subscriptions  | 0     | 0.02   | -   |
| user_oauth_bindings | 0     | 0.02   | -   |
| two_fas             | 0     | 0.02   | -   |
| two_fa_backup_codes | 0     | 0.02   | -   |
| top_ups             | 0     | 0.02   | -   |
| tokens              | 0     | 0.02   | -   |
| tasks               | 0     | 0.02   | -   |


### pet_smart

- **分类**：宠物智能舱
- **用途**：宠物智能舱设备与情绪记录
- **表数量**：9
- **行数(估)**：48,283
- **数据大小**：7.8 MB


| 表名                   | 行数(估)  | 大小(MB) | 注释  |
| -------------------- | ------ | ------ | --- |
| operation_logs       | 47,818 | 7.52   | -   |
| pet_emotion_records  | 244    | 0.11   | -   |
| cabin_temperatures   | 138    | 0.05   | -   |
| stream_notifications | 76     | 0.05   | -   |
| api_logs             | 0      | 0.02   | -   |
| app_credentials      | 1      | 0.02   | -   |
| device_subscriptions | 6      | 0.02   | -   |
| llm_api_configs      | 0      | 0.02   | -   |
| system_configs       | 0      | 0.02   | -   |


### petturex

- **分类**：官网 CMS
- **用途**：Petturex 官网 CMS
- **表数量**：15
- **行数(估)**：2,327
- **数据大小**：4.91 MB


| 表名                 | 行数(估) | 大小(MB) | 注释  |
| ------------------ | ----- | ------ | --- |
| none_article       | 286   | 4.48   | -   |
| none_log           | 1,919 | 0.17   | -   |
| none_category      | 8     | 0.06   | -   |
| none_admin         | 2     | 0.02   | -   |
| none_admin_power   | 46    | 0.02   | -   |
| none_admin_role    | 0     | 0.02   | -   |
| none_banner        | 4     | 0.02   | -   |
| none_banner_detail | 25    | 0.02   | -   |
| none_chat          | 0     | 0.02   | -   |
| none_comment       | 6     | 0.02   | -   |


### petturex-net

- **分类**：WordPress 站点
- **用途**：Petturex WordPress 官网
- **表数量**：42
- **行数(估)**：4,886
- **数据大小**：14.22 MB


| 表名                    | 行数(估) | 大小(MB) | 注释  |
| --------------------- | ----- | ------ | --- |
| wp_posts              | 842   | 10.47  | -   |
| wp_postmeta           | 2,131 | 1.52   | -   |
| wp_options            | 250   | 1.08   | -   |
| wp_pmxi_imports       | 17    | 0.28   | -   |
| wp_aioseo_cache       | 14    | 0.11   | -   |
| wp_yoast_indexable    | 82    | 0.08   | -   |
| wp_aioseo_posts       | 65    | 0.08   | -   |
| wp_pmxi_templates     | 2     | 0.05   | -   |
| wp_term_relationships | 660   | 0.05   | -   |
| wp_termmeta           | 0     | 0.02   | -   |


### platform-test

- **分类**：空库 / 测试
- **用途**：空库
- **表数量**：0
- **行数(估)**：0
- **数据大小**：0.0 MB

*（无业务表）*

---

## 三、架构关系

```
ms-api-prod (API网关)
    ├── ms_ai / ms_ai_dev (宠物AI问诊)
    ├── ms-fish / fish-recg-jd (智养鱼缸)
    └── ms-api-portal (开放平台门户)

cy-robot (机器人App)
    ├── AI智能体 / 社区 / 商城 / 设备
    └── 关联 ms_ai 问诊能力

ms-cockpit / pet_smart (行为分析 / 智能舱)
iot (设备认证 / 视频监控)
petturex / petturex-net (官网)
```

---

## 四、扫描工具

```bash
# 快速摘要（需设置 MYSQL_DSN 环境变量）
set MYSQL_DSN=user:pass@host:3306
python tools/mysql_summary.py

# 完整扫描
python tools/mysql_scanner.py "%MYSQL_DSN%"

# 从 JSON 生成本报告
python tools/generate_report_md.py
```

