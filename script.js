if (!localStorage.getItem('hasVisited')) {
  document.documentElement.classList.add('is-first-visit');
}

const i18n = {
  zh: {
    settings: "设置", inputLocation: "输入您的位置", locPlaceholder: "输入城市并选择匹配位置", saveLoc: "保存位置", useCurLoc: "使用当前位置",
    addNewGroup: "添加新分组", customEngine: "自定义搜索引擎", apiKeySet: "API Key 已设置", inputApiKey: "输入和风天气 API Key",
    applyApiKey: '前往 <a href="https://dev.qweather.com" target="_blank" rel="noopener">dev.qweather.com</a> 免费申请 API Key',
    searchPlaceholder: "Search something...", searchWith: "Search with {name}", delGroupConfirm: "确认删除该分组及内部所有链接吗?",
    delLinkConfirm: "确认删除该链接吗?", delEngineConfirm: "确认删除\"{name}\"?", editEngine: "编辑：{name}", engineName: "名称",
    engineNamePlaceholder: "如: Google", engineUrl: "搜索网址 （只需输入如 baidu.com 即可）", engineUrlPlaceholder: "例如: baidu.com",
    save: "保存", back: "返回", addNewLink: "添加新链接", noLinks: "该分组下暂无链接", linkNamePlaceholder: "网站名称",
    newGroupNamePrompt: "请输入新分组名称:", engineNameUrlEmpty: "名称和网址不能为空", keepOneEngine: "至少保留一个搜索引擎",
    yes: "是", no: "否", needApiKey: "天气服务需要自行申请API Key，点击右下角齿轮进行设置", clickToGetLoc: "点击获取位置",
    loading: "加载中...", locNotSupported: "您的浏览器不支持地理定位。", gettingLoc: "正在获取当前位置...",
    locFailed: "定位失败，请手动输入城市或检查权限。", weatherFailed: "天气获取失败，点击重试",
    weatherLocationMissing: "未找到该城市", weatherApiFailed: "天气服务返回异常", locationSearching: "搜索位置中...",
    locationNoMatches: "没有匹配位置", locationSearchFailed: "位置搜索失败，请稍后重试", locationSelected: "已选择：{location}",
    locationDetected: "识别到：{location}", confirmLocation: "确认位置", selectLocationFirst: "请先从下拉列表选择一个位置",
    feelsLike: "FL", groupNamePlaceholder: "分组名称",
    editLinksTitle: "编辑链接", delGroupTitle: "删除分组", dragSortTitle: "拖动排序", delLinkTitle: "删除链接",
    editBtnTitle: "编辑", delBtnTitle: "删除", usernamePlaceholder: "输入您的名字", welcomePrompt: "choose a name for you", welcomePlaceholder: "Press Enter to confirm"
  },
  en: {
    settings: "Settings", inputLocation: "Enter your location", locPlaceholder: "Type a city and choose a match", saveLoc: "Save Location", useCurLoc: "Use Current Location",
    addNewGroup: "Add New Group", customEngine: "Search Engines", apiKeySet: "API Key is Set", inputApiKey: "Enter QWeather API Key",
    applyApiKey: 'Get a free API Key at <a href="https://dev.qweather.com" target="_blank" rel="noopener">dev.qweather.com</a>',
    searchPlaceholder: "Search something...", searchWith: "Search with {name}", delGroupConfirm: "Delete this group and all its links?",
    delLinkConfirm: "Delete this link?", delEngineConfirm: "Delete \"{name}\"?", editEngine: "Edit: {name}", engineName: "Name",
    engineNamePlaceholder: "e.g., Google", engineUrl: "Search URL (e.g., just enter google.com)", engineUrlPlaceholder: "e.g., google.com",
    save: "Save", back: "Back", addNewLink: "Add New Link", noLinks: "No links in this group", linkNamePlaceholder: "Site Name",
    newGroupNamePrompt: "Enter new group name:", engineNameUrlEmpty: "Name and URL cannot be empty", keepOneEngine: "Keep at least one search engine",
    yes: "Yes", no: "No", needApiKey: "API Key is required for weather. Click the gear icon to set it.", clickToGetLoc: "Click to get location",
    loading: "Loading...", locNotSupported: "Geolocation is not supported by your browser.", gettingLoc: "Getting current location...",
    locFailed: "Location failed. Please enter manually or check permissions.", weatherFailed: "Weather failed. Click to retry",
    weatherLocationMissing: "Location not found", weatherApiFailed: "Weather service error", locationSearching: "Searching locations...",
    locationNoMatches: "No matching locations", locationSearchFailed: "Location search failed. Please try again.", locationSelected: "Selected: {location}",
    locationDetected: "Detected: {location}", confirmLocation: "Confirm Location", selectLocationFirst: "Please choose a location from the list first",
    feelsLike: "FL", groupNamePlaceholder: "Group Name",
    editLinksTitle: "Edit Links", delGroupTitle: "Delete Group", dragSortTitle: "Drag to sort", delLinkTitle: "Delete Link",
    editBtnTitle: "Edit", delBtnTitle: "Delete", usernamePlaceholder: "Enter your name", welcomePrompt: "choose a name for you", welcomePlaceholder: "Press Enter to confirm"
  }
};

let currentLang = localStorage.getItem('lang') || 'zh';
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
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

