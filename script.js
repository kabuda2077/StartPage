if (!localStorage.getItem('hasVisited')) {
  document.documentElement.classList.add('is-first-visit');
}

const i18n = {
  zh: {
    settings: "设置", inputLocation: "输入您的位置", locPlaceholder: "例如：广州 或 Beijing", saveLoc: "保存位置", useCurLoc: "使用当前位置",
    addNewGroup: "添加新分组", customEngine: "自定义搜索引擎", apiKeySet: "API Key 已设置", inputApiKey: "输入和风天气 API Key",
    applyApiKey: '前往 <a href="https://dev.qweather.com" target="_blank" style="color:inherit; text-decoration:underline;">dev.qweather.com</a> 免费申请 API Key',
    searchPlaceholder: "Search something...", searchWith: "Search with {name}", delGroupConfirm: "确认删除该分组及内部所有链接吗?",
    delLinkConfirm: "确认删除该链接吗?", delEngineConfirm: "确认删除\"{name}\"?", editEngine: "编辑：{name}", engineName: "名称",
    engineNamePlaceholder: "如: Google", engineUrl: "搜索网址 （只需输入如 baidu.com 即可）", engineUrlPlaceholder: "例如: baidu.com",
    save: "保存", back: "返回", addNewLink: "添加新链接", noLinks: "该分组下暂无链接", linkNamePlaceholder: "网站名称",
    newGroupNamePrompt: "请输入新分组名称:", engineNameUrlEmpty: "名称和网址不能为空", keepOneEngine: "至少保留一个搜索引擎",
    yes: "是", no: "否", needApiKey: "天气服务需要自行申请API Key，点击右下角齿轮进行设置", clickToGetLoc: "点击获取位置",
    loading: "加载中...", locNotSupported: "您的浏览器不支持地理定位。", gettingLoc: "正在获取当前位置...",
    locFailed: "定位失败，请手动输入城市或检查权限。", feelsLike: "FL", groupNamePlaceholder: "分组名称",
    editLinksTitle: "编辑链接", delGroupTitle: "删除分组", dragSortTitle: "拖动排序", delLinkTitle: "删除链接",
    editBtnTitle: "编辑", delBtnTitle: "删除", usernamePlaceholder: "输入您的名字", welcomePrompt: "choose a name for you", welcomePlaceholder: "Press Enter to confirm"
  },
  en: {
    settings: "Settings", inputLocation: "Enter your location", locPlaceholder: "e.g., Guangzhou or London", saveLoc: "Save Location", useCurLoc: "Use Current Location",
    addNewGroup: "Add New Group", customEngine: "Search Engines", apiKeySet: "API Key is Set", inputApiKey: "Enter QWeather API Key",
    applyApiKey: 'Get a free API Key at <a href="https://dev.qweather.com" target="_blank" style="color:inherit; text-decoration:underline;">dev.qweather.com</a>',
    searchPlaceholder: "Search something...", searchWith: "Search with {name}", delGroupConfirm: "Delete this group and all its links?",
    delLinkConfirm: "Delete this link?", delEngineConfirm: "Delete \"{name}\"?", editEngine: "Edit: {name}", engineName: "Name",
    engineNamePlaceholder: "e.g., Google", engineUrl: "Search URL (e.g., just enter google.com)", engineUrlPlaceholder: "e.g., google.com",
    save: "Save", back: "Back", addNewLink: "Add New Link", noLinks: "No links in this group", linkNamePlaceholder: "Site Name",
    newGroupNamePrompt: "Enter new group name:", engineNameUrlEmpty: "Name and URL cannot be empty", keepOneEngine: "Keep at least one search engine",
    yes: "Yes", no: "No", needApiKey: "API Key is required for weather. Click the gear icon to set it.", clickToGetLoc: "Click to get location",
    loading: "Loading...", locNotSupported: "Geolocation is not supported by your browser.", gettingLoc: "Getting current location...",
    locFailed: "Location failed. Please enter manually or check permissions.", feelsLike: "FL", groupNamePlaceholder: "Group Name",
    editLinksTitle: "Edit Links", delGroupTitle: "Delete Group", dragSortTitle: "Drag to sort", delLinkTitle: "Delete Link",
    editBtnTitle: "Edit", delBtnTitle: "Delete", usernamePlaceholder: "Enter your name", welcomePrompt: "choose a name for you", welcomePlaceholder: "Press Enter to confirm"
  }
};

