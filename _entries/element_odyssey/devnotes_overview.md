---
title: 開発ノート：全体像
permalink: /entries/element-odyssey/devnotes/overview/
tags: [ゲーム, 開発ノート, 元素, 反応]
summary: "状態/イベント/タイマーの俯瞰。"
description: "Element Odyssey の全体像メモ。勝敗条件と、状態/イベント/タイマーの整理（図あり）。"
wiki_key: element-odyssey
wiki_order: 21
---

- 親ページ: [エレメント・オデッセイ]({{ '/entries/element-odyssey/' | relative_url }})
- 開発ノート（入口）: [開発ノート（入口）]({{ '/entries/element-odyssey/devnotes/' | relative_url }})
- 関連: [実装メモ]({{ '/entries/element-odyssey/devnotes/implementation/' | relative_url }}) / [制作前提]({{ '/entries/element-odyssey/prereq/' | relative_url }}) / [運用メモ]({{ '/entries/element-odyssey/ops/' | relative_url }})

## 要点

- このページでは、ルールを「状態（stage 変数）」「イベント」「タイマー」に分けて俯瞰する。
- 勝敗条件などの結論だけ見たい場合は、[開発ノート（入口）]({{ '/entries/element-odyssey/devnotes/' | relative_url }}) の要点を先に見る。
- 実装の入口は `StageMain`（進行）→ `GetOrb`（回収）→ `ElementAttack`（2段攻撃/反応）。

用語の確認や、挙動の根拠リンク（公式/準公式/一次情報）は必要に応じて：
- [別枠：参考資料集]({{ '/entries/element-odyssey/references/' | relative_url }})

## 用語

