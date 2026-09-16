(() => {
  const memory = new Map();
  let persistentStorage;
  try { persistentStorage = window.localStorage; } catch { /* use session memory */ }
  const unavailable = () => {
    persistentStorage = null;
    window.dispatchEvent(new Event('startpage-storage-status'));
  };
  const storage = {
    get persistent() { return Boolean(persistentStorage); },
    getItem(key) {
      if (persistentStorage) {
        try {
          const value = persistentStorage.getItem(key);
          if (value !== null) memory.set(key, value);
          else memory.delete(key);
          return value;
        } catch { unavailable(); }
      }
      return memory.has(key) ? memory.get(key) : null;
    },
    setItem(key, value) {
      memory.set(key, String(value));
      if (persistentStorage) {
        try { persistentStorage.setItem(key, String(value)); }
        catch { unavailable(); }
      }
    },
    removeItem(key) {
      memory.delete(key);
      if (persistentStorage) {
        try { persistentStorage.removeItem(key); }
        catch { unavailable(); }
      }
    }
  };
  window.startPageStorage = storage;
  const root = document.documentElement;
  if (!storage.getItem('hasVisited')) root.classList.add('is-first-visit');
  if (storage.getItem('theme') === 'dark') root.classList.add('dark-mode');
})();