let currentLang = localStorage.getItem('lang') || 'zh';
function t(key, params) {
  let text = i18n[currentLang][key] || key;
  if (params) for (let k in params) text = text.replace(`{${k}}`, params[k]);
  return text;
}

function getGreetingMsg() {
  const hour = new Date().getHours();
  let greetings = [];
  if (hour >= 0 && hour < 5) greetings = ["up late, night owl?", "it's late, get some rest.", "still awake?"];
  else if (hour >= 5 && hour < 9) greetings = ["early bird!", "good morning, early riser!", "ready for a new day?"];
  else if (hour >= 9 && hour < 12) greetings = ["good morning!", "have a great morning!", "rise and shine!"];
  else if (hour >= 12 && hour < 18) greetings = ["good afternoon!", "hope your day is going well!", "stay focused!"];
  else if (hour >= 18 && hour < 22) greetings = ["good evening!", "time to wind down.", "hope you had a great day!"];
  else greetings = ["good night!", "late night browsing?", "time to rest soon."];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

const SUN_ICON = `<i class="fas fa-sun"></i>`;
const MOON_ICON = `<i class="fas fa-moon"></i>`;
const themeToggleBtn = document.getElementById('theme-toggle-icon');

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggleBtn.innerHTML = SUN_ICON;
  } else {
    document.body.classList.remove('dark-mode');
    themeToggleBtn.innerHTML = MOON_ICON;
  }
}

themeToggleBtn.addEventListener('click', (e) => {
  const isDark = document.body.classList.contains('dark-mode');
  const newTheme = isDark ? 'light' : 'dark';
  const x = e.clientX; const y = e.clientY;
  document.documentElement.style.setProperty('--click-x', `${x}px`);
  document.documentElement.style.setProperty('--click-y', `${y}px`);
  if (!document.startViewTransition) { localStorage.setItem('theme', newTheme); applyTheme(newTheme); return; }
  const transitionClass = isDark ? 'theme-transition-shrink' : 'theme-transition-expand';
  document.documentElement.classList.add(transitionClass);
  const transition = document.startViewTransition(() => { localStorage.setItem('theme', newTheme); applyTheme(newTheme); });
  transition.finished.finally(() => { document.documentElement.classList.remove('theme-transition-expand', 'theme-transition-shrink'); });
});

function updateAllTexts() {
  document.getElementById('langToggleBtnSettings').textContent = currentLang === 'zh' ? 'EN' : '中';
  document.getElementById('loc-modal-title').textContent = t('inputLocation');
  document.getElementById('locationInput').placeholder = t('locPlaceholder');
  document.getElementById('saveLocationBtn').textContent = t('saveLoc');
  document.getElementById('useCurrentLocationBtn').textContent = t('useCurLoc');
  document.getElementById('settings-title').textContent = t('settings');
  document.getElementById('addNewGroupBtnText').textContent = t('addNewGroup');
  document.getElementById('editEnginesBtnText').textContent = t('customEngine');
  document.getElementById('usernameInput').placeholder = t('usernamePlaceholder');
  document.getElementById('apiKeyInput').placeholder = t('inputApiKey');
  document.getElementById('applyApiKeyText').innerHTML = t('applyApiKey');
  document.getElementById('confirm-yes').textContent = t('yes');
  document.getElementById('confirm-no').textContent = t('no');
  renderUsernameSection();
  renderApiKeySection();
}

function getApiKey() { return localStorage.getItem('qweatherApiKey') || ''; }
function getUserName() { return localStorage.getItem('userName') || ''; }

