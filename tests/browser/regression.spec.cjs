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
  await page.locator('#locationInput').fill('Inline');
  await page.locator('#locationSuggestions button').first().click();
  await page.locator('#saveLocationBtn').click();
  await expect(page.locator('#weather-location-editor')).not.toBeVisible();
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
    for (const name of ['node_modules', 'tests', 'tools', 'docs', '.git']) expect(fs.existsSync(`dist/extension/${name}`)).toBe(false);
    const html = fs.readFileSync('dist/extension/index.html', 'utf8');
    for (const [, name] of html.matchAll(/<script src="([^"]+)"/g)) expect(fs.existsSync(`dist/extension/${name}`)).toBe(true);
  } finally { await context.close(); fs.rmSync(folder, { recursive: true, force: true }); }
});