const ICONS = {
  bars: '<svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>',
  check: '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
  cog: '<svg viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 4a1.65 1.65 0 0 0 1-1.51V2.4a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.47.5.84.96 1H21a2 2 0 1 1 0 4h-.09c-.46.16-.82.53-.96 1Z"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/></svg>',
  folder: '<svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
  key: '<svg viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M11 12l9-9"/><path d="M15 4l5 5"/><path d="M18 6l-2 2"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
  user: '<svg viewBox="0 0 24 24"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>'
};
const ENGINE_ICON_URLS = {
  google: 'https://www.google.com/favicon.ico',
  duckduckgo: 'https://duckduckgo.com/favicon.ico',
  baidu: 'https://www.baidu.com/favicon.ico',
  bing: 'https://www.microsoft.com/favicon.ico',
  yahoo: 'https://s.yimg.com/rz/l/favicon.ico',
  yandex: 'https://yandex.com/favicon.ico',
  bilibili: 'https://www.bilibili.com/favicon.ico',
  github: 'https://github.githubassets.com/favicons/favicon.svg',
  zhihu: 'https://static.zhihu.com/heifetz/favicon.ico'
};
const ENGINE_ICON_CLASS_MAP = {
  'brand:google': 'google',
  'brand:duckduckgo': 'duckduckgo',
  'brand:baidu': 'baidu',
  'brand:bing': 'bing',
  'brand:yahoo': 'yahoo',
  'brand:yandex': 'yandex',
  'brand:bilibili': 'bilibili',
  'brand:github': 'github',
  'brand:zhihu': 'zhihu',
  search: 'search'
};
const ENGINE_PRESETS = [
  { key: 'google', name: 'Google', url: 'https://www.google.com/search?q={query}', icon: 'brand:google', aliases: ['google', 'goog', '谷歌'] },
  { key: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={query}', icon: 'brand:duckduckgo', aliases: ['duckduckgo', 'duckgo', 'ddg'] },
  { key: 'baidu', name: 'Baidu', url: 'https://www.baidu.com/s?wd={query}', icon: 'brand:baidu', aliases: ['baidu', '百度'] },
  { key: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q={query}', icon: 'brand:bing', aliases: ['bing', '必应'] },
  { key: 'yahoo', name: 'Yahoo', url: 'https://search.yahoo.com/search?p={query}', icon: 'brand:yahoo', aliases: ['yahoo', '雅虎'] },
  { key: 'yandex', name: 'Yandex', url: 'https://yandex.com/search/?text={query}', icon: 'brand:yandex', aliases: ['yandex'] },
  { key: 'bilibili', name: 'Bilibili', url: 'https://search.bilibili.com/all?keyword={query}', icon: 'brand:bilibili', aliases: ['bilibili', 'b站', '哔哩哔哩'] },
  { key: 'github', name: 'GitHub', url: 'https://github.com/search?q={query}', icon: 'brand:github', aliases: ['github', 'gh'] },
  { key: 'zhihu', name: 'Zhihu', url: 'https://www.zhihu.com/search?q={query}', icon: 'brand:zhihu', aliases: ['zhihu', '知乎'] }
];
function engineIconNameFromValue(value) { return ENGINE_ICON_CLASS_MAP[value] || 'search'; }
function engineFromPreset(preset) {
  return { id: preset.key, name: preset.name, url: preset.url, icon: preset.icon };
}
function normalizeEngineMatchText(value) {
  return String(value || '').trim().toLowerCase();
}
function presetMatchesQuery(preset, query) {
  const q = normalizeEngineMatchText(query);
  if (!q) return false;
  return [preset.key, preset.name, ...preset.aliases].some(value => normalizeEngineMatchText(value).includes(q));
}
function findExactEnginePresetByName(name) {
  const q = normalizeEngineMatchText(name);
  if (!q) return null;
  return ENGINE_PRESETS.find(preset => [preset.key, preset.name, ...preset.aliases].some(value => normalizeEngineMatchText(value) === q))
    || null;
}
function findEnginePresetByName(name) {
  const q = normalizeEngineMatchText(name);
  if (!q) return null;
  return findExactEnginePresetByName(name)
    || ENGINE_PRESETS.find(preset => presetMatchesQuery(preset, q))
    || null;
}
function findEnginePresetByUrl(url) {
  const domain = normalizeEngineMatchText(url).replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  if (!domain) return null;
  return ENGINE_PRESETS.find(preset => domain.includes(preset.key)) || null;
}
function getMatchingEnginePresets(query) {
  return ENGINE_PRESETS.filter(preset => presetMatchesQuery(preset, query)).slice(0, 6);
}
function normalizeSearchEngineUrl(url) {
  if (url.includes('{query}')) return url;
  const preset = findEnginePresetByUrl(url);
  if (preset) return preset.url;
  const prefix = url.startsWith('http') ? '' : 'https://';
  return `${prefix}${url}/search?q={query}`;
}
function iconForEngine(name, url) {
  return (findEnginePresetByName(name) || findEnginePresetByUrl(url))?.icon || 'search';
}
function createIcon(name, className = '') {
  const span = document.createElement('span');
  span.className = className ? `ui-icon ${className}` : 'ui-icon';
  span.dataset.icon = name;
  span.innerHTML = ICONS[name] || ICONS.search;
  return span;
}
function setIcon(el, name) {
  el.classList.add('ui-icon');
  el.dataset.icon = name;
  el.innerHTML = ICONS[name] || ICONS.search;
}
function setEngineIcon(el, iconClassName) {
  const name = engineIconNameFromValue(iconClassName);
  el.classList.add('ui-icon');
  el.classList.remove('engine-brand-icon');
  el.removeAttribute('data-icon');
  el.dataset.engineIcon = name;
  el.innerHTML = '';

  if (!ENGINE_ICON_URLS[name]) {
    el.dataset.icon = 'search';
    el.innerHTML = ICONS.search;
    return;
  }

  const img = document.createElement('img');
  img.src = ENGINE_ICON_URLS[name];
  img.alt = '';
  img.decoding = 'async';
  img.loading = 'lazy';
  img.referrerPolicy = 'no-referrer';
  img.onerror = () => {
    el.classList.remove('engine-brand-icon');
    el.dataset.icon = 'search';
    el.innerHTML = ICONS.search;
  };
  el.classList.add('engine-brand-icon');
  el.appendChild(img);
}
function createEngineIcon(iconClassName, className = '') {
  const span = document.createElement('span');
  span.className = className ? `ui-icon ${className}` : 'ui-icon';
  setEngineIcon(span, iconClassName);
  return span;
}
function hydrateStaticIcons() {
  document.querySelectorAll('.ui-icon[data-icon]').forEach(el => setIcon(el, el.dataset.icon));
}
const themeToggleBtn = document.getElementById('theme-toggle-icon');

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggleBtn.replaceChildren(createIcon('sun'));
  } else {
    document.body.classList.remove('dark-mode');
    themeToggleBtn.replaceChildren(createIcon('moon'));
  }
}

