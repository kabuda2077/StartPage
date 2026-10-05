const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const current = require('../../manifest.json').version;
const [major, minor] = current.split('.').map(Number);
const newer = `${major}.${minor + 1}.0`;
const api = 'https://api.github.com/repos/kabuda2077/StartPage/releases/latest';
const releaseUrl = version => `https://github.com/kabuda2077/StartPage/releases/tag/v${version}`;
const payload = version => ({ tag_name: `v${version}`, draft: false, prerelease: false });
async function home(page) {
  await page.context().route('https://github.com/kabuda2077/StartPage/releases/tag/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Release</title>' }));
  await page.addInitScript(() => localStorage.setItem('hasVisited', 'true'));
  await page.goto('/');
  await expect(page.locator('.groups .group')).toHaveCount(4);
}
async function settings(page) {
  await page.locator('#settings-icon').click();
  await expect(page.locator('#checkUpdateBtn')).toBeVisible();
}
async function expectRelease(page, version, activate) {
  const opened = page.waitForEvent('popup');
  await activate();
  const release = await opened;
  await expect(release).toHaveURL(releaseUrl(version));
  await release.close();
}

test('the check label stays fixed, its icon is decorative, and only the newer result opens a release', async ({ page }) => {
  let requests = 0, releaseRequest;
  let mode = 'current';
  const waiting = new Promise(resolve => { releaseRequest = resolve; });
  await page.route(api, async route => {
    requests++;
    if (mode === 'waiting') await waiting;
    await route.fulfill({ json: payload(mode === 'newer' ? newer : current) });
  });
  await page.clock.install();
  await home(page);
  await expect.poll(() => page.evaluate(() => updateClient.getState().checkedAt)).not.toBeNull();
  await settings(page);
  await expect(page.locator('.settings-preferences > :last-child')).toHaveId('updateRow');
  await expect(page.locator('#updateRow > button')).toHaveCount(1);
  await expect(page.locator('#updateStatusLabel')).toHaveText('检查更新');
  await expect(page.locator('#updateResultLabel')).toBeHidden();
  await expect(page.locator('#updateVersion')).toHaveText(`v${current}`);
  expect(await page.locator('#updateResult').getAttribute('href')).toBeNull();
  const refreshIcon = await page.locator('#updateRow > .ui-icon svg').innerHTML();
  const initialStyle = await page.evaluate(() => ({ labelColor: getComputedStyle(updateStatusLabel).color, versionColor: getComputedStyle(updateVersion).color, versionRight: updateVersion.getBoundingClientRect().right }));
  await page.locator('#updateRow > .ui-icon').click();
  await page.locator('#updateVersion').click();
  expect(requests).toBe(1);
  expect(page.context().pages()).toHaveLength(1);

  mode = 'waiting';
  await page.locator('#checkUpdateBtn').click();
  await expect(page.locator('#updateStatusLabel')).toHaveText('检查更新');
  await expect(page.locator('#updateResultLabel')).toHaveText('正在检查…');
  await expect(page.locator('#checkUpdateBtn')).toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('#checkUpdateBtn')).toHaveAttribute('aria-busy', 'true');
  await page.evaluate(() => { checkUpdateBtn.click(); checkUpdateBtn.click(); });
  expect(requests).toBe(2);
  releaseRequest();
  await expect(page.locator('#updateResultLabel')).toHaveText('已是最新版本');
  await page.clock.fastForward(3100);
  await expect(page.locator('#updateResultLabel')).toBeHidden();
  await expect(page.locator('#updateStatusLabel')).toHaveText('检查更新');

  mode = 'newer';
  await page.locator('#checkUpdateBtn').click();
  await expect(page.locator('#updateStatusLabel')).toHaveText('检查更新');
  await expect(page.locator('#updateResultLabel')).toHaveText('发现新版本');
  await expect(page.locator('#updateVersion')).toHaveText(`v${newer}`);
  await expect(page.locator('#updateResult')).toHaveClass(/has-update/);
  await expect(page.locator('#updateVersion')).not.toHaveCSS('color', initialStyle.versionColor);
  await expect(page.locator('#updateResult svg')).toHaveCount(0);
  await expect(page.locator('#updateResultLabel')).toHaveCSS('font-size', '12.8px');
  await expect(page.locator('#updateVersion')).toHaveCSS('font-size', '12.8px');
  expect(await page.locator('#updateRow > .ui-icon svg').innerHTML()).toBe(refreshIcon);
  const alignment = await page.evaluate(() => {
    const box = selector => document.querySelector(selector).getBoundingClientRect();
    return { versionRight: box('#updateVersion').right, iconRight: box('#saveUsernameBtn .ui-icon').right,
      labelColor: getComputedStyle(updateStatusLabel).color,
      resultColors: ['updateResultLabel', 'updateVersion'].map(id => getComputedStyle(document.getElementById(id)).color) };
  });
  expect(alignment.versionRight).toBeCloseTo(alignment.iconRight, 1);
  expect(alignment.versionRight).toBeCloseTo(initialStyle.versionRight, 1);
  expect(alignment.labelColor).toBe(initialStyle.labelColor);
  expect(new Set(alignment.resultColors).size).toBe(1);
  expect(alignment.resultColors[0]).not.toBe(initialStyle.versionColor);
  expect(page.context().pages()).toHaveLength(1);
  await page.clock.fastForward(4000);
  await expect(page.locator('#updateResultLabel')).toHaveText('发现新版本');
  await page.locator('#langToggleBtnSettings').click();
  await expect(page.locator('#updateStatusLabel')).toHaveText('Check for updates');
  await expect(page.locator('#updateResultLabel')).toHaveText('New version');
  await expectRelease(page, newer, () => page.locator('#updateResult').click());
  expect(requests).toBe(3);
  mode = 'current';
  await page.locator('#checkUpdateBtn').click();
  await expect(page.locator('#updateVersion')).toHaveText(`v${current}`);
  expect(await page.locator('#updateVersion').evaluate(element => element.getBoundingClientRect().right)).toBeCloseTo(initialStyle.versionRight, 1);
  expect(await page.locator('#updateResult').getAttribute('href')).toBeNull();
  expect(requests).toBe(4);
});