let siteData = [
  { title: "media", color: "#e63946", links: [ { name: "Bilibili", url: "https://www.bilibili.com" }, { name: "Rednote", url: "https://www.xiaohongshu.com" }, { name: "YouTube", url: "https://www.youtube.com" } ] },
  { title: "social", color: "#7209b7", links: [ { name: "Jike", url: "https://web.okjike.com" }, { name: "Douban", url: "https://movie.douban.com" }, { name: "Reddit", url: "https://www.reddit.com" }, { name: "Linuxdo", url: "https://linux.do" } ] },
  { title: "others", color: "#f8961e", links: [ { name: "JD", url: "https://www.jd.com" }, { name: "Taobao", url: "https://www.taobao.com" }, { name: "Gmail", url: "https://mail.google.com" }, { name: "QQmail", url: "https://wx.mail.qq.com" } ] },
  { title: "ai", color: "#2a9d8f", links: [ { name: "Deepseek", url: "https://chat.deepseek.com" }, { name: "Chatgpt", url: "https://chatgpt.com" }, { name: "Claude", url: "https://claude.ai" }, { name: "Gemini", url: "https://gemini.google.com" } ] }
];

const greeting = document.getElementById("greeting");
const weatherDisplay = document.getElementById("weather");
const weatherTemp = document.getElementById("weather-temp");
const weatherFeelsLike = document.getElementById("weather-feels-like");
const weatherHighLow = document.getElementById("weather-high-low");
const locationModal = document.getElementById("locationModal");
const locCloseButton = document.getElementById("loc-close-button");
const locationInput = document.getElementById("locationInput");
const saveLocationBtn = document.getElementById("saveLocationBtn");
const useCurrentLocationBtn = document.getElementById("useCurrentLocationBtn");
const locationError = document.getElementById("locationError");
const groupsContainer = document.querySelector(".groups");
const settingsIcon = document.getElementById("settings-icon");
const settingsModal = document.getElementById("settingsModal");
const settingsCloseButton = document.getElementById("settings-close-button");
const settingsGroupsContainer = document.getElementById("settings-groups-container");
const addNewGroupBtn = document.getElementById("addNewGroupBtn");
const settingsTitle = document.getElementById("settings-title");
const globalSettingsSection = document.getElementById("global-settings-section");
const settingsActions = document.getElementById("settings-actions");
const customConfirmModal = document.getElementById('customConfirmModal');
const customConfirmMessage = document.getElementById('customConfirmMessage');
const confirmYesBtn = document.getElementById('confirm-yes');
const confirmNoBtn = document.getElementById('confirm-no');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchEngineSelector = document.getElementById('search-engine-selector');
const currentEngineIcon = document.getElementById('current-engine-icon');
const engineList = document.getElementById('engine-list');

const DEFAULT_ENGINES = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q={query}', icon: 'fab fa-google' },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={query}', icon: 'fas fa-shield-alt' },
  { id: 'baidu',      name: 'Baidu',      url: 'https://www.baidu.com/s?wd={query}',          icon: 'fas fa-paw' }
];
let enginesData = [];

function initTheme() { const stored = localStorage.getItem('theme') || 'light'; applyTheme(stored); }
function init() { initTheme(); loadSiteData(); loadEnginesData(); updateAllTexts(); initWeather(); updateGreeting(); renderMainPageGroups(); renderEngineDropdown(); setSearchEngine(localStorage.getItem('searchEngine') || enginesData[0]?.id || 'google'); handleFirstVisit(); }
function loadSiteData() { const stored = localStorage.getItem('siteData'); if (stored) { try { siteData = JSON.parse(stored); } catch(e){} } }
function saveSiteData() { localStorage.setItem('siteData', JSON.stringify(siteData)); }
function loadEnginesData() { const stored = localStorage.getItem('enginesData'); try { enginesData = stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(DEFAULT_ENGINES)); } catch(e) { enginesData = JSON.parse(JSON.stringify(DEFAULT_ENGINES)); } }
function saveEnginesData() { localStorage.setItem('enginesData', JSON.stringify(enginesData)); }

