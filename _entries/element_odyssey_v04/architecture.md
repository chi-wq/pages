---
title: 架构分析
permalink: /entries/element-odyssey-v04/architecture/
tags: [游戏, 架构, 节点图]
summary: "v0.04 项目架构详解。"
description: "元素试炼：深渊回廊 v0.04 的项目架构分析。四层架构设计、6个节点图、信号系统、游戏循环流程。"
wiki_key: element-odyssey-v04
wiki_order: 20
---

- 返回: [元素试炼：深渊回廊 v0.04]({{ '/entries/element-odyssey-v04/' | relative_url }})

## 整体架构

项目采用**声明式配置 + 分层系统 + 节点图**的架构风格，将游戏逻辑分为 4 层：

```
┌─────────────────────────────────────┐
│  config/        声明式关卡配置       │  ← 数据驱动
├─────────────────────────────────────┤
│  systems/       业务逻辑系统         │  ← 可复用 gstsServer* 函数
├─────────────────────────────────────┤
│  graphs/        节点图定义           │  ← 事件绑定 + 信号编排
├─────────────────────────────────────┤
│  utils/         工具函数             │  ← 安全取值、日志、映射
└─────────────────────────────────────┘
```

### 目录结构

```
src/
├── main.ts                    # 入口，import 所有 graph 文件以触发注册
├── config/                    # 配置数据（4 个文件）
│   ├── battleStageConfig.ts   #   9 关声明式配置 + deriveConfig
│   ├── constants.ts           #   所有游戏常量
│   ├── ruleText.ts            #   游戏规则文本
│   └── spawnSlots.ts          #   敌人固定生成槽位
├── graphs/                    # 节点图定义（6 个文件）
│   ├── stageMain.ts           #   关卡主控制（id=1073741854）
│   ├── playerMain.ts          #   玩家交互/UI（id=1073741837）
│   ├── elementAttack.ts       #   元素攻击命中（id=1073741853）
│   ├── enemyElementAttack.ts  #   敌方元素攻击命中（id=1073741855）
│   ├── getOrb.ts              #   元素球碰撞处理（id=1073741829）
│   └── scanTagReady.ts        #   场景就绪判定（id=1073741856）
├── systems/                   # 业务逻辑系统（5 个文件）
│   ├── stageFlow.ts           #   关卡生命周期/计时器/死锁检测
│   ├── cardSystem.ts          #   道具映射 + 卡牌选择器
│   ├── elementSystem.ts       #   元素攻击/反应/增益效果
│   ├── enemySystem.ts         #   刷怪/清除/计分/防掉落
│   └── orbSystem.ts           #   元素球生成/随机池/深渊球
├── types/                     # 类型定义
│   └── config.ts              #   StageConfig + deriveConfig
├── utils/                     # 工具函数
│   ├── stageUtils.ts          #   安全列表取值 + 消息通知
│   ├── enemyPrefabs.ts        #   敌人名称→prefabId 映射
│   └── logger.ts              #   调试日志封装
└── resources/                 # 编译器自动生成（勿手动编辑）
    ├── prefabs.ts             #   预制体 ID 常量
    └── signals.ts             #   信号 enum 定义
```

---

## 节点图（Graph）详解

6 个 `g.server()` 定义，每个独立文件，通过 `src/main.ts` 统一导入注册：

### StageMain — 关卡主控

**职责**：整个游戏的主控制器，管理关卡生命周期、战斗循环、胜败判定。

| 事件/信号 | 用途 |
|----------|------|
| `whenEntityIsCreated` | 开始等待场景和玩家就绪 |
| `whenGlobalTimerIsTriggered` | 处理 InitTimer（传送玩家）和 StageTimer（超时失败） |
| `Signal.StageReady` | 场景就绪后播放 BGM |
| `Signal.SpawnEnemyWave` | 生成敌人波次 |
| `Signal.EnterBattleStage` | 玩家入场后启动关卡计时器和战斗循环 |
| `Signal.PreFightPreparation` | 玩家退场后初始化下一关并显示卡牌选择器 |
| `whenEntityIsDestroyed` | 敌人被击杀时处理计分 |
| `Signal.ClientSignal` | 处理客户端发来的元素攻击和道具使用 |
| `Signal.ShowFloatingInteractionPage` | 显示重置确认弹窗（两种类型：死锁自动触发 / 手动按重置按钮） |
| `whenAllPlayerSCharactersAreDown` | 所有角色倒下时失败结算 |

**图变量**：
- `challengeState: int` — 0=进行中, 1=成功, 2=失败, 3=中断
- `infiniteTime: bool` — 是否为无限时间模式
- `orbPool: dict(int, bool)` — 元素球无放回随机池

### PlayerMain — 玩家交互

