(function () {
    function runMermaid() {
        if (!window.mermaid) return;

        var nodes = document.querySelectorAll('.post-content .mermaid');
        if (!nodes || nodes.length === 0) return;

        try {
            window.mermaid.initialize({
                startOnLoad: false,
                theme: 'neutral'
            });

            if (typeof window.mermaid.run === 'function') {
                nodes.forEach(function (node) {
                    try {
                        window.mermaid.run({
                            nodes: [node]
                        });
                    } catch (e) {
                        console.error('Mermaid render failed for a diagram', e);
                    }
                });
                return;
            }

            if (typeof window.mermaid.init === 'function') {
                nodes.forEach(function (node) {
                    try {
                        window.mermaid.init(undefined, node);
                    } catch (e) {
                        console.error('Mermaid render failed for a diagram', e);
                    }
                });
            }
        } catch (e) {
            // Fails open: the page should still be readable.
            console.error('Mermaid render failed', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runMermaid);
    } else {
        runMermaid();
    }
})();