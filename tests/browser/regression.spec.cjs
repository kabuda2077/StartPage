const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
async function home(page) {
  await page.addInitScript(() => localStorage.setItem('hasVisited', 'true'));
  await page.goto('/');
  await expect(page.locator('.groups .group')).toHaveCount(4);
}
async function settings(page) { await page.locator('#settings-icon').click(); }
async function importFile(page, buffer) {
  await page.locator('#importConfigInput').setInputFiles({ name: 'config.json', mimeType: 'application/json', buffer });
  await page.locator('#confirm-yes').click();
  await expect(page.locator('#customNoticeMessage')).toHaveText('配置导入成功');
  await page.locator('#customNoticeClose').click();
}

test.describe('time-based greetings', () => {
  test.use({ timezoneId: 'Asia/Shanghai' });

  test('settings, language, reload and name edits keep the time-selected phrase', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-05T10:15:00+08:00'));
    await home(page);
    const initial = await page.locator('#greeting').textContent();
    await page.evaluate(() => {
      window.greetingChanges = 0;
      window.greetingObserver = new MutationObserver(records => { window.greetingChanges += records.length; });
      window.greetingObserver.observe(document.getElementById('greeting'), { childList: true, characterData: true, subtree: true });
    });
    await settings(page);
    await page.locator('#langToggleBtnSettings').click();
    await page.locator('#langToggleBtnSettings').click();
    await page.locator('#settings-close-button').click();
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await expect(page.locator('#greeting')).toHaveText(initial);
    expect(await page.evaluate(() => window.greetingChanges)).toBe(0);
    await page.evaluate(() => window.greetingObserver.disconnect());

    const phrase = initial.slice('Hey, '.length);
    await settings(page);
    await page.locator('#usernameInput').fill('Alice');
    await page.locator('#saveUsernameBtn').click();
    await expect(page.locator('#greeting')).toHaveText(`Hey Alice, ${phrase}`);
    await importFile(page, Buffer.from(JSON.stringify({ schemaVersion: 2, settings: { userName: 'Bob' } })));
    await expect(page.locator('#greeting')).toHaveText(`Hey Bob, ${phrase}`);
    await page.locator('#settings-close-button').click();
    await page.reload();
    await expect(page.locator('#greeting')).toHaveText(`Hey Bob, ${phrase}`);
  });

  test('foreground boundaries, new dates and returning from background update by time alone', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-05T04:59:00+08:00') });
    await home(page);
    await page.clock.pauseAt(new Date('2026-10-05T04:59:30+08:00'));
    const periods = [
      [30000, ['early bird!', 'good morning, early riser!', 'ready for a new day?']],
      [4 * 3600000, ['good morning!', 'have a great morning!', 'rise and shine!']],
      [3 * 3600000, ['good afternoon!', 'hope your day is going well!', 'stay focused!']],
      [6 * 3600000, ['good evening!', 'time to wind down.', 'hope you had a great day!']],
      [4 * 3600000, ['good night!', 'late night browsing?', 'time to rest soon.']],
      [2 * 3600000, ['up late, night owl?', "it's late, get some rest.", 'still awake?']]
    ];
    for (const [elapsed, phrases] of periods) {
      await page.clock.fastForward(elapsed);
      expect(phrases.map(phrase => `Hey, ${phrase}`)).toContain(await page.locator('#greeting').textContent());
    }
    const yesterday = await page.locator('#greeting').textContent();
    await page.clock.fastForward(24 * 3600000);
    await expect(page.locator('#greeting')).not.toHaveText(yesterday);
    const beforeBackground = await page.locator('#greeting').textContent();
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(await page.evaluate(() => greetingTimer)).toBeNull();
    await page.clock.fastForward(10 * 3600000);
    await expect(page.locator('#greeting')).toHaveText(beforeBackground);
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(['good morning!', 'have a great morning!', 'rise and shine!'].map(phrase => `Hey, ${phrase}`))
      .toContain(await page.locator('#greeting').textContent());
    expect(await page.evaluate(() => greetingTimer)).not.toBeNull();
  });
});

