/* Text, preset catalogs, icons and theme presentation. */
const appStorage = window.startPageStorage;
const i18n = {
  zh: {
    storageTemporary: "当前无法自动保存，关闭前请导出配置。", settingsBusy: "另一个页面正在编辑设置，请先在那里关闭设置。", settingsChanged: "其他页面已更新配置，本页已停止保存。请关闭设置后重新打开，载入最新配置。",sortUnavailable: "拖动暂不可用，可聚焦排序图标后用 Alt + ↑ / ↓ 调整顺序。", sortKeyboard: "排序：Alt + ↑ / ↓", invalidUrl: "请输入有效的 HTTP 或 HTTPS 网址", invalidEngine: "请填写有效名称和搜索网址，并在网址中用 {query} 表示搜索词", requestTimeout: "请求超时，请重试", locationNoMatches: "没有匹配的城市", weatherSettings: "天气设置", toggleTheme: "切换深浅主题", close: "关闭", newEngine: "添加搜索引擎", invalidConfig: "配置格式或内容无效，已保留恢复副本。",
    editUsername: "编辑用户名", editApiKey: "编辑 API Key", apiKeyLabel: "天气 API Key", groupColor: "分组颜色", urlLabel: "网站网址",
    groupLimit: "最多可添加 {limit} 个分组。", linkLimit: "最多可添加 {limit} 个链接。", engineLimit: "最多可添加 {limit} 个搜索引擎。", backupTooLarge: "配置文件超过 {limit} MiB 上限。", exportFailed: "当前配置包含无效内容，无法导出，请检查设置。",
    locationApiFailed: "城市查询服务返回异常，请稍后重试。", locationTimeout: "城市查询超时，请重试。",
    searchSettings: "搜索引擎", configured: "已配置", notConfigured: "未配置", locationLabel: "位置", locationUnset: "未选择", configureWeatherFirst: "请先填写并保存天气 API Key。",
    weatherHostLabel: "API Host（控制台设置，可选）", weatherHostInvalid: "请输入控制台分配的 *.qweatherapi.com 域名",
    backup: "配置备份", includeApiKey: "包含天气 API Key", exportKeyHint: "勾选后，导出的文件将包含明文 Key。", showApiKey: "显示 API Key", hideApiKey: "隐藏 API Key",
    settings: "设置", inputLocation: "输入您的位置", locPlaceholder: "输入城市并选择匹配位置", saveLoc: "保存位置", useCurLoc: "使用当前位置",
    addNewGroup: "添加新分组", customEngine: "自定义搜索引擎", inputApiKey: "输入和风天气 API Key",
    applyApiKey: '前往 <a href="https://dev.qweather.com" target="_blank" rel="noopener">dev.qweather.com</a> 免费申请 API Key',
    searchPlaceholder: "Search something...", searchWith: "Search with {name}", delGroupConfirm: "确认删除该分组及内部所有链接吗?",
    delLinkConfirm: "确认删除该链接吗?", delEngineConfirm: "确认删除\"{name}\"?", editEngine: "编辑：{name}", engineName: "名称",
    engineNamePlaceholder: "如: Google", engineUrl: "搜索网址（用 {query} 表示搜索词）", engineUrlPlaceholder: "https://example.com/search?q={query}",
    save: "保存", back: "返回", addNewLink: "添加新链接", linkNamePlaceholder: "网站名称",
    newGroupNamePrompt: "请输入新分组名称:", engineNameUrlEmpty: "名称和网址不能为空", keepOneEngine: "至少保留一个搜索引擎",
    yes: "是", no: "否", ok: "确定", cancel: "取消", exportConfig: "导出配置", importConfig: "导入配置", importSuccess: "配置导入成功", importFailed: "配置文件无效", importConfirm: "导入将覆盖当前配置，继续吗？", needApiKey: "天气服务需要自行申请API Key，点击右下角齿轮进行设置", clickToGetLoc: "点击获取位置",
    loading: "加载中...", locNotSupported: "您的浏览器不支持地理定位。", gettingLoc: "正在获取当前位置...",
    locFailed: "定位失败，请手动输入城市或检查权限。", weatherFailed: "天气获取失败，点击重试",
    weatherLocationMissing: "未找到该城市", weatherApiFailed: "天气服务返回异常", locationSearchFailed: "位置搜索失败，请稍后重试", locationSelected: "已选择：{location}",
    locationDetected: "识别到：{location}", confirmLocation: "确认位置", selectLocationFirst: "请先从下拉列表选择一个位置",
    feelsLike: "体感", groupNamePlaceholder: "分组名称", dragSortTitle: "拖动排序", delLinkTitle: "删除链接",
    editBtnTitle: "编辑", delGroupTitle: "删除分组", usernamePlaceholder: "输入您的名字", welcomeSkip: "Skip"
  },
  en: {
    storageTemporary: "Settings cannot be saved automatically. Export them before closing.", settingsBusy: "Settings are being edited in another page. Close them there first.", settingsChanged: "Another page updated the settings. Saving is paused here. Close and reopen settings to load the latest version.", sortUnavailable: "Drag sorting is unavailable. Focus a sort handle and use Alt + Up / Down.", sortKeyboard: "Reorder: Alt + Up / Down", invalidUrl: "Enter a valid HTTP or HTTPS URL", invalidEngine: "Enter a name and a valid search URL containing {query}", requestTimeout: "Request timed out. Please retry.", locationNoMatches: "No matching cities", weatherSettings: "Weather settings", toggleTheme: "Toggle light/dark theme", close: "Close", newEngine: "Add search engine", invalidConfig: "Invalid settings; a recovery copy has been retained.",
    editUsername: "Edit username", editApiKey: "Edit API Key", apiKeyLabel: "Weather API Key", groupColor: "Group color", urlLabel: "Website URL",
    groupLimit: "You can add up to {limit} groups.", linkLimit: "You can add up to {limit} links.", engineLimit: "You can add up to {limit} search engines.", backupTooLarge: "The configuration file exceeds the {limit} MiB limit.", exportFailed: "The current settings contain invalid values and cannot be exported. Please check your settings.",
    locationApiFailed: "City lookup service error. Please try again.", locationTimeout: "City lookup timed out. Please retry.",
    searchSettings: "Search engines", configured: "Configured", notConfigured: "Not configured", locationLabel: "Location", locationUnset: "Not selected", configureWeatherFirst: "Enter and save the weather API Key first.",
    weatherHostLabel: "API Host (Console settings, optional)", weatherHostInvalid: "Enter the *.qweatherapi.com hostname assigned in the Console",
    backup: "Configuration backup", includeApiKey: "Include weather API Key", exportKeyHint: "When selected, the exported file will contain the Key in plain text.", showApiKey: "Show API Key", hideApiKey: "Hide API Key",
    settings: "Settings", inputLocation: "Enter your location", locPlaceholder: "Type a city and choose a match", saveLoc: "Save Location", useCurLoc: "Use Current Location",
    addNewGroup: "Add New Group", customEngine: "Search Engines", inputApiKey: "Enter QWeather API Key",
    applyApiKey: 'Get a free API Key at <a href="https://dev.qweather.com" target="_blank" rel="noopener">dev.qweather.com</a>',
    searchPlaceholder: "Search something...", searchWith: "Search with {name}", delGroupConfirm: "Delete this group and all its links?",
    delLinkConfirm: "Delete this link?", delEngineConfirm: "Delete \"{name}\"?", editEngine: "Edit: {name}", engineName: "Name",
    engineNamePlaceholder: "e.g., Google", engineUrl: "Search URL (use {query} for the search term)", engineUrlPlaceholder: "https://example.com/search?q={query}",
    save: "Save", back: "Back", addNewLink: "Add New Link", linkNamePlaceholder: "Site Name",
    newGroupNamePrompt: "Enter new group name:", engineNameUrlEmpty: "Name and URL cannot be empty", keepOneEngine: "Keep at least one search engine",
    yes: "Yes", no: "No", ok: "OK", cancel: "Cancel", exportConfig: "Export Config", importConfig: "Import Config", importSuccess: "Configuration imported", importFailed: "Invalid configuration file", importConfirm: "Importing will replace your current configuration. Continue?", needApiKey: "API Key is required for weather. Click the gear icon to set it.", clickToGetLoc: "Click to get location",
    loading: "Loading...", locNotSupported: "Geolocation is not supported by your browser.", gettingLoc: "Getting current location...",
    locFailed: "Location failed. Please enter manually or check permissions.", weatherFailed: "Weather failed. Click to retry",
    weatherLocationMissing: "Location not found", weatherApiFailed: "Weather service error", locationSearchFailed: "Location search failed. Please try again.", locationSelected: "Selected: {location}",
    locationDetected: "Detected: {location}", confirmLocation: "Confirm Location", selectLocationFirst: "Please choose a location from the list first",
    feelsLike: "Feels", groupNamePlaceholder: "Group Name", dragSortTitle: "Drag to sort", delLinkTitle: "Delete Link",
    editBtnTitle: "Edit", delGroupTitle: "Delete Group", usernamePlaceholder: "Enter your name", welcomeSkip: "Skip"
  }
};

