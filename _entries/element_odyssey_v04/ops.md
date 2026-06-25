---
title: 构建与部署
permalink: /entries/element-odyssey-v04/ops/
tags: [游戏, 工具]
summary: "构建、注入、调试的操作步骤。"
description: "元素试炼：深渊回廊 的构建与部署指南。编译、注入、调试的操作步骤和注意事项。"
wiki_key: element-odyssey-v04
wiki_order: 61
---

- 返回: [元素试炼：深渊回廊 v0.04]({{ '/entries/element-odyssey-v04/' | relative_url }})

---

## 环境准备

```bash
# 克隆仓库
git clone https://github.com/chi-wq/genshin-ts-element_odyssey.git
cd genshin-ts-element_odyssey

# 安装依赖
npm install
```

---

## 构建

```bash
# 增量编译（开发时使用，只编译变更的文件）
npm run dev

# 完整编译（首次或需要完全重建时）
npm run build
```

### 编译产物

编译后在 `dist/` 目录生成三个文件：

| 文件 | 说明 | 用途 |
|------|------|------|
| `.gs.ts` | 节点函数调用形式的中间代码 | 验证编译结果是否正确 |
| `.json` | 节点和连接的 IR 表示 | 调试节点图结构 |
| `.gia` | 可注入的最终产物 | 注入到地图中 |

### 调试方法

如果注入后游戏行为异常，按以下顺序排查：

1. 检查 `.gs.ts` — 看函数调用是否按预期生成
2. 检查 `.json` — 看节点和连接是否正确
3. 对比预期的节点图结构

---

## 注入

### 配置注入目标

在 `gsts.config.ts` 中配置：

```typescript
export default {
  compileRoot: '.',
  entries: ['./src'],
  outDir: './dist',
  inject: {
    gameRegion: 'China',        // 区服（China / Global）
    playerId: 344728135,       // 你的玩家 ID
    mapId: 1073741826          // 目标地图 ID
  }
}
```

### 获取 mapId

```bash
npm run maps
```

这个命令会列出你最近保存的地图，帮助确定 `mapId`。

### 注入安全规则

注入器有安全保护机制：

- 目标 `id` 必须在地图中存在
- 如果目标节点图为空或其名称不以 `_GSTS` 开头，注入将被阻止
- 注入时会自动创建回滚备份
- 确认了解规范后，可在 `gsts.config.ts` 中设置 `inject.skipSafeCheck = true`

> **建议**：先批量创建并保存节点图，然后一次性编译和注入。

---

## 编译优化

`gsts.config.ts` 的 `options.optimize` 控制编译器的优化行为，默认全部启用：

| 选项 | 默认值 | 说明 | 何时需要关闭 |
|------|--------|------|-------------|
| `precompileExpression` | `true` | 预计算仅含字面量的表达式（如 `1 + 2` 直接编译为 `3`） | 调试时想确认表达式是否正确生成了节点 |
| `removeUnusedNodes` | `true` | 删除未被使用的 exec/data 节点，减小节点图体积 | 怀疑某段代码被错误地当作"未使用"删除时 |
| `timerPool` | 自动 | `setTimeout` / `setInterval` 的名称池大小。编译器为每个定时器分配唯一名称，池大小决定可同时存在的定时器数量 | 出现定时器名称冲突时，可手动调大（或用注释 `// @gsts:timerPool=8` 覆盖）|
| `timerDispatchAggregate` | `true` | 将多个 timer dispatch 节点聚合成一个，降低节点图复杂度 | 需要单独调试每个定时器触发时 |

调试或需要对比节点图时，可在 `gsts.config.ts` 中临时禁用相关选项：

```typescript
export default {
  // ...
  options: {
    optimize: {
      precompileExpression: false,
      removeUnusedNodes: false
    }
  }
}
```

---

## 备份

```bash
npm run backup
```

注入前会自动创建备份。你也可以手动运行此命令创建回滚点。

---

## 版本迁移

从 v0.03 到 v0.04 时需要注意的变更：

| 项目 | v0.03 | v0.04 |
|------|-------|-------|
| `gsts.config.ts` 的 `playerId` | 873740275 | 344728135 |
| 目标 `mapId` | 1073741825 | 1073741826 |
| 代码结构 | 单文件 `src/main.ts` | 多模块结构 |

如果你的地图 ID 不同，请根据 `npm run maps` 的输出调整。
