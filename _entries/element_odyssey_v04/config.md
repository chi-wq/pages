---
title: 配置系统详解
permalink: /entries/element-odyssey-v04/config/
tags: [游戏, 配置, 类型系统]
summary: "v0.04 声明式配置与 deriveConfig 详解。"
description: "元素试炼：深渊回廊 v0.04 的配置系统详解。包含 deriveConfig 自动派生工具、9关声明式配置、常量体系和敌人槽位系统。"
wiki_key: element-odyssey-v04
wiki_order: 30
---

- 返回: [元素试炼：深渊回廊 v0.04]({{ '/entries/element-odyssey-v04/' | relative_url }})

## 设计理念

所有游戏常量（关卡数据、敌人位置、UI ID 等）都集中管理，采用**声明式配置**体系，而非分散的硬编码：

- **声明式写配置**：像写表格一样写每关的数据
- **自动派生**：`deriveConfig` 自动推断类型、展平嵌套数组、生成分段索引
- **运行时安全取值**：`gstsServerGetListValue` 提供带钳位的索引访问

---

## `deriveConfig` — 配置自动派生工具（定义在 `src/types/config.ts`）

### 为什么需要 deriveConfig？

要理解 `deriveConfig`，需要先了解 Genshin-TS 的两个关键限制：

**限制一：千星奇域的结构体（Struct）无法在代码中使用**

千星奇域编辑器支持自定义结构体（如定义 `SlotConfig { type: string, pos: int, rot: int }`），Genshin-TS 也提供了 `f.assembleStructure()` 等 API。但这些 API 编译后生成的是**空模板节点**（无引脚），**无法在 TypeScript 代码中指定结构体类型或给字段赋值**——类型绑定和字段赋值必须在编辑器中手动操作。（详见[开发笔记：结构体 API 限制]({{ '/entries/element-odyssey-v04/devnotes/' | relative_url }})）

这意味着：如果有一个包含嵌套对象的关卡配置数组，无法用结构体来表达。

**限制二：Genshin-TS 运行时只认 list，不认 JS 对象**

在节点图作用域（`g.server().on(...)` 内部）中，Genshin-TS 只能操作经过编译的节点图数据类型——**list**（同构数组）和 **dict**（只读字典）。JavaScript 的原生对象、数组索引访问（`arr[i]`）在回调体内不被支持。

### deriveConfig 的迂回方案

`deriveConfig` 的本质是：**在模块作用域（编译时）将 JS 结构体数组拆解为多个平行的 gsts list，然后用索引关联它们。**

把这一过程拆开看：

```
理想方案（用结构体，但不可行）：
  stageConfigs[stageIndex].slots[slotIndex].type
  
迂回方案（deriveConfig）：
  // 编译时：把结构体拆成多个 list
  const slotType = ['hilichurl', 'hilichurl', 'pyroSlime']   // string[]
  const slotPos  = [1, 1, 2]                                  // bigint[]
  const slotRot  = [1, 1, 2]                                  // bigint[]
  const slotStarts = [0, 1]  // 第0关从索引0开始，第1关从索引1开始
  const slotCounts = [1, 2]  // 第0关有1个槽位，第1关有2个槽位

  // 运行时：通过索引关联取值
  const flatIdx = slotStarts[currentStage] + i
  const type = slotType[flatIdx]   // 编译为 f.getCorrespondingValueFromList()
  const pos  = slotPos[flatIdx]
```

这就是所谓的**展平数组 + offset 模式**：把"结构体数组"展平成"多个平行的标量数组"，用一个共同的偏移量索引它们。

这样做的好处：
- 在**模块作用域**（编译时）可以自由使用 JS 对象、数组、`.map()` 等操作
- 最终产物是 gsts 支持的**同构 list**，运行时可以编译为节点图节点
- 使用 `keyField` 还可以提取主键标量，避免在图回调内直接索引 JS 数组

代价是：
- 配置定义和读取是分离的——写配置时是结构体，读配置时通过索引
- 需要配套的 `gstsServerGetListValue` / `gstsServerGetListValue0`（定义在 `src/utils/stageUtils.ts`，带钳位的安全索引函数）
- 嵌套数组需要手动管理 `Starts`/`Counts` 分段索引

---

### 核心功能

### 自动检测规则

```
输入：配置对象数组
输出：展平的字段数组 + 嵌套字段 + 分段索引 + 内置标量

示例输入：
[
  { maxEnemies: 4, orbsRequired: 1, slots: [{ type: 'hilichurl', pos: 1, rot: 1 }] },
  { maxEnemies: 6, orbsRequired: 2, slots: [{ type: 'hilichurl', pos: 1, rot: 1 },
                                              { type: 'pyroSlime', pos: 2, rot: 2 }] }
]

自动派生输出：
├── maxEnemies: bigint[]        → [4, 6]          ← 标量字段自动提取
├── orbsRequired: bigint[]      → [1, 2]
├── slotType: string[]          → ['hilichurl', 'hilichurl', 'pyroSlime']   ← 嵌套数组展平
├── slotPos: bigint[]           → [1, 1, 2]
├── slotRot: bigint[]           → [1, 1, 2]
├── slotStarts: bigint[]        → [0, 1]          ← 每关的起始索引
├── slotCounts: bigint[]        → [1, 2]          ← 每关的槽位数
├── maxSlotIdx: bigint          → 2               ← 总最大索引
├── size: bigint                → 2               ← 配置数量
└── maxIdx: bigint              → 1               ← 最大索引
```