themeToggleBtn.addEventListener('click', (e) => {
  const isDark = document.body.classList.contains('dark-mode');
  const newTheme = isDark ? 'light' : 'dark';
  const x = e.clientX; const y = e.clientY;
  document.documentElement.style.setProperty('--click-x', `${x}px`);
  document.documentElement.style.setProperty('--click-y', `${y}px`);
  if (reducedMotionQuery.matches || !document.startViewTransition) { localStorage.setItem('theme', newTheme); applyTheme(newTheme); return; }
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
  { title: "media", color: "#e63946", links: [ { name: "Bilibili", url: "https://www.bilibili.com" }, { name: "Rednote", url: "https://www.xiaohongshu.com" }, { name: "YouTube", url: "https://www.youtube.com" }, { name: "ZLibrary", url: "https://z-library.sk" } ] },
  { title: "social", color: "#7209b7", links: [ { name: "Jike", url: "https://web.okjike.com" }, { name: "Douban", url: "https://movie.douban.com" }, { name: "Reddit", url: "https://www.reddit.com" }, { name: "Linuxdo", url: "https://linux.do" } ] },
  { title: "others", color: "#f8961e", links: [ { name: "JD", url: "https://www.jd.com" }, { name: "Taobao", url: "https://www.taobao.com" }, { name: "Gmail", url: "https://mail.google.com" }, { name: "Qmail", url: "https://wx.mail.qq.com" } ] },
  { title: "ai", color: "#2a9d8f", links: [ { name: "Gemini", url: "https://gemini.google.com" }, { name: "Claude", url: "https://claude.ai" }, { name: "Chatgpt", url: "https://chatgpt.com" }, { name: "Deepseek", url: "https://chat.deepseek.com" } ] }
];

const greeting = document.getElementById("greeting");
const weatherDisplay = document.getElementById("weather");
const weatherTemp = document.getElementById("weather-temp");
const weatherFeelsLike = document.getElementById("weather-feels-like");
const weatherHighLow = document.getElementById("weather-high-low");
const locationModal = document.getElementById("locationModal");
const locCloseButton = document.getElementById("loc-close-button");
const locationInput = document.getElementById("locationInput");
const locationSuggestions = document.getElementById("locationSuggestions");
const locationSelectionPreview = document.getElementById("locationSelectionPreview");
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

const DEFAULT_ENGINES = ['google', 'duckduckgo', 'baidu'].map(key => engineFromPreset(ENGINE_PRESETS.find(preset => preset.key === key)));
let enginesData = [];

function initTheme() { const stored = localStorage.getItem('theme') || 'light'; applyTheme(stored); }
function scheduleIdleTask(fn) {
  if (window.requestIdleCallback) {
    return window.requestIdleCallback(fn, { timeout: 1500 });
  }
  return window.setTimeout(fn, 0);
}
function init() {
  hydrateStaticIcons();
  initTheme();
  loadSiteData();
  loadEnginesData();
  updateAllTexts();
  updateGreeting();
  renderMainPageGroups();
  renderEngineDropdown();
  setSearchEngine(localStorage.getItem('searchEngine') || enginesData[0]?.id || 'google');
  handleFirstVisit();
  scheduleIdleTask(() => initWeather());
}
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
    const title = document.createElement('div');
    title.className = 'group-title';
    title.style.color = group.color;
    title.textContent = group.title;
    div.appendChild(title);
    group.links.forEach(link => {
      const a = document.createElement('a'); a.href = link.url; a.target = "_blank"; a.textContent = link.name;
      div.appendChild(a);
    });
    groupsContainer.appendChild(div);
  });
}

