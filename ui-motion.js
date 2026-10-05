/* Small, interruptible UI transitions. Data changes never depend on animation frames. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
  const timing = Object.freeze({ quick: 120, standard: 160, expand: 200 });
  // CSS (the disclosure arrow) and JS use the same timing source.
  for (const [name, milliseconds] of Object.entries(timing)) {
    document.documentElement.style.setProperty(`--motion-${name}`, `${milliseconds}ms`);
  }
  document.documentElement.style.setProperty('--motion-easing', easing);
  const active = new Map();
  const visible = element => element.isConnected && element.getClientRects().length > 0;
  const enabled = element => !reduced.matches && !document.hidden && typeof element.animate === 'function' && visible(element);

  function stop(element, channel, complete = false) {
    active.get(element)?.get(channel)?.settle(complete);
  }
  function stopTree(root, complete = false) {
    for (const [element, channels] of [...active]) {
      if (root.contains(element)) for (const state of [...channels.values()]) state.settle(complete);
    }
  }
  function play(element, channel, frames, duration = timing.standard, onEnd = () => {}) {
    stop(element, channel);
    if (!enabled(element)) { onEnd(true); return Promise.resolve(true); }
    return new Promise(resolve => {
      const animation = element.animate(frames, { duration, easing, fill: 'both' });
      let settled = false;
      const state = { settle(completed) {
        if (settled) return;
        settled = true;
        animation.onfinish = animation.oncancel = null;
        const channels = active.get(element);
        channels?.delete(channel);
        if (!channels?.size) active.delete(element);
        animation.cancel();
        onEnd(completed);
        resolve(completed);
      } };
      if (!active.has(element)) active.set(element, new Map());
      active.get(element).set(channel, state);
      animation.onfinish = () => state.settle(true);
      animation.oncancel = () => state.settle(false);
    });
  }
  reduced.addEventListener('change', () => {
    if (reduced.matches) stopTree(document.documentElement, true);
  });
  window.addEventListener('pagehide', () => stopTree(document.documentElement, true));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTree(document.documentElement, true);
  });

  function captureHeight(element) {
    const height = visible(element) ? element.getBoundingClientRect().height : null;
    stop(element, 'size');
    return height;
  }
  function resize(element, from, duration = timing.standard) {
    stop(element, 'size');
    if (from == null || !enabled(element)) return;
    const to = element.getBoundingClientRect().height;
    if (Math.abs(from - to) < 1) return;
    element.classList.add('motion-sizing');
    play(element, 'size', [{ height: `${from}px` }, { height: `${to}px` }], duration,
      () => element.classList.remove('motion-sizing'));
  }
  function enter(element, distance = 4) {
    return play(element, 'enter', [{ opacity: 0, transform: `translateY(${distance}px)` }, { opacity: 1, transform: 'none' }]);
  }
  function row(saved, edit, showSaved, animate = false) {
    const next = showSaved ? saved : edit, previous = showSaved ? edit : saved;
    if (next.style.display === 'flex' && previous.style.display === 'none') return;
    const parent = saved.parentElement;
    const height = animate ? captureHeight(parent) : null;
    stop(saved, 'enter'); stop(edit, 'enter');
    saved.style.display = showSaved ? 'flex' : 'none';
    edit.style.display = showSaved ? 'none' : 'flex';
    if (animate) { resize(parent, height); enter(next, 2); }
  }

  function blockFrame(element) {
    const style = getComputedStyle(element);
    return Object.fromEntries(['height', 'opacity', 'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].map(key => [key, style[key]]));
  }
  const collapsed = frame => Object.fromEntries(Object.keys(frame).map(key => [key, key === 'opacity' ? 0 : '0px']));
  function popover(element, open, { clear = false, immediate = false } = {}) {
    const wasOpen = element.classList.contains('show');
    if (wasOpen === open && !element.classList.contains('is-leaving')) {
      element.inert = !open;
      element.setAttribute('aria-hidden', String(!open));
      if (!open && clear) element.replaceChildren();
      return Promise.resolve(true);
    }
    const wasVisible = visible(element);
    const flow = !['absolute', 'fixed'].includes(getComputedStyle(element).position);
    const from = wasVisible ? flow ? blockFrame(element) : { opacity: getComputedStyle(element).opacity, transform: getComputedStyle(element).transform } : null;
    stop(element, 'popover');
    element.classList.toggle('show', open);
    element.classList.toggle('is-leaving', !open && wasVisible);
    element.inert = !open;
    element.setAttribute('aria-hidden', String(!open));
    const finish = completed => {
      element.classList.remove('motion-flow');
      if (!completed) return;
      element.classList.remove('is-leaving');
      if (!open && clear) element.replaceChildren();
    };
    if (immediate || !enabled(element)) { finish(true); return Promise.resolve(true); }
    const full = flow ? blockFrame(element) : { opacity: 1, transform: 'none' };
    const empty = flow ? collapsed(full) : { opacity: 0, transform: 'translateY(-4px)' };
    if (flow) element.classList.add('motion-flow');
    return play(element, 'popover', [from || empty, open ? full : empty], open ? timing.standard : timing.quick, finish);
  }

  const messages = new WeakMap();
  function message(element, text, animate = true) {
    text = String(text || '');
    if (messages.get(element) === text) return;
    messages.set(element, text);
    const from = visible(element) && element.textContent ? blockFrame(element) : null;
    stop(element, 'message');
    const finish = completed => {
      element.classList.remove('motion-flow');
      if (completed && !text) { element.hidden = true; element.textContent = ''; }
    };
    if (!text && !from) { finish(true); return; }
    if (text) { element.hidden = false; element.textContent = text; }
    element.setAttribute('aria-hidden', String(!text));
    if (!animate || !enabled(element)) { finish(true); return; }
    const full = blockFrame(element), empty = collapsed(full);
    element.classList.add('motion-flow');
    play(element, 'message', [from || empty, text ? full : empty], text ? timing.standard : timing.quick, finish);
  }

  const listVersions = new WeakMap();
  async function list(container, update) {
    const version = (listVersions.get(container) || 0) + 1;
    listVersions.set(container, version);
    const animate = enabled(container);
    const origin = container.getBoundingClientRect();
    const before = new Map();
    const focused = container.contains(document.activeElement) ? document.activeElement : null;
    const focusedRow = focused?.closest('[data-item-id]');
    const rows = [...container.querySelectorAll(':scope > [data-item-id]')];
    const focusIndex = rows.indexOf(focusedRow);
    const controlIndex = focusedRow ? [...focusedRow.querySelectorAll('input, button, [tabindex]')].indexOf(focused) : -1;
    if (animate) for (const node of rows) {
      const rect = node.getBoundingClientRect();
      before.set(node.dataset.itemId, { node, top: rect.top - origin.top, left: rect.left - origin.left, width: rect.width, height: rect.height });
    }
    stopTree(container);
    await update();
    if (listVersions.get(container) !== version || !visible(container)) return;
    if (focused && !focused.isConnected && !container.closest('[inert]')) {
      const updated = [...container.querySelectorAll(':scope > [data-item-id]')];
      const row = updated.find(node => node.dataset.itemId === focusedRow?.dataset.itemId) || updated[Math.min(focusIndex, updated.length - 1)];
      const target = row?.querySelectorAll('input, button, [tabindex]')[Math.max(0, controlIndex)] || container.parentElement.querySelector('button');
      target?.focus({ preventScroll: true });
    }
    if (!animate || !enabled(container)) return;
    const target = container.getBoundingClientRect();
    container.classList.add('motion-list');
    for (const node of container.querySelectorAll(':scope > [data-item-id]')) {
      const old = before.get(node.dataset.itemId);
      if (!old) { enter(node); continue; }
      const delta = old.top - (node.getBoundingClientRect().top - target.top);
      if (Math.abs(delta) > 1) play(node, 'move', [{ transform: `translateY(${delta}px)` }, { transform: 'none' }]);
      before.delete(node.dataset.itemId);
    }
    for (const old of before.values()) {
      const ghost = old.node.cloneNode(true);
      ghost.removeAttribute('data-item-id');
      ghost.removeAttribute('id');
      ghost.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
      ghost.inert = true; ghost.setAttribute('aria-hidden', 'true');
      ghost.classList.add('motion-ghost');
      Object.assign(ghost.style, { top: `${old.top}px`, left: `${old.left}px`, width: `${old.width}px`, height: `${old.height}px` });
      container.appendChild(ghost);
      play(ghost, 'remove', [{ opacity: 1 }, { opacity: 0, transform: 'translateY(-4px)' }], timing.quick, () => ghost.remove());
    }
    resize(container, origin.height);
  }
  globalThis.StartPageMotion = { timing, enabled, play, stop, stopTree, captureHeight, resize, row, popover, message, list };
})();
