# pages

このリポジトリは、GitHub Pages で公開している **Jekyll のブログ/ノートサイト**のソースです。

- サイトURL: https://chi-wq.github.io/pages/

## 構成

- `_posts/`：ブログ記事（日時ベース）
- `_entries/`：ノート/条目（collection）。必要に応じて wiki 風に整理
- `assets/`：CSS/JS/画像などの静的ファイル

ページによっては、左サイドバーのツリー表示のために front matter で
`wiki_key` / `wiki_order` / `wiki_root` を使います（必要なページのみ設定）。
