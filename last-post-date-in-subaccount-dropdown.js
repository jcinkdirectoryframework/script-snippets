(() => {
    function timeAgo(s) {
        if (!s) return 'No posts yet';
        const d = new Date(s);
        if (isNaN(d)) return 'Unavailable';
        const x = Math.floor((new Date - d) / 1e3);
        if (x < 60) return 'Just now';
        const m = Math.floor(x / 60);
        if (m < 60) return `${m} minute${m > 1 ? 's' : ''} ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
        const d2 = Math.floor(h / 24);
        if (d2 < 7) return `${d2} day${d2 > 1 ? 's' : ''} ago`;
        const w = Math.floor(d2 / 7);
        if (d2 < 30) return `${w} week${w > 1 ? 's' : ''} ago`;
        const mo = Math.floor(d2 / 30);
        if (d2 < 365) return `${mo} month${mo > 1 ? 's' : ''} ago`;
        const y = Math.floor(d2 / 365);
        return `${y} year${y > 1 ? 's' : ''} ago`;
    }

    async function updateSubaccounts(s) {
        if (s.dataset.lastPostLoaded) return;
        s.dataset.lastPostLoaded = 1;
        const accounts = [...s.options].filter(o => o.value !== '------------');
        await Promise.all(accounts.map(async o => {
            const n = o.textContent.trim();
            try {
                const h = await (await fetch(`/index.php?showuser=${o.value}`)).text();
                const d = new DOMParser().parseFromString(h, 'text/html').querySelector('.last-post')?.textContent.trim();
                o.textContent = `${n} - Last post: ${timeAgo(d)}`;
            } catch (e) {
                o.textContent = `${n} - Last post: Unavailable`;
            }
        }));
    }

    const c = document.querySelector('#subacct_link');
    if (!c) return;
    const o = new MutationObserver(() => {
        const s = c.querySelector('#subaccounts_menu select');
        if (s) { o.disconnect(); updateSubaccounts(s); }
    });
    o.observe(c, { childList: true, subtree: true });
})();
