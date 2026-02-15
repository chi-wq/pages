---
title: 別枠：制作前提
permalink: /entries/element-odyssey/prereq/
tags: [ゲーム, ツール]
summary: "制作前提メモ。"
description: "Element Odyssey の制作前提（星々の幻境 / Genshin-TS）。"
wiki_key: element-odyssey
wiki_order: 40
---

- 親ページ: [エレメント・オデッセイ]({{ '/entries/element-odyssey/' | relative_url }})
- 関連: [開発ノート（入口）]({{ '/entries/element-odyssey/devnotes/' | relative_url }})
- 関連: [運用メモ]({{ '/entries/element-odyssey/ops/' | relative_url }})
- 関連: [参考資料集]({{ '/entries/element-odyssey/references/' | relative_url }})

## 制作の前提（星々の幻境 / Genshin-TS）

「星々の幻境」は、原神の UGC（ユーザー制作）コンテンツを作って共有する枠組みとして扱っています。
この作品では、マップ（`.gil`）内のノードグラフ部分をコード（TypeScript）側で管理するために Genshin-TS を使います。

**星々の幻境を選んだ理由**

UGC プラットフォームなら、既存のゲーム内アセットや仕組みを活用しながら、主にゲームロジックの設計・実装に集中できます。
目的は、素早く遊べるプロトタイプを作って検証し、手応えがあれば別環境へ移植して発展させること。

**Genshin-TSを使う理由**

ノードグラフは規模が大きくなると見通しやデバッグが難しくなりやすいので、ロジックをコードとして管理しやすい形に寄せたい、という動機です。

**ワークフロー（生成物・注入）**

- TS → `.gs.ts` → IR `.json` → `.gia` → マップ（`.gil`）へ注入（https://gsts.moe/doc/overview/workflow.html）
- 概要： https://gsts.moe/doc/overview/intro.html / README： https://github.com/josStorer/genshin-ts
- 注入の安全チェック（注入先が空など）：https://gsts.moe/doc/quick-start/inject.html

**制約と注意（実行スコープの前提）**

- 使える TypeScript はサブセット：https://gsts.moe/doc/writing/ts-subset.html
- 条件式は boolean が必要
- `gstsServer*` の再利用関数は「末尾の単一 `return`」など制約がある
- `console.log` は単一引数のみ等、実行スコープでは JS の素の機能が一部使えない場合がある
- トップレベル（ファイル直下）のコードはビルド時に複数回実行されることがある（副作用のある処理の置きどころに注意）

**ざっくり方針**

- ルールを「状態・イベント・タイマー」に落として、あとから手を入れやすい形にする
- 回収タイム／オーブ破壊／増援／スコアを、小さなルールの組み合わせで表現する
