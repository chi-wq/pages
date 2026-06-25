---
---
(function () {
  var searchInput, searchResults, searchWrapper;

  function initSearch() {
    searchWrapper = document.getElementById('wiki-search');
    searchInput = document.getElementById('wiki-search-input');
    searchResults = document.getElementById('wiki-search-results');

    if (!searchInput || !searchResults) return;

    // Load SimpleJekyllSearch from CDN
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/simple-jekyll-search@1.10.0/dest/simple-jekyll-search.min.js';
    script.onload = function () {
      setupSearch();
    };
    document.head.appendChild(script);
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightAllResults() {
    var term = searchInput.value.trim();
    if (!term) return;
    var escaped = escapeRegex(term);
    var items = searchResults.querySelectorAll('.search-result-item');
    if (items.length === 0) return;

    function markText(txt) {
      if (!txt) return txt;
      var parts = txt.split(new RegExp('(' + escaped + ')', 'gi'));
      return parts.map(function(p) {
        return p.toLowerCase() === term.toLowerCase()
          ? '<mark class="search-highlight">' + p + '</mark>'
          : p;
      }).join('');
    }

    items.forEach(function(item) {
      // Highlight title and summary
      ['.search-result-title', '.search-result-summary'].forEach(function(sel) {
        var el = item.querySelector(sel);
        if (!el) return;
        var html = markText(el.textContent);
        if (html !== el.innerHTML) el.innerHTML = html;
      });
      // Preview: show context around first match
      var previewEl = item.querySelector('.search-result-preview');
      if (!previewEl) return;
      var fullText = previewEl.textContent;
      var idx = fullText.toLowerCase().indexOf(term.toLowerCase());
      if (idx === -1) return;
      var CONTEXT = 50;
      var start = Math.max(0, idx - CONTEXT);
      var end = Math.min(fullText.length, idx + term.length + CONTEXT);
      var snippet = (start > 0 ? '...' : '') + fullText.slice(start, end) + (end < fullText.length ? '...' : '');
      previewEl.innerHTML = markText(snippet);
    });
  }

  function setupSearch() {
    var jsonUrl = searchWrapper.getAttribute('data-search-url') || '{{ "/search.json" | relative_url }}';
    var sjs = SimpleJekyllSearch({
      searchInput: document.getElementById('wiki-search-input'),
      resultsContainer: document.getElementById('wiki-search-results'),
      json: jsonUrl,
      searchResultTemplate: '<a href="{url}" class="search-result-item"><div class="search-result-title">{title}</div><div class="search-result-summary">{summary}</div><div class="search-result-preview">{preview}</div></a>',
      noResultsText: '<div class="search-no-results">未找到匹配内容</div>',
      limit: 20,
      fuzzy: false
    });

    // Highlight search terms after results render
    searchInput.addEventListener('input', function() {
      setTimeout(highlightAllResults, 500);
    });

    // Show/hide results on focus/blur
    searchInput.addEventListener('focus', function () {
      searchResults.classList.add('is-active');
    });

    document.addEventListener('click', function (e) {
      if (!searchWrapper.contains(e.target)) {
        searchResults.classList.remove('is-active');
      }
    });

    searchInput.addEventListener('input', function () {
      if (this.value.trim().length > 0) {
        searchResults.classList.add('is-active');
      } else {
        searchResults.classList.remove('is-active');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();