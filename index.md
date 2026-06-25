---
layout: home
title: Home
---

Hi，这是我的技术博客。

个人开发的作品（游戏、工具）以及留作备忘的技术笔记都放在这里。
每个项目独立成页，可按 wiki 风格浏览。

<button id="home-darkmode-toggle" class="home-darkmode-toggle" aria-label="切换深色模式">🌙</button>

<style>
.home-darkmode-toggle {
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
.home-darkmode-toggle:hover {
  background: #f5f5f5;
}
.dark-mode .home-darkmode-toggle {
  background: #333;
  border-color: rgba(255, 255, 255, 0.2);
  color: #ccc;
}
.dark-mode .home-darkmode-toggle:hover {
  background: #444;
}
</style>

<script>
(function() {
  var btn = document.getElementById('home-darkmode-toggle');
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

- 仓库: [chi-wq/pages](https://github.com/chi-wq/pages)
- 网址: [https://chi-wq.github.io/pages/](https://chi-wq.github.io/pages/)

<script src="{{ '/assets/search.js' | relative_url }}" defer></script>

<div id="wiki-search" class="home-search" data-search-url="{{ '/search.json' | relative_url }}">
  <input id="wiki-search-input" class="wiki-search__input" type="search" placeholder="搜索全站文档..." aria-label="Search">
  <div id="wiki-search-results" class="wiki-search__results"></div>
</div>

<style>
.home-search {
  max-width: 30rem;
  margin: 1.5rem 0;
}
.home-search .wiki-search__results {
  position: static;
  box-shadow: none;
  border: 1px solid rgba(0,0,0,0.12);
  margin-top: 0.25rem;
}
.home-search .wiki-search__results.is-active {
  display: block;
}
.wiki-search__input {
  box-sizing: border-box;
  width: 100%;
  padding: 0.4rem 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 4px;
  font-size: 0.875rem;
  background: transparent;
  color: inherit;
  outline: none;
}
.wiki-search__input:focus {
  border-color: rgba(0, 0, 0, 0.4);
}
.search-result-item {
  display: block;
  padding: 0.5rem 0.6rem;
  text-decoration: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.search-result-item:last-child {
  border-bottom: none;
}
.search-result-item:hover {
  background: rgba(0, 0, 0, 0.04);
}
.search-result-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #333;
}
.search-result-summary {
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.15rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.search-no-results {
  padding: 0.5rem 0.6rem;
  font-size: 0.8rem;
  color: #aaa;
}
.dark-mode .wiki-search__input {
  border-color: rgba(255,255,255,0.2);
  color: #e0e0e0;
}
.dark-mode .wiki-search__results {
  background: #1e1e1e;
  border-color: rgba(255,255,255,0.15);
}
.dark-mode .search-result-title { color: #ccc; }
.dark-mode .search-result-summary { color: #999; }
.dark-mode .search-result-item { border-bottom-color: rgba(255,255,255,0.08); }
.dark-mode .search-result-item:hover { background: rgba(255,255,255,0.06); }

/* ── Home page dark mode ── */
.dark-mode, .dark-mode body, .dark-mode .page-content,
.dark-mode .site-header, .dark-mode .site-footer {
  background: #121212;
  color: #e0e0e0;
}
.dark-mode .wrapper { background: transparent; }
.dark-mode a { color: #6cb6ff; }
.dark-mode a:hover { color: #89ceff; }
.dark-mode h1, .dark-mode h2, .dark-mode h3,
.dark-mode .site-title { color: #e8e8e8; }
.dark-mode .site-nav .page-link { color: #ccc; }
.dark-mode hr { border-color: rgba(255,255,255,0.1); }
.dark-mode .site-footer { border-top-color: rgba(255,255,255,0.1); }
.dark-mode .site-footer a { color: #6cb6ff; }
.dark-mode details { color: #d0d0d0; }
.dark-mode .post-list h3 a { color: #6cb6ff; }
.dark-mode .post-meta { color: #999; }
.dark-mode p code,
.dark-mode li code,
.dark-mode td code {
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

.search-result-preview {
  font-size: 0.85rem;
  color: #555;
  margin-top: 0.3rem;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  border-left: 2px solid #ddd;
  padding-left: 0.4rem;
}
.search-highlight {
  background: #fff3a8;
  padding: 0 0.1em;
  border-radius: 2px;
}
.dark-mode .search-highlight {
  background: #665d20;
  color: #e8e0b0;
}
</style>

## {{ site.entries_section_title | default: '投稿 / Entries' }}

{% assign wiki_roots = site.entries | where_exp: 'd', 'd.wiki_root == true' | sort: 'wiki_order' %}
{% if wiki_roots and wiki_roots.size > 0 %}
  {% for root in wiki_roots %}
{% if root.wiki_key == 'element-odyssey' %}
<details>
<summary><strong><a href="{{ root.url | relative_url }}" onclick="event.stopPropagation()">{{ root.title }}</a></strong> <small>（旧版 v0.03 日文文档，点击展开）</small></summary>
{% else %}
### <a href="{{ root.url | relative_url }}">{{ root.title }}</a>
{% endif %}
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
{% if root.wiki_key == 'element-odyssey' %}
</details>
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
    <li><em>（目前以 wiki 形式的项目为主）</em></li>
  {% endif %}
</ul>