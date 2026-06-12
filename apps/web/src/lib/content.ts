/** Unsplash 免费图（Demo 非商用） */
export const images = {
  hero: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&q=80",
  dogCat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80",
  puppy: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
  vet: "https://images.unsplash.com/photo-1628009365240-3a8f3aa8be7b?w=800&q=80",
  hardware: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=800&q=80",
  app: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
  insurance: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80",
  api: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
};

export const solutions = [
  {
    slug: "app",
    title: "宠物 App / 小程序",
    desc: "识图、问诊对话、健康测评一键接入，缩短上线周期。",
    image: images.app,
    apis: ["I01 图像识别", "T02 问诊对话", "H01 健康测评"],
  },
  {
    slug: "hardware",
    title: "智能硬件",
    desc: "摄像头行为分析、异常声音告警，云端 API + 边缘协同。",
    image: images.hardware,
    apis: ["V01 视频行为", "A01 声音识别"],
  },
  {
    slug: "insurance",
    title: "保险 / 金融",
    desc: "健康倾向测评、行为佐证数据，辅助核保与理赔初筛。",
    image: images.insurance,
    apis: ["H01 健康测评", "V01 视频行为"],
  },
  {
    slug: "hospital",
    title: "连锁医院 / 机构",
    desc: "预问诊对话、测评报告 API，提升门店数字化能力。",
    image: images.vet,
    apis: ["T02 问诊对话", "H01 健康测评"],
  },
];

export const stats = [
  { label: "API 类型", value: "5+" },
  { label: "场景 SKU", value: "6" },
  { label: "调用成功率", value: "94%+" },
  { label: "企业客户", value: "50+" },
];

export const faqs = [
  { q: "如何开始？", a: "注册账号 → 购买点数包或申请企业合同 → 创建 API Key → 按文档调用。" },
  { q: "失败是否扣费？", a: "仅返回有效结果时扣费，参数错误与上游失败均不扣点。" },
  { q: "企业如何签约？", a: "企业管理员在控制台提交签约申请，运营审批后开通合同额度。" },
  { q: "是否支持专票？", a: "Demo 模拟流程；生产环境支持普票与专票。" },
];