function updateGreeting() { const name = getUserName(); const msg = getGreetingMsg(); greeting.textContent = name ? `Hey ${name}, ${msg}` : `Hey, ${msg}`; }
function setWeatherMessage(message, state = '') {
  weatherDisplay.classList.remove('is-muted', 'is-prompt', 'is-error');
  if (state) weatherDisplay.classList.add(state);
  weatherTemp.textContent = message;
  weatherTemp.style.cssText = '';
  weatherFeelsLike.style.display = weatherHighLow.style.display = 'none';
}
function getSavedWeatherLocation() {
  const stored = localStorage.getItem('weatherLocationData');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) { localStorage.removeItem('weatherLocationData'); }
  }
  const legacyName = localStorage.getItem('weatherLocation');
  return legacyName ? { name: legacyName, location: legacyName } : null;
}
function formatLocation(location) {
  if (!location) return '';
  const parts = [location.name, location.adm2, location.adm1, location.country].filter(Boolean);
  return [...new Set(parts)].join(', ');
}
function weatherLocationValue(location) {
  return location?.id || location?.location || location?.name || '';
}
function locationLookupValue(location) {
  if (typeof location === 'string') return location.trim();
  if (location?.lon != null && location?.lat != null) return `${location.lon},${location.lat}`;
  return (location?.location || location?.name || '').trim();
}
function qweatherLang() {
  return currentLang === 'zh' ? 'zh-hans' : 'en';
}
async function lookupLocations(query, number = 6) {
  const apiKey = getApiKey();
  const value = locationLookupValue(query);
  if (!apiKey || !value) return [];
  const url = `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURIComponent(value)}&number=${number}&lang=${qweatherLang()}&key=${apiKey}`;
  const res = await fetch(url).then(r => r.json());
  if (res.code && res.code !== '200') throw new Error(t('weatherApiFailed'));
  return res.location || [];
}
function initWeather() {
  const key = getApiKey(), loc = getSavedWeatherLocation();
  if (!key) setWeatherMessage(t('needApiKey'), 'is-muted');
  else if (!loc) setWeatherMessage(t('clickToGetLoc'), 'is-prompt');
  else fetchWeatherData(loc);
}
async function fetchWeatherData(loc, isCoords = false) {
  const apiKey = getApiKey();
  if (!apiKey) return;
  const WEATHER_CACHE_TTL = 10 * 60 * 1000;
  const cached = localStorage.getItem('weatherCache'), time = localStorage.getItem('weatherCacheTime');
  if (cached && time && Date.now() - Number(time) < (isCoords ? 120000 : WEATHER_CACHE_TTL)) {
    try { applyWeatherData(JSON.parse(cached)); return; } catch(e) { localStorage.removeItem('weatherCache'); }
  }
  setWeatherMessage(t('loading'), 'is-prompt');
  try {
    const selectedLocation = typeof loc === 'object' && loc.id ? loc : await lookupLocations(loc, 1).then(items => items[0]);
    if (!selectedLocation) throw new Error(t('weatherLocationMissing'));
    const locId = weatherLocationValue(selectedLocation);
    localStorage.setItem('weatherLocationData', JSON.stringify(selectedLocation));
    localStorage.setItem('weatherLocation', selectedLocation.name || locId);
    const [curr, fore] = await Promise.all([
      fetch(`https://devapi.qweather.com/v7/weather/now?location=${locId}&key=${apiKey}`).then(r => r.json()),
      fetch(`https://devapi.qweather.com/v7/weather/3d?location=${locId}&key=${apiKey}`).then(r => r.json())
    ]);
    if (curr.code !== '200' || fore.code !== '200' || !curr.now || !fore.daily?.[0]) throw new Error(t('weatherApiFailed'));
    const data = { temp: Math.round(curr.now.temp), feelsLike: Math.round(curr.now.feelsLike), tempMax: fore.daily[0].tempMax, tempMin: fore.daily[0].tempMin };
    applyWeatherData(data);
    localStorage.setItem('weatherCache', JSON.stringify(data));
    localStorage.setItem('weatherCacheTime', String(Date.now()));
  } catch(e) {
    console.error(e);
    setWeatherMessage(e.message || t('weatherFailed'), 'is-error');
  }
}
function applyWeatherData(data) { weatherDisplay.classList.remove('is-muted', 'is-prompt', 'is-error'); weatherTemp.style.cssText = ''; weatherTemp.textContent = `${data.temp}°C`; weatherFeelsLike.textContent = `${t('feelsLike')} ${data.feelsLike}°C`; weatherHighLow.textContent = `H ${data.tempMax}°C / L ${data.tempMin}°C`; weatherFeelsLike.style.display = weatherHighLow.style.display = ''; }

let selectedWeatherLocation = null;
let locationSearchToken = 0;
function hideLocationSuggestions() {
  locationSuggestions.classList.remove('show');
  locationSuggestions.innerHTML = '';
  locationInput.setAttribute('aria-expanded', 'false');
}
function setLocationPreview(location, kind = 'selected') {
  selectedWeatherLocation = location;
  const locationText = formatLocation(location);
  locationSelectionPreview.textContent = kind === 'detected' ? t('locationDetected', {location: locationText}) : t('locationSelected', {location: locationText});
  locationSelectionPreview.hidden = false;
  saveLocationBtn.textContent = t('confirmLocation');
}
function clearLocationPreview() {
  selectedWeatherLocation = null;
  locationSelectionPreview.hidden = true;
  locationSelectionPreview.textContent = '';
  saveLocationBtn.textContent = t('saveLoc');
}
function renderLocationSuggestions(locations) {
  locationSuggestions.innerHTML = '';
  if (!locations.length) {
    const empty = document.createElement('div');
    empty.className = 'location-suggestion location-suggestion-empty';
    empty.textContent = t('locationNoMatches');
    locationSuggestions.appendChild(empty);
    locationSuggestions.classList.add('show');
    locationInput.setAttribute('aria-expanded', 'true');
    return;
  }
  locations.forEach((location) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'location-suggestion';
    btn.setAttribute('role', 'option');
    const name = document.createElement('span');
    name.className = 'location-suggestion-name';
    name.textContent = location.name;
    const meta = document.createElement('span');
    meta.className = 'location-suggestion-meta';
    meta.textContent = formatLocation(location);
    btn.append(name, meta);
    btn.addEventListener('click', () => {
      locationInput.value = formatLocation(location);
      setLocationPreview(location);
      hideLocationSuggestions();
      locationError.textContent = '';
    });
    locationSuggestions.appendChild(btn);
  });
  locationSuggestions.classList.add('show');
  locationInput.setAttribute('aria-expanded', 'true');
}
const searchLocationSuggestions = debounce(async () => {
  const query = locationInput.value.trim();
  clearLocationPreview();
  locationError.textContent = '';
  if (query.length < 2) {
    hideLocationSuggestions();
    return;
  }
  const token = ++locationSearchToken;
  try {
    const locations = await lookupLocations(query, 6);
    if (token !== locationSearchToken) return;
    renderLocationSuggestions(locations);
  } catch(e) {
    if (token !== locationSearchToken) return;
    console.error(e);
    hideLocationSuggestions();
    locationError.textContent = e.message || t('locationSearchFailed');
  }
}, 250);
function resetLocationModal() {
  const saved = getSavedWeatherLocation();
  locationInput.value = saved ? formatLocation(saved) : '';
  hideLocationSuggestions();
  clearLocationPreview();
  if (saved) setLocationPreview(saved);
  locationError.textContent = '';
  useCurrentLocationBtn.textContent = t('useCurLoc');
}
async function confirmWeatherLocation(location) {
  const loc = location || selectedWeatherLocation;
  if (!loc) {
    locationError.textContent = t('selectLocationFirst');
    return;
  }
  localStorage.removeItem('weatherCache');
  localStorage.removeItem('weatherCacheTime');
  setWeatherMessage(t('loading'), 'is-prompt');
  await fetchWeatherData(loc);
  closeModal(locationModal);
}

