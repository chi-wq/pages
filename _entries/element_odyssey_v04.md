---
title: 元素试炼：深渊回廊 (v0.04)
permalink: /entries/element-odyssey-v04/
tags: [游戏, 原神, 千星奇域]
summary: "v0.04 完整中文文档入口。9关闯关爬塔式元素战斗挑战图，使用 Genshin-TS 构建。"
description: "元素试炼：深渊回廊 v0.04 版本的中文文档。包含游戏介绍、架构分析、配置系统、核心系统详解和开发笔记。"
wiki_root: true
wiki_key: element-odyssey-v04
wiki_order: 0
prereq_note: "需安装**原神**，在「千星奇域」中游玩此地图"
---

**元素试炼：深渊回廊** 是一款闯关爬塔式元素战斗挑战图，在千星奇域中操控角色收集元素球、触发反应、击倒敌人逐关推进。

**源码**：[GitHub 仓库](https://github.com/chi-wq/genshin-ts-element_odyssey) · [Gitee 仓库](https://gitee.com/chi-wq/genshin-ts-element_odyssey) · [下载压缩包]({{ '/assets/downloads/genshin-ts-element_odyssey-0.04.zip' | relative_url }})

**框架**：[Genshin-TS](https://gsts.moe) — TypeScript 编译为节点图并注入千星奇域地图

**游玩需知**：关卡 GUID `24439692738` · 服务器：中国官方服务器（天空岛）

**场景文件**：[奇域资产中心](https://act.mihoyo.com/ys/prod/ugc/component-store/index.html#/item/2071426326023155712)（需登录奇域资产中心方可下载）

---

## 文档目录

### 🎮 游戏相关

- [游戏介绍]({{ '/entries/element-odyssey-v04/game/' | relative_url }}) — 玩法规则、操作说明、关卡设计及计分系统

### 🏗 开发相关

- [架构分析]({{ '/entries/element-odyssey-v04/architecture/' | relative_url }}) — 项目整体架构、分层设计、节点图与信号系统
- [配置系统]({{ '/entries/element-odyssey-v04/config/' | relative_url }}) — 声明式关卡配置、`deriveConfig` 自动派生、常量与槽位
- [核心系统详解]({{ '/entries/element-odyssey-v04/systems/' | relative_url }}) — 5 大业务系统（关卡流程、元素、敌人、元素球、卡牌）
- [开发笔记]({{ '/entries/element-odyssey-v04/devnotes/' | relative_url }}) — 技术难点、Genshin-TS 约束、踩坑记录与解决方案

### 📚 参考

- [制作前提]({{ '/entries/element-odyssey-v04/prereq/' | relative_url }}) — 千星奇域与 Genshin-TS 的基础概念与约束
- [构建与部署]({{ '/entries/element-odyssey-v04/ops/' | relative_url }}) — 编译、注入、调试的操作步骤
- [参考资料]({{ '/entries/element-odyssey-v04/references/' | relative_url }}) — 官方文档与资源链接汇总

### 📋 其他

- [规格检查清单]({{ '/entries/element-odyssey-v04/spec/' | relative_url }}) — 功能规格、QA 检查点及实现验证结果
- [游戏设计思路]({{ '/entries/element-odyssey-v04/design/' | relative_url }}) — 核心战斗机制的设计理念与灵感来源

---

## 附录：v0.04 相比旧版的主要变更

> 以下为历史对照信息，仅作参考。阅读本文档无需了解旧版内容。

| 变更项 | 旧版 (v0.03) | 当前版本 (v0.04) |
|--------|-------------|-----------------|
| 代码结构 | 单文件 `src/main.ts` (~800行) | 多模块：`graphs/`×6、`systems/`×5、`config/`×4、`utils/`×3 |
| 关卡数量 | 5 关 | 9 关（含 4 关教学） |
| 图(Graph) | 4 个 | 6 个 |
| 信号定义 | 纯字符串 | `signals.ts` 枚举定义 |
| 配置方式 | 硬编码数组 | 声明式 `deriveConfig` 自动派生 |
| 特殊元素球 | 无 | 4 种（风/岩/草/光） |
| 卡牌系统 | 无 | 5 种道具（含净化） |
| 死锁检测 | 无 | 自动检测卡死状态并弹重置窗 |
| 防掉落系统 | 无 | 每秒检测并拉回掉落敌人 |
| 元素球随机池 | 简单随机 | 无放回 dict 随机池 |
