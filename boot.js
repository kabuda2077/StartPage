(() => {
  // Keep the page usable when a file preview or browser policy denies storage.
  const memory = new Map();
  let persistentStorage;
  try { persistentStorage = window.localStorage; } catch { /* use session memory */ }
  const storage = {
    getItem(key) {
      if (persistentStorage) {
        try {
          const value = persistentStorage.getItem(key);
          if (value !== null) memory.set(key, value);
          else memory.delete(key);
          return value;
        } catch { persistentStorage = null; }
      }
      return memory.has(key) ? memory.get(key) : null;
    },
    setItem(key, value) {
      memory.set(key, String(value));
      if (persistentStorage) {
        try { persistentStorage.setItem(key, String(value)); }
        catch { persistentStorage = null; }
      }
    },
    removeItem(key) {
      memory.delete(key);
      if (persistentStorage) {
        try { persistentStorage.removeItem(key); }
        catch { persistentStorage = null; }
      }
    }
  };
  window.startPageStorage = storage;
  const root = document.documentElement;
  if (!storage.getItem('hasVisited')) root.classList.add('is-first-visit');
  if (storage.getItem('theme') === 'dark') root.classList.add('dark-mode');
})();
