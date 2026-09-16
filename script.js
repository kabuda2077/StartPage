function updateAllTexts() {
  if (currentLang !== 'zh' && currentLang !== 'en') currentLang = 'zh';
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.getElementById('langToggleBtnSettings').textContent = currentLang === 'zh' ? 'EN' : '中';
  document.getElementById('search-input').placeholder = t('searchPlaceholder');
  updateGreeting();
  document.getElementById('loc-modal-title').textContent = t('inputLocation');
  document.getElementById('locationInput').placeholder = t('locPlaceholder');
  document.getElementById('saveLocationBtn').textContent = t('saveLoc');
  document.getElementById('useCurrentLocationBtn').textContent = t('useCurLoc');
  document.getElementById('settings-title').textContent = weatherSettingsPage.hidden ? t('settings') : t('weatherSettings');
  document.getElementById('addNewGroupBtnText').textContent = t('addNewGroup');
  document.getElementById('editEnginesBtnText').textContent = t('searchSettings');
  document.getElementById('weatherSettingsBtnText').textContent = t('weatherSettings');
  document.getElementById('weatherLocationLabel').textContent = t('locationLabel');
  settingsBackButton.setAttribute('aria-label', t('back')); settingsBackButton.title = t('back');
  updateWeatherSummary();
  document.getElementById('usernameInput').placeholder = t('usernamePlaceholder');
  document.getElementById('apiKeyInput').placeholder = t('inputApiKey');
  document.getElementById('applyApiKeyText').innerHTML = t('applyApiKey');
  document.getElementById('confirm-yes').textContent = t('yes');
  document.getElementById('confirm-no').textContent = t('no');
  customInputYes.textContent = t('ok');
  customInputNo.textContent = t('cancel');
  customNoticeClose.textContent = t('ok');
  exportConfigBtn.textContent = t('exportConfig');
  importConfigBtn.textContent = t('importConfig');
  document.querySelector('.settings-backup-section').setAttribute('aria-label', t('backup'));
  document.getElementById('export-config-title').textContent = t('exportConfig');
  document.getElementById('include-api-key-label').textContent = t('includeApiKey');
  document.getElementById('export-key-hint').textContent = t('exportKeyHint');
  confirmExportBtn.textContent = t('exportConfig');
  cancelExportBtn.textContent = t('cancel');
  setApiKeyVisible(apiKeyInput.type === 'text');
  searchEngineSelector.setAttribute('aria-label', t('customEngine'));
  settingsIcon.setAttribute('aria-label', t('settings'));
  renderUsernameSection();
  renderApiKeySection();
  updateSettingsStatus();
  document.getElementById('weather-host-label').textContent = t('weatherHostLabel');
  document.getElementById('weatherHostInput').value = appStorage.getItem('qweatherApiHost') || '';
  document.getElementById('saveWeatherHostBtn').setAttribute('aria-label', t('save'));
  weatherDisplay.setAttribute('aria-label', t('weatherSettings'));
  themeToggleBtn.setAttribute('aria-label', t('toggleTheme'));
  document.querySelectorAll('.close-btn').forEach(button => button.setAttribute('aria-label', t('close')));
  document.getElementById('saveUsernameBtn').setAttribute('aria-label', t('save'));
  document.getElementById('saveApiKeyBtn').setAttribute('aria-label', t('save'));
  document.getElementById('editUsernameBtn').setAttribute('aria-label', t('editUsername'));
  document.getElementById('editApiKeyBtn').setAttribute('aria-label', t('editApiKey'));
  const buttonTexts = {
    'settings-icon': 'settings', 'theme-toggle-icon': 'toggleTheme',
    editUsernameBtn: 'editUsername', editApiKeyBtn: 'editApiKey',
    saveUsernameBtn: 'save', saveApiKeyBtn: 'save', saveWeatherHostBtn: 'save'
  };
  for (const [id, key] of Object.entries(buttonTexts)) document.getElementById(id).title = t(key);
  apiKeyInput.setAttribute('aria-label', t('apiKeyLabel'));
  document.querySelectorAll('.close-btn').forEach(button => { button.title = t('close'); });
  document.querySelectorAll('[data-i18n-aria]').forEach(element => element.setAttribute('aria-label', t(element.dataset.i18nAria)));
  document.querySelectorAll('[data-i18n-title]').forEach(element => { element.title = t(element.dataset.i18nTitle); });
  if (enginesData.length) setSearchEngine(appStorage.getItem('searchEngine'));
}

function getApiKey() { return appStorage.getItem('qweatherApiKey') || ''; }
function getUserName() { return appStorage.getItem('userName') || ''; }

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
const settingsBackButton = document.getElementById('settings-back-button');
const weatherSettingsPage = document.getElementById('weather-settings-page');
const weatherLocationEditor = document.getElementById('weather-location-editor');
const locationFields = document.getElementById('location-fields');
const settingsGroupsContainer = document.getElementById("settings-groups-container");
const addNewGroupBtn = document.getElementById("addNewGroupBtn");
const settingsTitle = document.getElementById("settings-title");
const globalSettingsSection = document.getElementById("global-settings-section");
const settingsActions = document.getElementById("settings-actions");
const customConfirmModal = document.getElementById('customConfirmModal');
const customConfirmMessage = document.getElementById('customConfirmMessage');
const customInputModal = document.getElementById('customInputModal');
const customInputTitle = document.getElementById('customInputTitle');
const customInputValue = document.getElementById('customInputValue');
const customInputYes = document.getElementById('customInputYes');
const customInputNo = document.getElementById('customInputNo');
const customNoticeModal = document.getElementById('customNoticeModal');
const customNoticeMessage = document.getElementById('customNoticeMessage');
const customNoticeClose = document.getElementById('customNoticeClose');
const confirmYesBtn = document.getElementById('confirm-yes');
const confirmNoBtn = document.getElementById('confirm-no');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchEngineSelector = document.getElementById('search-engine-selector');
const currentEngineIcon = document.getElementById('current-engine-icon');
const engineList = document.getElementById('engine-list');
const exportConfigModal = document.getElementById('exportConfigModal');
const includeApiKey = document.getElementById('includeApiKey');
const confirmExportBtn = document.getElementById('confirmExportBtn');
const cancelExportBtn = document.getElementById('cancelExportBtn');
const apiKeyInput = document.getElementById('apiKeyInput');
const toggleApiKeyBtn = document.getElementById('toggleApiKeyBtn');
const exportConfigBtn = document.getElementById('exportConfigBtn');
const importConfigBtn = document.getElementById('importConfigBtn');
const importConfigInput = document.getElementById('importConfigInput');

