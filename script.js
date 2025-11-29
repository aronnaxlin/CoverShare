const i18n = {
    CN: { workspace: "工作区", blog: "博客", mode_dark: "暗色", mode_light: "亮色", search_ph: "搜索专辑 (如: Jay Chou)", loading: "加载中..." },
    TC: { workspace: "工作區", blog: "部落格", mode_dark: "深色", mode_light: "淺色", search_ph: "搜尋專輯 (如: Jay Chou)", loading: "載入中..." },
    EN: { workspace: "Workspace", blog: "Blog", mode_dark: "Dark", mode_light: "Light", search_ph: "Search Album (e.g. Jay Chou)", loading: "Loading..." }
};

let currentLang = 'CN';
window.onload = () => fetchAlbum('Fantasy Jay Chou');

// Sidebar
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('collapsed'); }

// Language Dropdown
function toggleLangMenu(e) {
    e.stopPropagation();
    document.getElementById('lang-menu').classList.toggle('show');
}

function setLang(lang, el) {
    currentLang = lang;
    document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    const labels = { 'CN': '简体中文', 'TC': '繁體中文', 'EN': 'English' };
    document.getElementById('curr-lang-label').textContent = labels[lang];
    updateLangUI();
    document.getElementById('lang-menu').classList.remove('show');
}

window.onclick = (e) => {
    if (!e.target.closest('.control-btn')) {
        document.getElementById('lang-menu').classList.remove('show');
    }
};

function updateLangUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = i18n[currentLang][el.getAttribute('data-i18n')]);
    document.querySelectorAll('[data-placeholder]').forEach(el => el.placeholder = i18n[currentLang][el.getAttribute('data-placeholder')]);
}

// Theme
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    icon.textContent = isDark ? 'dark_mode' : 'light_mode';
    text.setAttribute('data-i18n', isDark ? 'mode_dark' : 'mode_light');
    updateLangUI();
}
// Search
let timeout;
const searchInput = document.getElementById('search-input');
const suggestions = document.getElementById('suggestions');
searchInput.addEventListener('input', (e) => {
    clearTimeout(timeout);
    const val = e.target.value.trim();
    if (val.length < 2) { suggestions.classList.remove('show'); return; }
    timeout = setTimeout(() => doSearch(val), 400);
});
async function doSearch(query) {
    try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=5`);
        const data = await res.json();
        renderSuggestions(data.results);
    } catch (e) { }
}
function renderSuggestions(list) {
    suggestions.innerHTML = '';
    if (!list.length) { suggestions.classList.remove('show'); return; }
    list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `<img src="${item.artworkUrl60}" class="s-thumb"><div class="s-info"><div style="font-weight:500">${item.collectionName}</div><div style="font-size:12px;opacity:0.7">${item.artistName}</div></div>`;
        div.onclick = () => { loadAlbumData(item); suggestions.classList.remove('show'); searchInput.value = item.collectionName; };
        suggestions.appendChild(div);
    });
    suggestions.classList.add('show');
}
function clearSearch() { searchInput.value = ''; suggestions.classList.remove('show'); }
// --- Card & Liquid Logic ---
async function fetchAlbum(query) {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=1`);
    const data = await res.json();
    if (data.results.length) loadAlbumData(data.results[0]);
}
const colorThief = new ColorThief();
const imgEl = document.getElementById('cover-img');
const cardEl = document.getElementById('vinyl-card');
const liquidBg = document.getElementById('liquid-bg');
function loadAlbumData(album) {
    const bigUrl = album.artworkUrl100.replace('100x100bb', '600x600bb');
    imgEl.classList.remove('loaded');
    imgEl.src = bigUrl;
    document.getElementById('album-title').textContent = album.collectionName;
    document.getElementById('album-artist').textContent = album.artistName;
    document.getElementById('album-year').textContent = album.releaseDate.substring(0, 4);
    document.getElementById('album-genre').textContent = album.primaryGenreName;
}
imgEl.onload = () => {
    imgEl.classList.add('loaded');
    try {
        // 提取两个颜色
        const palette = colorThief.getPalette(imgEl, 3);
        const color1 = boostColor(palette[0]);
        const color2 = boostColor(palette[1] || palette[0]);
        applyLiquidTheme(color1, color2);
    } catch (e) {
        applyLiquidTheme([100, 100, 100], [50, 50, 50]);
    }
};
// 核心算法：提升颜色饱和度
function boostColor([r, g, b]) {
    let r1 = r / 255, g1 = g / 255, b1 = b / 255;
    let max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1);
    let h, s, l = (max + min) / 2;
    if (max == min) { h = s = 0; }
    else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break;
            case g1: h = (b1 - r1) / d + 2; break;
            case b1: h = (r1 - g1) / d + 4; break;
        }
        h /= 6;
    }
    s = Math.max(0.6, s);
    l = Math.max(0.3, Math.min(0.6, l));
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}
function applyLiquidTheme(c1, c2) {
    cardEl.style.setProperty('--bg-color-1', c1);
    cardEl.style.setProperty('--bg-color-2', c2);
    cardEl.style.color = '#fff';
    cardEl.querySelector('.artist-name').style.color = 'rgba(255,255,255,0.85)';
    cardEl.querySelectorAll('.pill').forEach(p => {
        p.style.background = 'rgba(255,255,255,0.15)';
        p.style.borderColor = 'rgba(255,255,255,0.05)';
    });
}
// --- 修复色块问题的核心代码 ---
function downloadCard() {
    const btn = document.querySelector('.fab');
    btn.style.display = 'none';
    const style = getComputedStyle(cardEl);
    const c1 = style.getPropertyValue('--bg-color-1');
    const c2 = style.getPropertyValue('--bg-color-2');
    html2canvas(document.getElementById('vinyl-card'), {
        useCORS: true,
        scale: 3,
        backgroundColor: null,
        // 关键：在截图时，将复杂的径向渐变替换为简单的线性渐变
        onclone: (doc) => {
            const c = doc.getElementById('vinyl-card');
            // 关键修复：确保克隆的元素也有圆角，并且其父元素背景透明
            c.style.borderRadius = '24px';
            c.style.overflow = 'hidden';
            const bg = c.querySelector('.card-liquid-bg');
            const glass = c.querySelector('.card-glass-overlay');
            const noise = c.querySelector('.card-noise');
            // 1. 隐藏或简化 html2canvas 处理不佳的滤镜效果
            noise.style.display = 'none';
            glass.style.backdropFilter = 'none';
            glass.style.background = 'rgba(255,255,255,0.15)'; // 用半透明白色模拟亮度
            // 2. 将复杂的背景替换为平滑的线性渐变
            bg.style.opacity = '1';
            bg.style.backgroundImage = `linear-gradient(135deg, ${c1}, ${c2})`;
        }
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `CoverShare-${document.getElementById('album-title').textContent}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        btn.style.display = 'flex';
    });
}