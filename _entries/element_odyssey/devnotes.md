---
title: 開発ノート（入口）
permalink: /entries/element-odyssey/devnotes/
tags: [ゲーム, 開発ノート, 元素, 反応]
summary: "開発ノート各ページへの入口。"
description: "Element Odyssey の開発ノート（入口）。全体像・仕様・実装への導線。制作/運用メモも別枠で参照。"
wiki_key: element-odyssey
wiki_order: 20
---

- 親ページ: [エレメント・オデッセイ]({{ '/entries/element-odyssey/' | relative_url }})
- 関連: [ゲーム紹介]({{ '/entries/element-odyssey/game/' | relative_url }})

## 入口（要点）

このページは各メモへのリンクと、要点だけをまとめます。

用語や挙動の根拠リンク（公式/準公式/一次情報）は、必要に応じて参考資料集へ：
- [別枠：参考資料集]({{ '/entries/element-odyssey/references/' | relative_url }})

- 全体像（最初に読む）：[開発ノート：全体像]({{ '/entries/element-odyssey/devnotes/overview/' | relative_url }})
- 仕様（機能と体験）：[開発ノート：仕様メモ]({{ '/entries/element-odyssey/devnotes/spec/' | relative_url }})
- 実装（`src/main.ts`）：[開発ノート：実装メモ]({{ '/entries/element-odyssey/devnotes/implementation/' | relative_url }})

制作/運用メモ（別枠）

- 制作前提（星々の幻境 / Genshin-TS）：[別枠：制作前提]({{ '/entries/element-odyssey/prereq/' | relative_url }})
- 運用メモ（ビルド/注入/デバッグ）：[別枠：運用メモ]({{ '/entries/element-odyssey/ops/' | relative_url }})
- 開発メモ（背景/注意点）：[別枠：開発メモ（背景/注意点）]({{ '/entries/element-odyssey/notes/' | relative_url }})
- 参考資料集（公式/準公式/一次情報のリンク）：[別枠：参考資料集]({{ '/entries/element-odyssey/references/' | relative_url }})

## 要点

- コアループ：敵を倒す → 短時間だけオーブ回収 → 主/副元素を組み替えて反応を狙う
- 勝利：敵を倒し切って、必要数のオーブを回収できたら成功（細部は全体像の「条件」を見る）
- 失敗：制限時間切れ、またはタイマー喪失扱い等で敗北（細部は全体像の「条件」を見る）
- 進行の要：状態（`challengeState` など）と、定期的な条件チェックで遷移する
- 実装の入口：`StageMain`（進行）→ `GetOrb`（回収）→ `ElementAttack`（2段攻撃/反応）
