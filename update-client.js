/* Public release metadata only. No downloads, credentials or remote code execution. */
(() => {
  const API_URL = 'https://api.github.com/repos/kabuda2077/StartPage/releases/latest';
  const RELEASE_URL = 'https://github.com/kabuda2077/StartPage/releases/tag/';
  const STORAGE_KEY = 'updateCheck';
  const CHECK_INTERVAL = 24 * 60 * 60 * 1000, RETRY_INTERVAL = 60 * 60 * 1000;
  function versionParts(value) {
    if (typeof value !== 'string' || !/^v?\d{1,6}(?:\.\d{1,6}){0,3}$/i.test(value)) return null;
    return value.replace(/^v/i, '').split('.').map(Number);
  }
  function compareVersions(left, right) {
    const a = versionParts(left), b = versionParts(right);
    if (!a || !b) return null;
    for (let i = 0; i < 4; i++) {
      const difference = (a[i] || 0) - (b[i] || 0);
      if (difference) return Math.sign(difference);
    }
    return 0;
  }
  function create({ storage, version, onChange = () => {}, canCheck = () => true,
    fetcher = (...args) => fetch(...args), now = Date.now, timeout = 8000, locks = globalThis.navigator?.locks }) {
    const currentVersion = versionParts(version) ? version.replace(/^v/i, '') : null;
    let pending = null, controller;
    function readCache() {
      try {
        const stored = JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
        const timestamp = value => Number.isFinite(value) && value >= 0 && value <= now() ? value : null;
        const tag = versionParts(stored.tag) ? stored.tag : null;
        return { tag, checkedAt: tag ? timestamp(stored.checkedAt) : null, failedAt: timestamp(stored.failedAt) };
      } catch { return { tag: null, checkedAt: null, failedAt: null }; }
    }
    function getState() {
      const cache = readCache();
      const available = currentVersion && compareVersions(cache.tag, currentVersion) === 1;
      return {
        status: !currentVersion ? 'unknown' : available ? 'available' : pending ? 'checking' : cache.failedAt !== null ? 'error' : 'idle',
        checking: Boolean(pending), lastCheckFailed: cache.failedAt !== null,
        currentVersion, latestVersion: cache.tag?.replace(/^v/i, '') || null,
        // Build the link ourselves: cached/server URLs are never opened directly.
        releaseUrl: available ? RELEASE_URL + encodeURIComponent(cache.tag) : null,
        checkedAt: cache.checkedAt
      };
    }
    const recent = (at, interval) => at !== null && now() - at < interval;
    const due = cache => !recent(cache.checkedAt, CHECK_INTERVAL) && !recent(cache.failedAt, RETRY_INTERVAL);
    function check(manual = false) {
      if (pending) return pending;
      const before = readCache();
      if (!currentVersion || (!manual && (!canCheck() || !due(before)))) return Promise.resolve(false);
      controller = new AbortController();
      const signal = controller.signal;
      async function request() {
        if (signal.aborted || (!manual && !canCheck())) return false;
        const cache = readCache();
        // A different tab may have completed the same check while this one waited for the lock.
        if (!manual && !due(cache)) return false;
        if (manual && (cache.checkedAt !== before.checkedAt || cache.failedAt !== before.failedAt)) return cache.checkedAt !== null && cache.failedAt === null;
        let timedOut = false;
        const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeout);
        try {
          const response = await fetcher(API_URL, { signal, credentials: 'omit', cache: 'no-store', headers: { Accept: 'application/vnd.github+json' } });
          if (!response.ok) throw Error('updateCheckFailed');
          const release = await response.json();
          if (signal.aborted) { if (timedOut) throw Error('updateCheckFailed'); return false; }
          if (release.draft !== false || release.prerelease !== false || !versionParts(release.tag_name)) throw Error('updateCheckFailed');
          storage.setItem(STORAGE_KEY, JSON.stringify({ tag: release.tag_name, checkedAt: now() }));
          return true;
        } catch {
          if (!signal.aborted || timedOut) storage.setItem(STORAGE_KEY, JSON.stringify({ ...readCache(), failedAt: now() }));
          return false;
        } finally { clearTimeout(timer); }
      }
      pending = Promise.resolve().then(async () => {
        if (locks?.request) {
          try { return await locks.request('startpage-update-check', { signal }, request); }
          catch { if (signal.aborted) return false; } // Restricted storage contexts may deny Web Locks.
        }
        return request();
      }).finally(() => { pending = null; controller = null; onChange(); });
      onChange();
      return pending;
    }
    function cancel() { controller?.abort(); }
    return { getState, check, cancel };
  }
  globalThis.StartPageUpdates = { create, compareVersions, API_URL, STORAGE_KEY, CHECK_INTERVAL, RETRY_INTERVAL };
})();
