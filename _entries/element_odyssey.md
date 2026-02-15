---
title: エレメント・オデッセイ
permalink: /entries/element-odyssey/
tags: [ゲーム]
summary: "元素反応を使った小さめの PvE 試練（ゲーム紹介＋開発ノート＋制作/運用メモ）。"
description: "Element Odyssey（エレメント・オデッセイ）。ゲーム紹介・開発ノート・制作/運用メモへのリンクまとめ。"
wiki_root: true
wiki_key: element-odyssey
wiki_order: 0
---

{{ page.title }} は、**元素反応**を「副付着→主一撃」の二段攻撃で狙う、ソロ向けの PvE 試練です。

このページはハブです。導線としては「ゲーム紹介 →（気になったら）開発ノート」、必要なら「制作/運用メモ」も参照、くらいを想定しています。

用語や挙動の根拠リンクは、別枠の参考資料集にまとめています（採用者向けの“迷子防止”用）。
- [別枠：参考資料集]({{ '/entries/element-odyssey/references/' | relative_url }})

ざっくり導線
- ルールと動画：ゲーム紹介
- 仕組みや実装メモ：開発ノート
- 制作前提/運用/注意点：制作/運用メモ

（左サイドバーが表示されない環境向けに、下にもリンクを置いておきます。）

<ul>
	{% assign children = site.entries | where: 'wiki_key', page.wiki_key | where_exp: 'd', 'd.wiki_root != true' | sort: 'wiki_order' %}
	{% for child in children %}
		<li><a href="{{ child.url | relative_url }}">{{ child.title }}</a></li>
	{% endfor %}
</ul>

関連リンク
- リポジトリ: <a href="https://github.com/chi-wq/genshin-ts-element_odyssey" target="_blank" rel="noopener">chi-wq/genshin-ts-element_odyssey</a>