**职责**：处理玩家的传送、UI 交互、卡牌选择和角色状态。

| 事件 | 用途 |
|------|------|
| `whenPlayerTeleportCompletes` | 传送完成后发送入场/退场信号 |
| `whenDeckSelectorIsComplete` | 卡牌选择完成后记录选中的道具 |
| `whenUiControlGroupIsTriggered` | 处理重置按钮和规则说明按钮 |
| `whenTheCharacterIsDown` | 角色倒下时阻止复活并失败结算 |
| `whenFloatingInteractionPageIsTriggered` | 处理确认弹窗的确认/取消 |

### ElementAttack — 元素攻击执行

**职责**：投射物命中时执行二段攻击（副附着→主一击）和元素反应判定。

| 事件 | 用途 |
|------|------|
| `whenOnHitDetectionIsTriggered` | 命中后先副元素附着(0伤害)→10ms后主元素全额伤害→判定反应 |

### EnemyElementAttack — 敌方攻击

**职责**：敌方深渊球追踪投射物命中后的处理。

| 事件 | 用途 |
|------|------|
| `whenOnHitDetectionIsTriggered` | 命中后清除投射物 |

### GetOrb — 元素球拾取

**职责**：处理玩家或敌人进入元素球碰撞触发器的逻辑。

| 事件 | 用途 |
|------|------|
| `whenEnteringCollisionTrigger` | 判断接触者身份（玩家/敌人）和可拾取状态，执行拾取/惩罚 |

### ScanTagReady — 场景就绪检测

**职责**：检测场景 UI 是否已完全加载就绪。

| 事件 | 用途 |
|------|------|
| `whenOnHitDetectionIsTriggered` | 扫描标签命中后检查各就绪标志，发送 StageReady |

---

## 状态与事件总览

游戏的整体运转可以拆解为三个维度：**状态**（stage 变量）、**事件**（信号/接触/销毁）、**定时器**（GlobalTimer + 每秒循环）。

### 挑战状态机（challengeState）

游戏的关卡进度由 `challengeState` 变量驱动，它有 4 种状态：

| 状态 | 值 | 说明 |
|------|-----|------|
| 进行中 | `int(0)` | 正常游戏进行中，每秒循环在运行 |
| 成功 | `int(1)` | 通关条件达成，进入结算→下一关 |
| 失败 | `int(2)` | 超时或角色全部倒下，进入失败结算 |
| 中断 | `int(3)` | 传送过渡中，每秒循环暂停 |

**状态转移图：**

<div class="mermaid">
stateDiagram-v2
  [*] --> InProgress: 关卡开始
  InProgress --> Success: 通关条件成立
  InProgress --> Failed: 倒计时归零 / 角色全倒
  InProgress --> Interrupted: 传送至下一关
  Interrupted --> InProgress: 下一关开始
  Success --> [*]
  Failed --> [*]
</div>

### 关卡生命周期

**流程概览图：**

<div class="mermaid">
flowchart TD
  Start[地图加载] --> Wait[等待场景就绪]
  Wait --> Ready[场景就绪]
  Ready --> Init[关卡初始化]
  Init --> Select[卡牌选择]
  Select --> Teleport[传送玩家入场]
  Teleport --> Battle[战斗循环开始]
  
  Battle --> Tick{每秒检查}
  Tick -->|通关| Win[进入下一关]
  Tick -->|超时| Lose[失败结算]
  Tick -->|死锁| Deadlock[弹重置确认窗]
  
  Win --> Init
  Lose --> Final[最终结算]
  Deadlock --> Reset[重置本关]
  Reset --> Init
</div>

### 核心数据流

游戏运行时的主要状态变量通过 `stage.set()` / `stage.get()` 在场景实体上持久化：

| 分类 | 变量 | 类型 | 用途 |
|------|------|------|------|
| **进度** | `challengeState` | int | 0=进行中 / 1=成功 / 2=失败 / 3=中断 |
| | `currentStage` | int | 当前关卡编号 |
| | `score` | int | 累积分数（跨关保留） |
| **战斗** | `enemyCount` | int | 场上存活敌人数 |
| | `spawnTimer` | int | 敌人生成计时器（≥10 秒发波） |
| | `maxEnemies` | int | 关卡最大敌人上限 |
| **元素球** | `orbsCollected` | int | 已收集球数 |
| | `orbsRequired` | int | 通关所需球数 |
| | `orbsCollectable` | bool | 元素球是否可拾取 |
| | `collectableTimeout` | int | 可拾取剩余秒数 |
| **元素** | `mainElement` | int | 主元素类型（1~4） |
| | `subElement` | int | 副元素类型（1~4） |
| **反应** | `reaction` | str | 当前触发的反应名称 |
| | `reactionColor` | str | 反应显示颜色 |
| **定时器** | `stageTimerActive` | bool | 关卡计时器是否运行 |
| **道具** | `cardEffect` | int | 当前持有的道具效果 |
| **死锁** | `deadlockPageShown` | bool | 死锁弹窗是否已显示 |