const DEFAULT_ENGINES = ['google', 'duckduckgo', 'baidu'].map(key => engineFromPreset(ENGINE_PRESETS.find(preset => preset.key === key)));
let enginesData = [];
let sortUnavailable = false;
let settingsStale = false;
let openingSettings = false;
let releaseSettingsLock;
const groupStore = StartPageStore.create('siteData', StartPageData.groups, siteData, invalidateSettings);
const engineStore = StartPageStore.create('enginesData', StartPageData.engines, DEFAULT_ENGINES, invalidateSettings);
function invalidateSettings() {
  if (settingsStale) return;
  settingsStale = true;
  groupStore.cancel(); engineStore.cancel();
  document.getElementById('settings-editor').disabled = true;
  document.getElementById('langToggleBtnSettings').disabled = true;
  settingsModal.querySelector('.group-color-field input')?.setAttribute('disabled', '');
  updateSettingsStatus();
  customNotice(t('settingsChanged'));
}
function acquireSettingsLock() {
  if (!navigator.locks || !appStorage.persistent) return Promise.resolve(true);
  return new Promise(resolve => {
    navigator.locks.request('startpage-settings-editor', { ifAvailable: true }, lock => {
      if (!lock) { resolve(false); return; }
      return new Promise(release => { releaseSettingsLock = release; resolve(true); });
    }).catch(() => resolve(true)); // Storage comparison remains the fallback if locks are denied.
  });
}
function updateSettingsStatus() {
  const recovery = appStorage.getItem('siteData.recovery') || appStorage.getItem('enginesData.recovery');
  document.getElementById('settings-status').textContent = settingsStale ? t('settingsChanged') : recovery ? t('invalidConfig') : sortUnavailable && weatherSettingsPage.hidden ? t('sortUnavailable') : '';
  document.getElementById('backup-status').textContent = appStorage.persistent ? '' : t('storageTemporary');
}
window.addEventListener('startpage-storage-status', () => updateSettingsStatus());
window.addEventListener('storage', event => {
  const editableKeys = ['siteData', 'enginesData', 'userName', 'qweatherApiKey', 'qweatherApiHost', 'lang'];
  if (settingsModal.style.display === 'flex' && (event.key === null || editableKeys.includes(event.key))) { invalidateSettings(); return; }
  if (event.key === 'siteData' || event.key === null) { loadSiteData(); renderMainPageGroups(); }
  if (event.key === 'enginesData' || event.key === null) { loadEnginesData(); renderEngineDropdown(); setSearchEngine(appStorage.getItem('searchEngine')); }
  if (event.key === 'theme') applyTheme(appStorage.getItem('theme') || 'light');
  if (event.key === 'lang') { currentLang = appStorage.getItem('lang') || 'zh'; updateAllTexts(); }
  if (event.key === 'userName') { renderUsernameSection(); updateGreeting(); }
  if (event.key === 'searchEngine') { setSearchEngine(appStorage.getItem('searchEngine')); renderEngineDropdown(); }
  if (['qweatherApiKey', 'qweatherApiHost', 'weatherLocationData'].includes(event.key)) { renderApiKeySection(); initWeather(); }
});
window.addEventListener('pagehide', () => {
  if (!settingsStale) { groupStore.flush(); engineStore.flush(); }
  releaseSettingsLock?.(); releaseSettingsLock = null;
});

function initTheme() { const stored = appStorage.getItem('theme') || 'light'; applyTheme(stored); }
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
  renderMainPageGroups();
  renderEngineDropdown();
  setSearchEngine(appStorage.getItem('searchEngine') || enginesData[0]?.id || 'google');
  handleFirstVisit();
  scheduleIdleTask(() => initWeather());
}
function loadSiteData() { siteData = groupStore.load(); }
function saveSiteData(immediate = true) { return !settingsStale && groupStore.save(siteData, immediate); }
function loadEnginesData() { enginesData = engineStore.load(); }
function saveEnginesData(immediate = true) { return !settingsStale && engineStore.save(enginesData, immediate); }

function normalizeLinkUrl(value) { return StartPageData.linkUrl(value); }
let groupsRenderSignature = '';
function renderMainPageGroups() {
  const signature = JSON.stringify(siteData);
  if (signature === groupsRenderSignature && groupsContainer.childElementCount === siteData.length) return;
  groupsRenderSignature = signature;
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
      const href = normalizeLinkUrl(link.url);
      if (!href) return;
      const a = document.createElement('a'); a.href = href; a.target = "_blank"; a.rel = 'noopener'; a.textContent = link.name;
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
  weatherFeelsLike.style.display = weatherHighLow.style.display = 'none';
}
function getSavedWeatherLocation() {
  const stored = appStorage.getItem('weatherLocationData');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) { appStorage.removeItem('weatherLocationData'); }
  }
  const legacyName = appStorage.getItem('weatherLocation');
  return legacyName ? { name: legacyName, location: legacyName } : null;
}
function formatLocation(location) {
  if (!location) return '';
  const parts = [location.name, location.adm2, location.adm1, location.country].filter(Boolean);
  return [...new Set(parts)].join(', ');
}
function qweatherLang() {
  return currentLang === 'zh' ? 'zh-hans' : 'en';
}
const weatherClient = StartPageWeather.create({ storage: appStorage, getKey: getApiKey, getLang: qweatherLang, getHost: () => appStorage.getItem('qweatherApiHost') || '' });
async function lookupLocations(query, number = 6, signal) { return weatherClient.lookup(query, number, signal); }
function initWeather() {
  weatherClient.cancel();
  const key = getApiKey(), loc = getSavedWeatherLocation();
  if (!key) setWeatherMessage(t('needApiKey'), 'is-muted');
  else if (!loc) setWeatherMessage(t('clickToGetLoc'), 'is-prompt');
  else fetchWeatherData(loc);
}
function clearWeatherCache() { appStorage.removeItem('weatherCache'); }
async function fetchWeatherData(loc) {
  setWeatherMessage(t('loading'), 'is-prompt');
  try {
    const result = await weatherClient.load(loc);
    if (!result) return false;
    applyWeatherData(result.data);
    updateWeatherSummary();
    return true;
  } catch (error) {
    setWeatherMessage(t(error.message), 'is-error');
    return false;
  }
}

