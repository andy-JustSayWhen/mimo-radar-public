---
name: mimo-radar
description: Use when the user says "mimo雷达" or "mimo智商", or asks for MiMO-Radar latest IQ, trend, recommendation, or ranking data.
---

# MiMO-Radar Skill

## Trigger

Use this skill when the user asks for `mimo雷达`, `mimo智商`, MiMO latest IQ, MiMO trend, MiMO recommendation, or MiMO ranking.

Manual trigger means one fetch only. Do not poll.

Scheduled fetch times, Beijing time:

- Daily Heartbeat trigger: 03:05, 08:05, 11:05, 13:05, 16:05.
- Weekly formal benchmark trigger: Sunday 03:00.

These are requested trigger times, not guaranteed completion times. The scheduler may start late. Use `generatedAt` as the actual public observation completion time and never rewrite it to a planned trigger time.

If the public summary has not updated, report the currently published `generatedAt`. Do not claim that a delayed scheduled run completed on time, and do not poll unless the user explicitly asks to monitor it.

## Data Sources

Read only:

- `http://193.112.70.227/current.json`
- `http://193.112.70.227/history.json`

Prefer the agent's built-in HTTP or WebFetch capability.

If WebFetch fails domain safety verification, use:

```bash
curl -sSL --connect-timeout 10 --max-time 10 http://193.112.70.227/current.json
curl -sSL --connect-timeout 10 --max-time 10 http://193.112.70.227/history.json
```

If either URL fails or times out, say which URL failed. Do not wait, retry, or invent data.

## Score Provenance

- Treat the latest formal benchmark report as the only source of visible IQ scores.
- `currentIq` must equal `bestWith.totalScore`. If they differ, report a data inconsistency; do not choose or calculate a replacement.
- `bestWith` is the highest-IQ combination in that report. It is independent from `qualityRecommendation` and `valueRecommendation`.
- Combination totals and dimension scores come from the same latest formal benchmark. Never calculate IQ from Heartbeat, Drift, or Confirm raw scores.
- Heartbeat is the only default downgrade decision input. If Heartbeat is normal, keep baseline A unchanged; if Heartbeat detects a downgrade, immediately run a complete formal benchmark as baseline B; only completed B may replace visible IQ scores.
- Drift and Confirm are diagnostic-only worker levels. Their raw scores never replace baseline A and never enter visible IQ scores.
- If baseline B is skipped, fails, or is incomplete, keep baseline A visible.
- History points are report rows carrying formal benchmark scores. Do not invent, merge, delete, or rescore points.
- `generatedAt` is the latest public observation completion time. It may advance after a Heartbeat even when the visible formal scores remain unchanged.
- Use `observation.triggerType`, `observation.testType`, `observation.scheduledDate`, `observation.scheduledSlot`, `observation.logicalObservationId`, and `observation.baselineReportId` when present. Never infer scheduled/manual identity or a planned slot from `generatedAt` alone.

## Labels

Convert raw values before showing them:

- `payg` -> `按量`
- `token_plan` -> `Plan`
- `cn` -> `中国`
- `intl` -> `国际`
- `on` -> `推理-开`
- `off` -> `推理-关`

Combination format:

`模型名称［推理-开/推理-关，Plan/按量，中国/国际］`

Do not show raw values such as `token_plan`, `payg`, `cn`, `intl`, `on`, or `off`.

## Output Rules

Default output has exactly four sections:

1. `当前智商`
2. `智商趋势`
3. `推荐使用`
4. `智商榜单`

Do not use tables.

Do not add dimension details, risk notes, or a separate downgrade section.

Round all visible IQ scores to integers. No decimals.

Ranking groups:

- `mimo-v2.5-pro`: top 3.
- `mimo-v2.5`: top 3.

Each ranking item must use exactly two lines:

```text
1. 模型名称［推理-开/推理-关，Plan/按量，中国/国际］：整数智商
   智商 █████████░ · 成本 <成本值或成本暂无> · 耗时 <整数秒或耗时暂无>
```

The second line must always include all three fields: IQ bar, cost, and latency.

Do not default to `成本暂无` if the public JSON already provides a numeric cost.

If latency is `null`, missing, or cannot be derived from public JSON, write `耗时暂无`.

Cost display:

- Prefer the combo's latest numeric cost from `/current.json`.
- If a CNY cost field exists, show `¥` with one decimal.
- If only `costUsd` exists, convert with `1 USD = ¥7.2`, show `¥` with one decimal.
- Only if the public JSON truly has no usable cost, show `成本暂无`.

Latency display:

- Convert `latencyMs` to seconds.
- Round to integer seconds.

Trend meaning is fixed:

- `同比`: compare the current combination's linked formal baseline score with yesterday's valid scheduled observation in the same `scheduledSlot`. Manual observations never become the day-over-day anchor.
- `环比`: compare the current combination's linked formal baseline score with the immediately previous valid logical observation. Scheduled and manual observations both participate.
- A manual latest observation does not replace the latest valid scheduled `同比`; keep the scheduled day-over-day result.
- A retry in the same scheduled slot uses the last successful logical observation for that slot.
- Legacy history without explicit observation identity may remain visible in history, but must not be guessed into an exact scheduled comparison.

Trend sourcing is fixed:

- First use each `/current.json` `scoreSummaries` combo's `trend.dayOverDay` and `trend.previousRun` fields when present. These are the published conclusions from the latest code.
- Use `/history.json` only when a published dimension is absent, and only with explicit observation identity plus the same combination's linked complete formal baseline scores.
- Compare by relative change: `(current linked formal score - comparison linked formal score) / comparison linked formal score × 100%`. Do not compare rounded display integers.
- Strictly greater than `10%`: `智商明显上涨`.
- From `-10%` through `10%`, including both boundaries: `智商表现稳定`.
- Strictly less than `-10%`: `智商疑似波动`.
- If there is no legal comparison, a linked complete formal baseline is missing, the combination score is missing, or the comparison score is not positive: `数据缺失`.

Do not output the retired trend labels `降智`, `需观察`, `稳定`, or `无样本` as conclusions.

## Example

```text
当前智商
91，Best With：mimo-v2.5-pro［推理-关，Plan，中国］。

智商趋势
同比：智商表现稳定。
环比：智商表现稳定。

推荐使用
保质量：mimo-v2.5-pro［推理-开，按量，中国］。
性价比：mimo-v2.5-pro［推理-关，Plan，中国］。

智商榜单
mimo-v2.5-pro
1. mimo-v2.5-pro［推理-开，按量，中国］：92
   智商 █████████░ · 成本 ¥1.3 · 耗时 9 秒
2. mimo-v2.5-pro［推理-关，Plan，中国］：91
   智商 █████████░ · 成本 ¥0.4 · 耗时 2 秒
3. mimo-v2.5-pro［推理-关，按量，中国］：90
   智商 █████████░ · 成本 ¥0.7 · 耗时 2 秒

mimo-v2.5
1. mimo-v2.5［推理-开，Plan，中国］：90
   智商 █████████░ · 成本 ¥0.6 · 耗时 7 秒
2. mimo-v2.5［推理-开，按量，中国］：89
   智商 █████████░ · 成本 ¥0.5 · 耗时 6 秒
3. mimo-v2.5［推理-关，Plan，中国］：89
   智商 █████████░ · 成本 ¥0.2 · 耗时 1 秒
```
