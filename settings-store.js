/* Per-document drafts, batched writes and three-way merging across tabs. */
(() => {
  function create(key, validate, defaults, onChange, onConflict) {
    const storage = window.startPageStorage;
    let baseline, draft, timer, resolving = false;
    const copy = value => JSON.parse(JSON.stringify(value));
    function load() {
      const raw = storage.getItem(key);
      try { draft = validate(raw ? JSON.parse(raw) : copy(defaults)); }
      catch {
        // Preserve malformed data for recovery instead of silently deleting it.
        if (raw) storage.setItem(`${key}.recovery`, raw);
        draft = validate(copy(defaults));
      }
      baseline = copy(draft);
      if (raw !== JSON.stringify(draft)) storage.setItem(key, JSON.stringify(draft));
      return draft;
    }
    function commit(value) {
      storage.setItem(key, JSON.stringify(value));
      baseline = copy(value);
      draft = value;
    }
    function flush() {
      clearTimeout(timer); timer = null;
      if (!draft || resolving) return false;
      let remote;
      try { remote = validate(JSON.parse(storage.getItem(key) || 'null')); }
      catch { remote = baseline; }
      const local = validate(draft);
      if (JSON.stringify(local) === JSON.stringify(baseline)) {
        if (JSON.stringify(remote) !== JSON.stringify(baseline)) { baseline = copy(remote); draft = remote; onChange(remote); }
        return true;
      }
      try {
        const merged = StartPageData.merge(baseline, local, remote);
        const differs = JSON.stringify(local) !== JSON.stringify(merged);
        // Keep existing object references while the user is typing in an editor.
        if (differs) commit(merged);
        else {
          storage.setItem(key, JSON.stringify(local));
          baseline = copy(local);
        }
        if (differs) onChange(merged);
        return true;
      } catch {
        resolving = true;
        onConflict().then(keepLocal => {
          resolving = false;
          if (keepLocal) { commit(validate(draft)); onChange(draft); }
          else { const fresh = load(); onChange(fresh); }
        });
        return false;
      }
    }
    function save(value, immediate = true) {
      draft = value;
      if (immediate) return flush();
      clearTimeout(timer); timer = setTimeout(flush, 180);
      return true;
    }
    function receive() {
      if (timer || resolving) { if (!resolving) flush(); return; }
      onChange(load());
    }
    return { load, save, flush, receive, get pending() { return Boolean(timer || resolving); } };
  }
  globalThis.StartPageStore = { create };
})();
