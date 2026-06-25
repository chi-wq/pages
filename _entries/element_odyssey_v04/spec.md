---
title: 规格检查清单
permalink: /entries/element-odyssey-v04/spec/
tags: [游戏, 开发, QA]
summary: "功能规格与 QA 检查清单。"
description: "元素试炼：深渊回廊 的规格检查清单。核心玩法循环、胜败条件、HUD、稳定性、QA 检查点及当前实现验证结果。"
wiki_key: element-odyssey-v04
wiki_order: 70
---

- 返回: [元素试炼：深渊回廊 v0.04]({{ '/entries/element-odyssey-v04/' | relative_url }})

> 这份清单从"功能/体验"角度列出游戏应有的特性，并与当前实现对照验证。适合在调整规则或移植时用作检查参考。

---

## 规格范围

| 包含 | 不包含 |
|------|--------|
| 关卡推进、敌人/增援、元素球拾取、计时、计分、HUD、提示、结算 | 外部服务器、平台外权限、自定义渲染 |

---

## 核心玩法循环

<div class="mermaid">
flowchart TD
  Ready[准备: 显示目标/主副元素] --> Combat[战斗: 击杀敌人]
  Combat -->|反应触发| React[显示反应名/颜色]
  Combat --> Check[拾取/进度检查]
  React --> Check
  Check --> Window[可拾取窗口（5秒）]
  Window -->|拾取| Collect[收集数+1]
  Window -->|超时未拾取| Abyss[变深渊球 + 生成新敌人]
  Window -->|敌人触碰| Attack[生成敌方追踪攻击 / 球保留]
  Collect --> Judge{胜负判定}
  Abyss --> Judge
  Attack --> Judge
  Judge -->|成功| Clear[结算 → 下一关]
  Judge -->|失败| Fail[失败结算]
</div>

### 流程分解

1. **准备阶段**：显示关卡目标（时间/所需球数/分数）和主/副元素图标
2. **战斗阶段**：击杀敌人，触发元素反应时显示反应名称和颜色
3. **拾取阶段**：击杀后 5 秒可拾取窗口，拾取则收集数+1；超时未拾取则变深渊球并生成新敌人；敌人触碰元素球则生成追踪攻击（球保留不消失）
4. **判定阶段**：成功（全灭敌人 + 球数达标）→ 结算 → 下一关；失败（超时/角色倒下）→ 失败结算

---

## 胜败条件

| 条件 | 规则 | 实现状态 |
|------|------|---------|
| **胜利** | `enemyCount === 0` 且 `orbsCollected >= orbsRequired` | ✅ 每秒循环检测 |
| **失败** | `StageTimer` 倒计时归零 | ✅ GlobalTimer 触发 |
| **失败** | 角色全部倒下 | ✅ `whenAllPlayerSCharactersAreDown` 事件 |
| **失败（容错）** | `StageTimer` 因断线等丢失（剩余时间 ≤ 0） | ✅ 每秒循环检测 `getCurrentGlobalTimerTime` |

---

## HUD / 界面提示

| 元素 | 实现方式 | 状态 |
|------|---------|------|
| 剩余时间 | `StageTimer` GlobalTimer + UI 控件 | ✅ |
| 收集数（当前/目标） | UI 布局变量绑定 `orbsCollected` / `orbsRequired` | ✅ |
| 反应名称/颜色 | `reaction` / `reactionColor` → 3 秒后自动清除 | ✅ |
| 主/副元素图标 | `gstsServerUpdateElementIcons()` 切换 UI 控件 On/Off | ✅ |
| 关卡目标文本 | `goal` / `tips` 配置 → UI 文本绑定 | ✅ |
| 消息队列通知 | `gstsServerSendNotificationMsg` → `UpdateNotificationMsgList` 信号 | ✅ |

---

## 稳定性和边界保护

| 机制 | 说明 | 实现 |
|------|------|------|
| 敌人上限 | `enemyCount < maxEnemies` 时才生成新波次 | `SpawnEnemyWave` 信号中检查 |
| 元素球上限 | 每关固定生成 `orbCount` 个 | `finiteLoop` 生成 |
| 死锁保护 | 无敌人+无净化+球不足 → 弹重置确认窗 | `gstsServerCheckDeadlock()` |
| 防掉落 | 每秒检测敌人 Y < 2.5 → 重生拉回 | `gstsServerCheckFallenEnemies()` |
| 断线恢复 | `StageTimer` 剩余时间 ≤ 0 → 标记失败 | 每秒循环检测 |
| 重复弹窗防护 | `deadlockPageShown` 标志防止死锁弹窗重复出现 | stage 变量控制 |

---

## QA 检查清单

| 检查项 | 验证方法 | 当前状态 |
|--------|---------|---------|
| **计时** | 超时后是否正确进入失败结算？不会触发两次？ | ✅ 通过 — `challengeState` 检查防止重复 |
| **拾取** | 可拾取/不可拾取/敌人触碰的分支是否与 UI 一致？ | ✅ 通过 — 元素球显示/隐藏与 `orbsCollectable` 同步 |
| **推进** | 通关条件满足后是否进入结算并过渡到下一关？ | ✅ 通过 — `enemyCount=0 && orbsCollected>=orbsRequired` |
| **生成** | 敌人和元素球是否不超过上限？卡死后有无恢复手段？ | ✅ 通过 — `maxEnemies` 上限 + 死锁检测弹窗 |
| **计分** | 普通击杀+1、反应击杀+100、收集球+30？跨关累积？ | ✅ 通过 — `score` 跨关不重置 |
| **元素反应** | 6 种反应是否正确触发？名称和颜色是否显示？ | ✅ 通过 — `gstsServerGetReactionName/Color` |
| **道具使用** | 选定道具后 E 技能图标是否更新？使用后效果是否正确？ | ✅ 通过 — `gstsServerSetESkillIcon` + `gstsServerApplyBuffEffect` |
| **重置关卡** | 重置后是否正确清理旧状态并重新开始？ | ✅ 通过 — `gstsServerRestartStage()` |
| **特殊元素球** | 风/岩/草/光 4 种特殊球效果是否正确？ | ✅ 通过 — 加时/护盾/回血/全灭 |
| **深渊球** | 超时后变为深渊球？敌人触碰是否触发攻击？ | ✅ 通过 — `gstsServerSpawnOrbEnemyAttack` |
| **防掉落** | 敌人掉落地板下是否被拉回？ | ✅ 通过 — 每 1 秒 `gstsServerCheckFallenEnemies` |
