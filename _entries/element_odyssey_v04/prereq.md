---
title: 制作前提
permalink: /entries/element-odyssey-v04/prereq/
tags: [游戏, 工具]
summary: "千星奇域与 Genshin-TS 的基础概念。"
description: "元素试炼：深渊回廊 的制作前提。千星奇域（Miliastra Wonderland）和 Genshin-TS 的基本概念、工作流程与约束。"
wiki_key: element-odyssey-v04
wiki_order: 60
---

- 返回: [元素试炼：深渊回廊 v0.04]({{ '/entries/element-odyssey-v04/' | relative_url }})

---

## 千星奇域是什么

**千星奇域**（Miliastra Wonderland）是原神中的 UGC（用户生成内容）创作模式，玩家可以在其中创建自定义地图、关卡和玩法，并分享给其他人游玩。本游戏就是基于这个平台构建的。

### 为什么选择千星奇域

选择千星奇域作为游戏平台，主要基于以下考虑：

- **专注于游戏逻辑设计**：借助原神已有的美术资源、角色动作、物理系统和音效，可以直接把精力放在玩法设计和规则实现上，无需从零搭建游戏引擎
- **快速原型验证**：从想法到可玩的原型，只需要编写逻辑 → 编译 → 注入 → 测试，迭代周期短
- **为移植做准备**：先在千星奇域上验证玩法的趣味性和可行性，如果反响好、有进一步发展的空间，再考虑移植到独立游戏引擎中继续打磨

简单说，千星奇域是** prototyping 阶段的高效平台**——让你用最小的成本验证游戏设计，把精力集中在"好不好玩"这个核心问题上。

---

千星奇域的核心概念：
- **地图（.gil）**：包含地形、实体、节点图等全部关卡数据
- **节点图（NodeGraph）**：可视化编程界面，通过连接节点来编排游戏逻辑
- **预制体（Prefab）**：可复用的游戏对象模板（敌人、道具、特效等）
- **信号（Signal）**：节点之间通信的事件机制
- **全局定时器（GlobalTimer）**：与 UI 联动的可视化倒计时

---

## Genshin-TS 是什么

**Genshin-TS** 是一个工具链，让你可以用 TypeScript 代码来编写千星奇域的节点图逻辑，然后编译为节点图并注入到地图中。

### 为什么选择 Genshin-TS

千星奇域自带的节点图编辑器在逻辑简单时足够直观，但随着游戏规则的增加，节点图会变得庞大复杂——成百上千个节点和连线交织在一起，查看和调试都会变得困难。

Genshin-TS 解决的就是这个问题：

- **代码比节点图更容易管理**：TypeScript 提供了变量命名、函数拆分、类型检查等工程化手段，让复杂逻辑保持清晰
- **版本控制友好**：代码可以放在 Git 中管理，追踪每次变更、回滚错误、对比差异，这些都是节点图做不到的
- **复用和重构**：函数抽象、参数化配置、模块拆分，这些代码层面的重构手段在节点图编辑器中很难实现
- **声明式配置**：如 `battleStageConfig.ts` 中的关卡配置，用代码写比在节点图中拖拽连接几十个节点要高效得多

> 简单说：**逻辑复杂到一定程度后，文本代码的管理效率远超可视化节点图。** Genshin-TS 让你在享受千星奇域平台优势的同时，用代码来驾驭复杂度。

### 工作流程

```
TypeScript 源码
    ↓ 编译
.gs.ts（节点函数调用形式的中间代码）
    ↓ 转换
.json（节点和连接的 IR 表示）
    ↓ 打包
.gia（可注入的文件）
    ↓ 注入
地图文件（.gil）
```

### 常用命令

```bash
npm install          # 安装依赖
npm run dev          # 增量编译（自动注入）
npm run build        # 完整编译
npm run maps         # 列出最近保存的地图
npm run backup       # 创建回滚备份
```

### 注入配置

在 `gsts.config.ts` 中配置注入目标：

```typescript
const config: GstsConfig = {
  compileRoot: '.',
  entries: ['./src'],
  outDir: './dist',
  inject: {
    gameRegion: 'China',     // 游戏区服
    playerId: 344728135,     // 你的玩家 ID
    mapId: 1073741826        // 目标地图 ID
  }
}
```

---

## 两个作用域的理解

这是理解 Genshin-TS 最关键的概念：

### 模块作用域（编译时）

在文件顶层书写的代码，在 `npm run build` 时执行（Node.js 环境）。可以：
- 使用完整的 JavaScript/TypeScript 语法
- 使用 npm 包（如 `fs`、`path`）
- 进行复杂计算和数据预处理
- **不能**调用 `g.server()` 或 gsts 运行时 API

### 节点图作用域（运行时）

在 `g.server().on(...)` 或 `gstsServer*` 函数内部的代码，编译为节点图中的节点和连线。只能使用 Genshin-TS 支持的 TS 子集。

### 预编译模式

把节点图做不到的事（JSON 解析、复杂计算、字符串处理）在模块作用域提前做好，结果以静态数据形式传入节点图。

> **核心原则：能提前算好的，绝不到运行时再算。**

---

## Genshin-TS 的约束

### 控制流

- `if/while/switch` 的条件必须是 `boolean`，必要时使用 `bool(...)`
- `gstsServer*` 函数**仅允许末尾单个 `return`**
- 节点图作用域不支持递归、`async/await`、Promise
- `while(true)` 有循环上限，使用定时器或显式计数器替代

### 数值与类型

- `number` 是 **float**，`bigint` 是 **int**
- 取模/位运算使用 `bigint`
- List/dict 必须是同类元素（homogeneous），混合类型会失败
- 空数组可能无法推断类型，使用 `list('int', [])` 显式指定

### 可用全局函数

| 类别 | 函数 |
|------|------|
| 类型转换 | `bool()` `int()` `float()` `str()` `vec3()` `guid()` |
| 资源引用 | `prefabId()` `configId()` `faction()` `entity()` |
| 列表/字典 | `list('int', [...])` `dict('str', 'float', null)` |
| 数学 | `Math.*` `Mathf.*` `Vector3.*` `Random.*` |
| 实体 | `player(1)` `stage` `level` `self` |
| 查找 | `GameObject.Find()` `FindWithTag()` `FindByPrefabId()` |
| 定时器 | `setTimeout()` `setInterval()` `clearTimeout()` `clearInterval()` |
| 日志 | `print(str(...))` `console.log(x)`（限 1 个参数） |
| 信号 | `send('signalName')` |

---

## 典型的开发流程

1. **编辑器侧**：搭建地形、放置预制体、创建节点图框架、配置 UI 布局
2. **代码侧**：用 TypeScript 编写游戏逻辑
3. **编译**：`npm run build` 生成 `.gia` 文件
4. **注入**：自动或手动将 `.gia` 注入到地图中
5. **测试**：在游戏中加载地图，验证逻辑是否正确
6. **迭代**：修改代码 → 编译 → 注入 → 测试

> 注意：Genshin-TS 只处理**逻辑部分**。地形搭建、预制体放置、UI 排版、音效配置等仍需在千星奇域编辑器中完成。