let currentLang = appStorage.getItem('lang') || 'zh';
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
function t(key, params) {
  let text = (i18n[currentLang] || i18n.zh)[key] || key;
  if (params) for (let k in params) text = text.replaceAll(`{${k}}`, params[k]);
  return text;
}

const greetingPeriods = [
  { end: 5, messages: ["up late, night owl?", "it's late, get some rest.", "still awake?"] },
  { end: 9, messages: ["early bird!", "good morning, early riser!", "ready for a new day?"] },
  { end: 12, messages: ["good morning!", "have a great morning!", "rise and shine!"] },
  { end: 18, messages: ["good afternoon!", "hope your day is going well!", "stay focused!"] },
  { end: 22, messages: ["good evening!", "time to wind down.", "hope you had a great day!"] },
  { end: 24, messages: ["good night!", "late night browsing?", "time to rest soon."] }
];
function getGreetingPeriod(date = new Date()) { return greetingPeriods.findIndex(period => date.getHours() < period.end); }
function getGreetingMsg(date = new Date()) {
  const period = getGreetingPeriod(date), messages = greetingPeriods[period].messages;
  // Local calendar date, not elapsed hours: stable across reloads/tabs and DST changes.
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return messages[((day + period) % messages.length + messages.length) % messages.length];
}