function renderMainPageGroups() {
  groupsContainer.innerHTML = '';
  siteData.forEach(group => {
    const div = document.createElement('div');
    div.className = 'group';
    div.style.setProperty('--link-hover-color', group.color);
    div.innerHTML = `<div class="group-title" style="color:${group.color}">${group.title}</div>`;
    group.links.forEach(link => {
      const a = document.createElement('a'); a.href = link.url; a.target = "_blank"; a.textContent = link.name;
      div.appendChild(a);
    });
    groupsContainer.appendChild(div);
  });
}

function updateGreeting() { const name = getUserName(); const msg = getGreetingMsg(); greeting.textContent = name ? `Hey ${name}, ${msg}` : `Hey, ${msg}`; }
function initWeather() { const key = getApiKey(), loc = localStorage.getItem('weatherLocation'); if (!key) { weatherTemp.textContent = t('needApiKey'); weatherTemp.style.cssText = 'font-size:0.78rem; color:var(--text-light); font-weight:400;'; weatherFeelsLike.style.display = weatherHighLow.style.display = 'none'; } else if (!loc) { weatherTemp.textContent = t('clickToGetLoc'); weatherTemp.style.cssText = 'font-size:0.95rem; color:var(--text-gray); font-weight:500;'; weatherFeelsLike.style.display = weatherHighLow.style.display = 'none'; } else { weatherTemp.style.cssText = ''; fetchWeatherData(loc); } }
async function fetchWeatherData(loc, isCoords = false) { const apiKey = getApiKey(); if (!apiKey) return; const WEATHER_CACHE_TTL = 10 * 60 * 1000; const cached = localStorage.getItem('weatherCache'), time = localStorage.getItem('weatherCacheTime'); if (cached && time && Date.now() - Number(time) < (isCoords ? 120000 : WEATHER_CACHE_TTL)) { applyWeatherData(JSON.parse(cached)); return; } try { let locId = ''; const geoUrl = isCoords ? `https://geoapi.qweather.com/v2/city/lookup?location=${loc.lon},${loc.lat}&key=${apiKey}` : `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURIComponent(loc)}&key=${apiKey}`; const geoRes = await fetch(geoUrl).then(r => r.json()); if (geoRes.location?.[0]) { locId = geoRes.location[0].id; localStorage.setItem('weatherLocation', geoRes.location[0].name); } else throw new Error('Location not found'); const [curr, fore] = await Promise.all([ fetch(`https://devapi.qweather.com/v7/weather/now?location=${locId}&key=${apiKey}`).then(r => r.json()), fetch(`https://devapi.qweather.com/v7/weather/3d?location=${locId}&key=${apiKey}`).then(r => r.json()) ]); const data = { temp: Math.round(curr.now.temp), feelsLike: Math.round(curr.now.feelsLike), tempMax: fore.daily[0].tempMax, tempMin: fore.daily[0].tempMin }; applyWeatherData(data); localStorage.setItem('weatherCache', JSON.stringify(data)); localStorage.setItem('weatherCacheTime', String(Date.now())); } catch(e) { console.error(e); } }
function applyWeatherData(data) { weatherTemp.textContent = `${data.temp}°C`; weatherFeelsLike.textContent = `${t('feelsLike')} ${data.feelsLike}°C`; weatherHighLow.textContent = `H ${data.tempMax}°C / L ${data.tempMin}°C`; weatherFeelsLike.style.display = weatherHighLow.style.display = ''; }

function setSearchEngine(id) { const eng = enginesData.find(e => e.id === id) || enginesData[0]; searchInput.placeholder = t('searchWith', {name: eng.name}); currentEngineIcon.className = eng.icon; localStorage.setItem('searchEngine', eng.id); }
function renderEngineDropdown() { engineList.innerHTML = ''; enginesData.forEach(eng => { const li = document.createElement('li'); li.innerHTML = `<i class="${eng.icon}"></i><span>${eng.name}</span>`; li.onclick = (e) => { e.stopPropagation(); setSearchEngine(eng.id); engineList.classList.remove('show'); }; engineList.appendChild(li); }); }

