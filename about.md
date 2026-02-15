---
layout: page
title: About
permalink: /about/
---

This site is a small collection of tech notes.

作ったものをあとで見返す用に、プロジェクト単位で wiki 形式にまとめています。

## Projects

{% assign wiki_roots = site.entries | where_exp: 'd', 'd.wiki_root == true' | sort: 'title' %}
{% if wiki_roots and wiki_roots.size > 0 %}
	{% for root in wiki_roots %}
### <a href="{{ root.url | relative_url }}">{{ root.title }}</a>
{% if root.summary %}
<p>{{ root.summary }}</p>
{% endif %}

	{% endfor %}
{% else %}
<p><em>No projects yet.</em></p>
{% endif %}