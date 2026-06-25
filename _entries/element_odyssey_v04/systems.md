---
title: 核心系统详解
permalink: /entries/element-odyssey-v04/systems/
tags: [游戏, 系统, 实现]
summary: "v0.04 5 大核心系统详解。"
description: "元素试炼：深渊回廊 v0.04 的 5 大核心系统详解。包含关卡流程系统、元素系统、敌人系统、元素球系统和卡牌系统。"
wiki_key: element-odyssey-v04
wiki_order: 40
---

- 返回: [元素试炼：深渊回廊 v0.04]({{ '/entries/element-odyssey-v04/' | relative_url }})

---

## 1. 关卡流程系统 (`stageFlow.ts`)

### 核心函数

| 函数 | 用途 |
|------|------|
| `gstsServerCreateStage()` | 创建关卡：初始化变量 → 清空旧敌人/球 → 生成新元素球 → 生成特殊球 |
| `gstsServerWaitForPlayerReady()` | 轮询等待场景实体 + 玩家角色完全就绪 |
| `gstsServerStartStageIntervalTimer()` | 启动每秒战斗循环（主循环） |
| `gstsServerSettleSuccessStatus()` | 胜利/失败结算：停止计时器、显示分数、设置结算状态 |
| `gstsServerNextStage()` | 进入下一关：清空→传送→或最终胜利 |
| `gstsServerInitializeStageVariables()` | 初始化关卡变量：从 battleStageConfig 读取配置 |
| `gstsServerRestartStage()` | 重置本关：清空→重新选卡→重新传送 |
| `gstsServerCheckDeadlock()` | 死锁检测：无敌人+无净化+球不足 → true |

### 死锁检测逻辑

```typescript
// 死锁条件（同时满足）：
// 1. enemyCount === 0     —— 场上无敌人
// 2. maxEnemies === 0     —— 本关本来就没有敌人（纯收集关）
// 3. orbsCollected < orbsRequired  —— 球没收集够
// 4. !orbsCollectable     —— 球不可拾取（已变深渊球）
// 5. !hasPurify           —— 玩家没有净化卡牌
// → 卡死！弹窗询问是否重置

```



### 重置确认弹窗的两种类型

重置弹窗根据触发方式不同，显示不同的提示信息，通过 `showFloatingInteractionPage` 信号的 `Type` 参数区分：

| 触发方式 | Type 值 | 弹窗内容 | 实现位置 |
|---------|---------|---------|---------|
| **死锁自动检测** | `confirmConfig.Type1` | "元素球不足且无法继续前进，是否重置本关？" | `stageFlow.ts` 的每秒循环 |
| **手动按重置按钮** | `confirmConfig.Type2` | "是否重置本关？" | `playerMain.ts` 的 UI 按钮事件 |

两种重置最终都调用 `gstsServerRestartStage()`，执行相同的重置逻辑：清除旧状态→重新选卡→重新传送。

---

## 2. 元素系统 (`elementSystem.ts`)

### 核心函数

| 函数 | 用途 |
|------|------|
| `gstsServerGetElementalTypes()` | 返回 4 种基础元素列表 [冰,火,水,雷] |
| `gstsServerGetSpecialElementalTypes()` | 返回 4 种特殊元素列表 [风环,岩盾,草色十字,光柱] |
| `gstsServerUpdateElementIcons()` | 更新 UI 上的主/副元素图标显示 |
| `gstsServerElementAttack()` | 执行元素攻击：调用 `f.initiateAttack()` |
| `gstsServerGetReactionName()` | 根据主/副元素组合判定反应名称 |
| `gstsServerGetReactionColor()` | 根据反应类型返回 HEX 颜色 |
| `gstsServerApplyBuffEffect()` | 应用增益效果（风环=加时/岩盾=护盾/草色十字=回血/光柱=全灭） |

### 二段攻击流程

```
投射物命中
  │
  ├─ 有副元素且副≠主 → 副元素攻击（伤害系数 0，仅附着）
  │
  └─ 10ms 后 → 主元素攻击（伤害系数 1，全额伤害）
       │
       └─ 副元素存在且≠主 → 判定元素反应
            ├─ 反应名称 → 存入 stage.reaction
            └─ 反应颜色 → 存入 stage.reactionColor
```

### 元素反应判定表

| 条件 (主|副 任一为) | 另一为 | 反应 | 颜色 |
|-------------------|-------|------|------|
| 冰(1) | 火(2) | 融化 | #FF6633 |
| 冰(1) | 水(3) | 冻结 | #99FFFF |
| 冰(1) | 雷(4) | 超导 | #B065E0 |
| 火(2) | 水(3) | 蒸发 | #FF9933 |
| 火(2) | 雷(4) | 超载 | #FF3366 |
| 水(3) | 雷(4) | 感电 | #CC77FF |

---

## 3. 敌人系统 (`enemySystem.ts`)

### 核心函数