### 主键标量

指定 `keyField` 后，按字段值生成命名常量：

```typescript
// 输入
const confirmConfig = deriveConfig(data, {}, undefined, 'type')
// 自动生成
confirmConfig.Type1  → int(1)  // type=1 的标量
confirmConfig.Type2  → int(2)  // type=2 的标量
```

### 运行时安全取值

```typescript
// 1 基索引（适用于 currentStage 等从 1 开始的编号）
gstsServerGetListValue(data, index, maxIdx, 'int', f)  // 定义在 src/utils/stageUtils.ts
// 内部自动 index - 1，超出 maxIdx 时钳位到 maxIdx

// 0 基索引（适用于动态计算的索引，如 flatIdx = startIdx + i）
gstsServerGetListValue0(data, index, maxIdx, 'str', f)  // 定义在 src/utils/stageUtils.ts
```

---

## 9 关声明式配置 (`battleStageConfig.ts`)

每关配置包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `maxEnemies` | number | 最大敌人数（达到后不再生成新敌人） |
| `orbsRequired` | number | 通关所需元素球数 |
| `orbCount` | number | 元素球生成数量 |
| `fixedCard` | number | 固定道具序号（0=随机） |
| `skipCardSelector` | boolean | 是否跳过卡牌选择器 |
| `orbSPCount` | number | 特殊元素球数量 |
| `fixedSpecialOrb` | number | 固定特殊元素类型（0=随机） |
| `permanentOrbs` | boolean | 元素球是否永久可见可拾取 |
| `infiniteTime` | boolean | 是否为无限时间 |
| `goal` | string | 关卡目标描述 |
| `tips` | string | 关卡提示 |
| `slots` | SlotConfig[] | 敌人槽位数组 |

### 教学关设计思路

- **第1关**：永久可见元素球，无限时间，无敌人 — 学会"触碰收集"
- **第2关**：引入深渊球概念，固定给净化道具 — 学会"净化"
- **第3关**：纯战斗，无需球，固定回血道具 — 学会"战斗+回血"
- **第4关**：净化+战斗首次组合 — 综合应用

之后的关卡逐步增加敌人数量和球数要求，并在第6关引入特殊球、第8关集中展示元素反应、第9关用遗迹守卫作为最终挑战。

---

## 常量体系 (`constants.ts`)

所有游戏常量集中管理，按功能分组：

| 分组 | 内容 |
|------|------|
| **元素常量** | Cryo(1), Pyro(2), Hydro(3), Electro(4), Anemo(5), Geo(6), Dendro(7), Light(8) |
| **UI 图标 ID** | 主元素图标×4、副元素图标×4、计时器×2、E技能图标 |
| **敌人阵营** | `factionEnemy = 4` |
| **生成网格** | 排除半径 3、网格范围 10、步长 3、生成高度 3.2 |
| **元素球 Prefab** | 普通球 `1077936129`（`CustomPrefab.Orb`），特殊球 `1077936185`（`CustomPrefab.OrbSP`） |
| **道具常量** | 5 种道具 ID + 卡牌选择器 UI ID |
| **护盾 Config** | `geoShieldConfigId = configId(1077936131)` |
| **UI 控件** | 重置按钮、规则说明按钮、规则说明弹窗 |
| **传送点** | 玩家出生点、备用传送点（下一关） |
| **消息队列** | 队列索引 `1073742361`，消息项 ID 1 |
| **坐标** | 安全回拉位置 |
| **调试开关** | `DEBUG = false` |

---

## 敌人槽位系统 (`spawnSlots.ts`)

3 个固定敌人出生位置：

| 槽位索引 | 位置 (x, y, z) | 旋转 (x, y, z) |
|---------|----------------|----------------|
| 0 | (1, 3.5, 0) | (0, 0, 0) |
| 1 | (-1, 3.5, 0) | (0, 150.25, 0) |
| 2 | (0, 3.5, 2) | (0, 90, 0) |

通过 `battleStageConfig` 中每个关卡的 `slots` 数组引用这些槽位，如 `{ type: 'hilichurl', pos: 1, rot: 1 }` 表示在第 1 个槽位生成一个丘丘人。

---

## 规则文本与富文本预处理

### 规则文本 (`ruleText.ts`)

游戏规则说明弹窗的完整内容，支持 Unity 风格的富文本标签。

### `fmt()` 预处理函数 (`battleStageConfig.ts`)

关卡配置中的 `goal`（目标）和 `tips`（提示）文本并非直接使用，而是经过 `fmt()` 函数预处理：

```typescript
const fmt = (s: string) =>
  s
    .trim()
    .replace(/【([^】]+)】/g, '<color=white>【$1】</color>')  // 【术语】→ 白色高亮
    .replace(/\n/g, '\\n')                                      // 换行 → 兼容转义
```

预处理做两件事：

| 处理 | 效果 |
|------|------|
| **`【术语】` 着色** | 自动将 `【元素球】`、`【敌人】` 等术语包裹 `<color=white>` 标签，在游戏中显示为白色高亮文字 |
| **换行符转义** | JavaScript 的 `\n` 编译为 UTF-8 换行符会导致编码问题，`fmt()` 将其转为字面量 `\\n`，千星奇域编辑器正确解释为换行 |

这样在写配置时可以直接使用自然语言：

```typescript
goal: fmt('消灭【敌人】，收集【元素球】'),
tips: fmt('使用【道具】回血')
```

而不需要手动嵌入富文本标签或处理转义问题。
