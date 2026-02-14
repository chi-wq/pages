---
title: エレメント・オデッセイ ver0.03｜遊び方とステージ詳細
permalink: /entries/element-odyssey-ver0-03/
tags: [ゲーム, 元素, 反応, 試練]
---

> 反応を駆使して敵を倒そう。撃破で始まる「オーブ回収タイム」で光る元素オーブを拾い、主/副元素を組み替えて「副付着→主一撃」の連携で元素反応を狙う PvE 試練です。

- リポジトリ: [chi-wq/genshin-ts-element_odyssey](https://github.com/chi-wq/genshin-ts-element_odyssey)

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
- 回収タイム外にプレイヤーがオーブへ触れても拾えません。さらに警戒が上がり、増援が来ることがあります。  

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
- 回収タイム外にプレイヤーが触れても拾えず、増援が来ることがあります。回収タイムを待って拾いに行きましょう。  

### 元素反応の例
- 溶解（氷×炎）／凍結（氷×水）／超電導（氷×雷）  
- 蒸発（炎×水）／過負荷（炎×雷）／感電（水×雷）  
- 同一元素どうしは反応しません。

### スコア
- 元素オーブ取得：+30  
- 通常撃破：+1  
- 反応撃破：+100（反応成立直後の短時間内に撃破）  
スコアはステージをまたいで累積します。

---

## プレイ動画

<video controls preload="metadata" style="max-width:100%;height:auto;">
  <source src="https://github.com/chi-wq/attachments/releases/download/element_odyssey_ver0.03/element_odyssey_ver0.03.mp4" type="video/mp4">
  <track kind="subtitles" srclang="ja" label="日本語" src="{{ '/assets/subtitles/element_odyssey_ver0.03.ja.vtt' | relative_url }}" default>
  Your browser does not support the video tag.
</video>

If the embedded player doesn't work, open it directly:
<a href="https://github.com/chi-wq/attachments/releases/download/element_odyssey_ver0.03/element_odyssey_ver0.03.mp4" target="_blank" rel="noopener">element_odyssey_ver0.03.mp4</a>