---
layout: page
title: About
permalink: /about/
---

这个站点是个人技术笔记的小合集。

把自己做的东西按项目整理成 wiki 格式，方便日后回顾。

<button id="about-darkmode-toggle" class="about-darkmode-toggle" aria-label="切换深色模式">🌙</button>

<style>
.about-darkmode-toggle {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  font-size: 1.1rem;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.about-darkmode-toggle:hover {
  background: #f5f5f5;
}
.dark-mode, .dark-mode body, .dark-mode .page-content,
.dark-mode .site-header, .dark-mode .site-footer {
  background: #121212;
  color: #e0e0e0;
}
.dark-mode .wrapper { background: transparent; }
.dark-mode a { color: #6cb6ff; }
.dark-mode a:hover { color: #89ceff; }
.dark-mode h1, .dark-mode h2, .dark-mode h3,
.dark-mode .site-title { color: #f0f0f0; }
.dark-mode .site-nav .page-link { color: #ddd; }
.dark-mode hr { border-color: rgba(255,255,255,0.1); }
.dark-mode .site-footer { border-top-color: rgba(255,255,255,0.1); }
.dark-mode .site-footer a { color: #6cb6ff; }
.dark-mode details { color: #e0e0e0; }
.dark-mode .post-meta { color: #999; }
.dark-mode code {
  background: #2d2d2d !important;
  color: #ffd700 !important;
  border: 1px solid rgba(255,255,255,0.15) !important;
  padding: 0.1em 0.3em !important;
  border-radius: 3px !important;
}
.dark-mode pre code {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  color: #e0e0e0 !important;
}
.dark-mode .about-darkmode-toggle {
  background: #333;
  border-color: rgba(255,255,255,0.2);
  color: #ccc;
}
.dark-mode .about-darkmode-toggle:hover { background: #444; }
</style>

<script>
(function() {
  var btn = document.getElementById('about-darkmode-toggle');
  if (!btn) return;
  var html = document.documentElement;
  var stored = localStorage.getItem('darkMode');
  if (stored === 'true' || stored === null) html.classList.add('dark-mode');
  btn.textContent = html.classList.contains('dark-mode') ? '☀️' : '🌙';
  btn.addEventListener('click', function() {
    html.classList.toggle('dark-mode');
    var isDark = html.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    btn.textContent = isDark ? '☀️' : '🌙';
  });
})();
</script>

## Projects

{% assign wiki_roots = site.entries | where_exp: 'd', 'd.wiki_root == true' | sort: 'wiki_order' %}
{% if wiki_roots and wiki_roots.size > 0 %}
	{% for root in wiki_roots %}
{% if root.wiki_key == 'element-odyssey' %}
<details>
<summary><strong><a href="{{ root.url | relative_url }}" onclick="event.stopPropagation()">{{ root.title }}</a></strong> <small>（旧版 v0.03 日文文档）</small></summary>
{% if root.summary %}
<p>{{ root.summary }}</p>
{% endif %}
</details>
{% else %}
### <a href="{{ root.url | relative_url }}">{{ root.title }}</a>
{% if root.summary %}
<p>{{ root.summary }}</p>
{% endif %}
{% endif %}

	{% endfor %}
{% else %}
<p><em>No projects yet.</em></p>
{% endif %}