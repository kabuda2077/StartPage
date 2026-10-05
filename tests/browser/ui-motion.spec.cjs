const { test, expect } = require('@playwright/test');

test.use({ contextOptions: { reducedMotion: 'no-preference' } });
const idle = (page, selector = '#settingsModal') => expect.poll(() => page.locator(selector).evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
async function home(page) {
  await page.addInitScript(() => localStorage.setItem('hasVisited', 'true'));
  await page.goto('/');
}
async function settings(page) {
  await home(page);
  await page.locator('#settings-icon').click();
  await expect(page.locator('#settingsModal')).toBeVisible();
  await idle(page);
}
async function engines(page) {
  await page.locator('#editEnginesBtn').click();
  await expect(page.locator('#settings-title')).toHaveText('自定义搜索引擎');
  await idle(page);
}

test('new UI motion shares three timing tiers across JS and the disclosure arrow', async ({ page }) => {
  await home(page);
  const result = await page.evaluate(async () => {
    const durations = {};
    const record = (name, element) => { durations[name] = element.getAnimations()[0].effect.getTiming().duration; };
    setEngineListOpen(true); record('menuOpen', engineList);
    motion.stop(engineList, 'popover', true);
    setEngineListOpen(false); record('menuClose', engineList);
    await openSettings(); record('modalOpen', settingsModal);
    motion.stopTree(settingsModal, true);
    appStorage.setItem('userName', 'Preview'); renderUsernameSection();
    document.getElementById('editUsernameBtn').click(); record('inlineEdit', document.getElementById('username-edit-mode'));
    motion.stopTree(settingsModal, true);
    showWeatherSettings(); closeInlineLocationEditor(); openInlineLocationEditor(true);
    record('disclosure', weatherLocationEditor);
    const arrowDuration = parseFloat(getComputedStyle(document.querySelector('#weatherLocationBtn .disclosure-chevron')).transitionDuration) * 1000;
    const closing = settingsCloseButton.onclick(); record('modalClose', settingsModal);
    await closing;
    return { timing: motion.timing, durations, arrowDuration };
  });
  expect(result.timing).toEqual({ quick: 120, standard: 160, expand: 200 });
  expect(result.durations).toEqual({ menuOpen: 160, menuClose: 120, modalOpen: 200, inlineEdit: 160, disclosure: 200, modalClose: 120 });
  expect(result.arrowDuration).toBe(result.timing.expand);
});

test('nested dialogs keep one backdrop, block interaction during exit, and restore focus', async ({ page }) => {
  await settings(page);
  const opening = await page.evaluate(() => {
    document.getElementById('addNewGroupBtn').focus();
    document.getElementById('addNewGroupBtn').click();
    return {
      nested: customInputModal.classList.contains('is-nested'),
      backdrop: getComputedStyle(customInputModal).backgroundColor,
      parentAnimations: settingsModal.getAnimations().length,
      parentInert: settingsModal.inert,
      panelFrames: customInputModal.querySelector('.modal-content').getAnimations()[0].effect.getKeyframes()
    };
  });
  expect(opening.nested).toBe(true);
  expect(opening.backdrop).toBe('rgba(0, 0, 0, 0)');
  expect(opening.parentAnimations).toBe(0);
  expect(opening.parentInert).toBe(true);
  expect(opening.panelFrames[0].transform).toBe('translateY(8px)');
  await expect(page.locator('#customInputValue')).toBeFocused();
  await idle(page, '#customInputModal');
  const closing = await page.evaluate(() => {
    customInputNo.click();
    customInputModal.getAnimations().forEach(animation => animation.pause());
    return { closing: customInputModal.dataset.closing, parentInert: settingsModal.inert, panelInert: customInputModal.querySelector('.modal-content').inert, active: getActiveModal().id };
  });
  expect(closing).toEqual({ closing: 'true', parentInert: true, panelInert: true, active: 'customInputModal' });
  await page.keyboard.press('Tab');
  await expect(page.locator('#customInputModal')).toBeFocused();
  await page.evaluate(() => motion.stop(customInputModal, 'modal', true));
  await expect(page.locator('#customInputModal')).toBeHidden();
  await expect(page.locator('#addNewGroupBtn')).toBeFocused();
  expect(await page.locator('#settingsModal').evaluate(el => el.getAnimations().length)).toBe(0);
  await page.locator('#settings-close-button').click();
  await expect(page.locator('#settingsModal')).toBeHidden();
  await expect(page.locator('#settings-icon')).toBeFocused();
  expect(await page.locator('.groups').evaluate(el => el.inert)).toBe(false);
});

test('reopening a leaving dialog reverses it and cannot trigger the old close callback', async ({ page }) => {
  await settings(page);
  const state = await page.evaluate(async () => {
    customNotice('First');
    motion.stop(customNoticeModal, 'modal', true);
    motion.stop(customNoticeModal.querySelector('.modal-content'), 'modal', true);
    let callbacks = 0;
    const leaving = closeModal(customNoticeModal, { onClosed: () => callbacks++ });
    const animation = customNoticeModal.getAnimations()[0];
    animation.pause(); await animation.ready; animation.currentTime = animation.effect.getTiming().duration / 2;
    const opacity = Number(getComputedStyle(customNoticeModal).opacity);
    customNotice('Second');
    const firstFrame = Number(customNoticeModal.getAnimations()[0].effect.getKeyframes()[0].opacity);
    const closed = await leaving;
    return { opacity, firstFrame, closed, callbacks, count: modalStack.filter(entry => entry.modal === customNoticeModal).length };
  });
  expect(state.opacity).toBeGreaterThan(0);
  expect(state.opacity).toBeLessThan(1);
  expect(state.firstFrame).toBeCloseTo(state.opacity);
  expect(state.closed).toBe(false);
  expect(state.callbacks).toBe(0);
  expect(state.count).toBe(1);
  await idle(page, '#customNoticeModal');
  await expect(page.locator('#customNoticeMessage')).toHaveText('Second');
  await page.keyboard.press('Escape');
  await expect(page.locator('#customNoticeModal')).toBeHidden();
  await page.locator('#exportConfigBtn').click();
  await idle(page, '#exportConfigModal');
  await page.locator('#exportConfigModal').click({ position: { x: 4, y: 4 } });
  await expect(page.locator('#exportConfigModal')).toBeHidden();
  await expect(page.locator('#exportConfigBtn')).toBeFocused();
});

test('settings navigation fades without horizontal movement in either direction and still cancels a quick forward/back', async ({ page }) => {
  await settings(page);
  const frames = await page.evaluate(async () => {
    const transition = navigateSettings(editEngines);
    const outgoing = settingsContent.getAnimations()[0];
    const outFrames = outgoing.effect.getKeyframes(), outDuration = outgoing.effect.getTiming().duration;
    outgoing.finish();
    await transition;
    const incomingAnimation = settingsContent.getAnimations()[0];
    const incoming = incomingAnimation.effect.getKeyframes();
    const panel = settingsModal.querySelector('.modal-content');
    return { outFrames, incoming, outDuration, inDuration: incomingAnimation.effect.getTiming().duration, panelSize: panel.getAnimations().some(animation => animation.effect.getKeyframes().some(frame => frame.height)), modalAnimations: settingsModal.getAnimations().length };
  });
  expect(frames.outFrames.at(-1).opacity).toBe('0');
  expect(frames.incoming[0].opacity).toBe('0');
  expect([...frames.outFrames, ...frames.incoming].every(frame => frame.transform === undefined)).toBe(true);
  expect([frames.outDuration, frames.inDuration]).toEqual([120, 120]);
  expect(frames.panelSize).toBe(true);
  expect(frames.modalAnimations).toBe(0);
  await idle(page);
  const backward = await page.evaluate(async () => {
    const transition = navigateSettings(renderSettingsGroups, -1);
    const outgoing = settingsContent.getAnimations()[0];
    const outFrames = outgoing.effect.getKeyframes();
    outgoing.finish(); await transition;
    return { outFrames, incoming: settingsContent.getAnimations()[0].effect.getKeyframes() };
  });
  expect([...backward.outFrames, ...backward.incoming].every(frame => frame.transform === undefined)).toBe(true);
  await idle(page); await engines(page);
  const reversed = await page.evaluate(async () => {
    document.querySelector('.edit-eng-btn').click();
    const pending = settingsContent.getAnimations()[0];
    settingsBackButton.click();
    await Promise.resolve();
    return { title: settingsTitle.textContent, inert: settingsContent.inert, oldState: pending.playState, count: document.querySelectorAll('.engine-name').length };
  });
  expect(reversed).toEqual({ title: '自定义搜索引擎', inert: false, oldState: 'idle', count: 3 });
  await page.locator('#addEngBtn').click();
  await expect(page.locator('#engEditName')).toBeVisible();
  await idle(page);
  await page.locator('#engEditName').fill('Unsaved engine');
  await page.locator('#settings-back-button').click();
  await expect(page.locator('.engine-name')).toHaveCount(3);
  await idle(page);
  const closed = await page.evaluate(async () => {
    const navigation = navigateSettings(() => editSingleEngine(null, () => {}));
    await settingsCloseButton.onclick();
    await navigation;
    return { hidden: settingsModal.style.display, inert: settingsContent.inert, opacity: settingsContent.style.opacity, height: settingsModal.querySelector('.modal-content').style.height, form: Boolean(document.getElementById('engEditName')) };
  });
  expect(closed).toEqual({ hidden: 'none', inert: false, opacity: '', height: '', form: false });
});

test('menus reverse cleanly and updating candidate results does not replay their entrance', async ({ page }) => {
  await home(page);
  const menu = await page.evaluate(async () => {
    setEngineListOpen(true);
    const first = engineList.getAnimations()[0];
    first.pause(); await first.ready; first.currentTime = 70;
    setEngineListOpen(false);
    const closingInert = engineList.inert;
    const closing = engineList.getAnimations()[0];
    closing.pause(); await closing.ready; closing.currentTime = 30;
    const opacity = Number(getComputedStyle(engineList).opacity);
    setEngineListOpen(true);
    return { closingInert, oldState: closing.playState, from: Number(engineList.getAnimations()[0].effect.getKeyframes()[0].opacity), opacity };
  });
  expect(menu.closingInert).toBe(true);
  expect(menu.oldState).toBe('idle');
  expect(menu.from).toBeCloseTo(menu.opacity);
  await idle(page, '#engine-list');
  await page.locator('#engine-list li').nth(1).click();
  await expect(page.locator('#engine-list')).toBeHidden();
  await expect(page.locator('#search-input')).toBeFocused();
  await page.locator('#settings-icon').click(); await idle(page); await engines(page);
  await page.locator('#addEngBtn').click();
  await expect(page.locator('#engEditName')).toBeVisible(); await idle(page);
  const candidates = await page.evaluate(() => {
    const field = document.getElementById('engEditName');
    field.value = 'Go'; field.dispatchEvent(new Event('input', { bubbles: true }));
    const list = document.getElementById('enginePresetSuggestions');
    const entrance = list.getAnimations()[0];
    field.value = 'Google'; field.dispatchEvent(new Event('input', { bubbles: true }));
    return { animated: Boolean(entrance), sameAnimation: list.getAnimations()[0] === entrance, expanded: field.getAttribute('aria-expanded'), count: list.querySelectorAll('button').length };
  });
  expect(candidates.animated).toBe(true);
  expect(candidates.sameAnimation).toBe(true);
  expect(candidates.expanded).toBe('true');
  expect(candidates.count).toBeGreaterThan(0);
  await page.locator('#enginePresetSuggestions button').first().click();
  await expect(page.locator('#enginePresetSuggestions')).toBeHidden();
  await expect(page.locator('#engEditName')).toHaveValue('Google');
  await expect(page.locator('#engEditUrl')).not.toHaveValue('');
});

test('inline editing and status messages settle naturally without replay on ordinary rendering', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('userName', 'Alice'));
  await settings(page);
  const editing = await page.evaluate(() => {
    document.getElementById('editUsernameBtn').click();
    return { animated: document.getElementById('username-edit-mode').getAnimations().length, focused: document.activeElement.id };
  });
  expect(editing.animated).toBe(1);
  expect(editing.focused).toBe('usernameInput');
  await page.locator('#usernameInput').fill('Bob');
  await page.locator('#saveUsernameBtn').click();
  await expect(page.locator('#username-saved-text')).toHaveText('Bob'); await idle(page);
  expect(await page.evaluate(() => { renderUsernameSection(); renderSettingsGroups(); return settingsContent.getAnimations().length; })).toBe(0);
  await page.locator('#weatherSettingsBtn').click();
  await expect(page.locator('#weatherLocationBtn')).toBeVisible(); await idle(page);
  await page.locator('#apiKeyInput').fill('test-only');
  await page.locator('#saveApiKeyBtn').click();
  await expect(page.locator('#api-key-saved-mode')).toBeVisible(); await idle(page);
  await page.locator('#editApiKeyBtn').click();
  await expect(page.locator('#apiKeyInput')).toBeFocused(); await idle(page);
  const message = await page.evaluate(async () => {
    setLocationError('Example validation message');
    const entrance = locationError.getAnimations()[0];
    entrance.pause(); await entrance.ready; entrance.currentTime = 80;
    setLocationError('Example validation message');
    const same = locationError.getAnimations()[0] === entrance;
    setLocationError('');
    const exit = locationError.getAnimations()[0];
    const frames = exit.effect.getKeyframes();
    exit.finish();
    return { same, opacity: Number(frames[0].opacity), finalHeight: frames.at(-1).height };
  });
  expect(message.same).toBe(true);
  expect(message.opacity).toBeGreaterThan(0);
  expect(message.finalHeight).toBe('0px');
  await expect(page.locator('#locationError')).toBeHidden();
  expect(await page.locator('#locationError').evaluate(el => el.style.height)).toBe('');
});

