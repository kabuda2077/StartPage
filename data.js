/* Shared validation for saved settings, editors and backup files. */
(() => {
  // Covers every permitted group/link/engine field even with JSON escaping.
  // Keep a byte cap for unrelated or excessively padded files as well.
  const limits = { fileBytes: 64 * 1024 * 1024, groups: 100, links: 2000, engines: 100, text: 200, url: 4096 };
  const id = () => globalThis.crypto?.randomUUID?.() || `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const text = (value, max = limits.text) => typeof value === 'string' && value.length <= max;
  function linkUrl(value) {
    const raw = String(value || '').trim();
    if (!raw || raw.length > limits.url || /\s/.test(raw)) return '';
    if (/^[a-z][a-z\d+.-]*:/i.test(raw) && !/^https?:\/\//i.test(raw) && !/^[^/:]+:\d+(?:[/?#]|$)/.test(raw)) return '';
    try {
      const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      return /^https?:$/.test(parsed.protocol) && parsed.hostname && !parsed.username && !parsed.password && parsed.href.length <= limits.url ? parsed.href : '';
    } catch { return ''; }
  }
  function navigationUrl(value) {
    const raw = String(value || '').trim();
    if (/^https?:\/\//i.test(raw)) return linkUrl(raw);
    const host = raw.split(/[/?#]/)[0];
    const local = /^localhost(?::\d+)?$/i.test(host) || /^\d+(?:\.\d+){3}(?::\d+)?$/.test(host) || /^\[[0-9a-f:]+\](?::\d+)?$/i.test(host);
    if (local) return linkUrl(`http://${raw}`);
    if (/\s/.test(raw) || !/^[\w\p{L}-]+(?:\.[\w\p{L}-]+)+(?::\d+)?(?:[/?#].*)?$/u.test(raw)) return '';
    const suffix = host.replace(/:\d+$/, '').split('.').pop();
    if (!/^[a-z]{2,24}$/i.test(suffix) || /^(json|dll|exe|js|ts|cs|py|java|txt|md)$/i.test(suffix)) return '';
    return linkUrl(raw);
  }
  function groups(value) {
    if (!Array.isArray(value) || value.length > limits.groups) throw Error('groups');
    let count = 0;
    const ids = new Set();
    return value.map(group => {
      if (!object(group) || !text(group.title) || !/^#[0-9a-f]{6}$/i.test(group.color) || !Array.isArray(group.links)) throw Error('group');
      count += group.links.length;
      if (count > limits.links) throw Error('links');
      const groupId = group.id || id();
      if (!text(groupId) || ids.has(groupId)) throw Error('id');
      ids.add(groupId);
      const linkIds = new Set();
      const links = group.links.map(link => {
        if (!object(link) || !text(link.name) || !text(link.url, limits.url) || (link.url && !linkUrl(link.url))) throw Error('link');
        const linkId = link.id || id();
        if (!text(linkId) || linkIds.has(linkId)) throw Error('id');
        linkIds.add(linkId);
        return { id: linkId, name: link.name, url: link.url ? linkUrl(link.url) : '' };
      });
      return { id: groupId, title: group.title, color: group.color, links };
    });
  }
  function engines(value) {
    if (!Array.isArray(value) || !value.length || value.length > limits.engines) throw Error('engines');
    const ids = new Set();
    return value.map(engine => {
      if (!object(engine) || !text(engine.id) || !engine.id || ids.has(engine.id)
        || !text(engine.name) || !engine.name.trim() || !text(engine.url, limits.url)
        || !engine.url.includes('{query}') || !/^https?:\/\//i.test(engine.url)
        || !linkUrl(engine.url.replaceAll('{query}', 'test'))) throw Error('engine');
      ids.add(engine.id);
      return { id: engine.id, name: engine.name.trim(), url: engine.url, icon: text(engine.icon) ? engine.icon : 'search' };
    });
  }
  function location(value) {
    if (value === null) return null;
    if (!object(value) || !['id', 'name', 'location'].some(key => text(value[key]) && value[key])) throw Error('location');
    const result = {};
    for (const key of ['id', 'name', 'location', 'lat', 'lon', 'adm1', 'adm2', 'country']) {
      if (value[key] !== undefined) {
        if (!text(value[key])) throw Error('location');
        result[key] = value[key];
      }
    }
    return result;
  }
  function weatherHost(value) {
    if (!value) return '';
    try {
      const url = new URL(value.includes('://') ? value : `https://${value}`);
      if (url.protocol !== 'https:' || url.port || url.username || url.password || url.pathname !== '/' || url.search || url.hash || !/^[a-z0-9.-]+\.qweatherapi\.com$/i.test(url.hostname)) throw Error();
      return url.hostname;
    } catch { throw Error('weatherHost'); }
  }
  function importSettings(data) {
    if (!object(data) || ![1, 2].includes(data.schemaVersion) || !object(data.settings)) throw Error('schema');
    const result = {};
    for (const key of ['siteData', 'enginesData', 'weatherLocationData']) {
      if (!(key in data.settings)) continue;
      let value = data.settings[key];
      if (data.schemaVersion === 1) {
        if (!text(value, limits.fileBytes)) throw Error('value');
        value = JSON.parse(value);
      }
      result[key] = JSON.stringify(({ siteData: groups, enginesData: engines, weatherLocationData: location })[key](value));
    }
    for (const key of ['theme', 'lang', 'userName', 'weatherLocation', 'searchEngine', 'qweatherApiKey', 'qweatherApiHost']) {
      if (!(key in data.settings)) continue;
      const value = data.settings[key];
      if (!text(value, key === 'qweatherApiKey' ? 4096 : limits.text)) throw Error('text');
      if (key === 'theme' && !['light', 'dark'].includes(value)) throw Error('theme');
      if (key === 'lang' && !['zh', 'en'].includes(value)) throw Error('lang');
      result[key] = key === 'qweatherApiHost' ? weatherHost(value) : value;
    }
    if (!Object.keys(result).length) throw Error('empty');
    return result;
  }
  function serializeBackup(data) {
    const checked = importSettings(data);
    const settings = { ...checked };
    for (const key of ['siteData', 'enginesData', 'weatherLocationData']) {
      if (key in settings) settings[key] = JSON.parse(settings[key]);
    }
    const result = JSON.stringify({ schemaVersion: 2, exportedAt: data.exportedAt, settings }, null, 2);
    if (new TextEncoder().encode(result).byteLength > limits.fileBytes) throw Error('backupTooLarge');
    return result;
  }
  function parseBackup(source) {
    if (typeof source !== 'string' || new TextEncoder().encode(source).byteLength > limits.fileBytes) throw Error('backupTooLarge');
    return importSettings(JSON.parse(source));
  }
  function merge(base, local, remote) {
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    if (same(local, base)) return remote;
    if (same(remote, base) || same(local, remote)) return local;
    if (Array.isArray(base) && Array.isArray(local) && Array.isArray(remote)) {
      const keyed = list => new Map(list.map(item => [item.id, item]));
      const b = keyed(base), l = keyed(local), r = keyed(remote);
      const merged = new Map();
      for (const key of new Set([...b.keys(), ...l.keys(), ...r.keys()])) {
        const item = merge(b.get(key), l.get(key), r.get(key));
        if (item !== undefined) merged.set(key, item);
      }
      const common = base.filter(item => l.has(item.id) && r.has(item.id)).map(item => item.id);
      const order = list => list.filter(item => common.includes(item.id)).map(item => item.id);
      const lo = order(local), ro = order(remote);
      if (!same(lo, common) && !same(ro, common) && !same(lo, ro)) throw Error('conflict');
      const preferred = !same(lo, common) ? local : remote;
      return [...new Set([...preferred.map(item => item.id), ...local.map(item => item.id), ...remote.map(item => item.id)])]
        .filter(key => merged.has(key)).map(key => merged.get(key));
    }
    if (object(base) && object(local) && object(remote)) {
      const result = {};
      for (const key of new Set([...Object.keys(base), ...Object.keys(local), ...Object.keys(remote)])) {
        const value = merge(base[key], local[key], remote[key]);
        if (value !== undefined) result[key] = value;
      }
      return result;
    }
    throw Error('conflict');
  }
  globalThis.StartPageData = { limits, id, groups, engines, location, linkUrl, navigationUrl, importSettings, serializeBackup, parseBackup, merge, weatherHost };
})();
