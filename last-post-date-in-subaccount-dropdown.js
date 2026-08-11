(() => {
    function calculateTimeAgo(date) {
        const x = Math.floor((new Date() - date) / 1e3);
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

    function timeAgo(s) {
        if (!s) return 'No posts yet';
        const d = new Date(s);
        if (!isNaN(d)) return calculateTimeAgo(d);
        
        const match = s.match(/^(\d+)\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\s+ago$/i);
        if (match) {
            const num = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            const now = new Date();
            let pastDate = new Date(now);
            if (unit.startsWith('minute')) pastDate.setMinutes(now.getMinutes() - num);
            else if (unit.startsWith('hour')) pastDate.setHours(now.getHours() - num);
            else if (unit.startsWith('day')) pastDate.setDate(now.getDate() - num);
            else if (unit.startsWith('week')) pastDate.setDate(now.getDate() - (num * 7));
            else if (unit.startsWith('month')) pastDate.setMonth(now.getMonth() - num);
            else if (unit.startsWith('year')) pastDate.setFullYear(now.getFullYear() - num);
            return calculateTimeAgo(pastDate);
        }
        if (s.toLowerCase() === 'just now' || s === 'Now') return 'Just now';
        return 'Unavailable';
    }

    async function updateDropdown(select) {
        if (select.dataset.lastPostLoaded) return;
        select.dataset.lastPostLoaded = 1;
        const accounts = [...select.options].filter(o => o.value && o.value !== '------------' && !isNaN(o.value));
        if (accounts.length === 0) return;
        
        await Promise.all(accounts.map(async o => {
            const n = o.textContent.trim();
            try {
                const h = await (await fetch(`/index.php?showuser=${o.value}`)).text();
                const doc = new DOMParser().parseFromString(h, 'text/html');
                const lastPost = doc.querySelector('.last-post')?.textContent.trim();
                o.textContent = `${n} - Last post: ${timeAgo(lastPost)}`;
            } catch {
                o.textContent = `${n} - Last post: Unavailable`;
            }
        }));
    }

    function findAndUpdateSelect() {
        const select = document.querySelector('#subacct_link select');
        if (select && [...select.options].some(o => o.value && o.value !== '------------' && !isNaN(o.value))) {
            updateDropdown(select);
            return true;
        }
        return false;
    }

    if (!findAndUpdateSelect()) {
        const subLink = document.querySelector('#subacct_link');
        if (subLink) {
            const observer = new MutationObserver(() => {
                if (findAndUpdateSelect()) observer.disconnect();
            });
            observer.observe(subLink, { childList: true, subtree: true });
        }
    }
})();
