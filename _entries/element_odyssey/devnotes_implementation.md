---
title: 開発ノート：実装メモ
permalink: /entries/element-odyssey/devnotes/implementation/
tags: [ゲーム, 開発ノート, 実装]
summary: "src/main.ts の実装メモ。"
description: "Element Odyssey の実装メモ。StageMain / GetOrb / ElementAttack などの整理。"
wiki_key: element-odyssey
wiki_order: 24
---

- 親ページ: [エレメント・オデッセイ]({{ '/entries/element-odyssey/' | relative_url }})
- 開発ノート（入口）: [開発ノート（入口）]({{ '/entries/element-odyssey/devnotes/' | relative_url }})
- 関連: [全体像]({{ '/entries/element-odyssey/devnotes/overview/' | relative_url }}) / [制作前提]({{ '/entries/element-odyssey/prereq/' | relative_url }}) / [運用メモ]({{ '/entries/element-odyssey/ops/' | relative_url }})

## 実装メモ（`src/main.ts`）

主要なロジックは [`src/main.ts`](https://github.com/chi-wq/genshin-ts-element_odyssey/blob/main/src/main.ts) にまとまっているので、その見返し用メモ。
「ステージ進行（勝敗・次ステージ）」と「プレイヤー操作（元素切り替え・攻撃）」を、`g.server(...)` と `stage` 変数で組み立てている。

用語の確認や、公式/準公式/一次情報へのリンク集は必要に応じて：
- [別枠：参考資料集]({{ '/entries/element-odyssey/references/' | relative_url }})

## 読み方（星々の幻境 / Genshin-TS 特有の概念）

この章は星々の幻境（Miliastra Wonderland）固有の API が前提なので、最初に “読み替え” を置きます。

- `g.server(...)`：NodeGraph 上の **サーバーノード**定義。`on(...)` / `onSignal(...)` にイベントハンドラを登録する
- `stage` / `level` / `self`：公式のグローバル（現在のグラフが参照している stage/entity のハンドル）。このプロジェクトでは `stage` を状態コンテナとして扱い、`stage.set/get` でステージ進行の状態を永続する
- `send('...')`：ノード間の **シグナル通知**（イベントバス的）
- `GlobalTimer`：エンジン側のタイマー（UI と連動）。`StageTimer` はタイムアウト敗北の入口
- `setTimeout/setInterval`：サーバースコープでは **グラフのタイマーにコンパイル**される（ms 指定）。このプロジェクトでは `setInterval(..., 1000)` を毎秒ループに使う
- 衝突イベント：星々の幻境の言い方だと「加入者エンティティ（入ってきた側）」と「トリガーエンティティ（受け側）」で整理する。`GetOrb` はオーブ（受け側）に衝突トリガーがある前提で、侵入者（プレイヤー/敵）を見て分岐している

公式ドキュメント（用語の確認用）

- https://gsts.moe/doc/globals/cheatsheet.html
- https://gsts.moe/doc/globals/types.html
- https://gsts.moe/doc/events/signals.html
- https://gsts.moe/doc/timers/overview.html
- https://gsts.moe/doc/events/gserver.html

星々の幻境の用語（補助）

- https://library.althena-soft.com/pages/tips/0003-nodegraph-timer-howto
- https://library.althena-soft.com/pages/tips/0004-collision-trigger-source

移植（別エンジンに持っていく）観点では、ここに出てくる `stage 変数` を「仕様のモデル」、`send/Timer` を「イベントと時間の抽象」として読むと追いやすい。

読み順（メモ）
- `StageMain`（進行）
- `GetOrb`（回収・増援）
- `ElementAttack`（2段攻撃・反応表示）

**全体の骨格（3つの server ノード）**

- `StageMain`：ステージ進行の司令塔。初期化、BGM、タイマー開始/停止、敵ウェーブ生成、勝敗判定、決算、次ステージへのテレポート。
- `ElementAttack`：投射物の命中を拾って「副付着 → 主一撃」を実行。反応名/色の計算とステージ変数への書き込みもここ。
- `GetOrb`：オーブ接触（プレイヤー or 敵）を処理。拾える/拾えない、増援トリガー、主/副元素の入れ替え、スコア加点。
- `PlayerMain`：テレポート完了をフックにして、入場/退場（次ステージ開始）シグナルを出す。

**主要なステージ変数（`stage.set(...)`）**

- 進行・勝敗系：`challengeState`（進行中/成功/敗北/中断。3は実質「次ステージ遷移中」）、`currentStage`、`maxStage`
- 敵と湧き：`enemyCount`、`maxEnemies`、`spawnTimer`（現状 10秒ごとのウェーブ用）
- オーブ：`orbsCollectable`（拾えるか）、`collectableTimeout`（拾える残り秒数）、`orbsCollected`、`orbsRequired`
- 元素：`mainElement`、`subElement`（拾得で主/副を入れ替える）
- 反応表示：`reaction`、`reactionColor`、`reactionMsg`、`reactionMsgColor`
- タイマー関連：`stageTimerActive`（タイマー喪失の検知用）、`teleportFrom`（どこから来たか）

補足：`score` はステージ間で累積する前提（初期化でリセットしない）。

**タイマーの扱い（GlobalTimer + setInterval の二重構え）**

時間の概念が2本あります。

1) **見えるタイマー（GlobalTimer）**
- `InitTimer`：ステージ開始前の短い準備用
- `StageTimer`：制限時間（タイムアウト敗北）