function setSearchEngine(id) { const eng = enginesData.find(e => e.id === id) || enginesData[0]; searchInput.placeholder = t('searchWith', {name: eng.name}); setEngineIcon(currentEngineIcon, eng.icon); localStorage.setItem('searchEngine', eng.id); }
function renderEngineDropdown() {
  engineList.innerHTML = '';
  enginesData.forEach(eng => {
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.className = 'engine-list-label';
    label.textContent = eng.name;
    li.append(createEngineIcon(eng.icon), label);
    li.onclick = (e) => { e.stopPropagation(); setSearchEngine(eng.id); engineList.classList.remove('show'); };
    engineList.appendChild(li);
  });
}

function renderUsernameSection() { const name = getUserName(); document.getElementById('username-saved-text').textContent = name; document.getElementById('username-saved-mode').style.display = name ? 'flex' : 'none'; document.getElementById('username-edit-mode').style.display = name ? 'none' : 'flex'; }
function renderApiKeySection() { const key = getApiKey(); if (key) { document.getElementById('api-key-saved-text').textContent = key.length > 8 ? key.substring(0, 4) + '••••••••' + key.substring(key.length - 4) : '••••••••'; document.getElementById('api-key-saved-mode').style.display = 'flex'; document.getElementById('api-key-edit-mode').style.display = 'none'; } else { document.getElementById('api-key-saved-mode').style.display = 'none'; document.getElementById('api-key-edit-mode').style.display = 'flex'; } }

document.querySelectorAll('[data-svg="edit"]').forEach(el => { el.replaceChildren(createIcon('edit')); el.removeAttribute('data-svg'); });
document.querySelectorAll('[data-svg="check"]').forEach(el => { el.replaceChildren(createIcon('check')); el.removeAttribute('data-svg'); });
function debounce(f, d) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), d); }; }
function getFocusableElements(container) {
  return [...container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter(el => el.offsetParent !== null || el === document.activeElement);
}
const modalStack = [];
function getActiveModal() {
  return modalStack[modalStack.length - 1]?.modal || null;
}
function openModal(modal, focusTarget) {
  const existingIndex = modalStack.findIndex(entry => entry.modal === modal);
  if (existingIndex >= 0) modalStack.splice(existingIndex, 1);
  modalStack.push({ modal, returnFocus: document.activeElement instanceof HTMLElement ? document.activeElement : null });
  modal.style.display = 'flex';
  const focusable = getFocusableElements(modal);
  (focusTarget || focusable[0] || modal).focus({ preventScroll: true });
}
function closeModal(modal, options = {}) {
  modal.style.display = 'none';
  const index = modalStack.findIndex(entry => entry.modal === modal);
  const entry = index >= 0 ? modalStack.splice(index, 1)[0] : null;
  if (!options.keepFocus && entry?.returnFocus?.isConnected) entry.returnFocus.focus({ preventScroll: true });
}
function closeOnBackdropClick(modal, onClose) {
  let pointerStartedOnBackdrop = false;
  modal.addEventListener('pointerdown', e => {
    pointerStartedOnBackdrop = e.target === modal;
  });
  modal.addEventListener('click', e => {
    if (e.target === modal && pointerStartedOnBackdrop) onClose();
    pointerStartedOnBackdrop = false;
  });
}
document.addEventListener('keydown', e => {
  const activeModal = getActiveModal();
  if (!activeModal) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    if (activeModal === customConfirmModal) { confirmNoBtn.click(); return; }
    if (activeModal === settingsModal) { settingsCloseButton.click(); return; }
    if (activeModal === locationModal) { locCloseButton.click(); }
    return;
  }
  if (e.key !== 'Tab') return;
  const focusable = getFocusableElements(activeModal);
  if (!focusable.length) { e.preventDefault(); activeModal.focus({ preventScroll: true }); return; }
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus({ preventScroll: true }); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus({ preventScroll: true }); }
});
function customConfirm(m) { return new Promise(res => { customConfirmMessage.textContent = m; openModal(customConfirmModal, confirmNoBtn); confirmYesBtn.onclick = () => { closeModal(customConfirmModal); res(true); }; confirmNoBtn.onclick = () => { closeModal(customConfirmModal); res(false); }; }); }