const ICONS = {
  cloud: '<svg viewBox="0 0 24 24"><path d="M7 19h10a4 4 0 0 0 0-8 6 6 0 0 0-12 0 4 4 0 0 0 2 8Z"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24"><path d="m3 3 18 18M10.6 5.1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3 3.8M6.3 6.3A20 20 0 0 0 2 12s3.5 7 10 7c1.9 0 3.6-.6 5-1.5M10 10a3 3 0 0 0 4 4"/></svg>',
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
  google: 'assets/engine-icons/google.ico',
  duckduckgo: 'assets/engine-icons/duckduckgo.ico',
  baidu: 'assets/engine-icons/baidu.ico',
  bing: 'assets/engine-icons/bing.ico',
  yahoo: 'assets/engine-icons/yahoo.ico',
  yandex: 'assets/engine-icons/yandex.ico',
  bilibili: 'assets/engine-icons/bilibili.ico',
  github: 'assets/engine-icons/github.svg',
  zhihu: 'assets/engine-icons/zhihu.ico'
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
  try {
    const host = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./i, '').toLowerCase();
    return ENGINE_PRESETS.find(preset => {
      const presetHost = new URL(preset.url).hostname.replace(/^www\./i, '');
      return host === presetHost || host === presetHost.replace(/^search\./, '');
    }) || null;
  } catch { return null; }
}
function getMatchingEnginePresets(query) {
  return ENGINE_PRESETS.filter(preset => presetMatchesQuery(preset, query)).slice(0, 6);
}
function normalizeSearchEngineUrl(url) {
  const value = url.trim();
  if (value.includes('{query}')) return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const preset = findEnginePresetByUrl(value);
  return preset ? preset.url : value;
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
  if (el.dataset.engineIcon === name && el.firstElementChild) return;
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
  img.loading = 'eager';
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
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  document.documentElement.classList.toggle('dark-mode', isDark);
  themeToggleBtn.replaceChildren(createIcon(isDark ? 'sun' : 'moon'));
}

themeToggleBtn.addEventListener('click', (e) => {
  const isDark = document.body.classList.contains('dark-mode');
  const newTheme = isDark ? 'light' : 'dark';
  const x = e.clientX || window.innerWidth / 2; const y = e.clientY || window.innerHeight / 2;
  document.documentElement.style.setProperty('--click-x', `${x}px`);
  document.documentElement.style.setProperty('--click-y', `${y}px`);
  if (reducedMotionQuery.matches || !document.startViewTransition) { appStorage.setItem('theme', newTheme); applyTheme(newTheme); return; }
  const transitionClass = isDark ? 'theme-transition-shrink' : 'theme-transition-expand';
  document.documentElement.classList.add(transitionClass);
  const transition = document.startViewTransition(() => { appStorage.setItem('theme', newTheme); applyTheme(newTheme); });
  transition.finished.finally(() => { document.documentElement.classList.remove('theme-transition-expand', 'theme-transition-shrink'); });
});

