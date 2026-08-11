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
        if (!isNaN(d)) {
            return calculateTimeAgo(d);
        }
        
        const match = s.match(/^(\d+)\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\s+ago$/i);
        if (match) {
            const num = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            const now = new Date();
            let pastDate = new Date(now);
            if (unit.startsWith('minute')) {
                pastDate.setMinutes(now.getMinutes() - num);
            } else if (unit.startsWith('hour')) {
                pastDate.setHours(now.getHours() - num);
            } else if (unit.startsWith('day')) {
                pastDate.setDate(now.getDate() - num);
            } else if (unit.startsWith('week')) {
                pastDate.setDate(now.getDate() - (num * 7));
            } else if (unit.startsWith('month')) {
                pastDate.setMonth(now.getMonth() - num);
            } else if (unit.startsWith('year')) {
                pastDate.setFullYear(now.getFullYear() - num);
            }
            return calculateTimeAgo(pastDate);
        }
        
        if (s.toLowerCase() === 'just now' || s === 'Now') return 'Just now';
        return 'Unavailable';
    }

    async function updateSubaccounts(s) {
        if (s.dataset.lastPostLoaded) return;
        s.dataset.lastPostLoaded = 1;
        const accounts = [...s.options].filter(o => o.value !== '------------' && o.value !== '');
        console.log(`Found ${accounts.length} accounts to process`);
        
        await Promise.all(accounts.map(async o => {
            const n = o.textContent.trim();
            console.log(`Processing: ${n} (ID: ${o.value})`);
            try {
                const h = await (await fetch(`/index.php?showuser=${o.value}`)).text();
                const doc = new DOMParser().parseFromString(h, 'text/html');
                const lastPostElement = doc.querySelector('.last-post');
                let d = lastPostElement?.textContent.trim();
                console.log(`Last post text for ${n}:`, d);
                const result = timeAgo(d);
                o.textContent = `${n} - Last post: ${result}`;
            } catch (e) {
                console.error(`Error processing ${n}:`, e);
                o.textContent = `${n} - Last post: Unavailable`;
            }
        }));
    }

    function findAndUpdateSelect() {
        console.log('🔍 Looking for account select...');
        // Look for the select inside #subacct_link
        let select = document.querySelector('#subacct_link select');
        if (!select) {
            // Also check #sub_bar (it might still be there after being cloned)
            select = document.querySelector('#sub_bar select');
        }
        
        if (select) {
            console.log('✅ Found select!');
            const accounts = [...select.options].filter(o => o.value && o.value !== '------------' && !isNaN(o.value));
            if (accounts.length > 0) {
                updateSubaccounts(select);
                return true;
            } else {
                console.log('⚠️ Select found but no account options');
            }
        } else {
            console.log('❌ No select found yet');
        }
        return false;
    }

    // Wait for the subacct_link to exist
    const c = document.querySelector('#subacct_link');
    if (!c) {
        console.log('❌ #subacct_link not found');
        return;
    }
    console.log('✅ #subacct_link found');

    // Check if select already exists (if the dropdown is already open)
    if (!findAndUpdateSelect()) {
        console.log('⏳ Setting up observer to wait for select...');
        
        // Set up mutation observer on #subacct_link to detect when content changes
        const observer = new MutationObserver(() => {
            console.log('👀 Mutation detected in #subacct_link');
            if (findAndUpdateSelect()) {
                observer.disconnect();
                console.log('✅ Observer disconnected after finding select');
            }
        });
        observer.observe(c, { childList: true, subtree: true, characterData: true });
        
        // Also watch for clicks on the "Switch Account" link
        const switchLink = c.querySelector('a[onclick*="subacct_link"]');
        if (switchLink) {
            console.log('🔗 Found Switch Account link, adding click listener');
            switchLink.addEventListener('click', () => {
                console.log('🔄 Switch Account clicked, waiting for select...');
                // Check after a short delay to let the DOM update
                setTimeout(() => {
                    if (findAndUpdateSelect()) {
                        observer.disconnect();
                        console.log('✅ Observer disconnected after click');
                    }
                }, 100);
            });
        }
        
        // Also watch the body for #sub_bar being moved/cloned
        const bodyObserver = new MutationObserver(() => {
            const subBar = document.querySelector('#sub_bar');
            if (subBar && subBar.querySelector('select')) {
                console.log('👀 #sub_bar found with select!');
                if (findAndUpdateSelect()) {
                    observer.disconnect();
                    bodyObserver.disconnect();
                    console.log('✅ Both observers disconnected');
                }
            }
        });
        bodyObserver.observe(document.body, { childList: true, subtree: true });
    }
})();