function applyWeatherData(data) { weatherDisplay.classList.remove('is-muted', 'is-prompt', 'is-error'); weatherTemp.textContent = `${data.temp}°C`; weatherFeelsLike.textContent = `${t('feelsLike')} ${data.feelsLike}°C`; weatherHighLow.textContent = `H ${data.tempMax}°C / L ${data.tempMin}°C`; weatherFeelsLike.style.display = weatherHighLow.style.display = ''; }

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
    btn.onkeydown = event => {
      if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const options = [...locationSuggestions.querySelectorAll('button')];
      const index = options.indexOf(btn), direction = event.key === 'ArrowDown' ? 1 : -1;
      options[(index + direction + options.length) % options.length]?.focus();
    };
    locationSuggestions.appendChild(btn);
  });
  locationSuggestions.classList.add('show');
  locationInput.setAttribute('aria-expanded', 'true');
}
let locationSearchController;
function cancelLocationSearch() {
  locationSearchToken++;
  locationSearchController?.abort();
  searchLocationSuggestions.cancel();
  hideLocationSuggestions();
}
const searchLocationSuggestions = debounce(async (query, token) => {
  locationSearchController = new AbortController();
  try {
    const locations = await lookupLocations(query, 6, locationSearchController.signal);
    if (token !== locationSearchToken || !isLocationEditorOpen()) return;
    renderLocationSuggestions(locations);
  } catch (error) {
    if (token !== locationSearchToken || error.name === 'AbortError') return;
    hideLocationSuggestions();
    locationError.textContent = t(error.message);
  }
}, 250);

function resetLocationModal() {
  cancelLocationSearch();
  const saved = getSavedWeatherLocation();
  locationInput.value = saved ? formatLocation(saved) : '';
  hideLocationSuggestions();
  clearLocationPreview();
  if (saved) setLocationPreview(saved);
  locationError.textContent = '';
  useCurrentLocationBtn.disabled = false;
  useCurrentLocationBtn.textContent = t('useCurLoc');
}
async function confirmWeatherLocation(location) {
  const loc = location || selectedWeatherLocation;
  if (!loc) {
    locationError.textContent = t('selectLocationFirst');
    return;
  }
  clearWeatherCache();
  setWeatherMessage(t('loading'), 'is-prompt');
  if (await fetchWeatherData(loc)) {
    if (!weatherLocationEditor.hidden) { closeInlineLocationEditor(); document.getElementById('weatherLocationBtn').focus(); }
    else closeModal(locationModal);
  }
  else locationError.textContent = weatherTemp.textContent;
}

function setSearchEngine(id) {
  const eng = enginesData.find(e => e.id === id) || enginesData[0];
  if (!eng) return;
  searchInput.placeholder = t('searchWith', {name: eng.name});
  setEngineIcon(currentEngineIcon, eng.icon);
  if (appStorage.getItem('searchEngine') !== eng.id) appStorage.setItem('searchEngine', eng.id);
}
let enginesRenderSignature = '';
function renderEngineDropdown() {
  const signature = JSON.stringify([enginesData, appStorage.getItem('searchEngine')]);
  if (signature === enginesRenderSignature && engineList.childElementCount === enginesData.length) return;
  enginesRenderSignature = signature;
  engineList.innerHTML = '';
  enginesData.forEach(eng => {
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.className = 'engine-list-label';
    label.textContent = eng.name;
    li.tabIndex = -1;
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(appStorage.getItem('searchEngine') === eng.id));
    li.append(createEngineIcon(eng.icon), label);
    li.onclick = (e) => { e.stopPropagation(); setSearchEngine(eng.id); renderEngineDropdown(); setEngineListOpen(false); searchInput.focus(); };
    li.onkeydown = e => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Escape'].includes(e.key)) e.stopPropagation();
      const options = [...engineList.children], index = options.indexOf(li);
      if (e.key === 'ArrowDown') { e.preventDefault(); options[(index + 1) % options.length]?.focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); options[(index - 1 + options.length) % options.length]?.focus(); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
      if (e.key === 'Escape') { e.preventDefault(); setEngineListOpen(false); searchEngineSelector.focus(); }
    };
    engineList.appendChild(li);
  });
}

function renderUsernameSection() { const name = getUserName(); document.getElementById('username-saved-text').textContent = name; document.getElementById('username-saved-mode').style.display = name ? 'flex' : 'none'; document.getElementById('username-edit-mode').style.display = name ? 'none' : 'flex'; }
function setApiKeyVisible(visible) {
  apiKeyInput.type = visible ? 'text' : 'password';
  toggleApiKeyBtn.replaceChildren(createIcon(visible ? 'eyeOff' : 'eye'));
  toggleApiKeyBtn.setAttribute('aria-pressed', String(visible));
  toggleApiKeyBtn.setAttribute('aria-label', t(visible ? 'hideApiKey' : 'showApiKey'));
  toggleApiKeyBtn.title = t(visible ? 'hideApiKey' : 'showApiKey');
}
toggleApiKeyBtn.onclick = () => setApiKeyVisible(apiKeyInput.type === 'password');
function renderApiKeySection() { updateWeatherSummary(); const key = getApiKey(); if (key) { document.getElementById('api-key-saved-text').textContent = key.length > 8 ? key.substring(0, 4) + '••••••••' + key.substring(key.length - 4) : '••••••••'; document.getElementById('api-key-saved-mode').style.display = 'flex'; document.getElementById('api-key-edit-mode').style.display = 'none'; } else { document.getElementById('api-key-saved-mode').style.display = 'none'; document.getElementById('api-key-edit-mode').style.display = 'flex'; } }