test('list additions/deletions animate only changed rows and keep save and focus behavior', async ({ page }) => {
  await settings(page);
  await page.locator('#addNewGroupBtn').click();
  await page.locator('#customInputValue').fill('Motion group'); await idle(page, '#customInputModal');
  await page.evaluate(() => { customInputYes.onclick(); customInputYes.onclick(); });
  await expect(page.locator('.groups .group')).toHaveCount(5); await idle(page);
  expect(await page.evaluate(() => siteData.filter(group => group.title === 'Motion group').length)).toBe(1);
  const deleted = await page.evaluate(async () => {
    const removed = siteData[1].id;
    settingsGroupsContainer.querySelectorAll('.del-btn')[1].focus();
    siteData.splice(1, 1); saveSiteData(); renderMainPageGroups();
    await motion.list(settingsGroupsContainer, renderSettingsGroups);
    const ghost = settingsGroupsContainer.querySelector('.motion-ghost');
    return {
      ghosts: settingsGroupsContainer.querySelectorAll('.motion-ghost').length,
      inert: ghost.inert,
      hasId: Boolean(ghost.querySelector('[id]')),
      focusId: document.activeElement.closest('[data-item-id]')?.dataset.itemId,
      removed,
      moveCount: [...settingsGroupsContainer.querySelectorAll('[data-item-id]')].filter(node => node.getAnimations().length).length,
      size: settingsGroupsContainer.getAnimations().length
    };
  });
  expect(deleted.ghosts).toBe(1);
  expect(deleted.inert).toBe(true);
  expect(deleted.hasId).toBe(false);
  expect(deleted.focusId).toBeTruthy();
  expect(deleted.focusId).not.toBe(deleted.removed);
  expect(deleted.moveCount).toBeGreaterThan(0);
  expect(deleted.size).toBe(1);
  await idle(page);
  await expect(page.locator('.motion-ghost')).toHaveCount(0);
  await page.locator('#settings-groups-container input').first().fill('Typing normally');
  expect(await page.locator('#settings-groups-container').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
  await page.locator('.edit-btn').first().click();
  await expect(page.locator('#l-list')).toBeVisible(); await idle(page);
  const count = await page.locator('#l-list > [data-item-id]').count();
  await page.locator('#addL').click();
  await expect(page.locator('#l-list > [data-item-id]')).toHaveCount(count + 1); await idle(page);
  await page.locator('#l-list .btn-danger').last().click();
  await page.locator('#confirm-yes').click();
  await expect(page.locator('#l-list > [data-item-id]')).toHaveCount(count); await idle(page);
});

test('changing reduced motion settles a paused modal and makes subsequent navigation immediate', async ({ page }) => {
  await settings(page);
  await page.evaluate(() => {
    customNotice('Motion preference');
    customNoticeModal.getAnimations().forEach(animation => animation.pause());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await idle(page, '#customNoticeModal');
  const state = await page.evaluate(async () => {
    await closeModal(customNoticeModal);
    await navigateSettings(editEngines);
    return { reduced: matchMedia('(prefers-reduced-motion: reduce)').matches, title: settingsTitle.textContent, modalHidden: customNoticeModal.style.display, animations: settingsModal.getAnimations({ subtree: true }).length };
  });
  expect(state).toEqual({ reduced: true, title: '自定义搜索引擎', modalHidden: 'none', animations: 0 });
});

test('missing Web Animations support falls back to fully usable dialogs and navigation', async ({ page }) => {
  await page.addInitScript(() => { Element.prototype.animate = undefined; });
  await settings(page);
  await engines(page);
  await page.locator('#addEngBtn').click();
  await expect(page.locator('#engEditName')).toBeFocused();
  await page.locator('#settings-back-button').click();
  await expect(page.locator('.engine-name')).toHaveCount(3);
  await page.locator('#settings-close-button').click();
  await expect(page.locator('#settingsModal')).toBeHidden();
});