| 函数 | 用途 |
|------|------|
| `gstsServerSpawnEnemy()` | 生成单个敌人 + 设置阵营 + 附加元素反应监控 |
| `gstsServerSpawnSlot()` | 按槽位配置生成单个敌人 |
| `gstsServerSpawnEnemyWave()` | 生成一波敌人：从展平数组读取当前关卡的 slots 配置 |
| `gstsServerClearAllEnemies()` | 清除场上所有敌人（字典管理敌人类型） |
| `gstsServerClearEnemyType()` | 清除指定类型的全部敌人 |
| `gstsServerHandleEnemyKill()` | 处理敌人击杀：计分 + 设置元素球可拾取 |
| `gstsServerCheckFallenEnemies()` | 防掉落检测：拉回掉落地板下的敌人 |
| `gstsServerGetEnemyPosByIdx()` | 根据索引获取敌人位置 |
| `gstsServerGetEnemyRotByIdx()` | 根据索引获取敌人旋转 |

### 预生成波次 vs 动态波次

- **预生成**：基于 `battleStageConfig.slots` 配置，每关的敌人种类和数量在配置中声明
- **动态限制**：`enemyCount < maxEnemies` 时才允许生成新波次
- **生成时机**：每 10 秒一波 + 深渊球触发额外波次

### 防掉落系统

每秒检测所有敌人类型的 Y 坐标：
- Y >= 2.5：正常
- Y < 2.5：**重生拉回** — 在相同 XZ 坐标、Y=3.5 处重新生成，删除旧实体
- 使用 `f.doubleBranch()` 代替 `if` 做条件分支（Genshin-TS 约束）

---

## 4. 元素球系统 (`orbSystem.ts`)

### 核心函数

| 函数 | 用途 |
|------|------|
| `gstsServerBuildOrbPool()` | 构建无放回随机池（dict 方案） |
| `gstsServerCreateOrbAtSafePos()` | 在安全位置生成指定类型的球 |
| `gstsServerCreateOrbAtRandomPos()` | 生成随机属性的普通元素球 |
| `gstsServerCreateSpecialOrbAtRandomPos()` | 生成特殊元素球（风环/岩盾/草色十字/光柱） |
| `gstsServerSetOrbCollectable()` | 设置全场元素球的可见/可拾取状态 |
| `gstsServerClearAllOrbs()` | 删除场上所有元素球（含特殊球） |
| `gstsServerRemoveRandomOrb()` | 随机删除一个元素球 |
| `gstsServerSpawnOrbEnemyAttack()` | 深渊球触发时生成追踪攻击投射物 |

### 安全位置预计算

在模块顶层（编译时）计算安全坐标：

```
网格：     [-10, 10] × [-10, 10]，步长 3 → 7×7 = 49 个候选点
排除：     玩家出生点附近 + 3 个敌人槽位附近（半径 3 内）
剩余：     44 个安全位置
```

### 无放回随机池（运行时的巧妙设计）

```
每关开始时：gstsServerBuildOrbPool()
  └─ 填充 dict: {0:true, 1:true, ..., 43:true}

生成一个球时：
  1. 从 dict 取 keys 列表
  2. 用 f.getRandomInteger(0, len-1) 随机抽一个 key
  3. 用该 key 作为位置索引（safeOrbXs[posIdx], safeOrbZs[posIdx]）
  4. 从 dict 移除该 key（确保同关内不重复）
  
下一关开始：重新填充 dict（回到 44 个全量位置）
```

这同时满足三个要求：
- ✅ **无编译时随机**：dict 内容在运行时通过 `finiteLoop` 填充
- ✅ **不重复**：抽过的 key 立即移除
- ✅ **顺序随机**：每次用 `f.getRandomInteger` 独立随机选

---

## 5. 卡牌/道具系统 (`cardSystem.ts`)

### 核心函数

| 函数 | 用途 |
|------|------|
| `gstsServerCardEffectToElement()` | 道具序号 → 特殊元素常量映射 |
| `gstsServerCardEffectToIcon()` | 道具序号 → 图标素材 ID 映射 |
| `gstsServerSetESkillIcon()` | 设置 E 技能按钮的图标 |
| `gstsServerShowDeckSelector()` | 显示卡牌选择器 |

### 道具映射

| 道具序号 | 道具名 | 对应特殊元素 | 图标素材 ID |
|---------|-------|------------|-----------|
| 1 | 生命回复 | 草(7) | 111128 |
| 2 | 护盾 | 岩(6) | 111111 |
| 3 | 增加时间 | 风(5) | 111016 |
| 4 | 敌人全灭 | 光(8) | 111025 |
| 5 | 净化 | 无（特殊逻辑） | 111048 |

### 选卡逻辑

- `fixedCard === 0`：从 1~5 中随机选 2 张不同的卡
- `fixedCard !== 0`：仅显示该固定卡牌
- 第1关跳过选卡，第3关起开始选卡