document.querySelectorAll('[data-svg="edit"]').forEach(el => { el.replaceChildren(createIcon('edit')); el.removeAttribute('data-svg'); });
document.querySelectorAll('[data-svg="check"]').forEach(el => { el.replaceChildren(createIcon('check')); el.removeAttribute('data-svg'); });
function debounce(fn, delay) {
  let timer;
  const debounced = (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}
function getFocusableElements(container) {
  return [...container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter(el => !el.matches(':disabled') && (el.offsetParent !== null || el === document.activeElement));
}
const modalStack = [];
function getActiveModal() {
  return modalStack[modalStack.length - 1]?.modal || null;
}
function syncModalInteractivity() {
  const active = getActiveModal();
  for (const child of document.body.children) {
    if (child.tagName === 'SCRIPT') continue;
    child.inert = Boolean(active && child !== active);
  }
}
function openModal(modal, focusTarget) {
  const existingIndex = modalStack.findIndex(entry => entry.modal === modal);
  if (existingIndex >= 0) modalStack.splice(existingIndex, 1);
  modalStack.push({ modal, returnFocus: document.activeElement instanceof HTMLElement ? document.activeElement : null });
  modal.style.display = 'flex';
  syncModalInteractivity();
  const focusable = getFocusableElements(modal);
  (focusTarget || focusable[0] || modal).focus({ preventScroll: true });
}
function closeModal(modal, options = {}) {
  modal.style.display = 'none';
  const index = modalStack.findIndex(entry => entry.modal === modal);
  const entry = index >= 0 ? modalStack.splice(index, 1)[0] : null;
  syncModalInteractivity();
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
  if (e.key === 'Escape' && engineList.classList.contains('show')) { engineList.classList.remove('show'); searchEngineSelector.setAttribute('aria-expanded', 'false'); searchEngineSelector.focus(); return; }
  const activeModal = getActiveModal();
  if (!activeModal) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    if (activeModal === customConfirmModal) { confirmNoBtn.click(); return; }
    if (activeModal === exportConfigModal) { cancelExportBtn.click(); return; }
    if (activeModal === customInputModal) { customInputNo.click(); return; }
    if (activeModal === customNoticeModal) { customNoticeClose.click(); return; }
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
function customInput(title, initial = '') {
  return new Promise(resolve => {
    customInputTitle.textContent = title;
    customInputValue.maxLength = StartPageData.limits.text;
    customInputValue.value = initial;
    openModal(customInputModal, customInputValue);
    const finish = value => { closeModal(customInputModal); resolve(value); };
    customInputYes.onclick = () => finish(customInputValue.value.trim() || null);
    customInputNo.onclick = () => finish(null);
    customInputValue.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); customInputYes.click(); } };
  });
}
function customNotice(message) {
  customNoticeMessage.textContent = message;
  openModal(customNoticeModal, customNoticeClose);
  customNoticeClose.onclick = () => closeModal(customNoticeModal);
}

function updateWeatherSummary() {
  const location = getSavedWeatherLocation();
  document.getElementById('weatherSettingsSummary').textContent = !getApiKey() ? t('notConfigured') : location?.name || t('configured');
  document.getElementById('weatherLocationSummary').textContent = location?.name || t('locationUnset');
}
function isLocationEditorOpen() {
  return locationModal.style.display === 'flex' || (!weatherSettingsPage.hidden && !weatherLocationEditor.hidden);
}
function closeInlineLocationEditor() {
  if (!weatherLocationEditor.contains(locationFields)) return;
  cancelLocationSearch();
  locationModal.querySelector('.modal-content').appendChild(locationFields);
  weatherLocationEditor.hidden = true;
  document.getElementById('weatherLocationBtn').setAttribute('aria-expanded', 'false');
}
function setSettingsBack(onBack) {
  settingsBackButton.hidden = false;
  document.getElementById('langToggleBtnSettings').style.display = 'none';
  settingsBackButton.onclick = async () => {
    await onBack();
    settingsModal.querySelector('.modal-content').scrollTop = 0;
    (settingsBackButton.hidden ? settingsGroupsContainer.querySelector('input, button') : settingsBackButton)?.focus({ preventScroll: true });
  };
}
function showWeatherSettings() {
  if (settingsStale || !groupStore.flush()) return;
  document.querySelector('.group-color-field')?.remove();
  if (sortableInst) { sortableInst.destroy(); sortableInst = null; }
  settingsGroupsContainer.style.display = 'none';
  globalSettingsSection.style.display = 'none'; settingsActions.style.display = 'none';
  weatherSettingsPage.hidden = false; settingsBackButton.hidden = false;
  setSettingsBack(async () => {
    closeInlineLocationEditor(); setApiKeyVisible(false);
    await renderSettingsGroups();
  });
  settingsTitle.textContent = t('weatherSettings');
  renderApiKeySection(); updateSettingsStatus(); setApiKeyVisible(false);
  settingsModal.querySelector('.modal-content').scrollTop = 0;
  document.getElementById('weatherLocationBtn').focus({ preventScroll: true });
}
document.getElementById('weatherSettingsBtn').onclick = showWeatherSettings;
document.getElementById('weatherLocationBtn').onclick = () => {
  if (!weatherLocationEditor.hidden) { closeInlineLocationEditor(); return; }
  if (!getApiKey()) { customNotice(t('configureWeatherFirst')); return; }
  resetLocationModal();
  weatherLocationEditor.appendChild(locationFields); weatherLocationEditor.hidden = false;
  document.getElementById('weatherLocationBtn').setAttribute('aria-expanded', 'true');
  locationInput.focus();
};
function openWeatherAction() {
  if (!getApiKey()) { openSettings('weather'); return; }
  if (weatherDisplay.classList.contains('is-error')) {
    const loc = getSavedWeatherLocation();
    if (loc) { clearWeatherCache(); fetchWeatherData(loc); }
  }
  resetLocationModal();
  openModal(locationModal, locationInput);
}
weatherDisplay.onclick = openWeatherAction;
weatherDisplay.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openWeatherAction(); } };
locCloseButton.onclick = () => { cancelLocationSearch(); closeModal(locationModal); };
closeOnBackdropClick(locationModal, () => locCloseButton.onclick());
locationInput.addEventListener('input', () => {
  cancelLocationSearch(); clearLocationPreview(); locationError.textContent = '';
  const query = locationInput.value.trim();
  if (query.length >= 2) searchLocationSuggestions(query, locationSearchToken);
});
locationInput.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    const options = [...locationSuggestions.querySelectorAll('button')];
    if (options.length) { e.preventDefault(); options[e.key === 'ArrowDown' ? 0 : options.length - 1].focus(); }
    return;
  }
  if (e.key !== 'Enter' || e.isComposing) return;
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
  cancelLocationSearch();
  const token = locationSearchToken;
  useCurrentLocationBtn.disabled = true;
  useCurrentLocationBtn.textContent = t('gettingLoc');
  navigator.geolocation.getCurrentPosition(
    async p => {
      try {
        const locations = await lookupLocations({ lat: p.coords.latitude, lon: p.coords.longitude }, 1);
        if (!locations[0]) throw new Error(t('weatherLocationMissing'));
        if (token !== locationSearchToken || !isLocationEditorOpen()) return;
        locationInput.value = formatLocation(locations[0]);
        setLocationPreview(locations[0], 'detected');
        hideLocationSuggestions();
      } catch(e) {
        if (token === locationSearchToken) locationError.textContent = t(e.message) || t('locFailed');
      } finally {
        useCurrentLocationBtn.disabled = false;
        useCurrentLocationBtn.textContent = t('useCurLoc');
      }
    },
    () => {
      useCurrentLocationBtn.disabled = false;
      if (token !== locationSearchToken) return;
      locationError.textContent = t('locFailed');
      setWeatherMessage(t('locFailed'), 'is-error');
      useCurrentLocationBtn.textContent = t('useCurLoc');
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
};
async function openSettings(page = 'main') {
  if (openingSettings || settingsModal.style.display === 'flex') return;
  openingSettings = true;
  try {
    if (!await acquireSettingsLock()) { customNotice(t('settingsBusy')); return; }
    settingsStale = false;
    document.getElementById('settings-editor').disabled = false;
    document.getElementById('langToggleBtnSettings').disabled = false;
    loadSiteData(); loadEnginesData(); updateAllTexts();
    if (page === 'weather') showWeatherSettings();
    else await renderSettingsGroups();
    openModal(settingsModal, page === 'weather' ? document.getElementById('weatherLocationBtn') : settingsGroupsContainer.querySelector('input, button') || settingsCloseButton);
  } catch {
    releaseSettingsLock?.(); releaseSettingsLock = null;
    customNotice(t('importFailed'));
  } finally { openingSettings = false; }
}
settingsIcon.onclick = () => openSettings();
settingsCloseButton.onclick = () => {
  if (!settingsStale && (!groupStore.flush() || !engineStore.flush())) return;
  groupStore.cancel(); engineStore.cancel();
  closeInlineLocationEditor();
  setApiKeyVisible(false); closeModal(settingsModal);
  releaseSettingsLock?.(); releaseSettingsLock = null;
  settingsStale = false;
  loadSiteData(); loadEnginesData(); renderMainPageGroups(); renderEngineDropdown();
  currentLang = appStorage.getItem('lang') || 'zh'; updateAllTexts();
};
closeOnBackdropClick(settingsModal, () => settingsCloseButton.onclick());
document.getElementById('langToggleBtnSettings').onclick = () => { currentLang = currentLang === 'zh' ? 'en' : 'zh'; appStorage.setItem('lang', currentLang); updateAllTexts(); initWeather(); };
document.getElementById('saveUsernameBtn').onclick = () => { appStorage.setItem('userName', document.getElementById('usernameInput').value.trim()); renderUsernameSection(); updateGreeting(); };
document.getElementById('editUsernameBtn').onclick = () => { const input = document.getElementById('usernameInput'); input.value = getUserName(); document.getElementById('username-saved-mode').style.display = 'none'; document.getElementById('username-edit-mode').style.display = 'flex'; input.focus(); };
document.getElementById('saveApiKeyBtn').onclick = () => { appStorage.setItem('qweatherApiKey', apiKeyInput.value.trim()); setApiKeyVisible(false); clearWeatherCache(); initWeather(); renderApiKeySection(); };
document.getElementById('editApiKeyBtn').onclick = () => { apiKeyInput.value = getApiKey(); setApiKeyVisible(false); document.getElementById('api-key-saved-mode').style.display = 'none'; document.getElementById('api-key-edit-mode').style.display = 'flex'; apiKeyInput.focus(); };

document.getElementById('saveWeatherHostBtn').onclick = () => {
  const input = document.getElementById('weatherHostInput');
  try {
    const host = StartPageData.weatherHost(input.value.trim());
    appStorage.setItem('qweatherApiHost', host); input.value = host;
    document.getElementById('weatherHostError').textContent = '';
    clearWeatherCache(); initWeather();
  } catch { document.getElementById('weatherHostError').textContent = t('weatherHostInvalid'); }
};
function setEngineListOpen(open) {
  engineList.classList.toggle('show', open);
  searchEngineSelector.setAttribute('aria-expanded', String(open));
}
searchEngineSelector.onclick = e => { e.stopPropagation(); setEngineListOpen(!engineList.classList.contains('show')); };
searchEngineSelector.onkeydown = e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); searchEngineSelector.click(); }
  if (e.key === 'ArrowDown') { e.preventDefault(); setEngineListOpen(true); engineList.querySelector('li')?.focus(); }
};
document.addEventListener('click', () => setEngineListOpen(false));
function isDirectNavigationTarget(value) { return Boolean(StartPageData.navigationUrl(value)); }
searchForm.onsubmit = e => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (!q) return;
  const destination = StartPageData.navigationUrl(q);
  if (destination) { window.open(destination, '_blank', 'noopener'); return; }
  const eng = enginesData.find(item => item.id === appStorage.getItem('searchEngine')) || enginesData[0];
  window.open(eng.url.replaceAll('{query}', encodeURIComponent(q)), '_blank', 'noopener');
};