weatherDisplay.onclick = () => {
  if (!getApiKey()) {
    settingsIcon.click();
    return;
  }
  resetLocationModal();
  openModal(locationModal, locationInput);
};
locCloseButton.onclick = () => closeModal(locationModal);
closeOnBackdropClick(locationModal, () => locCloseButton.onclick());
locationInput.addEventListener('input', searchLocationSuggestions);
locationInput.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const firstSuggestion = locationSuggestions.querySelector('.location-suggestion:not(.location-suggestion-empty)');
  if (firstSuggestion && locationSuggestions.classList.contains('show')) {
    firstSuggestion.click();
    return;
  }
  confirmWeatherLocation();
});
saveLocationBtn.onclick = () => confirmWeatherLocation();
useCurrentLocationBtn.onclick = () => {
  locationError.textContent = '';
  if (!navigator.geolocation) { locationError.textContent = t('locNotSupported'); return; }
  useCurrentLocationBtn.textContent = t('gettingLoc');
  navigator.geolocation.getCurrentPosition(
    async p => {
      try {
        const locations = await lookupLocations({ lat: p.coords.latitude, lon: p.coords.longitude }, 1);
        if (!locations[0]) throw new Error(t('weatherLocationMissing'));
        locationInput.value = formatLocation(locations[0]);
        setLocationPreview(locations[0], 'detected');
        hideLocationSuggestions();
      } catch(e) {
        console.error(e);
        locationError.textContent = e.message || t('locFailed');
      } finally {
        useCurrentLocationBtn.textContent = t('useCurLoc');
      }
    },
    () => {
      locationError.textContent = t('locFailed');
      setWeatherMessage(t('locFailed'), 'is-error');
      useCurrentLocationBtn.textContent = t('useCurLoc');
    }
  );
};
settingsIcon.onclick = async () => { await renderSettingsGroups(); openModal(settingsModal, settingsGroupsContainer.querySelector('input, button') || settingsCloseButton); };
settingsCloseButton.onclick = () => { closeModal(settingsModal); saveSiteData(); renderMainPageGroups(); };
closeOnBackdropClick(settingsModal, () => settingsCloseButton.onclick());
document.getElementById('langToggleBtnSettings').onclick = () => { currentLang = currentLang === 'zh' ? 'en' : 'zh'; localStorage.setItem('lang', currentLang); updateAllTexts(); };
document.getElementById('saveUsernameBtn').onclick = () => { localStorage.setItem('userName', document.getElementById('usernameInput').value.trim()); renderUsernameSection(); updateGreeting(); };
document.getElementById('editUsernameBtn').onclick = () => { document.getElementById('username-saved-mode').style.display = 'none'; document.getElementById('username-edit-mode').style.display = 'flex'; };
document.getElementById('saveApiKeyBtn').onclick = () => { localStorage.setItem('qweatherApiKey', document.getElementById('apiKeyInput').value.trim()); localStorage.removeItem('weatherCache'); initWeather(); renderApiKeySection(); };
document.getElementById('editApiKeyBtn').onclick = () => { document.getElementById('api-key-saved-mode').style.display = 'none'; document.getElementById('api-key-edit-mode').style.display = 'flex'; };

searchEngineSelector.onclick = e => { e.stopPropagation(); engineList.classList.toggle('show'); };
document.onclick = () => engineList.classList.remove('show');
searchForm.onsubmit = e => { e.preventDefault(); const q = searchInput.value.trim(); if (!q) return; const isUrl = /^https?:\/\//i.test(q) || /^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(q) || /^[^\s]+\.[a-z]{2,}([:\/?#].*)?$/i.test(q); if (isUrl) { window.open(/^https?:\/\//i.test(q) ? q : 'https://' + q, '_blank'); } else { const eng = enginesData.find(e => e.id === (localStorage.getItem('searchEngine') || enginesData[0].id)); window.open(eng.url.replace('{query}', encodeURIComponent(q)), '_blank'); } };

addNewGroupBtn.addEventListener('click', () => { const n = prompt(t('newGroupNamePrompt')); if (n && n.trim()) { siteData.push({ title: n.trim(), color: '#ffa726', links: [] }); renderSettingsGroups(); renderMainPageGroups(); setTimeout(() => settingsGroupsContainer.scrollTop = settingsGroupsContainer.scrollHeight, 100); } });
document.getElementById('editEnginesBtn').addEventListener('click', editEngines);

async function editEngines() {
  await ensureSortable();
  settingsTitle.textContent = t('customEngine'); settingsActions.style.display = 'none'; globalSettingsSection.style.display = 'none'; document.getElementById('langToggleBtnSettings').style.display = 'none';
  const renderEngineList = () => {
    settingsGroupsContainer.innerHTML = '';
    enginesData.forEach((eng, idx) => {
      const d = document.createElement('div'); d.className = 'setting-item group-item';
      const name = document.createElement('span'); name.className = 'engine-name'; name.textContent = eng.name;
      const editBtn = document.createElement('button'); editBtn.className = 'btn btn-icon edit-eng-btn'; editBtn.appendChild(createIcon('edit'));
      const delBtn = document.createElement('button'); delBtn.className = 'btn btn-icon btn-danger del-eng-btn'; delBtn.appendChild(createIcon('trash'));
      d.append(createIcon('bars', 'handle'), createEngineIcon(eng.icon, 'engine-icon'), name, editBtn, delBtn);
      settingsGroupsContainer.appendChild(d);
      d.querySelector('.edit-eng-btn').addEventListener('click', () => editSingleEngine(idx, renderEngineList));
      d.querySelector('.del-eng-btn').addEventListener('click', async () => { if (enginesData.length <= 1) { alert(t('keepOneEngine')); return; } if (await customConfirm(t('delEngineConfirm', {name: eng.name}))) { enginesData.splice(idx, 1); saveEnginesData(); renderEngineDropdown(); if (localStorage.getItem('searchEngine') === eng.id) setSearchEngine(enginesData[0].id); renderEngineList(); } });
    });
    const actions = document.createElement('div'); actions.className = 'settings-inline-actions';
    const addEngBtn = document.createElement('button'); addEngBtn.id = 'addEngBtn'; addEngBtn.className = 'btn btn-primary'; addEngBtn.append(createIcon('plus'), document.createTextNode(` ${t('customEngine')}`));
    const backFromEng = document.createElement('button'); backFromEng.id = 'backFromEng'; backFromEng.className = 'btn btn-secondary'; backFromEng.textContent = t('back');
    actions.replaceChildren(addEngBtn, backFromEng);
    settingsGroupsContainer.appendChild(actions);
    document.getElementById('addEngBtn').onclick = () => { const newId = 'custom_' + Date.now(); enginesData.push({ id: newId, name: 'New Engine', url: 'https://example.com/search?q={query}', icon: 'search' }); saveEnginesData(); renderEngineDropdown(); renderEngineList(); setTimeout(() => editSingleEngine(enginesData.length - 1, renderEngineList), 50); };
    document.getElementById('backFromEng').onclick = () => { saveEnginesData(); renderEngineDropdown(); setSearchEngine(localStorage.getItem('searchEngine') || enginesData[0]?.id); renderSettingsGroups(); };
    if (sortableInst) sortableInst.destroy();
    sortableInst = new Sortable(settingsGroupsContainer, { 
      handle: '.handle', animation: reducedMotionQuery.matches ? 0 : 150, 
      forceFallback: true,
      fallbackClass: 'sortable-fallback',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      filter: '#addEngBtn, #backFromEng', 
      onEnd: e => { const item = enginesData.splice(e.oldIndex, 1)[0]; enginesData.splice(e.newIndex, 0, item); saveEnginesData(); renderEngineDropdown(); }
    });
  };
  renderEngineList();
}

function hideEnginePresetSuggestions(container) {
  container.classList.remove('show');
  container.innerHTML = '';
}
function renderEnginePresetSuggestions(query, container, onSelect) {
  const matches = getMatchingEnginePresets(query);
  container.innerHTML = '';
  if (!matches.length) {
    container.classList.remove('show');
    return;
  }
  matches.forEach(preset => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'engine-preset-suggestion';
    button.setAttribute('role', 'option');
    button.addEventListener('pointerdown', e => e.preventDefault());
    button.addEventListener('click', () => onSelect(preset));

    const text = document.createElement('span');
    text.className = 'engine-preset-suggestion-text';
    const name = document.createElement('span');
    name.className = 'engine-preset-suggestion-name';
    name.textContent = preset.name;
    const url = document.createElement('span');
    url.className = 'engine-preset-suggestion-url';
    url.textContent = preset.url;
    text.append(name, url);

    button.append(createEngineIcon(preset.icon, 'engine-preset-suggestion-icon'), text);
    container.appendChild(button);
  });
  container.classList.add('show');
}

