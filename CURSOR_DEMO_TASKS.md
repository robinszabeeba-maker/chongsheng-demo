# Cursor 分日任务清单 · 宠生万象 Demo

> 目标：老板可访问 · 界面像产品 · 代码可延续

## D1 ✅ 骨架（已完成）

- [x] Demo PRD
- [x] Next.js + FastAPI + Postgres docker-compose
- [x] Auth / Keys / Billing / Mock Provider
- [x] 首页 / 目录 / 登录 / 控制台 / Playground / Admin

## D2 联调与部署

- [x] 本地 SQLite + seed + 冒烟脚本
- [ ] Railway / Vercel → [DEPLOY_D2.md](./DEPLOY_D2.md)

## D2.5 Demo v2（老板演示版）✅

- [x] 营销页丰满（Hero 图、解决方案、定价、FAQ）
- [x] 企业签约流（申请 / 合同 / 订单）
- [x] 控制台数据看板 + 调用明细
- [x] 运营后台（KPI、客户、订单、合同、签约审批、刊例）
- [x] 30 天 rich seed 数据

## D3 UI 打磨

- [ ] 控制台移动端适配
- [ ] Playground「失败样例」一键按钮
- [ ] 加载态 / 空状态
- [ ] favicon + OG 图

## D4 演示彩排

- [ ] 按 Demo_PRD §8 脚本走 5 分钟
- [ ] 录屏备份
- [ ] 准备 1 页「Demo vs 生产」说明给老板

## Cursor 提示词模板

```
阅读 docs/Demo_PRD_v1.md 和 apps/api/app/providers.py。
任务：为 Playground 增加「失败样例」按钮，调用 missing_image 场景，确认不扣点。
不要改计费核心逻辑，补组件测试即可。
```