for (const appearance of [{ width: 1280, theme: 'light' }, { width: 320, theme: 'dark' }]) {
  test(`grouped settings stay aligned and editable at ${appearance.width}px in ${appearance.theme} mode`, async ({ page }) => {
    await page.setViewportSize({ width: appearance.width, height: 900 });
    await page.addInitScript(theme => {
      localStorage.setItem('theme', theme);
      localStorage.setItem('userName', 'kabuda');
    }, appearance.theme);
    await home(page); await settings(page);
    await expect(page.locator('#settings-groups-container > .group-item')).toHaveCount(4);
    await expect(page.locator('.settings-preferences')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const layout = () => page.evaluate(() => {
      const box = selector => document.querySelector(selector).getBoundingClientRect();
      const group = box('#settings-groups-container > .group-item');
      const add = box('#addNewGroupBtn'), card = box('.settings-preferences'), backup = box('.settings-data-actions');
      return {
        lefts: [group.left, add.left, card.left, backup.left], rights: [group.right, add.right, card.right, backup.right],
        above: card.top - add.bottom, below: backup.top - card.bottom,
        rows: [box('#editEnginesBtn').height, box('#weatherSettingsBtn').height, box('#username-section').height],
        cardHeight: card.height,
        overflow: document.querySelector('.settings-preferences').scrollWidth - document.querySelector('.settings-preferences').clientWidth
      };
    });
    const before = await layout();
    expect(Math.max(...before.lefts) - Math.min(...before.lefts)).toBeLessThan(1);
    expect(Math.max(...before.rights) - Math.min(...before.rights)).toBeLessThan(1);
    expect(before.above).toBe(26); expect(before.below).toBe(26);
    expect(before.rows).toEqual([50, 50, 50]);
    expect(before.overflow).toBeLessThanOrEqual(1);
    await expect(page.locator('#addNewGroupBtn')).toHaveClass(/btn-add-group/);
    await expect(page.locator('#global-settings-section')).toHaveCSS('border-top-width', '0px');
    await expect(page.locator('.settings-backup-section')).toHaveCSS('border-top-width', '0px');
    await expect(page.locator('#settingsModal .modal-header')).toHaveCSS('border-bottom-width', '1px');

    const name = 'A long display name '.repeat(9).trim();
    await page.locator('#editUsernameBtn').click();
    await expect(page.locator('#usernameInput')).toBeFocused();
    await page.locator('#usernameInput').fill(name); await page.locator('#saveUsernameBtn').click();
    await expect(page.locator('#username-saved-text')).toHaveText(name);
    await expect(page.locator('#username-saved-text')).toHaveCSS('text-overflow', 'ellipsis');
    expect(await page.evaluate(() => getUserName())).toBe(name);
    expect((await layout()).cardHeight).toBe(before.cardHeight);
    expect((await layout()).overflow).toBeLessThanOrEqual(1);
    await page.locator('#editUsernameBtn').click();
    await page.locator('#usernameInput').fill(''); await page.locator('#saveUsernameBtn').click();
    await expect(page.locator('#username-edit-mode')).toBeVisible();
    expect((await layout()).rows).toEqual([50, 50, 50]);
    await page.locator('#editEnginesBtn').press('Enter');
    await expect(page.locator('#settings-title')).toHaveText('自定义搜索引擎');
    await page.locator('#settings-back-button').click();
    await expect(page.locator('.settings-preferences')).toBeVisible();
    expect((await layout()).below).toBe(26);
  });
}

test('one settings editor at a time; other tabs sync without overwriting', async ({ context, page }) => {
  await home(page);
  const second = await context.newPage(); await second.goto('/');
  await settings(page); await settings(second);
  await expect(second.locator('#settingsModal')).not.toBeVisible();
  await expect(second.locator('#customNoticeMessage')).toContainText('另一个页面');
  const title = page.locator('#settings-groups-container input').first();
  for (const value of ['First edit', 'Second edit']) {
    await title.fill(value);
    await expect.poll(() => second.locator('.group-title').first().textContent()).toBe(value);
  }
  await page.locator('#settings-close-button').click();
  await second.locator('#customNoticeClose').click(); await settings(second);
  await expect(second.locator('#settings-groups-container input').first()).toHaveValue('Second edit');
  await second.locator('#settings-close-button').click();
  await page.reload(); await expect(page.locator('.group-title').first()).toHaveText('Second edit');
});

test('without browser locks, external edits pause stale settings instead of overwriting', async ({ context, page }) => {
  await context.addInitScript(() => Object.defineProperty(navigator, 'locks', { value: undefined, configurable: true }));
  await home(page);
  const second = await context.newPage(); await second.goto('/');
  await settings(page); await settings(second);
  await page.locator('#settings-groups-container input').first().fill('Latest');
  await expect(second.locator('#customNoticeMessage')).toContainText('本页已停止保存');
  await expect(second.locator('#settings-groups-container input').first()).toBeDisabled();
  await second.locator('#customNoticeClose').click(); await second.locator('#settings-close-button').click();
  await settings(second); await expect(second.locator('#settings-groups-container input').first()).toHaveValue('Latest');
  await second.locator('#settings-close-button').click();
  expect(await page.evaluate(() => JSON.parse(appStorage.getItem('siteData'))[0].title)).toBe('Latest');
  await second.evaluate(() => Object.defineProperty(navigator, 'locks', { value: { request: () => Promise.reject(new DOMException('Denied', 'SecurityError')) } }));
  await settings(second); await expect(second.locator('#settingsModal')).toBeVisible();
  await second.locator('#settings-close-button').click();
});

test('reordering edits the correct engine, cancelling drafts saves nothing, invalid links are retained', async ({ page }) => {
  await home(page); await settings(page); await page.locator('#editEnginesBtn').click();
  const handles = page.locator('.handle');
  const from = await handles.nth(0).boundingBox(), to = await handles.nth(2).boundingBox();
  await page.mouse.move(from.x + 8, from.y + 8); await page.mouse.down();
  await page.mouse.move(to.x + 8, to.y + to.height - 2, { steps: 20 }); await page.mouse.up();
  const name = await page.locator('.engine-name').first().textContent();
  await page.locator('.edit-eng-btn').first().click(); await expect(page.locator('#engEditName')).toHaveValue(name);
  await page.locator('#settings-back-button').click();
  const count = await page.locator('.engine-name').count();
  await page.locator('#addEngBtn').click(); await page.locator('#settings-back-button').click();
  await expect(page.locator('.engine-name')).toHaveCount(count);
  await page.locator('.del-eng-btn').first().click(); await page.locator('#confirm-yes').click();
  expect(await page.locator('.engine-name').allTextContents()).not.toContain(name);
  await page.locator('#settings-back-button').click(); await page.locator('.edit-btn').first().click();
  const field = page.locator('.link-url-input').first(); const before = await field.inputValue();
  await field.fill('javascript:alert(1)'); await page.locator('#settings-title').click();
  await expect(field).toHaveValue('javascript:alert(1)'); await expect(field).toHaveAttribute('aria-invalid', 'true');
  expect(await page.evaluate(() => siteData[0].links[0].url)).toBe(before);
});

test('shared settings and sorting keep keyboard editing usable without the vendor library', async ({ page }) => {
  await page.route('**/assets/vendor/Sortable.min.js', route => route.abort());
  await home(page); await settings(page);
  expect(await page.evaluate(() => typeof Sortable)).toBe('undefined');
  const groups = await page.evaluate(() => siteData.map(group => group.id));
  await page.locator('#settings-groups-container .handle').first().press('Alt+ArrowDown');
  const reordered = [groups[1], groups[0], ...groups.slice(2)];
  expect(await page.evaluate(() => JSON.parse(appStorage.getItem('siteData')).map(group => group.id))).toEqual(reordered);
  await expect(page.locator('#settings-groups-container .handle').nth(1)).toBeFocused();

  await page.locator('.edit-btn').nth(1).click();
  await expect(page.locator('.group-color-field')).toHaveCount(1);
  await expect(page.locator('#langToggleBtnSettings')).toBeHidden();
  const links = await page.evaluate(id => siteData.find(group => group.id === id).links.map(link => link.id), groups[0]);
  await page.locator('#l-list .handle').first().press('Alt+ArrowDown');
  expect(await page.evaluate(id => JSON.parse(appStorage.getItem('siteData')).find(group => group.id === id).links.map(link => link.id), groups[0]))
    .toEqual([links[1], links[0], ...links.slice(2)]);
  await page.locator('#settings-back-button').click();
  await expect(page.locator('.group-color-field')).toHaveCount(0);
  await expect(page.locator('#langToggleBtnSettings')).toBeVisible();

  await page.locator('#editEnginesBtn').click();
  const engines = await page.evaluate(() => enginesData.map(engine => engine.id));
  await page.locator('#settings-groups-container .handle').first().press('Alt+ArrowDown');
  expect(await page.evaluate(() => JSON.parse(appStorage.getItem('enginesData')).map(engine => engine.id)))
    .toEqual([engines[1], engines[0], ...engines.slice(2)]);
  await page.locator('#settings-back-button').click();
  await page.locator('#weatherSettingsBtn').click();
  await expect(page.locator('#weather-settings-page')).toBeVisible();
  await expect(page.locator('#settings-groups-container')).toBeHidden();
  await page.locator('#settings-back-button').click();
  await expect(page.locator('#weather-settings-page')).toBeHidden();
  await expect(page.locator('#settings-back-button')).toBeHidden();
  await expect(page.locator('#global-settings-section')).toBeVisible();
});

test('large backups round-trip with optional Key and legacy import support', async ({ page }) => {
  await home(page); await settings(page);
  await page.evaluate(() => {
    appStorage.setItem('qweatherApiKey', 'test-only');
    siteData = StartPageData.groups([{ id: 'large', title: 'Large', color: '#123456', links: Array.from({ length: 600 }, (_, i) => ({ id: String(i), name: 'Link', url: 'https://example.com/' + 'a'.repeat(3980) })) }]);
    saveSiteData();
  });
  async function download(withKey) {
    await page.locator('#exportConfigBtn').click(); await expect(page.locator('#includeApiKey')).not.toBeChecked();
    if (withKey) await page.locator('#includeApiKey').check();
    const event = page.waitForEvent('download'); await page.locator('#confirmExportBtn').click();
    return fs.readFileSync(await (await event).path());
  }
  const plain = await download(false), withKey = await download(true);
  expect(plain.byteLength).toBeGreaterThan(2 * 1024 * 1024);
  expect(JSON.parse(plain).settings.qweatherApiKey).toBeUndefined();
  expect(JSON.parse(withKey).settings.qweatherApiKey).toBe('test-only');
  await importFile(page, plain); expect(await page.evaluate(() => siteData[0].links.length)).toBe(600);
  expect(await page.evaluate(() => getApiKey())).toBe('test-only');
  await importFile(page, Buffer.from(JSON.stringify({ schemaVersion: 1, settings: { userName: 'Legacy' } })));
  await expect(page.locator('#username-saved-text')).toHaveText('Legacy');
});

test('late weather results cannot overwrite a newer city', async ({ page }) => {
  await home(page);
  const result = await page.evaluate(async () => {
    appStorage.setItem('qweatherApiKey', 'test-only'); clearWeatherCache();
    const original = window.fetch; let release, started;
    const gate = new Promise(resolve => release = resolve), ready = new Promise(resolve => started = resolve);
    window.fetch = async url => {
      const old = new URL(url).searchParams.get('location') === 'old';
      if (old) { started(); await gate; }
      return { ok: true, json: async () => ({ code: '200', now: { temp: old ? '10' : '25', feelsLike: '20' }, daily: [{ tempMax: '30', tempMin: '10' }] }) };
    };
    const old = fetchWeatherData({ id: 'old', name: 'Old' }); await ready;
    await fetchWeatherData({ id: 'new', name: 'New' }); release(); await old; window.fetch = original;
    return { temp: weatherTemp.textContent, city: getSavedWeatherLocation().id, cache: JSON.parse(appStorage.getItem('weatherCache')).locationId };
  });
  expect(result).toEqual({ temp: '25°C', city: 'new', cache: 'new' });
  await settings(page);
  await expect(page.locator('#apiKeyInput')).not.toBeVisible();
  await expect(page.locator('#weatherHostInput')).not.toBeVisible();
  await expect(page.locator('#weatherSettingsSummary')).toHaveText('New');
  await page.locator('#weatherSettingsBtn').click();
  await expect(page.locator('#settings-title')).toHaveText('天气设置');
  await expect(page.locator('#weatherHostInput')).toBeVisible();
  await expect(page.locator('#weatherLocationBtn')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#weatherLocationBtn .disclosure-chevron')).toHaveCSS('transform', 'none');
  await expect(page.locator('#weather-location-editor')).not.toBeVisible();
  await expect(page.locator('#exportConfigBtn')).not.toBeVisible();
  await page.route('https://*.qweather.com/**', route => {
    const payload = route.request().url().includes('/city/lookup')
      ? { code: '200', location: [{ id: 'inline', name: 'Inline City' }] }
      : { code: '200', now: { temp: '26', feelsLike: '25' }, daily: [{ tempMax: '30', tempMin: '20' }] };
    return route.fulfill({ json: payload });
  });
  await page.locator('#weatherLocationBtn').click();
  await expect(page.locator('#locationModal')).not.toBeVisible();
  await expect(page.locator('#weather-location-editor #locationInput')).toBeVisible();
  await expect(page.locator('#weatherLocationBtn')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#weatherLocationBtn .disclosure-chevron')).toHaveCSS('transform', 'matrix(0, 1, -1, 0, 0, 0)');
  await page.locator('#weatherLocationBtn').click({ position: { x: 20, y: 20 } });
  await expect(page.locator('#weather-location-editor')).not.toBeVisible();
  await expect(page.locator('#weatherLocationBtn')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('#weatherLocationBtn').press('Enter');
  await expect(page.locator('#locationInput')).toBeFocused();
  await page.locator('#locationInput').fill('Inline');
  await page.locator('#locationSuggestions button').first().click();
  await page.locator('#saveLocationBtn').click();
  await expect(page.locator('#weather-location-editor')).not.toBeVisible();
  await expect(page.locator('#weatherLocationBtn')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#weatherLocationBtn .disclosure-chevron')).toHaveCSS('transform', 'none');
  await expect(page.locator('#weatherLocationSummary')).toHaveText('Inline City');
  await expect(page.locator('#langToggleBtnSettings')).not.toBeVisible();
  await page.locator('#settings-back-button').click();
  await page.locator('#langToggleBtnSettings').click();
  await expect(page.locator('#settings-title')).toHaveText('Settings');
  await expect(page.locator('#weatherSettingsSummary')).toHaveText('Inline City');
  await page.locator('#settings-close-button').click();
  await page.locator('#weather').click();
  await expect(page.locator('#locationModal #locationInput')).toBeVisible();
  await page.locator('#loc-close-button').click();
  await page.evaluate(() => appStorage.removeItem('qweatherApiKey'));
  await page.locator('#weather').click();
  await expect(page.locator('#settings-title')).toHaveText('Weather settings');
  await expect(page.locator('#apiKeyInput')).toBeVisible();
});

test('unset location opens inline, requires a Key and collapses after saving', async ({ page }) => {
  await home(page); await settings(page); await page.locator('#weatherSettingsBtn').click();
  const toggle = page.locator('#weatherLocationBtn');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toBeFocused();
  await expect(page.locator('#weather-location-editor #locationInput')).toBeVisible();
  await expect(page.locator('#locationError')).toContainText('API Key');
  await toggle.press('Space');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#weather-location-editor')).not.toBeVisible();
  await page.locator('#settings-back-button').click();
  await page.locator('#weatherSettingsBtn').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  await page.evaluate(() => {
    window.geolocationCalls = 0;
    navigator.geolocation.getCurrentPosition = () => { window.geolocationCalls++; };
  });
  const requests = [];
  await page.route('https://*.qweather.com/**', route => {
    requests.push(route.request().url());
    const payload = route.request().url().includes('/city/lookup')
      ? { code: '200', location: [{ id: 'first', name: 'First City' }] }
      : { code: '200', now: { temp: '26', feelsLike: '25' }, daily: [{ tempMax: '30', tempMin: '20' }] };
    return route.fulfill({ json: payload });
  });
  await page.locator('#locationInput').fill('First');
  await page.locator('#saveLocationBtn').click();
  await page.locator('#useCurrentLocationBtn').click();
  await expect(page.locator('#locationError')).toContainText('API Key');
  await expect(page.locator('#customNoticeModal')).not.toBeVisible();
  expect(await page.evaluate(() => window.geolocationCalls)).toBe(0);
  expect(requests).toEqual([]);
  await page.locator('#apiKeyInput').fill('test-only');
  await page.locator('#saveApiKeyBtn').click();
  await expect(page.locator('#locationError')).toBeEmpty();
  await page.locator('#locationSuggestions button').first().click();
  await page.locator('#saveLocationBtn').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#weatherLocationSummary')).toHaveText('First City');
  await page.locator('#settings-close-button').click();
  await settings(page); await page.locator('#weatherSettingsBtn').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#weather-location-editor')).not.toBeVisible();
});

for (const viewport of [{ width: 1280, height: 900 }, { width: 320, height: 700 }]) {
  test(`add-group dialog stays spaced and usable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await home(page); await settings(page); await page.locator('#addNewGroupBtn').click();
    const input = page.locator('#customInputValue');
    await expect(input).toBeFocused();
    const [dialog, title, field, confirm, cancel] = await Promise.all([
      '#customInputModal .modal-content', '#customInputTitle', '#customInputValue', '#customInputYes', '#customInputNo'
    ].map(selector => page.locator(selector).boundingBox()));
    expect(title.x).toBeCloseTo(field.x, 0);
    expect(title.y - dialog.y).toBeGreaterThanOrEqual(20);
    expect(title.y - dialog.y).toBeLessThanOrEqual(28);
    expect(field.y - title.y - title.height).toBeGreaterThanOrEqual(12);
    expect(confirm.y - field.y - field.height).toBeGreaterThanOrEqual(16);
    expect(cancel.x - confirm.x - confirm.width).toBeGreaterThanOrEqual(10);
    expect(confirm.width).toBeCloseTo(cancel.width, 0);
    expect(confirm.height).toBeCloseTo(field.height, 0);
    expect(dialog.x).toBeGreaterThanOrEqual(12);
    expect(dialog.x + dialog.width).toBeLessThanOrEqual(viewport.width - 12);
    expect(dialog.y + dialog.height).toBeLessThanOrEqual(viewport.height);
    await input.fill('New group'); await input.press('Enter');
    await expect(page.locator('#customInputModal')).not.toBeVisible();
    await expect(page.locator('.groups .group')).toHaveCount(5);
    await page.locator('#addNewGroupBtn').click();
    await input.fill('Cancelled'); await page.locator('#customInputNo').click();
    await expect(page.locator('.groups .group')).toHaveCount(5);
    await expect(page.locator('#addNewGroupBtn')).toBeFocused();
  });
}

test('built standalone runs offline and imports with denied storage; package contains only runtime files', async ({ browser }) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'startpage-smoke-'));
  const file = path.join(folder, 'StartPage.html'); fs.copyFileSync('StartPage.html', file);
  const context = await browser.newContext({ offline: true, reducedMotion: 'reduce', viewport: { width: 1280, height: 650 } });
  await context.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Denied', 'SecurityError'); } }));
  try {
    const page = await context.newPage(), errors = [], network = [];
    page.on('pageerror', error => errors.push(error.message)); page.on('request', r => { if (r.url().startsWith('http')) network.push(r.url()); });
    await page.goto(pathToFileURL(file).href); await page.locator('#welcome-skip').click();
    await expect(page.locator('#welcome-overlay')).not.toBeVisible(); await settings(page);
    await expect(page.locator('#settings-status')).toBeEmpty();
    await expect(page.locator('.settings-backup-section #backup-status')).toContainText('关闭前请导出配置');
    const rect = await page.locator('#settingsModal .modal-content').boundingBox();
    expect(rect.y).toBeGreaterThanOrEqual(0); expect(rect.y + rect.height).toBeLessThanOrEqual(650);
    await importFile(page, Buffer.from(JSON.stringify({ schemaVersion: 2, settings: { userName: 'Offline' } })));
    await expect(page.locator('#greeting')).toContainText('Offline');
    expect(await page.evaluate(async () => {
      await document.fonts.ready; await document.querySelector('#current-engine-icon img').decode();
      return typeof Sortable === 'function' && document.fonts.check('16px "JetBrains Mono"');
    })).toBe(true);
    expect(errors).toEqual([]); expect(network).toEqual([]);
    for (const name of ['node_modules', 'tests', 'tools', 'docs', '.git', 'icons', 'Sortable.min.js', 'assets/engine-icons/README.md']) expect(fs.existsSync(`dist/extension/${name}`)).toBe(false);
    const manifest = JSON.parse(fs.readFileSync('dist/extension/manifest.json', 'utf8'));
    for (const name of [...Object.values(manifest.icons), 'assets/vendor/Sortable.min.js']) expect(fs.existsSync(`dist/extension/${name}`)).toBe(true);
    expect(fs.readFileSync('dist/extension/assets/vendor/Sortable.min.js')).toEqual(fs.readFileSync('assets/vendor/Sortable.min.js'));
    const html = fs.readFileSync('dist/extension/index.html', 'utf8');
    for (const [, name] of html.matchAll(/<script src="([^"]+)"/g)) expect(fs.existsSync(`dist/extension/${name}`)).toBe(true);
  } finally { await context.close(); fs.rmSync(folder, { recursive: true, force: true }); }
});
