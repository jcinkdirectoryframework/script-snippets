(() => {
    function calcTimeAgo(date) {
        const s = Math.floor((new Date() - date) / 1e3);
        if (s < 60) return 'Just now';
        const m = Math.floor(s / 60);
        if (m < 60) return `${m} minute${m > 1 ? 's' : ''} ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
        const d = Math.floor(h / 24);
        if (d < 7) return `${d} day${d > 1 ? 's' : ''} ago`;
        const w = Math.floor(d / 7);
        if (d < 30) return `${w} week${w > 1 ? 's' : ''} ago`;
        const mo = Math.floor(d / 30);
        if (d < 365) return `${mo} month${mo > 1 ? 's' : ''} ago`;
        const y = Math.floor(d / 365);
        return `${y} year${y > 1 ? 's' : ''} ago`;
    }

    function parseTime(s) {
        if (!s) return 'No posts yet';
        const d = new Date(s);
        if (!isNaN(d)) return calcTimeAgo(d);
        const m = s.match(/^(\d+)\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\s+ago$/i);
        if (m) {
            const n = +m[1];
            const u = m[2].toLowerCase();
            const now = new Date();
            const past = new Date(now);
            if (u.startsWith('minute')) past.setMinutes(now.getMinutes() - n);
            else if (u.startsWith('hour')) past.setHours(now.getHours() - n);
            else if (u.startsWith('day')) past.setDate(now.getDate() - n);
            else if (u.startsWith('week')) past.setDate(now.getDate() - n * 7);
            else if (u.startsWith('month')) past.setMonth(now.getMonth() - n);
            else if (u.startsWith('year')) past.setFullYear(now.getFullYear() - n);
            return calcTimeAgo(past);
        }
        return s.toLowerCase() === 'just now' || s === 'Now' ? 'Just now' : 'Unavailable';
    }

    async function update(select) {
        if (select.dataset.loaded) return;
        select.dataset.loaded = 1;
        const opts = [...select.options].filter(o => o.value && o.value !== '------------' && !isNaN(o.value));
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

    function find() {
        const s = document.querySelector('#subacct_link select');
        if (s && [...s.options].some(o => o.value && o.value !== '------------' && !isNaN(o.value))) {
            update(s);
            return true;
        }
        return false;
    }

    if (!find()) {
        const el = document.querySelector('#subacct_link');
        if (el) {
            const obs = new MutationObserver(() => { if (find()) obs.disconnect(); });
            obs.observe(el, { childList: true, subtree: true });
        }
    }
})();
