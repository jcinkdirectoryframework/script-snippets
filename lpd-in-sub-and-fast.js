    // === FAST REPLY SUPPORT ===
    // Only run on topic pages where fast reply exists
    if (window.location.href.includes('act=ST')) {
        // Function to update fast reply dropdown (copied from your working update function)
        async function updateFastReply(select) {
            if (select.dataset.loaded) return;
            select.dataset.loaded = 1;
            const opts = [...select.options].filter(o => o.value && o.value !== '0' && o.value !== '-1' && !isNaN(o.value));
            if (!opts.length) return;
            await Promise.all(opts.map(async o => {
                const name = o.textContent.trim();
                try {
                    const res = await fetch(`/index.php?showuser=${o.value}`, { credentials: 'include', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
                    const html = await res.text();
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    const last = doc.querySelector('.last-post')?.textContent.trim();
                    o.textContent = `${name} - Last post: ${parseTime(last)}`;
                } catch {
                    o.textContent = `${name} - Last post: Unavailable`;
                }
            }));
        }

        // Check if fast reply is already open
        const fastSelect = document.querySelector('#post_as_selector select#post_as_menu');
        if (fastSelect) {
            updateFastReply(fastSelect);
        }

        // Watch for fast reply appearing
        const fastObserver = new MutationObserver(() => {
            const s = document.querySelector('#post_as_selector select#post_as_menu');
            if (s && !s.dataset.loaded) {
                updateFastReply(s);
            }
        });
        fastObserver.observe(document.body, { childList: true, subtree: true });
    }