addNewGroupBtn.addEventListener('click', async () => {
  const name = await customInput(t('newGroupNamePrompt'));
  if (!name) return;
  if (siteData.length >= StartPageData.limits.groups) { customNotice(t('groupLimit', { limit: StartPageData.limits.groups })); return; }
  siteData.push({ id: StartPageData.id(), title: name.slice(0, StartPageData.limits.text), color: '#ffa726', links: [] });
  saveSiteData(); renderSettingsGroups(); renderMainPageGroups();
  setTimeout(() => settingsGroupsContainer.scrollTop = settingsGroupsContainer.scrollHeight, 100);
});
document.getElementById('editEnginesBtn').addEventListener('click', editEngines);

async function editEngines() {
  document.querySelector('.group-color-field')?.remove();
  await ensureSortable();
  settingsTitle.textContent = t('customEngine'); settingsActions.style.display = 'none'; globalSettingsSection.style.display = 'none'; document.getElementById('langToggleBtnSettings').style.display = 'none';
  const renderEngineList = () => {
    settingsTitle.textContent = t('customEngine');
    setSettingsBack(() => { saveEnginesData(); renderEngineDropdown(); setSearchEngine(appStorage.getItem('searchEngine') || enginesData[0]?.id); return renderSettingsGroups(); });
    settingsGroupsContainer.innerHTML = '';
    enginesData.forEach((eng, idx) => {
      const d = document.createElement('div'); d.className = 'setting-item group-item';
      const name = document.createElement('span'); name.className = 'engine-name'; name.textContent = eng.name;
      const editBtn = document.createElement('button'); editBtn.className = 'btn btn-icon edit-eng-btn'; editBtn.setAttribute('aria-label', t('editEngine', { name: eng.name })); editBtn.appendChild(createIcon('edit'));
      const delBtn = document.createElement('button'); delBtn.className = 'btn btn-icon btn-danger del-eng-btn'; delBtn.setAttribute('aria-label', t('delEngineConfirm', { name: eng.name })); delBtn.appendChild(createIcon('trash'));
      d.append(createIcon('bars', 'handle'), createEngineIcon(eng.icon, 'engine-icon'), name, editBtn, delBtn);
      settingsGroupsContainer.appendChild(d);
      d.querySelector('.edit-eng-btn').addEventListener('click', () => editSingleEngine(eng.id, renderEngineList));
      d.querySelector('.del-eng-btn').addEventListener('click', async () => { if (enginesData.length <= 1) { customNotice(t('keepOneEngine')); return; } if (await customConfirm(t('delEngineConfirm', {name: eng.name}))) { if (enginesData.findIndex(item => item.id === eng.id) < 0) return; enginesData.splice(enginesData.findIndex(item => item.id === eng.id), 1); saveEnginesData(); renderEngineDropdown(); if (appStorage.getItem('searchEngine') === eng.id) setSearchEngine(enginesData[0].id); renderEngineList(); } });
    });
    const actions = document.createElement('div'); actions.className = 'settings-inline-actions';
    const addEngBtn = document.createElement('button'); addEngBtn.id = 'addEngBtn'; addEngBtn.className = 'btn btn-primary'; addEngBtn.append(createIcon('plus'), document.createTextNode(` ${t('newEngine')}`));
    actions.replaceChildren(addEngBtn);
    settingsGroupsContainer.appendChild(actions);
    document.getElementById('addEngBtn').onclick = () => editSingleEngine(null, renderEngineList);
    if (sortableInst) sortableInst.destroy();
    sortableInst = makeSortable(settingsGroupsContainer, {
      handle: '.handle', animation: reducedMotionQuery.matches ? 0 : 150,
      forceFallback: true,
      fallbackClass: 'sortable-fallback',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      draggable: '.group-item',
      filter: '#addEngBtn',
      onEnd: e => { const item = enginesData.splice(e.oldDraggableIndex, 1)[0]; enginesData.splice(e.newDraggableIndex, 0, item); saveEnginesData(); renderEngineDropdown(); renderEngineList(); }
    });
    enableKeyboardSorting(settingsGroupsContainer, enginesData, () => { saveEnginesData(); renderEngineDropdown(); renderEngineList(); });
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

function editSingleEngine(engineId, onBack) {
  setSettingsBack(onBack);
  const eng = enginesData.find(item => item.id === engineId) || { id: StartPageData.id(), name: '', url: '', icon: 'search' };
  settingsTitle.textContent = engineId ? t('editEngine', {name: eng.name}) : t('newEngine'); document.getElementById('langToggleBtnSettings').style.display = 'none';
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
  nameLabel.htmlFor = nameInput.id; urlLabel.htmlFor = urlInput.id;
  nameInput.maxLength = StartPageData.limits.text; urlInput.maxLength = StartPageData.limits.url;
  form.append(nameField, urlField);
  const actions = document.createElement('div'); actions.className = 'settings-actions-stack';
  const saveBtn = document.createElement('button'); saveBtn.id = 'saveEngBtn'; saveBtn.className = 'btn btn-primary'; saveBtn.append(createIcon('check'), document.createTextNode(` ${t('save')}`));
  actions.append(saveBtn);
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
  document.getElementById('saveEngBtn').onclick = async () => {
    let name = document.getElementById('engEditName').value.trim(); let url  = document.getElementById('engEditUrl').value.trim();
    const exactPreset = findExactEnginePresetByName(name);
    if (exactPreset && !url) {
      name = exactPreset.name;
      url = exactPreset.url;
    }
    if (!name || !url) { customNotice(t('engineNameUrlEmpty')); return; }
    url = normalizeSearchEngineUrl(url);
    try { StartPageData.engines([{ ...eng, name, url }]); }
    catch { customNotice(t('invalidEngine')); return; }
    const preset = exactPreset || findEnginePresetByUrl(url);
    if (exactPreset) name = exactPreset.name;
    const i = preset?.icon || iconForEngine(name, url);
    const idx = enginesData.findIndex(item => item.id === eng.id);
    if (engineId && idx < 0) { customNotice(t('settingsChanged')); return; }
    const updated = { ...eng, name, url, icon: i };
    if (idx < 0) {
      if (enginesData.length >= StartPageData.limits.engines) { customNotice(t('engineLimit', { limit: StartPageData.limits.engines })); return; }
      enginesData.push(updated);
    } else enginesData[idx] = updated;
    saveEnginesData(); renderEngineDropdown(); if (appStorage.getItem('searchEngine') === eng.id) setSearchEngine(eng.id);
    onBack();
  };
  setTimeout(() => { nameInput.focus({ preventScroll: true }); nameInput.select(); }, 0);
}

let sortableInst = null;
let sortableLoadPromise = null;
function ensureSortable() {
  if (window.Sortable) return Promise.resolve(window.Sortable);
  if (!sortableLoadPromise) {
    sortableLoadPromise = new Promise(resolve => {
      const script = document.createElement('script');
      const finish = value => { clearTimeout(timer); resolve(value); };
      const timer = setTimeout(() => { script.remove(); finish(null); }, 3000);
      script.src = 'Sortable.min.js';
      script.onload = () => finish(window.Sortable || null);
      script.onerror = () => finish(null);
      document.head.appendChild(script);
    }).then(value => {
      sortUnavailable = !value; updateSettingsStatus();
      if (!value) sortableLoadPromise = null;
      return value;
    });
  }
  return sortableLoadPromise;
}
function makeSortable(container, options) {
  if (!window.Sortable) return null;
  return new Sortable(container, options);
}
function enableKeyboardSorting(container, items, onChange) {
  container.querySelectorAll('.handle').forEach((handle, index) => {
    handle.tabIndex = 0; handle.removeAttribute('aria-hidden');
    handle.dataset.i18nAria = 'sortKeyboard'; handle.dataset.i18nTitle = 'sortKeyboard';
    handle.setAttribute('role', 'button'); handle.setAttribute('aria-label', t('sortKeyboard')); handle.title = t('sortKeyboard');
    handle.onkeydown = event => {
      if (!event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const next = index + (event.key === 'ArrowUp' ? -1 : 1);
      if (next < 0 || next >= items.length) return;
      [items[index], items[next]] = [items[next], items[index]];
      onChange();
      requestAnimationFrame(() => container.querySelectorAll('.handle')[next]?.focus());
    };
  });
}
async function renderSettingsGroups() {
  closeInlineLocationEditor();
  weatherSettingsPage.hidden = true; settingsBackButton.hidden = true;
  settingsGroupsContainer.style.display = 'flex';
  updateSettingsStatus();
  document.querySelector('.group-color-field')?.remove();
  settingsTitle.textContent = t('settings'); globalSettingsSection.style.display = "flex"; settingsActions.style.display = "flex"; document.getElementById('langToggleBtnSettings').style.display = 'flex';
  settingsGroupsContainer.innerHTML = '';
  siteData.forEach((g) => {
    const div = document.createElement('div'); div.className = 'setting-item group-item';
    const input = document.createElement('input'); input.type = 'text'; input.className = 'setting-input setting-input-flush'; input.value = g.title;
    input.dataset.i18nAria = 'groupNamePlaceholder';
    input.setAttribute('aria-label', t('groupNamePlaceholder'));
    const editBtn = document.createElement('button'); editBtn.className = 'btn btn-icon edit-btn'; editBtn.title = editBtn.setAttribute('aria-label', t('editBtnTitle')) || t('editBtnTitle'); editBtn.appendChild(createIcon('edit'));
    const delBtn = document.createElement('button'); delBtn.className = 'btn btn-icon btn-danger del-btn'; delBtn.title = delBtn.setAttribute('aria-label', t('delGroupTitle')) || t('delGroupTitle'); delBtn.appendChild(createIcon('trash'));
    const handle = createIcon('bars', 'handle'); handle.title = t('dragSortTitle'); handle.setAttribute('aria-hidden', 'true');
    editBtn.dataset.i18nAria = editBtn.dataset.i18nTitle = 'editBtnTitle';
    delBtn.dataset.i18nAria = delBtn.dataset.i18nTitle = 'delGroupTitle';
    div.append(handle, input, editBtn, delBtn);
    input.maxLength = StartPageData.limits.text;
    input.oninput = e => { g.title = e.target.value; saveSiteData(false); };
    editBtn.onclick = () => editGroup(g);
    delBtn.onclick = async () => {
      if (await customConfirm(t('delGroupConfirm'))) {
        const idx = siteData.indexOf(g);
        if (idx !== -1) {
          siteData.splice(idx, 1);
          saveSiteData();
          renderMainPageGroups();
          renderSettingsGroups();
        }
      }
    };
    settingsGroupsContainer.appendChild(div);
  });
  await ensureSortable();
  if (sortableInst) sortableInst.destroy();
  sortableInst = makeSortable(settingsGroupsContainer, {
    handle: '.handle', animation: reducedMotionQuery.matches ? 0 : 150,
    forceFallback: true,
    fallbackClass: 'sortable-fallback',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    draggable: '.group-item',
    onEnd: e => { const item = siteData.splice(e.oldDraggableIndex, 1)[0]; siteData.splice(e.newDraggableIndex, 0, item); saveSiteData(); renderMainPageGroups(); renderSettingsGroups(); }
  });
  enableKeyboardSorting(settingsGroupsContainer, siteData, () => { saveSiteData(); renderMainPageGroups(); renderSettingsGroups(); });
}

async function editGroup(group) {
  if (!groupStore.flush()) return;
  group = siteData.find(item => item.id === group.id);
  if (!group) return renderSettingsGroups();
  await ensureSortable();
  const g = group;
  setSettingsBack(renderSettingsGroups);
  settingsTitle.textContent = ''; globalSettingsSection.style.display = "none"; settingsActions.style.display = "none"; document.getElementById('langToggleBtnSettings').style.display = 'none';
  settingsGroupsContainer.innerHTML = '';
  document.querySelector('.group-color-field')?.remove();
  const colorField = document.createElement('label'); colorField.className = 'group-color-field';
  const colorLabel = t('groupColor');
  colorField.title = colorLabel;
  const colorInput = document.createElement('input'); colorInput.type = 'color'; colorInput.value = g.color;
  colorInput.setAttribute('aria-label', colorLabel);
  colorInput.oninput = e => { g.color = e.target.value; saveSiteData(); renderMainPageGroups(); };
  colorField.appendChild(colorInput);
  settingsCloseButton.before(colorField);
  const titleText = document.createElement('span'); titleText.className = 'group-title-text'; titleText.textContent = g.title;
  settingsTitle.append(titleText);
  const list = document.createElement('div'); list.id = 'l-list'; list.className = 'link-list';
  const actions = document.createElement('div'); actions.className = 'settings-inline-actions';
  const addBtn = document.createElement('button'); addBtn.id = 'addL'; addBtn.className = 'btn btn-primary'; addBtn.append(createIcon('plus'), document.createTextNode(` ${t('addNewLink')}`));
  actions.append(addBtn);
  settingsGroupsContainer.append(list, actions);
  const render = () => {
    list.innerHTML = '';
    g.links.forEach((l) => {
      const d = document.createElement('div'); d.className = 'setting-item link-item';
      const nameInput = document.createElement('input'); nameInput.type = 'text'; nameInput.className = 'setting-input link-name-input'; nameInput.value = l.name; nameInput.placeholder = t('linkNamePlaceholder');
      const divider = document.createElement('div'); divider.className = 'link-divider';
      const urlInput = document.createElement('input'); urlInput.type = 'text'; urlInput.className = 'setting-input link-url-input'; urlInput.value = l.url; urlInput.placeholder = 'URL';
      const delBtn = document.createElement('button'); delBtn.className = 'btn btn-icon btn-danger'; delBtn.title = t('delLinkTitle'); delBtn.setAttribute('aria-label', t('delLinkTitle')); delBtn.appendChild(createIcon('trash'));
      d.append(createIcon('bars', 'handle'), nameInput, divider, urlInput, delBtn);
      nameInput.maxLength = StartPageData.limits.text; urlInput.maxLength = StartPageData.limits.url;
      nameInput.setAttribute('aria-label', t('linkNamePlaceholder')); urlInput.setAttribute('aria-label', t('urlLabel'));
      nameInput.oninput = e => { l.name = e.target.value; saveSiteData(false); };
      urlInput.oninput = () => { urlInput.setCustomValidity(''); urlInput.removeAttribute('aria-invalid'); };
      urlInput.onblur = () => {
        const value = urlInput.value.trim(), normalized = normalizeLinkUrl(value);
        if (value && !normalized) {
          urlInput.setCustomValidity(t('invalidUrl')); urlInput.setAttribute('aria-invalid', 'true'); urlInput.reportValidity(); return;
        }
        l.url = normalized; urlInput.value = normalized; saveSiteData(); renderMainPageGroups();
      };
      delBtn.onclick = async () => {
        if (await customConfirm(t('delLinkConfirm'))) {
          const linkIdx = g.links.indexOf(l);
          if (linkIdx !== -1) {
            g.links.splice(linkIdx, 1);
            saveSiteData(); renderMainPageGroups();
            render();
          }
        }
      };
      list.appendChild(d);
    });
    if (sortableInst) sortableInst.destroy();
    sortableInst = makeSortable(list, {
      handle: '.handle', animation: reducedMotionQuery.matches ? 0 : 150,
      forceFallback: true,
      fallbackClass: 'sortable-fallback',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      draggable: '.link-item',
      onEnd: e => { const item = g.links.splice(e.oldDraggableIndex, 1)[0]; g.links.splice(e.newDraggableIndex, 0, item); saveSiteData(); renderMainPageGroups(); render(); }
    });
    enableKeyboardSorting(list, g.links, () => { saveSiteData(); renderMainPageGroups(); render(); });
  };
  render();
  document.getElementById('addL').onclick = () => {
    if (siteData.reduce((sum, item) => sum + item.links.length, 0) >= StartPageData.limits.links) { customNotice(t('linkLimit', { limit: StartPageData.limits.links })); return; }
    g.links.push({id: StartPageData.id(), name:'', url:''}); saveSiteData(); render();
  };
}

function createConfigSnapshot(withApiKey = false) {
  const location = getSavedWeatherLocation();
  const activeEngine = enginesData.find(engine => engine.id === appStorage.getItem('searchEngine')) || enginesData[0];
  const settings = {
    siteData: StartPageData.groups(siteData),
    enginesData: StartPageData.engines(enginesData),
    theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light',
    lang: currentLang,
    userName: getUserName(),
    weatherLocationData: location,
    weatherLocation: location?.name || '',
    qweatherApiHost: appStorage.getItem('qweatherApiHost') || '',
    searchEngine: activeEngine.id
  };
  if (withApiKey) settings.qweatherApiKey = getApiKey();
  return { schemaVersion: 2, exportedAt: new Date().toISOString(), settings };
}
function exportConfig(withApiKey = false) {
  if (settingsStale || !groupStore.flush() || !engineStore.flush()) return false;
  let source;
  try { source = StartPageData.serializeBackup(createConfigSnapshot(withApiKey)); }
  catch (error) {
    customNotice(t(error.message === 'backupTooLarge' ? 'backupTooLarge' : 'exportFailed', { limit: StartPageData.limits.fileBytes / 1024 / 1024 }));
    return false;
  }
  const blob = new Blob([source], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob); link.download = 'startpage-config.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  return true;
}
async function importConfig(file) {
  try {
    if (file.size > StartPageData.limits.fileBytes) throw Error('backupTooLarge');
    const settings = StartPageData.parseBackup(await file.text());
    if (!await customConfirm(t('importConfirm'))) return;
    if (settingsStale || !groupStore.flush() || !engineStore.flush()) return;
    for (const [key, value] of Object.entries(settings)) appStorage.setItem(key, value);
    clearWeatherCache();
    loadSiteData(); loadEnginesData();
    currentLang = appStorage.getItem('lang') || 'zh';
    initTheme(); updateAllTexts(); renderMainPageGroups(); renderEngineDropdown();
    setSearchEngine(appStorage.getItem('searchEngine')); initWeather();
    await renderSettingsGroups();
    customNotice(t('importSuccess'));
  } catch (error) { customNotice(t(error.message === 'backupTooLarge' ? 'backupTooLarge' : 'importFailed', { limit: StartPageData.limits.fileBytes / 1024 / 1024 })); }
}

exportConfigBtn.onclick = () => {
  includeApiKey.checked = false;
  openModal(exportConfigModal, includeApiKey);
};
confirmExportBtn.onclick = () => { if (exportConfig(includeApiKey.checked)) closeModal(exportConfigModal); };
cancelExportBtn.onclick = () => closeModal(exportConfigModal);
closeOnBackdropClick(exportConfigModal, () => cancelExportBtn.click());
importConfigBtn.onclick = () => importConfigInput.click();
importConfigInput.onchange = () => { const file = importConfigInput.files[0]; if (file) importConfig(file); importConfigInput.value = ''; };

/* First-visit flow is independent of settings and weather requests. */
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
let welcomeFinishing = false;
async function finishWelcome(name, skipGreeting = false) {
  if (welcomeFinishing) return;
  welcomeFinishing = true;
  appStorage.setItem('userName', name);
  appStorage.setItem('hasVisited', 'true');
  updateGreeting(); renderUsernameSection();
  const overlay = document.getElementById('welcome-overlay');
  const inputContainer = document.getElementById('welcome-input-container');
  const greetingContainer = document.getElementById('welcome-greeting-container');
  const reduced = reducedMotionQuery.matches;
  inputContainer.style.opacity = '0';
  inputContainer.style.transform = 'translateY(-30px)';
  await delay(reduced ? 0 : 500);
  inputContainer.style.display = 'none';
  if (!skipGreeting) {
    document.getElementById('welcome-greeting-text').textContent = greeting.textContent;
    greetingContainer.style.opacity = '1';
    greetingContainer.style.transform = 'translateY(0)';
    await delay(1500);
    greetingContainer.style.opacity = '0';
    greetingContainer.style.transform = 'translateY(-30px)';
    await delay(reduced ? 0 : 400);
  }
  overlay.style.opacity = '0';
  document.documentElement.classList.add('do-reveal');
  document.documentElement.classList.remove('is-first-visit');
  await delay(reduced ? 0 : 800);
  overlay.style.display = 'none';
  searchInput.focus();
  document.getElementById('floating-controls').classList.add('is-discoverable');
  setTimeout(() => document.getElementById('floating-controls').classList.remove('is-discoverable'), 6000);
  await delay(reduced ? 0 : 500);
  document.documentElement.classList.remove('do-reveal');
}
function handleFirstVisit() {
  if (appStorage.getItem('hasVisited')) return;
  const overlay = document.getElementById('welcome-overlay');
  const input = document.getElementById('welcome-name-input');
  const skip = document.getElementById('welcome-skip');
  overlay.style.display = 'flex';
  setTimeout(() => input.focus(), 0);
  skip.textContent = t('welcomeSkip');
  input.onkeydown = e => {
    if (e.isComposing) return;
    if (e.key === 'Enter') finishWelcome(input.value.trim());
    if (e.key === 'Escape') finishWelcome('', true);
  };
  skip.onclick = () => finishWelcome('', true);
}

let lastRefresh = Date.now();
const getGreetingPeriod = () => [5, 9, 12, 18, 22, 24].findIndex(end => new Date().getHours() < end);
let greetingPeriod = getGreetingPeriod();
function refreshWhenVisible() {
  if (document.visibilityState !== 'visible') return;
  const period = getGreetingPeriod();
  if (period !== greetingPeriod) { greetingPeriod = period; updateGreeting(); }
  if (Date.now() - lastRefresh > 60000) { lastRefresh = Date.now(); initWeather(); }
}
document.addEventListener('visibilitychange', refreshWhenVisible);
window.addEventListener('focus', refreshWhenVisible);
document.getElementById('usernameInput').maxLength = StartPageData.limits.text;
document.getElementById('welcome-name-input').maxLength = StartPageData.limits.text;
apiKeyInput.maxLength = 4096;
init();
