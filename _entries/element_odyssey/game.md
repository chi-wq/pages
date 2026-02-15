---
title: ゲーム紹介
permalink: /entries/element-odyssey/game/
tags: [ゲーム, 元素, 反応, 試練]
summary: "ルールのメモと動画。"
description: "Element Odyssey（エレメント・オデッセイ）のルールと見どころ。オーブ回収で主/副元素を入れ替え、二段攻撃で元素反応を狙う PvE 試練。動画あり。"
wiki_key: element-odyssey
wiki_order: 10
---

- 親ページ: [エレメント・オデッセイ]({{ '/entries/element-odyssey/' | relative_url }})
- 関連: [開発ノート（入口）]({{ '/entries/element-odyssey/devnotes/' | relative_url }})

> 反応を駆使して敵を倒そう。撃破で始まる「オーブ回収タイム」で光る元素オーブを拾い、主/副元素を組み替えて「副付着→主一撃」の連携で元素反応を狙う PvE 試練です。

ざっくり概要
- オーブを拾うと主元素が切り替わり、直前の主元素は副元素になります
- 攻撃は「副で付着 → 主で一撃」の二段で、組み合わせ次第で反応が起きます
- 回収タイムや増援があるので、ただ殴るだけより工夫しどころが出ます

関連リンク
- リポジトリ: [chi-wq/genshin-ts-element_odyssey](https://github.com/chi-wq/genshin-ts-element_odyssey)

用語やツール（星々の幻境 / Genshin-TS）まわりの補足は、開発ノートとは別枠に切り出しています：
- [別枠：制作前提]({{ '/entries/element-odyssey/prereq/' | relative_url }})
- [別枠：運用メモ]({{ '/entries/element-odyssey/ops/' | relative_url }})
- [別枠：開発メモ（背景/注意点）]({{ '/entries/element-odyssey/notes/' | relative_url }})

## バージョン情報
- ビルド: ver0.03

---

## 遊び方紹介
- 敵を倒すと短い「オーブ回収タイム」が始まり、フィールドの元素オーブが発光して拾えるようになります。  
- オーブを拾うと主元素がその属性に、直前の主元素は副元素に切り替わります（UI アイコンが即時更新）。  
- 攻撃は二段構成。「副で付着」してから「主で一撃」を入れることで、組み合わせ次第で元素反応が発生します。  
- 反応で仕留めると高得点。全ての敵を倒し、指定数のオーブを集めるとステージクリア。時間切れは失敗です。  

重要な挙動
- 敵がオーブに触れると、オーブは砕けて消え、増援ウェーブが発生します。  
- 回収タイム外にプレイヤーがオーブへ触れても拾えません。さらに **増援ウェーブが発生** します（この場合、オーブ自体は残ります）。  

---

## ステージの詳細

### 目的
敵を倒して安全を作り、各ステージで指定数の元素オーブを集めてスコアを伸ばしましょう。最後に累計スコアが表示されます。

### 流れ
1) オーブ回収タイム  
敵を倒すと短い回収タイムが始まり、オーブが発光して拾えるようになります。  
2) 元素の切り替え  
拾った属性が主元素になり、直前の主元素は副元素に。UI アイコンが即時に反映。  
3) 攻撃と反応  
「副付着→主一撃」の二段で反応が発生。組み合わせにより大きなダメージを与えられます。  
4) クリア条件  
制限時間内に「全敵撃破」かつ「必要オーブ数の達成」を同時に満たすとクリア。  

### オーブのルール（重要）
- 敵が触れるとオーブは砕けて消滅し、増援ウェーブが出現。  
- 回収タイム外にプレイヤーが触れても拾えず、増援ウェーブが発生します（オーブは残る）。回収タイムを待って拾いに行きましょう。  

### 元素反応の例
- 溶解（氷×炎）／凍結（氷×水）／超電導（氷×雷）  
- 蒸発（炎×水）／過負荷（炎×雷）／感電（水×雷）  
- 同一元素どうしは反応しません。

### スコア
- スコアは「オーブ回収」「撃破」「反応での撃破」などで増えます。
- 反応で仕留めるほどスコアが伸びやすい設計です。

※具体的な加点や猶予（秒数）は調整対象になりやすいので、現状値は実装メモを参照します：
- [開発ノート：実装メモ]({{ '/entries/element-odyssey/devnotes/implementation/' | relative_url }})

スコアはステージをまたいで累積します。

---
## 幻境（ステージ）のGUID

7788835694

## プレイ動画

雰囲気は動画がいちばん早いです。

<video id="trailer" controls preload="metadata" style="max-width:100%;height:auto;">
  <source src="https://github.com/chi-wq/attachments/releases/download/element_odyssey_ver0.03.sub/element_odyssey_ver0.03.sub.mp4" type="video/mp4">
  お使いの環境では video タグを再生できません。
</video>

埋め込み再生できない場合は、直接開いてください：
<a href="https://github.com/chi-wq/attachments/releases/download/element_odyssey_ver0.03.sub/element_odyssey_ver0.03.sub.mp4" target="_blank" rel="noopener">element_odyssey_ver0.03.sub.mp4</a>

---

## 開発ノート

このページはプレイヤー向けの説明が中心です。実装に依存する細部（加点、秒数、分岐の厳密さなど）は、一次情報（`src/main.ts`）側を根拠に整理しています。
- 根拠リンク集: [別枠：参考資料集]({{ '/entries/element-odyssey/references/' | relative_url }})
- 実装メモ: [開発ノート：実装メモ]({{ '/entries/element-odyssey/devnotes/implementation/' | relative_url }})

### 仕様メモ（短い版）

開発ノートにある「仕様メモ（機能と体験だけ）」を、プレイヤー向けに短くまとめたものです。

- 目標：制限時間の中で、戦闘→反応→オーブ回収の判断を回してクリアを目指す
- 勝利：全敵撃破 + 必要数のオーブ回収（この作品の基本形）
- 失敗：時間切れ（または進行不能を避けるための敗北扱い）
- HUD：残り時間 / 回収数 / 反応表示 / 主・副元素アイコン
- 安定性：同時敵数やオーブ数に上限を置き、詰まりが起きた場合は無限待ちにならない逃げ道を用意する

仕組みや実装のメモは開発ノート側にまとめています。
- [開発ノート（入口）]({{ '/entries/element-odyssey/devnotes/' | relative_url }})