import { readFile } from "node:fs/promises";

const skillPath = new URL("../agent/skills/mimo-radar/SKILL.md", import.meta.url);
const skill = await readFile(skillPath, "utf8");
const requiredRules = [
  "Treat the latest formal benchmark report as the only source of visible IQ scores.",
  "`currentIq` must equal `bestWith.totalScore`",
  "It is independent from `qualityRecommendation` and `valueRecommendation`.",
  "Never calculate IQ from Heartbeat, Drift, or Confirm raw scores.",
  "A confirmed downgrade triggers a new formal benchmark",
  "Do not invent, merge, delete, or rescore points.",
];

const missingRules = requiredRules.filter((rule) => !skill.includes(rule));

if (missingRules.length > 0) {
  throw new Error(`Skill contract missing:\n${missingRules.join("\n")}`);
}

console.log(`Skill contract verified: ${requiredRules.length} rules`);

