const { test, expect } = require('@playwright/test');

test.use({ contextOptions: { reducedMotion: 'no-preference' } });

async function weatherSettings(page) {
  await page.context().route('https://api.github.com/repos/kabuda2077/StartPage/releases/latest', route => route.fulfill({ json: { tag_name: `v${require('../../manifest.json').version}`, draft: false, prerelease: false } }));
  await page.addInitScript(() => {
    localStorage.setItem('hasVisited', 'true');
    localStorage.setItem('weatherLocationData', JSON.stringify({ id: 'preview', name: 'Preview city' }));
  });
  await page.goto('/');
  await page.locator('#settings-icon').click();
  await page.locator('#weatherSettingsBtn').click();
  await expect(page.locator('#settings-title')).toHaveText('天气设置');
  await expect.poll(() => page.locator('#settingsModal').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
}

const editorSelector = '#weather-location-editor';
const settled = page => expect.poll(() => page.locator(editorSelector).evaluate(el => el.getAnimations().length)).toBe(0);

test('location disclosure interpolates height and reverses without jumps or lost input', async ({ page }) => {
  await weatherSettings(page);
  const frames = await page.evaluate(async () => {
    const editor = document.getElementById('weather-location-editor');
    const button = document.getElementById('weatherLocationBtn');
    const panel = document.querySelector('#settingsModal .modal-content');
    const closedPanel = panel.getBoundingClientRect().height;
    button.click();
    const opening = editor.getAnimations()[0];
    opening.pause(); await opening.ready; opening.currentTime = 0;
    const startPanel = panel.getBoundingClientRect().height;
    opening.currentTime = 100;
    const middlePanel = panel.getBoundingClientRect().height;
    const middleHeight = editor.getBoundingClientRect().height;
    const middleOpacity = Number(getComputedStyle(editor).opacity);
    document.getElementById('locationInput').value = 'Unfinished city';
    button.click();
    const closing = editor.getAnimations()[0];
    closing.pause(); await closing.ready; closing.currentTime = 0;
    const reverseStart = editor.getBoundingClientRect().height;
    const closingInert = editor.inert;
    const closingFocusable = getFocusableElements(document.getElementById('settingsModal')).includes(document.getElementById('locationInput'));
    closing.currentTime = 50;
    const closingHeight = editor.getBoundingClientRect().height;
    button.click();
    const reopening = editor.getAnimations()[0];
    reopening.pause(); await reopening.ready; reopening.currentTime = 0;
    const reopenStart = editor.getBoundingClientRect().height;
    reopening.finish();
    return { closedPanel, startPanel, middlePanel, middleHeight, middleOpacity, reverseStart, closingInert, closingFocusable, closingHeight, reopenStart };
  });
  expect(frames.startPanel).toBeCloseTo(frames.closedPanel, 0);
  expect(frames.middlePanel).toBeGreaterThan(frames.closedPanel);
  expect(frames.middleOpacity).toBeGreaterThan(0);
  expect(frames.middleOpacity).toBeLessThan(1);
  expect(frames.reverseStart).toBeCloseTo(frames.middleHeight, 0);
  expect(frames.closingInert).toBe(true);
  expect(frames.closingFocusable).toBe(false);
  expect(frames.reopenStart).toBeCloseTo(frames.closingHeight, 0);
  await settled(page);
  await expect(page.locator('#locationInput')).toHaveValue('Unfinished city');
  await expect(page.locator('#weatherLocationBtn')).toHaveAttribute('aria-expanded', 'true');
  const fullPanel = await page.locator('#settingsModal .modal-content').boundingBox();
  expect(fullPanel.height).toBeGreaterThan(frames.middlePanel);

  const collapse = await page.evaluate(async () => {
    const editor = document.getElementById('weather-location-editor');
    const beforeSuggestions = editor.getBoundingClientRect().height;
    renderLocationSuggestions(Array.from({ length: 8 }, (_, index) => ({ id: String(index), name: 'City ' + index })));
    motion.stop(document.getElementById('locationSuggestions'), 'popover', true);
    const withSuggestions = editor.getBoundingClientRect().height;
    document.getElementById('weatherLocationBtn').click();
    const animation = editor.getAnimations()[0];
    animation.pause(); await animation.ready; animation.currentTime = 0;
    const collapseStart = editor.getBoundingClientRect().height;
    animation.currentTime = 100;
    const middle = editor.getBoundingClientRect().height;
    animation.finish();
    return { beforeSuggestions, withSuggestions, collapseStart, middle };
  });
  expect(collapse.withSuggestions).toBeGreaterThan(collapse.beforeSuggestions);
  expect(collapse.collapseStart).toBeCloseTo(collapse.withSuggestions, 0);
  expect(collapse.middle).toBeGreaterThan(0);
  expect(collapse.middle).toBeLessThan(collapse.withSuggestions);
  await settled(page);
  await expect(page.locator(editorSelector)).toBeHidden();
  await expect(page.locator('#locationModal #location-fields')).toHaveCount(1);
  expect(await page.locator(editorSelector).evaluate(el => el.style.height)).toBe('');
  const finalPanel = await page.locator('#settingsModal .modal-content').boundingBox();
  expect(finalPanel.height).toBeCloseTo(frames.closedPanel, 0);
});

test('reduced motion settles an active disclosure and skips subsequent animations', async ({ page }) => {
  await weatherSettings(page);
  await page.evaluate(() => {
    document.getElementById('weatherLocationBtn').click();
    document.getElementById('weather-location-editor').getAnimations()[0].pause();
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await settled(page);
  await expect(page.locator(editorSelector)).toBeVisible();
  await expect(page.locator(editorSelector)).not.toHaveClass(/is-animating/);
  const states = await page.evaluate(() => {
    const editor = document.getElementById('weather-location-editor');
    const button = document.getElementById('weatherLocationBtn');
    button.click();
    const hiddenImmediately = editor.hidden;
    button.click();
    return { hiddenImmediately, expanded: button.getAttribute('aria-expanded'), hidden: editor.hidden, animations: editor.getAnimations().length };
  });
  expect(states).toEqual({ hiddenImmediately: true, expanded: 'true', hidden: false, animations: 0 });
});

test('leaving settings cancels disclosure motion before reusing the location form', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await weatherSettings(page);
  const cancelled = await page.evaluate(async () => {
    document.getElementById('weatherLocationBtn').click();
    const editor = document.getElementById('weather-location-editor');
    const animation = editor.getAnimations()[0];
    animation.pause();
    await document.getElementById('settings-close-button').onclick();
    appStorage.setItem('qweatherApiKey', 'test-only');
    document.getElementById('weather').click();
    return { playState: animation.playState, hidden: editor.hidden, animations: editor.getAnimations().length };
  });
  expect(cancelled).toEqual({ playState: 'idle', hidden: true, animations: 0 });
  await expect(page.locator('#locationModal #locationInput')).toBeVisible();
  await expect(page.locator('#locationInput')).toBeFocused();
  await expect(page.locator('#settingsModal')).toBeHidden();
  expect(errors).toEqual([]);
});
