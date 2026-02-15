---
layout: home
title: Home
---

Hi, this is my tech blog.

個人開発で作ったもの（ゲーム・ツール）や、あとで見返す用の技術メモを置いています。
プロジェクトごとにページを分けて、wiki っぽく辿れるようにしています。

- Repository: [chi-wq/pages](https://github.com/chi-wq/pages)
- Site: [https://chi-wq.github.io/pages/](https://chi-wq.github.io/pages/)

## {{ site.entries_section_title | default: '投稿 / Entries' }}

{% assign wiki_roots = site.entries | where_exp: 'd', 'd.wiki_root == true' | sort: 'title' %}
{% if wiki_roots and wiki_roots.size > 0 %}
  {% for root in wiki_roots %}
### <a href="{{ root.url | relative_url }}">{{ root.title }}</a>
{% if root.summary %}
<p>{{ root.summary }}</p>
{% endif %}
{% assign children = site.entries | where: 'wiki_key', root.wiki_key | where_exp: 'd', 'd.wiki_root != true' | sort: 'wiki_order' %}
{% if children and children.size > 0 %}
<ul>
  {% for child in children %}
  <li>
    <a href="{{ child.url | relative_url }}">{{ child.title }}</a>
    {% if child.summary %}<small> — {{ child.summary }}</small>{% endif %}
  </li>
  {% endfor %}
</ul>
{% endif %}

  {% endfor %}

---
{% endif %}

<ul>
  {% assign non_wiki_docs = site.entries | where_exp: 'd', 'd.wiki_key == nil' | sort: 'date' | reverse %}
  {% if non_wiki_docs and non_wiki_docs.size > 0 %}
    {% for doc in non_wiki_docs %}
      <li>
        <a href="{{ doc.url | relative_url }}">{{ doc.title }}</a>
      </li>
    {% endfor %}
  {% else %}
    <li><em>（今のところ、wiki 形式のプロジェクトが中心です）</em></li>
  {% endif %}
</ul>