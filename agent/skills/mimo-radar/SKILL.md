---
name: mimo-radar
description: Use when the user says "mimo雷达" or "mimo智商", or asks for MiMO-Radar latest IQ, trend, recommendation, or ranking data.
---

# MiMO-Radar Skill

## Trigger

Use this skill when the user asks for `mimo雷达`, `mimo智商`, MiMO latest IQ, MiMO trend, MiMO recommendation, or MiMO ranking.

Manual trigger means one fetch only. Do not poll.

Scheduled fetch times, Beijing time:

- Formal benchmark result: 03:15.
- Daily test result: 03:15, 08:15, 11:15, 13:15, 16:15.

If the public summary has not updated, wait for the next scheduled point or the next manual trigger.

## Data Sources

Read only:

- `https://mimoradar.netlify.app/current.json`
- `https://mimoradar.netlify.app/history.json`

Prefer the agent's built-in HTTP or WebFetch capability.

If WebFetch fails domain safety verification, use:

```bash
curl -sSL --connect-timeout 10 --max-time 10 https://mimoradar.netlify.app/current.json
curl -sSL --connect-timeout 10 --max-time 10 https://mimoradar.netlify.app/history.json
```

If either URL fails or times out, say which URL failed. Do not wait, retry, or invent data.

## Score Provenance

- Treat the latest formal benchmark report as the only source of visible IQ scores.
- `currentIq` must equal `bestWith.totalScore`. If they differ, report a data inconsistency; do not choose or calculate a replacement.
- `bestWith` is the highest-IQ combination in that report. It is independent from `qualityRecommendation` and `valueRecommendation`.
- Combination totals and dimension scores come from the same latest formal benchmark. Never calculate IQ from Heartbeat, Drift, or Confirm raw scores.
- Heartbeat, Drift, and Confirm update monitoring time and state only. A confirmed downgrade triggers a new formal benchmark; only that formal result may replace visible IQ scores.
- History points are report rows carrying formal benchmark scores. Do not invent, merge, delete, or rescore points.

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

Downgrade thresholds are global:

- Same combination drops by 3.0 or more: `降智`.
- Drops by 1.0 to 2.9: `需观察`.
- Drops below 1.0: no downgrade.

Trend meaning is fixed:

- `同比`: compare with yesterday's same test window.
- `环比`: compare with the immediately previous public test.

Trend sourcing is fixed:

- First use `/current.json` combo field `trend.dayOverDay` and `trend.previousRun` if present.
- If either dimension is missing, derive only that missing dimension from `/history.json` for the same combo.
- Only write `无样本` for the dimension that truly has no comparable sample.

Use the downgrade threshold inside both trend lines when comparable samples exist.

## Example

```text
当前智商
91，Best With：mimo-v2.5-pro［推理-关，Plan，中国］。

智商趋势
同比：稳定。
环比：需观察。

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