- 「星々の幻境」：原神の UGC 編集／共有モード（Miliastra Wonderland）
- [Genshin-TS](https://github.com/josStorer/genshin-ts)：TypeScript で書いたロジックを NodeGraph に変換して扱うためのツールチェーン（モード本体と同義ではありません）

## 星々の幻境 / Genshin-TS の前提（ここだけ読めば追える）

星々の幻境の仕組みを知らない人が見たときに詰まりやすいポイントだけ、最小限で説明します。

- `g.server({ name: 'StageMain' ... }).on(...)`：**サーバー側のノード（NodeGraph）定義**。イベント（生成/破壊/接触/タイマー/シグナル）を入口に、処理を登録している
- `stage` / `level` / `self`：**グローバルに用意されるハンドル**（現在のグラフが参照している stage/entity）。このプロジェクトでは主に `stage` を「状態コンテナ」として使い、`stage.set('xxx', ...)` / `stage.get('xxx')` でステージ進行の状態を保持している（Unity で言う `GameState` / `StageContext` の置き場に近い）
- `stage 変数`：`enemyCount` / `orbsCollected` / `orbsCollectable` のような **ゲームルールの状態**。TS のローカル変数ではなく、ステージ（エンティティ）に永続される
- `send('SpawnEnemyWave')`：**シグナル（イベントバス）**。ノード間で「〜して」の合図を投げる。関数呼び出しというより “イベント通知”
- `GlobalTimer`（`InitTimer` / `StageTimer`）：**エンジン側タイマー**。UI と連動しやすい「見える制限時間」を担当
- `setTimeout/setInterval`：**サーバースコープではグラフのタイマーにコンパイルされる**（ms 指定）。このプロジェクトでは `setInterval(..., 1000)` を「毎秒ループ」として勝敗判定やカウントダウン等の定期ポーリングに使っている
- `prefabId(...)`：**生成するオブジェクトの種別 ID**（敵/オーブ/投射物など）。Unity で言う Prefab 参照に近い
- `faction`：**陣営**。敵かプレイヤーか等の判定に使う（例：オーブ接触が「敵」ならペナルティ）
- `UIControlGroupStatus.On/Off`：**UI レイアウト上の部品を表示/非表示**するためのスイッチ（UI の見え方はレイアウト側の定義に依存）
- 衝突判定：星々の幻境では「衝突トリガーソース（攻め側）」が「衝突トリガー（受け側）」の範囲に入るとイベントが起きる。イベントを受けるノードグラフは **受け側（衝突トリガーを持つ側）** に付ける

補足（公式の挙動メモ）

- `send('signal')` はステージシグナルを投げ、`onSignal` で受ける。シグナル名はエディタ側のシグナル管理に登録が必要
- タイマーは ms。`setInterval` が短すぎる（<=100ms）と警告対象
- 星々の幻境の用語としては「グローバルタイマー（ゲーム全体向け）」と「タイマー（ノードグラフごとのローカル）」が区別されている（発火するとイベント側の「タイマーが発動時」が起点になる）
- 衝突イベントは「加入者エンティティ（入ってきた側＝攻め側）」と「トリガーエンティティ（受け側）」という見方で整理される

参考（公式ドキュメント）

- https://gsts.moe/doc/globals/cheatsheet.html （`player(1)` / `stage` / `level` / `self` など）
- https://gsts.moe/doc/globals/types.html （`send`、`setTimeout/setInterval` の扱い）
- https://gsts.moe/doc/events/signals.html （`send` / `onSignal` と登録要件）
- https://gsts.moe/doc/timers/overview.html （Timers の基本）
- https://gsts.moe/doc/events/gserver.html （`g.server` のオプションと変数定義）

参考（星々の幻境：用語の説明に寄せたページ）

- https://library.althena-soft.com/page/basic/what-is-the-miliastra （星々の幻境とは）
- https://library.althena-soft.com/pages/tips/0003-nodegraph-timer-howto （タイマー：グローバル/ローカルの考え方）
- https://library.althena-soft.com/pages/tips/0004-collision-trigger-source （衝突トリガーソース/衝突トリガー）

### Unity 等に読み替えると

採用者向けの読み替え（このドキュメント上の言葉 → 一般的なゲーム実装）

- `stage` / `stage 変数` → `GameState`（ステージ状態のモデル）
- `GlobalTimer` → エンジンのタイマー + UI 表示
- `setInterval` → `Update()` での定期処理（またはサーバーループ）
- `send(...)` → イベント通知 / メッセージキュー
- `prefabId` → プレハブ参照 / 生成テーブル

このリポジトリのノートは、**仕様（体験）→ 全体像（概念）→ 実装（星々の幻境 API）** で分離しているので、移植する場合は「仕様/全体像」を先に持って行き、実装メモは API 対応表として扱う想定です。

## 全体像（俯瞰メモ）

ルールは「状態（stage 変数）」「イベント（シグナル/接触/破壊）」「タイマー（GlobalTimer + 毎秒ループ）」に分けて整理している。

※数値（秒数・個数・加点など）は実装依存で変わるので、目安は実装メモ側を参照する。

### ゲームのループ（ざっくり）

- 開始：ステージ初期化 → 敵/オーブ生成 →（プレイヤー入場後に）`StageTimer` 開始
- 進行：敵を倒す → 一定条件で「短時間だけオーブが拾える」→ 敵に触られるとオーブ消失＆増援、時間外に触ると増援（オーブは残る）（状況が悪化）
- 目標：敵数が 0 になり、必要数のオーブを回収したら成功 → 決算 → 次ステージへ
- 失敗：制限時間切れ、または（切断などで）タイマーが失われた扱いになったら敗北

### 主要なロジックの置き場

- ほぼ全部が [`src/main.ts`](https://github.com/chi-wq/genshin-ts-element_odyssey/blob/main/src/main.ts)
- 役割分担は `StageMain`（進行） / `ElementAttack`（2段攻撃と反応） / `GetOrb`（オーブ接触） / `PlayerMain`（入退場シグナル）

### 状態・イベント・タイマーの関係

- **状態（stage 変数）**：`challengeState` / `enemyCount` / `orbsCollected` / `orbsCollectable` / `collectableTimeout` / `mainElement` / `subElement` など
- **イベント**：シグナル（例：`SpawnEnemyWave`）と、接触（オーブ）/破壊（敵）で分岐
- **タイマー**：GlobalTimer（見える制限時間）と、毎秒 `setInterval` の更新ループが並走

### 進行状態（`challengeState`）

俯瞰用に粒度を落として、「どういう状態を持っているか」だけ書く（詳細は `src/main.ts` 側）。

- 進行中：通常プレイ中
- 成功：条件達成後、決算・次ステージ遷移へ
- 敗北：タイムアウト、またはタイマー喪失扱い等で終了へ
- 中断（遷移中）：次ステージへ移動中（テレポート中）。進行判定ループを止めたい状態（`challengeState = 3`）

**図：状態遷移（概念）**

<div class="mermaid">
stateDiagram-v2
  [*] --> InProgress: ステージ開始
  InProgress --> Success: 勝利条件成立
  InProgress --> Failed: StageTimer timeout
  InProgress --> Transition: 次ステージへ移動
  Transition --> InProgress: 次ステージ開始
  Success --> [*]
  Failed --> [*]
</div>

### 条件（勝利/失敗）

- 勝利条件（現行実装）：`enemyCount` が 0、かつ `orbsCollected >= orbsRequired`
- 失敗条件（現行実装）：`StageTimer` のタイムアウト、または `stageTimerActive` 絡みの「タイマーが失われた扱い」

このへんは毎秒ループ（`setInterval`）の判定と、GlobalTimer の残り時間チェックの両方にまたがるので、詳細は `src/main.ts` を見返す前提です。

**図：イベントとタイマー（概念）**

<div class="mermaid">
flowchart TD
  Start[ステージ開始] --> Init[初期化: 敵/オーブ生成]
  Init --> Ready[準備: InitTimer -> テレポート]
  Ready --> Timer[入場後にStageTimer開始]
  Timer --> Tick[毎秒ループ]

  Tick -->|勝利条件| Win[成功: 決算→次ステージ]
  Tick -->|時間切れ| Lose[敗北: 決算]
  Tick --> Combat[戦闘イベント]

  Combat -->|敵撃破| Window[回収タイム開始: orbsCollectable を true]
  Window -->|拾う| Swap[主/副元素入替 + 回収数加算]
  Window -->|敵接触| Break[オーブ消失]
  Window -->|時間外接触| Mistake[拾えない / オーブは残る]

  Break --> Reinforce[増援Wave]
  Mistake --> Reinforce
  Swap --> Tick
  Reinforce --> Tick
</div>