function renderUsernameSection() { const name = getUserName(); document.getElementById('username-saved-text').textContent = name; document.getElementById('username-saved-mode').style.display = name ? 'flex' : 'none'; document.getElementById('username-edit-mode').style.display = name ? 'none' : 'flex'; }
function renderApiKeySection() { const key = getApiKey(); if (key) { document.getElementById('api-key-saved-text').textContent = key.length > 8 ? key.substring(0, 4) + '••••••••' + key.substring(key.length - 4) : '••••••••'; document.getElementById('api-key-saved-mode').style.display = 'flex'; document.getElementById('api-key-edit-mode').style.display = 'none'; } else { document.getElementById('api-key-saved-mode').style.display = 'none'; document.getElementById('api-key-edit-mode').style.display = 'flex'; } }

const TRASH_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
const EDIT_ICON_SVG  = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`;
const CHECK_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
document.querySelectorAll('[data-svg="edit"]').forEach(el => { el.innerHTML = EDIT_ICON_SVG; el.removeAttribute('data-svg'); });
document.querySelectorAll('[data-svg="check"]').forEach(el => { el.innerHTML = CHECK_ICON_SVG; el.removeAttribute('data-svg'); });
function debounce(f, d) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), d); }; }
function customConfirm(m) { return new Promise(res => { customConfirmMessage.textContent = m; customConfirmModal.style.display = 'flex'; confirmYesBtn.onclick = () => { customConfirmModal.style.display = 'none'; res(true); }; confirmNoBtn.onclick = () => { customConfirmModal.style.display = 'none'; res(false); }; }); }

weatherDisplay.onclick = () => getApiKey() ? (locationModal.style.display = 'flex') : settingsIcon.click();
locCloseButton.onclick = () => locationModal.style.display = 'none';
saveLocationBtn.onclick = () => { localStorage.removeItem('weatherCache'); weatherTemp.textContent = t('loading'); fetchWeatherData(locationInput.value); locationModal.style.display = 'none'; };
useCurrentLocationBtn.onclick = () => { navigator.geolocation.getCurrentPosition(p => { fetchWeatherData({ lat: p.coords.latitude, lon: p.coords.longitude }, true); locationModal.style.display = 'none'; }); };
settingsIcon.onclick = () => { settingsModal.style.display = 'flex'; renderSettingsGroups(); };
settingsCloseButton.onclick = () => { settingsModal.style.display = 'none'; saveSiteData(); renderMainPageGroups(); };
document.getElementById('langToggleBtnSettings').onclick = () => { currentLang = currentLang === 'zh' ? 'en' : 'zh'; localStorage.setItem('lang', currentLang); updateAllTexts(); };
document.getElementById('saveUsernameBtn').onclick = () => { localStorage.setItem('userName', document.getElementById('usernameInput').value.trim()); renderUsernameSection(); updateGreeting(); };
document.getElementById('editUsernameBtn').onclick = () => { document.getElementById('username-saved-mode').style.display = 'none'; document.getElementById('username-edit-mode').style.display = 'flex'; };
document.getElementById('saveApiKeyBtn').onclick = () => { localStorage.setItem('qweatherApiKey', document.getElementById('apiKeyInput').value.trim()); localStorage.removeItem('weatherCache'); initWeather(); renderApiKeySection(); };
document.getElementById('editApiKeyBtn').onclick = () => { document.getElementById('api-key-saved-mode').style.display = 'none'; document.getElementById('api-key-edit-mode').style.display = 'flex'; };

searchEngineSelector.onclick = e => { e.stopPropagation(); engineList.classList.toggle('show'); };
document.onclick = () => engineList.classList.remove('show');
searchForm.onsubmit = e => { e.preventDefault(); const q = searchInput.value.trim(); if (!q) return; const eng = enginesData.find(e => e.id === (localStorage.getItem('searchEngine') || enginesData[0].id)); window.open(eng.url.replace('{query}', encodeURIComponent(q)), '_blank'); searchInput.value = ''; };

addNewGroupBtn.addEventListener('click', () => { const n = prompt(t('newGroupNamePrompt')); if (n && n.trim()) { siteData.push({ title: n.trim(), color: '#ffa726', links: [] }); renderSettingsGroups(); renderMainPageGroups(); setTimeout(() => settingsGroupsContainer.scrollTop = settingsGroupsContainer.scrollHeight, 100); } });
document.getElementById('editEnginesBtn').addEventListener('click', editEngines);

function editEngines() {
  settingsTitle.textContent = t('customEngine'); settingsActions.style.display = 'none'; globalSettingsSection.style.display = 'none'; document.getElementById('langToggleBtnSettings').style.display = 'none';
  const renderEngineList = () => {
    settingsGroupsContainer.innerHTML = '';
    enginesData.forEach((eng, idx) => {
      const d = document.createElement('div'); d.className = 'setting-item group-item';
      d.innerHTML = `<i class="fas fa-bars handle"></i><i class="${eng.icon}" style="color:var(--text-light); font-size:0.95rem; width:20px; text-align:center; flex-shrink:0;"></i><span style="flex:1; font-size:0.9rem; color:var(--text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${eng.name}</span><button class="btn btn-icon edit-eng-btn">${EDIT_ICON_SVG}</button><button class="btn btn-icon btn-danger del-eng-btn">${TRASH_ICON_SVG}</button>`;
      settingsGroupsContainer.appendChild(d);
      d.querySelector('.edit-eng-btn').addEventListener('click', () => editSingleEngine(idx, renderEngineList));
      d.querySelector('.del-eng-btn').addEventListener('click', async () => { if (enginesData.length <= 1) { alert(t('keepOneEngine')); return; } if (await customConfirm(t('delEngineConfirm', {name: eng.name}))) { enginesData.splice(idx, 1); saveEnginesData(); renderEngineDropdown(); if (localStorage.getItem('searchEngine') === eng.id) setSearchEngine(enginesData[0].id); renderEngineList(); } });
    });
    const actions = document.createElement('div'); actions.style.cssText = 'display:flex; flex-direction:column; gap:10px; margin-top:15px; margin-bottom:10px;';
    actions.innerHTML = `<button id="addEngBtn" class="btn btn-primary"><i class="fas fa-plus"></i> ${t('customEngine')}</button><button id="backFromEng" class="btn btn-secondary">${t('back')}</button>`;
    settingsGroupsContainer.appendChild(actions);
    document.getElementById('addEngBtn').onclick = () => { const newId = 'custom_' + Date.now(); enginesData.push({ id: newId, name: 'New Engine', url: 'https://example.com/search?q={query}', icon: 'fas fa-search' }); saveEnginesData(); renderEngineDropdown(); renderEngineList(); setTimeout(() => editSingleEngine(enginesData.length - 1, renderEngineList), 50); };
    document.getElementById('backFromEng').onclick = () => { saveEnginesData(); renderEngineDropdown(); setSearchEngine(localStorage.getItem('searchEngine') || enginesData[0]?.id); renderSettingsGroups(); };
    if (sortableInst) sortableInst.destroy();
    sortableInst = new Sortable(settingsGroupsContainer, { 
      handle: '.handle', animation: 150, 
      forceFallback: true,
      fallbackClass: 'sortable-fallback',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      filter: '#addEngBtn, #backFromEng', 
      onEnd: e => { const item = siteData.splice(e.oldIndex, 1)[0]; siteData.splice(e.newIndex, 0, item); saveSiteData(); renderMainPageGroups(); } 
    });
  };
  renderEngineList();
}

