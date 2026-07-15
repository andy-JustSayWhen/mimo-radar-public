import { readFile } from "node:fs/promises";

const skillPath = new URL("../agent/skills/mimo-radar/SKILL.md", import.meta.url);
const skill = await readFile(skillPath, "utf8");
const requiredRules = [
  "Treat the latest formal benchmark report as the only source of visible IQ scores.",
  "`currentIq` must equal `bestWith.totalScore`",
  "It is independent from `qualityRecommendation` and `valueRecommendation`.",
  "Never calculate IQ from Heartbeat, Drift, or Confirm raw scores.",
  "Heartbeat is the only default downgrade decision input.",
  "If baseline B is skipped, fails, or is incomplete, keep baseline A visible.",
  "Do not invent, merge, delete, or rescore points.",
  "Daily Heartbeat trigger: 03:05, 08:05, 11:05, 13:05, 16:05.",
  "Weekly formal benchmark trigger: Sunday 03:00.",
  "Use `generatedAt` as the actual public observation completion time",
  "http://193.112.70.227/current.json",
  "http://193.112.70.227/history.json",
  "Never infer scheduled/manual identity or a planned slot from `generatedAt` alone.",
  "Manual observations never become the day-over-day anchor.",
  "Scheduled and manual observations both participate.",
  "Strictly greater than `10%`: `智商明显上涨`.",
  "From `-10%` through `10%`, including both boundaries: `智商表现稳定`.",
  "Strictly less than `-10%`: `智商疑似波动`.",
  "comparison score is not positive: `数据缺失`.",
];

const forbiddenLegacyRules = [
  "mimoradar.netlify.app",
  "Formal benchmark result: 03:15.",
  "Daily test result: 03:15",
  "Same combination drops by 3.0 or more",
  "Drops by 1.0 to 2.9",
  "Only write `无样本`",
];

const missingRules = requiredRules.filter((rule) => !skill.includes(rule));

if (missingRules.length > 0) {
  throw new Error(`Skill contract missing:\n${missingRules.join("\n")}`);
}

const staleRules = forbiddenLegacyRules.filter((rule) => skill.includes(rule));

if (staleRules.length > 0) {
  throw new Error(`Skill contract still contains retired rules:\n${staleRules.join("\n")}`);
}

console.log(`Skill contract verified: ${requiredRules.length} required rules, ${forbiddenLegacyRules.length} retired rules absent`);