### 事件与定时器的协作

游戏中有两套时间系统并行工作：

| 系统 | 类型 | 用途 | 实现位置 |
|------|------|------|---------|
| `InitTimer` | GlobalTimer | 关卡初始化倒计时 | `stageMain.ts` |
| `StageTimer` | GlobalTimer | 关卡限时（超时即失败） | `stageMain.ts` |
| 战斗循环 | `setInterval(1000)` | 每秒检查通关/死锁/倒计时 | `stageFlow.ts` |
| 防掉落检测 | `setInterval(1000)` | 每秒检测敌人位置 | `stageFlow.ts` |

**事件协作图：**

<div class="mermaid">
sequenceDiagram
  participant Scene as 场景
  participant Stage as StageMain
  participant Player as PlayerMain
  participant Orb as GetOrb
  participant EA as ElementAttack
  
  Scene->>Stage: 场景就绪
  Stage->>Stage: 关卡初始化
  Stage->>Player: 卡牌选择器
  Player->>Stage: 传送完成
  Stage->>Stage: 启动战斗循环
  
  loop 每秒
    Stage->>Stage: 检查通关/死锁/倒计时
  end
  
  Orb->>Stage: 元素球被收集
  Orb->>Stage: 深渊球触发
  
  EA->>Stage: 元素反应判定
</div>

---

## 信号系统

在 `src/resources/signals.ts` 中以枚举形式定义，共 7 个结构化信号：

| 信号名 | 参数 | 用途 |
|-------|------|------|
| `StageReady` | 无 | 场景就绪，开始初始化 |
| `PreFightPreparation` | 无 | 战斗前准备（生成下一关） |
| `EnterBattleStage` | 无 | 玩家入场，开始战斗 |
| `SpawnEnemyWave` | 无 | 生成一波敌人 |
| `ShowFloatingInteractionPage` | Index, Type | 显示确认弹窗 |
| `ClientSignal` | SignalName, Location, Rotate, OwnerEntity, OwnerPlayer | 客户端发来的攻击/道具信号 |
| `UpdateNotificationMsgList` | Entity, NotificationQueueIndex, NotificationItemId, Msg | 更新消息队列 |

---

## 游戏主循环（战斗循环）

战斗循环由 `StageMain` 中的 `setInterval(..., 1000)` 驱动，每秒执行一次：

```
[每秒执行]  — 实现在 src/systems/stageFlow.ts 的 gstsServerStartStageIntervalTimer()
├─ 检查 challengeState（失败/成功/中断 → 清除定时器）
├─ 检查 StageTimer 是否失效（用于断线恢复）
├─ 检查角色是否全部倒下
├─ 通关检测：enemyCount === 0 && orbsCollected >= orbsRequired
│   └─ 成功 → 进入下一关 / 最终胜利结算
├─ 死锁检测：场上无敌人+无可生成+无可净化+球不足
│   └─ 死锁 → 弹重置确认窗
├─ 元素球倒计时（collectableTimeout 每秒 -1）
│   └─ 归零 → 元素球变为不可拾取（深渊球状态）
├─ 敌人生成计时（spawnTimer 每秒 +1）
│   └─ ≥10秒 → 发送 SpawnEnemyWave 信号
└─ 防掉落检测（独立 setInterval，每秒）
    └─ 敌人 Y < 2.5 → 重生拉回安全位置
```

---

## 状态变量体系

游戏状态通过 `stage.set()` / `stage.get()` 存储在场景实体上，主要变量：

| 变量名 | 类型 | 用途 |
|--------|------|------|
| `challengeState` | int | 0=进行中, 1=成功, 2=失败, 3=中断 |
| `currentStage` | int | 当前关卡编号 |
| `enemyCount` | int | 场上存活敌人数 |
| `orbsCollected` | int | 已收集元素球数 |
| `orbsCollectable` | bool | 元素球是否可拾取 |
| `collectableTimeout` | int | 可拾取剩余秒数 |
| `mainElement` | int | 主元素类型(1~4) |
| `subElement` | int | 副元素类型(1~4) |
| `score` | int | 累积分数（跨关保留） |
| `reaction` | str | 当前触发的反应名称 |
| `reactionColor` | str | 反应显示颜色 |
| `stageTimerActive` | bool | 关卡计时器运行标志 |
| `cardEffect` | int | 当前持有的卡牌效果 |
| `deadlockPageShown` | bool | 死锁弹窗是否已显示 |