function editSingleEngine(idx, onBack) {
  const eng = enginesData[idx]; settingsTitle.textContent = t('editEngine', {name: eng.name}); document.getElementById('langToggleBtnSettings').style.display = 'none';
  settingsGroupsContainer.innerHTML = `<div style="display:flex; flex-direction:column; gap:12px; padding:4px 0;"><div class="setting-item edit-height" style="flex-direction:column; align-items:flex-start; gap:6px; padding:12px; height:auto;"><label style="font-size:0.8rem; color:var(--text-light);">${t('engineName')}</label><input type="text" class="setting-input standalone-input" id="engEditName" value="${eng.name}" style="width:100%;"></div><div class="setting-item edit-height" style="flex-direction:column; align-items:flex-start; gap:6px; padding:12px; height:auto;"><label style="font-size:0.8rem; color:var(--text-light);">${t('engineUrl')}</label><input type="text" class="setting-input standalone-input" id="engEditUrl" value="${eng.url}" style="width:100%;"></div></div><div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;"><button id="saveEngBtn" class="btn btn-primary">${CHECK_ICON_SVG} ${t('save')}</button><button id="backFromSingleEng" class="btn btn-secondary">${t('back')}</button></div>`;
  document.getElementById('saveEngBtn').onclick = () => {
    const name = document.getElementById('engEditName').value.trim(); let url  = document.getElementById('engEditUrl').value.trim(); if (!name || !url) { alert(t('engineNameUrlEmpty')); return; }
    if (!url.includes('{query}')) { let domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase(); const k = { 'google': 'https://www.google.com/search?q={query}', 'baidu': 'https://www.baidu.com/s?wd={query}', 'bing': 'https://www.bing.com/search?q={query}', 'duckduckgo': 'https://duckduckgo.com/?q={query}', 'yahoo': 'https://search.yahoo.com/search?p={query}', 'yandex': 'https://yandex.com/search/?text={query}', 'bilibili': 'https://search.bilibili.com/all?keyword={query}', 'github': 'https://github.com/search?q={query}', 'zhihu': 'https://www.zhihu.com/search?q={query}' }; let m = false; for (let key in k) { if (domain.includes(key)) { url = k[key]; m = true; break; } } if (!m) { let p = url.startsWith('http') ? '' : 'https://'; url = `${p}${url}/search?q={query}`; } }
    let i = 'fas fa-search'; const s = (name + ' ' + url).toLowerCase(); if (s.includes('google')) i = 'fab fa-google'; else if (s.includes('baidu')) i = 'fas fa-paw'; else if (s.includes('bing')) i = 'fab fa-microsoft'; else if (s.includes('duckduckgo')) i = 'fas fa-shield-alt';
    enginesData[idx] = { ...eng, name, url, icon: i }; saveEnginesData(); renderEngineDropdown(); if (localStorage.getItem('searchEngine') === eng.id) setSearchEngine(eng.id); onBack();
  };
  document.getElementById('backFromSingleEng').onclick = onBack;
}

