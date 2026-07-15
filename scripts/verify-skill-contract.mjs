import { readFile } from "node:fs/promises";

const skillPath = new URL("../agent/skills/mimo-radar/SKILL.md", import.meta.url);
const skill = await readFile(skillPath, "utf8");
const requiredRules = [
  "只要用户提到“mimo智商”“mimo雷达”",
  "必须使用本 Skill，不得改为搜索小米模型的一般资料或其他评测",
  "最新完整正式基准报告是公开智商分数的唯一来源。",
  "`currentIq` 必须等于 `bestWith.totalScore`",
  "与 `qualityRecommendation`、`valueRecommendation` 相互独立",
  "禁止用 Heartbeat、Drift 或 Confirm 的原始分数计算智商。",
  "Heartbeat 是默认降智决策的唯一输入。",
  "基准 B 被跳过、失败或不完整时，继续展示基准 A。",
  "不得编造、合并、删除或重新评分。",
  "每日 Heartbeat：03:05、08:05、11:05、13:05、16:05。",
  "每周正式基准：周日 03:00。",
  "必须把 `generatedAt` 解释为公开观测的实际完成时间",
  "http://193.112.70.227/current.json",
  "http://193.112.70.227/history.json",
  "禁止只根据 `generatedAt` 推断定时/手动身份或计划档位。",
  "手动观测不得成为同比锚点。",
  "定时和手动观测都参与环比。",
  "相对变化率严格大于 `10%`：`智商明显上涨`。",
  "包含两个边界：`智商表现稳定`。",
  "相对变化率严格小于 `-10%`：`智商疑似波动`。",
  "对照分不是有效正数：`数据缺失`。",
  "最终答案必须且只能包含以下四个章节",
  "第四章最后一个榜单条目结束后立即结束回答。",
  "禁止添加数据时间、来源、说明、总结、亮点、风险、脚注、引用、第五章节或任何尾注。",
  "禁止使用表格。",
  "所有可见智商四舍五入为整数，禁止显示小数。",
];

const forbiddenLegacyRules = [
  "mimoradar.netlify.app",
  "Formal benchmark result: 03:15.",
  "Daily test result: 03:15",
  "Same combination drops by 3.0 or more",
  "Drops by 1.0 to 2.9",
  "Only write `无样本`",
  "# MiMO-Radar Skill",
  "## Trigger",
  "## Data Sources",
  "## Score Provenance",
  "## Output Rules",
  "## Example",
];

const missingRules = requiredRules.filter((rule) => !skill.includes(rule));

if (missingRules.length > 0) {
  throw new Error(`Skill 契约缺少当前规则：\n${missingRules.join("\n")}`);
}

const staleRules = forbiddenLegacyRules.filter((rule) => skill.includes(rule));

if (staleRules.length > 0) {
  throw new Error(`Skill 契约仍包含废止规则：\n${staleRules.join("\n")}`);
}

console.log(`Skill 契约验证通过：${requiredRules.length} 条当前规则存在，${forbiddenLegacyRules.length} 条废止规则不存在`);
