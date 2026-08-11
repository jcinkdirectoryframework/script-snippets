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
        console.log('🔍 timeAgo received:', s);
        
        if (!s) {
            console.log('❌ Input is empty/null');
            return 'No posts yet';
        }
        
        // Check if it's already an absolute date
        const d = new Date(s);
        if (!isNaN(d)) {
            console.log('✅ Parsed as valid date:', d);
            const result = calculateTimeAgo(d);
            console.log('📅 Calculated time ago:', result);
            return result;
        }
        
        console.log('⚠️ Not a valid date, trying to parse relative time...');
        
        // Parse relative time strings like "6 minutes ago", "2 hours ago", etc.
        const match = s.match(/^(\d+)\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\s+ago$/i);
        if (match) {
            console.log('✅ Matched relative time pattern:', match);
            const num = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            const now = new Date();
            console.log('🕐 Current time:', now);
            
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
            console.log('📅 Calculated past date:', pastDate);
            const result = calculateTimeAgo(pastDate);
            console.log('📅 Calculated time ago:', result);
            return result;
        }
        
        // Handle "Just now" or other special cases
        if (s.toLowerCase() === 'just now' || s === 'Now') {
            console.log('✅ Matched "Just now"');
            return 'Just now';
        }
        
        console.log('❌ Could not parse input');
        return 'Unavailable';
    }

    async function updateSubaccounts(s) {
        console.log('🚀 Starting updateSubaccounts');
        if (s.dataset.lastPostLoaded) {
            console.log('⏭️ Already loaded, skipping');
            return;
        }
        s.dataset.lastPostLoaded = 1;
        const accounts = [...s.options].filter(o => o.value !== '------------');
        console.log(`👥 Found ${accounts.length} accounts to process`);
        
        await Promise.all(accounts.map(async o => {
            const n = o.textContent.trim();
            console.log(`🔎 Processing account: ${n} (ID: ${o.value})`);
            try {
                const url = `/index.php?showuser=${o.value}`;
                console.log(`🌐 Fetching: ${url}`);
                const response = await fetch(url);
                console.log(`📡 Response status: ${response.status}`);
                const h = await response.text();
                console.log(`📄 HTML length: ${h.length} characters`);
                
                // Log first 500 chars of HTML to see what's there
                console.log(`📄 HTML preview: ${h.substring(0, 500)}...`);
                
                const parsed = new DOMParser().parseFromString(h, 'text/html');
                const lastPostElement = parsed.querySelector('.last-post');
                console.log(`🔍 .last-post element found:`, lastPostElement);
                
                let d;
                if (lastPostElement) {
                    d = lastPostElement.textContent.trim();
                    console.log(`📝 Raw .last-post text: "${d}"`);
                } else {
                    console.log(`❌ No .last-post element found on page`);
                    // Try to find any element that might contain last post info
                    const allSpans = parsed.querySelectorAll('span');
                    console.log(`🔍 Found ${allSpans.length} span elements on page`);
                    for (const span of allSpans) {
                        const text = span.textContent.trim();
                        if (text.includes('ago') || text.includes('minute') || text.includes('hour') || text.includes('day')) {
                            console.log(`🔍 Found potential match in span: "${text}"`);
                        }
                    }
                    d = undefined;
                }
                
                const result = timeAgo(d);
                console.log(`✅ Final result for ${n}: "${result}"`);
                o.textContent = `${n} - Last post: ${result}`;
            } catch (e) {
                console.error(`❌ Error processing ${n}:`, e);
                o.textContent = `${n} - Last post: Unavailable`;
            }
        }));
        console.log('✅ updateSubaccounts complete');
    }

    const c = document.querySelector('#subacct_link');
    if (!c) {
        console.log('❌ #subacct_link not found');
        return;
    }
    console.log('✅ #subacct_link found');
    
    const o = new MutationObserver(() => {
        console.log('👀 MutationObserver triggered');
        const s = c.querySelector('#subaccounts_menu select');
        if (s) {
            console.log('✅ Found #subaccounts_menu select, disconnecting observer and updating');
            o.disconnect();
            updateSubaccounts(s);
        } else {
            console.log('⏳ #subaccounts_menu select not found yet');
        }
    });
    o.observe(c, { childList: true, subtree: true });
    console.log('👀 MutationObserver set up');
})();