let sortableInst = null;
function renderSettingsGroups() {
  settingsTitle.textContent = t('settings'); globalSettingsSection.style.display = "flex"; settingsActions.style.display = "block"; document.getElementById('langToggleBtnSettings').style.display = 'flex';
  settingsGroupsContainer.innerHTML = '';
  siteData.forEach((g, i) => {
    const div = document.createElement('div'); div.className = 'setting-item group-item';
    div.innerHTML = `<i class="fas fa-bars handle"></i><input type="text" class="setting-input" value="${g.title}" style="padding-left:0 !important;"><button class="btn btn-icon edit-btn">${EDIT_ICON_SVG}</button><button class="btn btn-icon btn-danger del-btn">${TRASH_ICON_SVG}</button>`;
    div.querySelector('input').oninput = debounce(e => { siteData[i].title = e.target.value; }, 300);
    div.querySelector('.edit-btn').onclick = () => editGroup(i);
    div.querySelector('.del-btn').onclick = async () => { if (await customConfirm(t('delGroupConfirm'))) { siteData.splice(i, 1); renderSettingsGroups(); } };
    settingsGroupsContainer.appendChild(div);
  });
  if (sortableInst) sortableInst.destroy();
  sortableInst = new Sortable(settingsGroupsContainer, { 
    handle: '.handle', animation: 150, 
    forceFallback: true, 
    fallbackClass: 'sortable-fallback',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    onEnd: e => { const item = siteData.splice(e.oldIndex, 1)[0]; siteData.splice(e.newIndex, 0, item); } 
  });
}

