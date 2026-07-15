import { readFile } from "node:fs/promises";

const skillPath = new URL("../agent/skills/mimo-radar/SKILL.md", import.meta.url);
const skill = await readFile(skillPath, "utf8");

const requiredRules = [
  "本 Skill 用于自动读取并输出 MiMO-Radar 官网显示的各项数据",
  "当前智商、智商趋势、模型推荐",
  "从性价比、保质量的角度",
  "智商排行榜",
  "http://193.112.70.227/current.json",
  "当前智商：`currentIq`",
  "当前智商时间：`generatedAt`",
  "当前最佳组合：`bestWith`",
  "保质量推荐：`qualityRecommendation`",
  "性价比推荐：`valueRecommendation`",
  "智商趋势：`bestWith.trend.dayOverDay` 和 `bestWith.trend.previousRun`",
  "智商排行榜：与“一键接入”页面一致",
  "优先读取 `comboRunSummaries` 中 `totalScore` 不为空的项目",
  "数组为空时读取 `scoreSummaries`",
  "组合统一显示为",
  "`模型名称［推理开关，计费方式，区域］`",
  "模型智商排行榜",
  "<智商条> 智商 <整数智商> 成本 <人民币金额> · 耗时 <整数秒>",
  "不要重新计算智商或趋势。",
  "只整理和格式化这些现成数据",
  "## Step 1：抓取官网数据",
  "## Step 2：整理官网数据",
  "## Step 3：输出结果",
  "### 输出格式",
  "### 输出示例",
  "只输出以下四个部分",
  "当前智商 ：<整数智商>；",
  "Best With：<组合>；",
  "更新时间：<MM/DD | HH:MM>",
  "`generatedAt` 按北京时间显示为 `MM/DD | HH:MM`。",
];

const forbiddenRules = [
  "## Step 4",
  "history.json",
  "scheduledSlot",
  "baselineReportId",
  "相对变化率",
  "`watch`",
  "curl -sSL",
  "优先使用网页读取工具",
  "智商榜单",
  "<组合>：<整数智商>",
  "智商 <智商条> · 成本",
  "排行榜组合名称例外",
  "`模型名称，推理开关，计费方式，区域`",
  "mimo-v2.5-pro，推理-",
  "mimo-v2.5，推理-",
];

const missingRules = requiredRules.filter((rule) => !skill.includes(rule));
const staleRules = forbiddenRules.filter((rule) => skill.includes(rule));

if (missingRules.length > 0 || staleRules.length > 0) {
  throw new Error([
    "Skill 契约验证失败：",
    ...missingRules.map((rule) => `缺少：${rule}`),
    ...staleRules.map((rule) => `不应包含：${rule}`),
  ].join("\n"));
}

console.log(`Skill 契约验证通过：${requiredRules.length} 条必要规则存在，${forbiddenRules.length} 条过度设计内容不存在`);
