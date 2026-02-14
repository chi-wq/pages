---
layout: home
title: Home
---

Welcome! This is my tech blog.

- Repository: [chi-wq/pages](https://github.com/chi-wq/pages)
- Site: [https://chi-wq.github.io/pages/](https://chi-wq.github.io/pages/)

## {{ site.entries_section_title | default: '投稿 / Entries' }}
<ul>
  {% assign docs = site.entries | sort: 'date' | reverse %}
  {% if docs and docs.size > 0 %}
    {% for doc in docs %}
      <li>
        <a href="{{ doc.url | relative_url }}">{{ doc.title }}</a>
        {% if doc.date %}<small> — {{ doc.date | date: "%Y-%m-%d" }}</small>{% endif %}
      </li>
    {% endfor %}
  {% else %}
    <li><em>まだ投稿はありません / No entries yet.</em></li>
  {% endif %}
</ul>