function editSingleEngine(idx, onBack) {
  const eng = enginesData[idx]; settingsTitle.textContent = t('editEngine', {name: eng.name}); document.getElementById('langToggleBtnSettings').style.display = 'none';
  settingsGroupsContainer.innerHTML = '';
  const form = document.createElement('div'); form.className = 'settings-form-stack';
  const nameField = document.createElement('div'); nameField.className = 'settings-field engine-preset-field';
  const nameLabel = document.createElement('label'); nameLabel.textContent = t('engineName');
  const nameInput = document.createElement('input'); nameInput.type = 'text'; nameInput.className = 'setting-input standalone-input full-width'; nameInput.id = 'engEditName'; nameInput.value = eng.name; nameInput.placeholder = t('engineNamePlaceholder'); nameInput.autocomplete = 'off';
  const enginePresetSuggestions = document.createElement('div'); enginePresetSuggestions.id = 'enginePresetSuggestions'; enginePresetSuggestions.className = 'engine-preset-suggestions'; enginePresetSuggestions.setAttribute('role', 'listbox');
  nameField.append(nameLabel, nameInput, enginePresetSuggestions);
  const urlField = document.createElement('div'); urlField.className = 'settings-field';
  const urlLabel = document.createElement('label'); urlLabel.textContent = t('engineUrl');
  const urlInput = document.createElement('input'); urlInput.type = 'text'; urlInput.className = 'setting-input standalone-input full-width'; urlInput.id = 'engEditUrl'; urlInput.value = eng.url; urlInput.placeholder = t('engineUrlPlaceholder');
  urlField.append(urlLabel, urlInput);
  form.append(nameField, urlField);
  const actions = document.createElement('div'); actions.className = 'settings-actions-stack';
  const saveBtn = document.createElement('button'); saveBtn.id = 'saveEngBtn'; saveBtn.className = 'btn btn-primary'; saveBtn.append(createIcon('check'), document.createTextNode(` ${t('save')}`));
  const backBtn = document.createElement('button'); backBtn.id = 'backFromSingleEng'; backBtn.className = 'btn btn-secondary'; backBtn.textContent = t('back');
  actions.append(saveBtn, backBtn);
  settingsGroupsContainer.append(form, actions);
  const selectEnginePreset = preset => {
    nameInput.value = preset.name;
    urlInput.value = preset.url;
    hideEnginePresetSuggestions(enginePresetSuggestions);
    nameInput.focus({ preventScroll: true });
    nameInput.select();
  };
  nameInput.addEventListener('input', () => renderEnginePresetSuggestions(nameInput.value, enginePresetSuggestions, selectEnginePreset));
  nameInput.addEventListener('focus', () => {
    if (nameInput.value !== eng.name) renderEnginePresetSuggestions(nameInput.value, enginePresetSuggestions, selectEnginePreset);
  });
  nameInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideEnginePresetSuggestions(enginePresetSuggestions);
  });
  nameInput.addEventListener('blur', () => setTimeout(() => hideEnginePresetSuggestions(enginePresetSuggestions), 120));
  document.getElementById('saveEngBtn').onclick = () => {
    let name = document.getElementById('engEditName').value.trim(); let url  = document.getElementById('engEditUrl').value.trim();
    const exactPreset = findExactEnginePresetByName(name);
    if (exactPreset && !url) {
      name = exactPreset.name;
      url = exactPreset.url;
    }
    if (!name || !url) { alert(t('engineNameUrlEmpty')); return; }
    url = normalizeSearchEngineUrl(url);
    const preset = exactPreset || findEnginePresetByUrl(url);
    if (exactPreset) name = exactPreset.name;
    const i = preset?.icon || iconForEngine(name, url);
    enginesData[idx] = { ...eng, name, url, icon: i }; saveEnginesData(); renderEngineDropdown(); if (localStorage.getItem('searchEngine') === eng.id) setSearchEngine(eng.id); onBack();
  };
  document.getElementById('backFromSingleEng').onclick = onBack;
  setTimeout(() => { nameInput.focus({ preventScroll: true }); nameInput.select(); }, 0);
}

