---
title: 別枠：運用メモ
permalink: /entries/element-odyssey/ops/
tags: [ゲーム, ツール]
summary: "ビルド/注入/デバッグのメモ。"
description: "Element Odyssey の運用メモ。ビルド、注入、デバッグ手順。"
wiki_key: element-odyssey
wiki_order: 41
---

- 親ページ: [エレメント・オデッセイ]({{ '/entries/element-odyssey/' | relative_url }})
- 関連: [開発ノート（入口）]({{ '/entries/element-odyssey/devnotes/' | relative_url }})
- 関連: [制作前提]({{ '/entries/element-odyssey/prereq/' | relative_url }})
- 関連: [参考資料集]({{ '/entries/element-odyssey/references/' | relative_url }})

## 運用メモ（ビルド/注入/デバッグ）

- コードの中心：リポジトリ内の [`src/main.ts`](https://github.com/chi-wq/genshin-ts-element_odyssey/blob/main/src/main.ts)
- 変換設定：`gsts.config.ts`（ビルド対象や出力先、必要に応じて注入設定）
- 生成物（`.gs.ts` / IR `.json` / `.gia`）はローカルで生成される。GitHub 上では見えないことがある

流れ（メモ）

0. （新規作成する場合）`npm create genshin-ts@latest`
1. `npm install`
2. `npm run dev`（増分ビルド／監視）または `npm run build`（フルビルド）
3. 出力された `.gia` を注入 → マップをリロードして確認

デバッグは `print(...)` などのログ出力を中心にして、挙動差が出た場合は `.gs.ts`（展開結果）や IR `.json` で切り分けます。