function editGroup(idx) {
  const g = siteData[idx]; settingsTitle.innerHTML = `<i class="fas fa-folder-open" style="color:${g.color}; margin-right:8px;"></i>${g.title}`; globalSettingsSection.style.display = "none"; settingsActions.style.display = "none"; document.getElementById('langToggleBtnSettings').style.display = 'none';
  settingsGroupsContainer.innerHTML = `<div id="l-list" style="display:flex; flex-direction:column; gap:12px;"></div><div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;"><button id="addL" class="btn btn-primary"><i class="fas fa-plus"></i> ${t('addNewLink')}</button><button id="backG" class="btn btn-secondary">${t('back')}</button></div>`;
  const list = document.getElementById('l-list');
  const render = () => {
    list.innerHTML = '';
    g.links.forEach((l, li) => {
      const d = document.createElement('div'); d.className = 'link-edit-item';
      d.innerHTML = `<input type="text" class="setting-input standalone-input" value="${l.name}" placeholder="名称" style="flex:0.3;"><input type="text" class="setting-input standalone-input" value="${l.url}" placeholder="URL" style="flex:0.7;"><button class="btn btn-icon btn-danger">${TRASH_ICON_SVG}</button>`;
      d.querySelectorAll('input')[0].oninput = e => g.links[li].name = e.target.value;
      d.querySelectorAll('input')[1].oninput = e => g.links[li].url = e.target.value;
      d.querySelector('button').onclick = async () => { if (await customConfirm(t('delLinkConfirm'))) { g.links.splice(li, 1); render(); } };
      list.appendChild(d);
    });
  };
  render();
  document.getElementById('addL').onclick = () => { g.links.push({name:'', url:''}); render(); };
  document.getElementById('backG').onclick = renderSettingsGroups;
}

function handleFirstVisit() {
  if (!localStorage.getItem('hasVisited')) {
    const ov = document.getElementById('welcome-overlay'), inp = document.getElementById('welcome-name-input');
    const welcomeGreetingContainer = document.getElementById('welcome-greeting-container');
    ov.style.display = 'flex'; setTimeout(() => inp.focus(), 100);
    inp.onkeydown = e => {
      if (e.key === 'Enter') {
        const val = inp.value.trim(); localStorage.setItem('userName', val); localStorage.setItem('hasVisited', 'true');
        updateGreeting(); renderUsernameSection();
        document.getElementById('welcome-input-container').style.opacity = '0'; document.getElementById('welcome-input-container').style.transform = 'translateY(-30px)';
        setTimeout(() => {
          document.getElementById('welcome-input-container').style.display = 'none'; const msg = getGreetingMsg(); document.getElementById('welcome-greeting-text').textContent = val ? `Hey ${val}, ${msg}` : `Hey, ${msg}`;
          welcomeGreetingContainer.style.opacity = '1'; welcomeGreetingContainer.style.transform = 'translateY(0)';
          setTimeout(() => { welcomeGreetingContainer.style.opacity = '0'; welcomeGreetingContainer.style.transform = 'translateY(-30px)'; setTimeout(() => { ov.style.opacity = '0'; document.documentElement.classList.add('do-reveal'); document.documentElement.classList.remove('is-first-visit'); setTimeout(() => { ov.style.display = 'none'; setTimeout(() => { document.documentElement.classList.remove('do-reveal'); }, 1500); }, 800); }, 400); }, 1500);
        }, 500);
      }
    };
  }
}
init();