2) **毎秒の進行ループ（`setInterval(..., 1000)`）**
- 成功条件（`enemyCount === 0` かつ `orbsCollected >= orbsRequired`）のチェック
- 「拾える時間」のカウントダウン（`collectableTimeout` を毎秒減らす）
- 10秒ごとの増援トリガー（現状は `spawnTimer` を毎秒増やし、閾値で `orbsCollected < orbsRequired` の間だけ `SpawnEnemyWave`）

`stageTimerActive` を別途持ち、`getCurrentGlobalTimerTime('StageTimer')` が 0 以下になったときに
「切断などでタイマーが失われた」ケースとして敗北扱いにしています。

**オーブ生成と「拾える/拾えない」**

**図：オーブ接触の分岐（概念）**

<div class="mermaid">
flowchart TD
  Touch[オーブ接触] --> Who{接触者}
  Who -->|敵| Enemy[オーブ消失 + 増援]
  Who -->|プレイヤー| Player{拾える状態}
  Player -->|Yes| Pickup[回収: 主/副入替 + カウント加算]
  Player -->|No| Miss[拾えない + 増援 / オーブは残る]
  Enemy --> Wave[SpawnEnemyWave]
  Miss --> Wave
  Pickup --> Continue[進行へ戻る]
  Wave --> Continue
</div>

- オーブは固定個数（`orbCount`）をランダム座標に生成し、`customVariable('element')` に元素タイプを持たせています。
- 個数は現状 `orbCount = 10`。
- `orbsCollectable` が false のときは、モデル表示もまとめてオフ（拾える間だけ見える）。
- 敵がオーブに触れた場合は `SpawnEnemyWave` を投げ、オーブも消えます（触られるのがペナルティ）。
- プレイヤーが拾える時間外に触れた場合も `SpawnEnemyWave` を投げる（ミスがリスクになる）。この場合は早期 `return` で、オーブ自体は消えません。

**「副付着 → 主一撃」の実装（投射物命中 → 2段攻撃）**

**図：2段攻撃の流れ（概念）**

<div class="mermaid">
sequenceDiagram
  participant P as 投射物
  participant EA as ElementAttack
  participant S as stage
  P->>EA: 命中イベント
  EA->>EA: 副元素で付着(係数0)
  EA-->>EA: setTimeout(10ms)
  EA->>EA: 主元素で実ダメージ
  EA->>S: reaction/reactionColor を保存
</div>

- `ElementAttackServer` シグナルで投射物を生成し、命中イベントを `ElementAttack` ノードで受けます。
- 命中時、**副元素でダメージ係数0** の攻撃を入れて“付着だけ”を作り、
  その後（現状）**短い遅延（10ms）** で **主元素の実ダメージ** を入れています。
- 反応名（例：溶解/凍結/超電導/蒸発/過負荷/感電）と表示色は、主/副の組み合わせから関数で決めて `stage` に保存。

**スコア計算が “反応” と結びつくところ**

- オーブ回収：（現状）+30。
- 敵が破壊されたとき（`whenEntityIsDestroyed`）に、直前の `stage.reaction` が空でないなら「反応撃破」として（現状）+100。
- 反応撃破メッセージを出したあと `reaction` / `reactionColor` をリセット。
- しばらく（現状 3秒）経って `reaction` が空のままなら `reactionMsg` もクリア。

**敵ウェーブとステージ難易度**

- ステージごとに `maxEnemies` / `orbsRequired` のテーブルを持ち、`currentStage` に合わせて設定。
- 現状のテーブル：`maxEnemies = [12, 18, 24, 30, 36]`、`orbsRequired = [3, 4, 5, 6, 7]`。
- `SpawnEnemyWave` シグナルでは、現在敵数が `maxEnemies` 未満ならウェーブを足す。
- 生成する敵の種類と数はステージ番号で分岐。

**細かい実装メモ（あとで直すなら）**

- デバッグ `print` / `console.log` が多いので、落ち着いたらログレベル的なフラグでまとめると見通しが良くなる。
- `setInterval` / `setTimeout` が複数あるので、タイマーの責務（進行/演出/掃除）は軽くまとめたい。
- 反応判定は今は4元素の組み合わせに固定なので、元素を増やすならテーブル駆動に寄せる余地がある。

## このページの内容とコードの対応（ざっくり）

このページに書いたルールや流れ（例：「遊び方紹介」「ステージの詳細」）が、コード上ではどの処理にあたるかを大まかに対応付けたメモです。

- 主元素／副元素の切り替え：オーブ取得時に `mainElement` / `subElement` を更新し、UI アイコン表示を切り替え
- 「副付着→主一撃」：サブ元素で先に付着（ダメージ 0 相当）→短い遅延後に主元素で実ダメージ、の二段処理
- 反応表示：元素の組み合わせから反応名や表示色を決め、メッセージとして提示
- オーブ回収タイム：一定時間だけ「拾える状態」にして、時間外は拾えない（＋状況によってはペナルティ／増援）
- 敵ウェーブ：オーブ消失（敵接触）や進行状況に応じて増援を生成し、ステージ進行を制御
- スコア：オーブ取得・通常撃破・反応撃破などの加点を累積

※実際の変数名・イベント名・UI ID は実装に依存します。挙動が変わっていないかは、最終的には [`src/main.ts`](https://github.com/chi-wq/genshin-ts-element_odyssey/blob/main/src/main.ts) を見返します。
