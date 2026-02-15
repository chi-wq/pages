(function () {
    function slugify(text) {
        return String(text)
            .trim()
            .toLowerCase()
            .replace(/[^\w\u00C0-\u024f\u4e00-\u9fff\u3040-\u30ff\u3400-\u4dbf\uac00-\ud7af\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    function ensureId(heading, usedIds) {
        if (heading.id && !usedIds.has(heading.id)) {
            usedIds.add(heading.id);
            return heading.id;
        }

        var base = slugify(heading.textContent || '') || 'section';
        var candidate = base;
        var i = 2;
        while (usedIds.has(candidate)) {
            candidate = base + '-' + i;
            i += 1;
        }
        heading.id = candidate;
        usedIds.add(candidate);
        return candidate;
    }

    function buildToc(headings) {
        var tocRoot = document.createElement('ul');
        tocRoot.className = 'toc-list';

        var minLevel = 99;
        for (var i = 0; i < headings.length; i++) {
            var level = parseInt(headings[i].tagName.substring(1), 10);
            if (level < minLevel) minLevel = level;
        }

        var stack = [tocRoot];
        var currentLevel = minLevel;

        for (var j = 0; j < headings.length; j++) {
            var h = headings[j];
            var hLevel = parseInt(h.tagName.substring(1), 10);

            while (hLevel > currentLevel) {
                var lastLi = stack[stack.length - 1].lastElementChild;
                var newUl = document.createElement('ul');
                newUl.className = 'toc-list';
                if (lastLi) {
                    lastLi.appendChild(newUl);
                    stack.push(newUl);
                }
                currentLevel += 1;
            }

            while (hLevel < currentLevel && stack.length > 1) {
                stack.pop();
                currentLevel -= 1;
            }

            var li = document.createElement('li');
            li.className = 'toc-item toc-level-' + hLevel;

            var a = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = (h.textContent || '').trim();
            li.appendChild(a);
            stack[stack.length - 1].appendChild(li);
        }

        return tocRoot;
    }

    document.addEventListener('DOMContentLoaded', function () {
        var container = document.querySelector('.wiki-content');
        var tocHost = document.querySelector('.toc-sidebar__nav');
        var tocAside = document.querySelector('.toc-sidebar');

        if (!container || !tocHost || !tocAside) return;

        var headings = Array.prototype.slice
            .call(container.querySelectorAll('h2, h3, h4'))
            .filter(function (h) {
                return (h.textContent || '').trim().length > 0;
            });

        if (headings.length === 0) {
            tocAside.style.display = 'none';
            return;
        }

        var usedIds = new Set();
        var existing = Array.prototype.slice.call(document.querySelectorAll('[id]'));
        for (var i = 0; i < existing.length; i++) usedIds.add(existing[i].id);

        for (var j = 0; j < headings.length; j++) ensureId(headings[j], usedIds);

        var toc = buildToc(headings);
        tocHost.appendChild(toc);
    });
})();