test('checking text can recheck a known update without navigating, including failure retries and keyboard use @smoke', async ({ page }) => {
  const newest = `${major}.${minor + 1}.1`;
  let mode = 'newer', requests = 0, releaseRequest;
  const waiting = new Promise(resolve => { releaseRequest = resolve; });
  await page.route(api, async route => {
    requests++;
    if (mode === 'fail') { await waiting; await route.fulfill({ status: 503, body: 'Unavailable' }); }
    else await route.fulfill({ json: payload(mode === 'newest' ? newest : newer) });
  });
  await home(page);
  await expect.poll(() => page.evaluate(() => updateClient.getState().status)).toBe('available');
  await settings(page);
  await page.locator('#updateRow > .ui-icon').click();
  expect(requests).toBe(1);
  mode = 'fail';
  await page.locator('#checkUpdateBtn').click();
  await expect(page.locator('#checkUpdateBtn')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#checkUpdateBtn')).toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('#updateStatusLabel')).toHaveText('检查更新');
  await expect(page.locator('#updateResultLabel')).toHaveText('发现新版本');
  await expect(page.locator('#updateResult')).toHaveAttribute('href', releaseUrl(newer));
  await expect(page.locator('#updateVersion')).toHaveText(`v${newer}`);
  await page.evaluate(() => { checkUpdateBtn.click(); checkUpdateBtn.click(); });
  expect(requests).toBe(2);
  expect(page.context().pages()).toHaveLength(1);
  releaseRequest();
  await expect(page.locator('#checkUpdateBtn')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#checkUpdateBtn')).toHaveAttribute('title', /点击重试/);
  await expect(page.locator('#updateVersion')).toHaveText(`v${newer}`);
  mode = 'newest';
  await page.locator('#checkUpdateBtn').press('Enter');
  await expect(page.locator('#updateVersion')).toHaveText(`v${newest}`);
  expect(requests).toBe(3);
  expect(page.context().pages()).toHaveLength(1);
  await page.locator('#checkUpdateBtn').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#updateResult')).toBeFocused();
  await expectRelease(page, newest, () => page.keyboard.press('Enter'));
});

test('automatic checks share cached results across tabs, honor 24 hours and preserve updates after a failed check', async ({ context, page }) => {
  let requests = 0, failing = false;
  await context.route(api, route => {
    requests++;
    return route.fulfill(failing ? { status: 503, body: 'Unavailable' } : { json: payload(newer) });
  });
  const start = Date.parse('2026-10-05T10:00:00Z');
  await page.clock.setFixedTime(start);
  await home(page);
  await expect.poll(() => page.evaluate(() => updateClient.getState().status)).toBe('available');
  const second = await context.newPage(); await second.goto('/');
  await expect(second.locator('.groups .group')).toHaveCount(4);
  expect(await second.evaluate(() => updateClient.getState().latestVersion)).toBe(newer);
  expect(await second.evaluate(() => updateClient.check())).toBe(false);
  expect(requests).toBe(1);
  await second.close(); await page.bringToFront();
  await settings(page);
  await page.clock.setFixedTime(start + 23 * 3600000);
  expect(await page.evaluate(() => updateClient.check())).toBe(false);
  expect(requests).toBe(1);
  failing = true;
  await page.clock.setFixedTime(start + 24 * 3600000);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect.poll(() => page.evaluate(() => JSON.parse(appStorage.getItem('updateCheck')).failedAt)).toBe(start + 24 * 3600000);
  await expect(page.locator('#updateStatusLabel')).toHaveText('检查更新');
  await expect(page.locator('#updateResultLabel')).toHaveText('发现新版本');
  await expect(page.locator('#updateVersion')).toHaveText(`v${newer}`);
  expect(requests).toBe(2);
  await page.reload();
  await expect(page.locator('.groups .group')).toHaveCount(4);
  expect(await page.evaluate(() => updateClient.check())).toBe(false);
  await page.clock.setFixedTime(start + 25 * 3600000 - 1);
  expect(await page.evaluate(() => updateClient.check())).toBe(false);
  expect(requests).toBe(2);
  failing = false;
  await page.clock.setFixedTime(start + 25 * 3600000);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect.poll(() => page.evaluate(() => updateClient.getState().checkedAt)).toBe(start + 25 * 3600000);
  expect(requests).toBe(3);
});

test('failed checks never claim up-to-date and manual retries bypass automatic backoff', async ({ page }) => {
  let requests = 0, valid = false;
  await page.route(api, route => {
    requests++;
    return route.fulfill({ json: valid ? payload(current) : { ...payload(newer), tag_name: 'javascript:alert(1)' } });
  });
  await home(page);
  await expect.poll(() => page.evaluate(() => updateClient.getState().status)).toBe('error');
  await settings(page);
  await expect(page.locator('#updateStatusLabel')).toHaveText('检查更新');
  await expect(page.locator('#updateResultLabel')).toHaveText('检查失败');
  await expect(page.locator('#updateVersion')).toHaveText(`v${current}`);
  expect(await page.locator('#updateResult').getAttribute('href')).toBeNull();
  expect(await page.evaluate(() => updateClient.check())).toBe(false);
  expect(requests).toBe(1);
  valid = true;
  await page.locator('#checkUpdateBtn').click();
  await expect(page.locator('#updateResultLabel')).toHaveText('已是最新版本');
  await expect(page.locator('#updateStatusLabel')).toHaveText('检查更新');
  expect(requests).toBe(2);
});

test('built single-file displays its embedded version offline; extension runtime version takes priority', async ({ browser }) => {
  for (const runtimeVersion of [null, '9.9.9']) {
    const context = await browser.newContext({ offline: true, reducedMotion: 'reduce' });
    try {
      await context.addInitScript(version => {
        localStorage.setItem('hasVisited', 'true');
        if (version) globalThis.browser = { runtime: { getManifest: () => ({ version }) } };
      }, runtimeVersion);
      const page = await context.newPage(), network = [], errors = [];
      page.on('request', request => { if (/^https?:/.test(request.url())) network.push(request.url()); });
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(path.resolve('StartPage.html')).href);
      await settings(page);
      await expect(page.locator('#updateVersion')).toHaveText(`v${runtimeVersion || current}`);
      await expect(page.locator('#updateStatusLabel')).toHaveText('检查更新');
      expect(network).toEqual([]);
      expect(errors).toEqual([]);
      await page.locator('#checkUpdateBtn').click();
      await expect(page.locator('#updateResultLabel')).toHaveText('检查失败');
      await expect(page.locator('#updateStatusLabel')).toHaveText('检查更新');
    } finally { await context.close(); }
  }
});
