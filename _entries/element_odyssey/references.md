---
title: 別枠：参考資料集
permalink: /entries/element-odyssey/references/
tags: [ゲーム, 参考]
summary: "星々の幻境 / Genshin-TS / Element Odyssey の参照リンク集。"
description: "星々の幻境（Miliastra Wonderland）・Genshin-TS・本プロジェクトの一次情報へのリンク集。用語確認や実装追跡の入口。"
wiki_key: element-odyssey
wiki_order: 43
---

- 親ページ: [エレメント・オデッセイ]({{ '/entries/element-odyssey/' | relative_url }})
- 開発ノート（入口）: [開発ノート（入口）]({{ '/entries/element-odyssey/devnotes/' | relative_url }})
- 関連（別枠）: [制作前提]({{ '/entries/element-odyssey/prereq/' | relative_url }}) / [運用メモ]({{ '/entries/element-odyssey/ops/' | relative_url }})

## このページの使い方

- **用語が分からない**：まず「星々の幻境（制作ツール/ノードグラフ）」→ 次に「Genshin-TS（`stage`/`send`/タイマー等のTS側）」の順に見る
- **挙動の根拠を追う**：最後は必ず `src/main.ts`（一次情報）へ戻る

外部サイトは更新されるので、必要ならページ内検索（Ctrl+F）でキーワードを拾って読む前提。

## 一次情報（本プロジェクト）

- `src/main.ts`（実装の根拠）
  - GitHub: https://github.com/chi-wq/genshin-ts-element_odyssey/blob/main/src/main.ts
  - Raw: https://raw.githubusercontent.com/chi-wq/genshin-ts-element_odyssey/main/src/main.ts

## 公式ドキュメント（Genshin-TS / gsts.moe）

- トップ / 全体像
  - https://gsts.moe/
  - Intro: https://gsts.moe/doc/overview/intro.html
  - Workflow: https://gsts.moe/doc/overview/workflow.html

- グローバル（`stage` / `level` / `self` / `player(1)` など）
  - Global Cheat Sheet: https://gsts.moe/doc/globals/cheatsheet.html
  - Type Mapping: https://gsts.moe/doc/globals/types.html

- イベント/シグナル
  - `g.server` オプション: https://gsts.moe/doc/events/gserver.html
  - Signals（`send` / `onSignal`・登録要件）: https://gsts.moe/doc/events/signals.html

- タイマー
  - Timers: https://gsts.moe/doc/timers/overview.html
  - Closures（キャプチャの挙動）: https://gsts.moe/doc/timers/closures.html

- デバッグ/トラブルシュート
  - Runtime Issues: https://gsts.moe/doc/troubleshooting/runtime.html
  - Common Issues: https://gsts.moe/doc/troubleshooting/common.html

## 参考（星々の幻境：用語/ノードグラフの説明に寄せたページ）

※ここは「公式」ではなく、星々の幻境の画面・用語に寄せた解説として便利な参照。

- 星々の幻境の概要
  - 星々の幻境とは: https://library.althena-soft.com/page/basic/what-is-the-miliastra
  - 星々の箱庭とは: https://library.althena-soft.com/page/basic/what-is-the-miliastra-sandbox
  - 公式チュートリアル: https://library.althena-soft.com/page/basic/official_tutorial

- ノードグラフ基礎（タイマー / 衝突）
  - タイマー（グローバル/ローカルの考え方）: https://library.althena-soft.com/pages/tips/0003-nodegraph-timer-howto
  - 衝突トリガーソース/衝突トリガー: https://library.althena-soft.com/pages/tips/0004-collision-trigger-source

- ノードリファレンス（例）
  - 衝突トリガーをオン/オフ: https://library.althena-soft.com/page/nodes/exec/0040_active_disable_collision_trigger

## 公式チュートリアル（HoYoverse UGC）

※公式ページは言語や用語が中国語ベースのため、こちらのノートで使っている日本語（星々の幻境/星々の箱庭）と表記ゆれが出ます。
用語としては、公式側で「千星奇域」「千星沙箱」「超限模式/经典模式」などの語が使われます（概念の対応を取りたいときの入口）。

- 更新日志（章の追加/変更ログ）: https://act.hoyoverse.com/ys/ugc/tutorial/detail/mhs2w008wf14

## 関連（このサイト内）

- 全体像（状態/イベント/タイマー）: [開発ノート：全体像]({{ '/entries/element-odyssey/devnotes/overview/' | relative_url }})
- 仕様チェックリスト: [開発ノート：仕様メモ]({{ '/entries/element-odyssey/devnotes/spec/' | relative_url }})
- 実装メモ（`src/main.ts` の読み解き）: [開発ノート：実装メモ]({{ '/entries/element-odyssey/devnotes/implementation/' | relative_url }})
