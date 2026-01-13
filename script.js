        // Init
        const i18n = {
            CN: { workspace: "工作区", blog: "博客", search_ph: "搜索专辑 (如: Jay Chou)" },
            TW: { workspace: "工作區", blog: "部落格", search_ph: "搜尋專輯 (如: Jay Chou)" },
            EN: { workspace: "Workspace", blog: "Blog", search_ph: "Search Album..." }
        };
        let currLang = 'CN';
        let currStyle = 'jewel';
        let currentAlbumData = null;
        const colorThief = new ColorThief();

        window.onload = () => { fetchAlbum('Fantasy Jay Chou'); }

        function toggleSidebar() { document.getElementById('sidebar').classList.toggle('collapsed'); }
        function toggleMenu(e, id) {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-menu').forEach(m => { if (m.id !== id) m.classList.remove('show'); });
            document.getElementById(id).classList.toggle('show');
        }
        window.onclick = () => document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));

        function setLang(lang, el) {
            currLang = lang;
            document.querySelectorAll('#lang-menu .menu-option').forEach(o => o.classList.remove('selected'));
            el.classList.add('selected');
            const labels = { CN: '简体中文', TW: '繁體中文', EN: 'English' };
            document.getElementById('label-lang').innerText = labels[lang];
            document.querySelectorAll('[data-i18n]').forEach(elem => {
                const key = elem.getAttribute('data-i18n');
                if (i18n[lang][key]) elem.innerText = i18n[lang][key];
            });
            document.getElementById('inp-search').placeholder = i18n[lang].search_ph;
        }

        function switchStyle(style, el) {
            currStyle = style;
            document.querySelectorAll('#style-menu .menu-option').forEach(o => o.classList.remove('selected'));
            el.classList.add('selected');
            document.getElementById('label-style').innerText = style === 'liquid' ? 'Liquid Glass' : 'Classic Vibe';

            const card = document.getElementById('vinyl-card');
            card.className = '';
            card.classList.add(`style-${style}`);

            const isLiq = style === 'liquid';
            document.getElementById('bg-liquid').style.display = isLiq ? 'block' : 'none';
            document.getElementById('content-liquid').style.display = isLiq ? 'flex' : 'none';
            document.getElementById('grain-jewel').style.display = isLiq ? 'none' : 'block';
            document.getElementById('content-jewel').style.display = isLiq ? 'none' : 'flex';
        }

        // Search
        let timer;
        const inp = document.getElementById('inp-search');
        inp.addEventListener('input', (e) => {
            clearTimeout(timer);
            const val = e.target.value.trim();
            if (val.length < 2) return;

            // Check if it's a URL (Spotify or QQ Music)
            if (val.includes('open.spotify.com') || val.includes('y.qq.com')) {
                // URL - pass directly to fetchAlbum, which will search iTunes
                // The backend API will handle URL parsing if needed
                timer = setTimeout(() => fetchAlbum(val), 500);
            } else {
                // Regular search
                timer = setTimeout(() => doSearch(val), 500);
            }
        });

        async function doSearch(q) {
            try {
                // Logic Update: TW -> TW Store (zh_TW), Others -> US Store (en_US)
                const isTW = currLang === 'TW';
                const langParam = isTW ? 'zh_TW' : 'en_US';
                const countryParam = isTW ? 'TW' : 'US';

                const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=album&limit=5&lang=${langParam}&country=${countryParam}`);
                const data = await res.json();
                const list = document.getElementById('suggestions');
                list.innerHTML = '';
                data.results.forEach(alb => {
                    const d = document.createElement('div');
                    d.className = 'suggestion-item';
                    d.innerHTML = `<img src="${alb.artworkUrl60}" style="width:40px;border-radius:4px"><div><div>${alb.collectionName}</div><div style="font-size:12px;opacity:0.6">${alb.artistName}</div></div>`;
                    d.onclick = () => { loadAlbum(alb); list.style.display = 'none'; inp.value = alb.collectionName; };
                    list.appendChild(d);
                });
                list.style.display = 'block';
            } catch (e) { console.error("Search failed:", e); }
        }

        async function fetchAlbum(q) {
            try {
                let searchQuery = q;

                // Hide suggestions list
                const list = document.getElementById('suggestions');
                list.style.display = 'none';

                // Check if it's a QQ Music URL
                if (q.includes('y.qq.com')) {
                    console.log('🎵 Detected QQ Music URL, resolving via backend...');
                    const resolved = await resolveQQMusicUrl(q);
                    if (resolved) {
                        searchQuery = resolved;
                        console.log('✅ Resolved to:', searchQuery);
                    } else {
                        console.error('❌ Failed to resolve QQ Music URL');
                        return;
                    }
                }
                // Check if it's a Spotify URL
                else if (q.includes('open.spotify.com')) {
                    console.log('🎵 Detected Spotify URL, resolving...');
                    const resolved = await resolveSpotifyUrl(q);
                    if (resolved) {
                        searchQuery = resolved;
                        console.log('✅ Resolved to:', searchQuery);
                    } else {
                        console.error('❌ Failed to resolve Spotify URL, trying direct search');
                        // Fallback: try direct search
                    }
                }

                const isTW = currLang === 'TW';
                const langParam = isTW ? 'zh_TW' : 'en_US';
                const countryParam = isTW ? 'TW' : 'US';

                console.log('🔍 Searching iTunes for:', searchQuery);
                const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=album&limit=1&lang=${langParam}&country=${countryParam}`);
                const d = await res.json();
                if (d.results.length) {
                    console.log('✅ Found album:', d.results[0].collectionName);
                    loadAlbum(d.results[0]);
                } else {
                    console.warn('⚠️ No results found for:', searchQuery);
                }
            } catch (e) {
                console.error("❌ Fetch album failed:", e);
            }
        }

        // Helper to resolve QQ Music URL (via backend proxy to avoid CORS)
        async function resolveQQMusicUrl(qqUrl) {
            try {
                console.log('Resolving QQ Music URL via backend proxy...');

                // Use production URL if on production, otherwise use relative path
                const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                    ? '' // Relative path for local development
                    : 'https://covershare.aronnax.site'; // Production URL

                const response = await fetch(`${apiBase}/api/resolve-qqmusic`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: qqUrl })
                });

                const data = await response.json();

                if (data.success) {
                    console.log(`✅ Resolved to: ${data.searchQuery}`);
                    return data.searchQuery;
                } else {
                    console.error('❌ Failed to resolve:', data.error);
                    return null;
                }
            } catch (e) {
                console.error("❌ Error resolving QQ Music URL:", e);
                return null;
            }
        }

        // Helper to resolve Spotify URL (via backend proxy to avoid CORS)
        async function resolveSpotifyUrl(spotifyUrl) {
            try {
                console.log('Resolving Spotify URL via backend proxy...');

                // Use production URL if on production, otherwise use relative path
                const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                    ? ''
                    : 'https://covershare.aronnax.site';

                const response = await fetch(`${apiBase}/api/resolve-spotify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: spotifyUrl })
                });

                const data = await response.json();

                if (data.success) {
                    console.log(`✅ Resolved to: ${data.searchQuery}`);
                    return data.searchQuery;
                } else {
                    console.error('❌ Failed to resolve:', data.error);
                    return null;
                }
            } catch (e) {
                console.error("❌ Error resolving Spotify URL:", e);
                return null;
            }
        }

        // --- Core Font Logic ---
        function checkCJK(text) {
            const regex = /[\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/;
            return regex.test(text);
        }

        function loadAlbum(data) {
            currentAlbumData = data;
            const url = data.artworkUrl100.replace('100x100bb', '600x600bb');
            const year = data.releaseDate.slice(0, 4);
            const dateFull = data.releaseDate.slice(0, 10).replace(/-/g, '.');
            const genre = data.primaryGenreName;

            // --- Dynamic Sizing Logic ---
            const getLen = (str) => {
                let len = 0;
                for (let i = 0; i < str.length; i++) len += str.charCodeAt(i) > 255 ? 2 : 1;
                return len;
            };

            const tLen = getLen(data.collectionName);
            const aLen = getLen(data.artistName);

            let tClass = '', aClass = '', spineClass = '';

            // Title Sizing
            if (tLen > 60) tClass = 'size-huge';
            else if (tLen > 40) tClass = 'size-vlong';
            else if (tLen > 25) tClass = 'size-long';
            else if (tLen > 15) tClass = 'size-medium';

            // Artist Sizing
            if (aLen > 40) aClass = 'size-vlong';
            else if (aLen > 25) aClass = 'size-long';

            // Spine Sizing
            const totalSpineLen = tLen + aLen;
            if (totalSpineLen > 70) spineClass = 'size-huge';
            else if (totalSpineLen > 50) spineClass = 'size-vlong';
            else if (totalSpineLen > 35) spineClass = 'size-long';
            // ---------------------------

            // Liquid Data
            const tl = document.getElementById('title-l');
            const al = document.getElementById('artist-l');
            tl.innerText = data.collectionName;
            al.innerText = data.artistName;

            // Reset & Add Classes
            tl.className = 'title-l'; if (tClass) tl.classList.add(tClass);
            al.className = 'artist-l'; if (aClass) al.classList.add(aClass);

            document.getElementById('year-l').innerText = year;
            document.getElementById('genre-l').innerText = genre.toUpperCase();

            // Jewel Data
            const jTitle = document.getElementById('title-j');
            const jArtist = document.getElementById('artist-j');
            const spineText = document.getElementById('spine-text');
            const jMeta = document.querySelector('.j-meta');

            const titleStr = data.collectionName.toUpperCase();
            const artistStr = data.artistName.toUpperCase();

            // Set Data
            jTitle.innerText = titleStr;
            jArtist.innerText = artistStr;
            spineText.innerText = `${artistStr} - ${titleStr}`;

            // Reset & Add Classes for Jewel
            jTitle.classList.remove('size-medium', 'size-long', 'size-vlong', 'size-huge');
            if (tClass) jTitle.classList.add(tClass);

            jArtist.classList.remove('size-long', 'size-vlong'); // Remove old size classes
            // Note: jArtist has 'j-artist font-artist' base classes, handled below

            spineText.classList.remove('size-long', 'size-vlong', 'size-huge');
            if (spineClass) spineText.classList.add(spineClass);

            document.getElementById('genre-j').innerText = genre.toUpperCase();
            document.getElementById('date-j').innerText = dateFull;

            // Font Fallback for UnboundedSans
            const needsFallback = checkCJK(titleStr);
            const elements = [jTitle, spineText, jMeta];
            elements.forEach(el => {
                if (needsFallback) {
                    el.classList.remove('font-main');
                    el.classList.add('font-fallback');
                } else {
                    el.classList.remove('font-fallback');
                    el.classList.add('font-main');
                }
            });

            // Artist Font: Always use Noto Sans Mono -> SC
            jArtist.className = 'j-artist font-artist';
            if (aClass) jArtist.classList.add(aClass);

            // Images
            const imgL = document.getElementById('img-l');
            const imgJ = document.getElementById('img-j');
            imgL.crossOrigin = "Anonymous";
            imgJ.crossOrigin = "Anonymous";
            imgL.src = url;
            imgJ.src = url;
            imgL.onload = () => applyColors(imgL);
        }

        function applyColors(img) {
            try {
                const pal = colorThief.getPalette(img, 4);
                const c1 = `rgb(${pal[0].join(',')})`;
                const c2 = `rgb(${pal[1].join(',')})`;
                document.querySelector('.liquid-bg').style.backgroundImage = `linear-gradient(135deg, ${c1}, ${c2})`;

                const rgb = pal[0];
                const lightC = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.15)`;
                const card = document.getElementById('vinyl-card');
                card.style.setProperty('--bg-c1', '#f0f0f0');
                card.style.setProperty('--bg-c2', lightC);
            } catch (e) { console.error("Color Thief failed:", e); }
        }

        function toggleTheme() {
            const html = document.documentElement;
            const dark = html.getAttribute('data-theme') === 'dark';
            html.setAttribute('data-theme', dark ? 'light' : 'dark');
            document.getElementById('icon-theme').innerText = dark ? 'dark_mode' : 'light_mode';
        }

        async function downloadCard() {
            const btn = document.querySelector('.fab');
            btn.classList.add('loading');

            await document.fonts.ready;
            const card = document.getElementById('vinyl-card');

            let filename = 'Covershare.png';
            if (currentAlbumData && currentAlbumData.collectionName) {
                const cleanName = currentAlbumData.collectionName.replace(/[/\\?%*:|"<>]/g, '-');
                filename = `Covershare-${cleanName}.png`;
            }

            // Steady-state Download Logic
            const contentJewel = document.getElementById('content-jewel');
            const originalTransform = contentJewel.style.transform;
            if (currStyle === 'jewel') {
                contentJewel.style.transform = 'none';
            }

            // --- 截图色块修复：混合模式降级 ---
            // html2canvas 对 mix-blend-mode 支持极差，截图时需临时改为 normal + 低透明度模拟
            const grain = document.querySelector('.grain-overlay');
            const scuffs = document.querySelector('.plastic-scuffs');
            const oldGrainMode = grain.style.mixBlendMode;
            const oldGrainOp = grain.style.opacity;
            const oldScuffMode = scuffs.style.mixBlendMode;
            const oldScuffOp = scuffs.style.opacity;

            if (currStyle === 'jewel') {
                // 模拟 Overlay: Normal 模式下极低透明度
                grain.style.mixBlendMode = 'normal';
                grain.style.opacity = '0.08'; // 降低透明度以防突兀

                // 模拟 Screen: Normal 模式下极低透明度
                scuffs.style.mixBlendMode = 'normal';
                scuffs.style.opacity = '0.05';
            }

            // Save scroll position to prevent jarring jump
            const scrollPos = window.scrollY;
            window.scrollTo(0, 0);

            setTimeout(() => {
                html2canvas(card, {
                    useCORS: true,
                    scale: 2,
                    backgroundColor: null,
                    allowTaint: true,
                    scrollX: 0, scrollY: 0,
                    width: card.offsetWidth,
                    height: card.offsetHeight
                }).then(canvas => {
                    const a = document.createElement('a');
                    a.download = filename;
                    a.href = canvas.toDataURL('image/png');
                    a.click();
                    btn.classList.remove('loading');

                    // Restore State
                    if (currStyle === 'jewel') {
                        contentJewel.style.transform = originalTransform;

                        // 恢复混合模式
                        grain.style.mixBlendMode = oldGrainMode || '';
                        grain.style.opacity = oldGrainOp || '';
                        scuffs.style.mixBlendMode = oldScuffMode || '';
                        scuffs.style.opacity = oldScuffOp || '';
                    }
                    window.scrollTo(0, scrollPos); // Restore scroll
                });
            }, 800);
        }