let sortableInst = null;
let sortableLoadPromise = null;
function ensureSortable() {
  if (window.Sortable) return Promise.resolve(window.Sortable);
  if (!sortableLoadPromise) {
    sortableLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'Sortable.min.js';
      script.onload = () => resolve(window.Sortable);
      script.onerror = () => reject(new Error('Failed to load Sortable.min.js'));
      document.head.appendChild(script);
    });
  }
  return sortableLoadPromise;
}
async function renderSettingsGroups() {
  settingsTitle.textContent = t('settings'); globalSettingsSection.style.display = "flex"; settingsActions.style.display = "block"; document.getElementById('langToggleBtnSettings').style.display = 'flex';
  settingsGroupsContainer.innerHTML = '';
  siteData.forEach((g) => {
    const div = document.createElement('div'); div.className = 'setting-item group-item';
    const input = document.createElement('input'); input.type = 'text'; input.className = 'setting-input setting-input-flush'; input.value = g.title;
    const editBtn = document.createElement('button'); editBtn.className = 'btn btn-icon edit-btn'; editBtn.appendChild(createIcon('edit'));
    const delBtn = document.createElement('button'); delBtn.className = 'btn btn-icon btn-danger del-btn'; delBtn.appendChild(createIcon('trash'));
    div.append(createIcon('bars', 'handle'), input, editBtn, delBtn);
    input.oninput = e => { g.title = e.target.value; };
    editBtn.onclick = () => editGroup(g);
    delBtn.onclick = async () => {
      if (await customConfirm(t('delGroupConfirm'))) {
        const idx = siteData.indexOf(g);
        if (idx !== -1) {
          siteData.splice(idx, 1);
          renderSettingsGroups();
        }
      }
    };
    settingsGroupsContainer.appendChild(div);
  });
  await ensureSortable();
  if (sortableInst) sortableInst.destroy();
  sortableInst = new Sortable(settingsGroupsContainer, { 
    handle: '.handle', animation: reducedMotionQuery.matches ? 0 : 150, 
    forceFallback: true, 
    fallbackClass: 'sortable-fallback',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    onEnd: e => { const item = siteData.splice(e.oldIndex, 1)[0]; siteData.splice(e.newIndex, 0, item); saveSiteData(); renderMainPageGroups(); } 
  });
}

async function editGroup(group) {
  await ensureSortable();
  const g = group;
  settingsTitle.textContent = ''; settingsTitle.append(createIcon('folder'), document.createTextNode(g.title)); settingsTitle.querySelector('.ui-icon').style.cssText = `color:${g.color}; margin-right:8px;`; globalSettingsSection.style.display = "none"; settingsActions.style.display = "none"; document.getElementById('langToggleBtnSettings').style.display = 'none';
  settingsGroupsContainer.innerHTML = '';
  const list = document.createElement('div'); list.id = 'l-list'; list.className = 'link-list';
  const actions = document.createElement('div'); actions.className = 'settings-inline-actions';
  const addBtn = document.createElement('button'); addBtn.id = 'addL'; addBtn.className = 'btn btn-primary'; addBtn.append(createIcon('plus'), document.createTextNode(` ${t('addNewLink')}`));
  const backBtn = document.createElement('button'); backBtn.id = 'backG'; backBtn.className = 'btn btn-secondary'; backBtn.textContent = t('back');
  actions.append(addBtn, backBtn);
  settingsGroupsContainer.append(list, actions);
  const render = () => {
    list.innerHTML = '';
    g.links.forEach((l) => {
      const d = document.createElement('div'); d.className = 'setting-item link-item';
      const nameInput = document.createElement('input'); nameInput.type = 'text'; nameInput.className = 'setting-input link-name-input'; nameInput.value = l.name; nameInput.placeholder = t('linkNamePlaceholder');
      const divider = document.createElement('div'); divider.className = 'link-divider';
      const urlInput = document.createElement('input'); urlInput.type = 'text'; urlInput.className = 'setting-input link-url-input'; urlInput.value = l.url; urlInput.placeholder = 'URL';
      const delBtn = document.createElement('button'); delBtn.className = 'btn btn-icon btn-danger'; delBtn.appendChild(createIcon('trash'));
      d.append(createIcon('bars', 'handle'), nameInput, divider, urlInput, delBtn);
      nameInput.oninput = e => { l.name = e.target.value; };
      urlInput.oninput = e => { l.url = e.target.value; };
      delBtn.onclick = async () => {
        if (await customConfirm(t('delLinkConfirm'))) {
          const linkIdx = g.links.indexOf(l);
          if (linkIdx !== -1) {
            g.links.splice(linkIdx, 1);
            render();
          }
        }
      };
      list.appendChild(d);
    });
    if (sortableInst) sortableInst.destroy();
    sortableInst = new Sortable(list, {
      handle: '.handle', animation: reducedMotionQuery.matches ? 0 : 150,
      forceFallback: true,
      fallbackClass: 'sortable-fallback',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      onEnd: e => { const item = g.links.splice(e.oldIndex, 1)[0]; g.links.splice(e.newIndex, 0, item); saveSiteData(); renderMainPageGroups(); }
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
