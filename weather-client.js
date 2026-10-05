/* Weather transport has no DOM dependencies; every load supersedes its predecessor. */
(() => {
  const CACHE_TTL = 60 * 60 * 1000;
  const RETRY_DELAY = 5 * 60 * 1000;
  async function json(url, { signal, timeout = 8000, headers } = {}) {
    const controller = new AbortController();
    const abort = () => controller.abort();
    if (signal?.aborted) abort();
    signal?.addEventListener('abort', abort, { once: true });
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeout);
    try {
      const response = await fetch(url, { signal: controller.signal, headers });
      if (!response.ok) throw Error('weatherApiFailed');
      return await response.json();
    } catch (error) {
      if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
      throw Error(timedOut ? 'requestTimeout' : error.message === 'weatherApiFailed' ? 'weatherApiFailed' : 'weatherFailed');
    } finally {
      clearTimeout(timer); signal?.removeEventListener('abort', abort);
    }
  }
  function create({ storage, getKey, getLang, getHost = () => '' }) {
    let generation = 0, active;
    const lookupValue = location => typeof location === 'string' ? location.trim()
      : location?.lon != null && location?.lat != null ? `${location.lon},${location.lat}` : location?.location || location?.name || '';
    async function lookup(location, number = 6, signal) {
      const value = lookupValue(location), key = getKey();
      if (!key || !value) return [];
      const host = getHost();
      const query = new URLSearchParams({ location: value, number: String(number), lang: getLang() });
      if (!host) query.set('key', key);
      let result;
      try {
        result = await json(`https://${host || 'geoapi.qweather.com'}/v2/city/lookup?${query}`, { signal, headers: host ? { 'X-QW-Api-Key': key } : undefined });
      } catch (error) {
        if (error.name === 'AbortError') throw error;
        const codes = { requestTimeout: 'locationTimeout', weatherApiFailed: 'locationApiFailed' };
        throw Error(codes[error.message] || 'locationSearchFailed');
      }
      if (result.code === '404') return [];
      if (result.code !== '200' || !Array.isArray(result.location)) throw Error('locationApiFailed');
      return result.location;
    }
    function readStored(name) {
      try { return JSON.parse(storage.getItem(name) || 'null'); }
      catch { return null; }
    }
    function cancel() { generation++; active?.abort(); }
    async function load(location, { onCache = () => {}, onLoading = () => {}, canRefresh = () => true, force = false } = {}) {
      cancel();
      const token = generation, key = getKey(), lang = getLang(), host = getHost();
      if (!key) return null;
      active = new AbortController();
      const signal = active.signal;
      const current = () => token === generation && key === getKey() && lang === getLang() && host === getHost();
      const keyId = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key)))].map(byte => byte.toString(16).padStart(2, '0')).join('');
      if (!current()) return null;
      const validData = data => data && ['temp', 'feelsLike', 'tempMax', 'tempMin'].every(field => Number.isFinite(Number(data[field])));
      const identity = { locationId: location?.id || lookupValue(location), keyId, host, lang };
      const matches = entry => entry && Object.entries(identity).every(([name, value]) => entry[name] === value);
      const cache = readStored('weatherCache');
      const cached = matches(cache) && Number.isFinite(cache.fetchedAt) && cache.fetchedAt <= Date.now() && validData(cache.data)
        ? { data: cache.data, location, fetchedAt: cache.fetchedAt, refreshAt: cache.fetchedAt + CACHE_TTL } : null;
      // Render even expired data before starting a request; cache reads never show a loading message.
      if (cached) onCache(cached);
      const retry = readStored('weatherRetry');
      const hasRetry = matches(retry) && Number.isFinite(retry.failedAt) && retry.failedAt <= Date.now() && typeof retry.error === 'string';
      if (!force && hasRetry && Date.now() < retry.failedAt + RETRY_DELAY) {
        throw Object.assign(Error(retry.error), { retryAt: retry.failedAt + RETRY_DELAY });
      }
      if (!force && !hasRetry && cached && Date.now() < cached.refreshAt) return cached;
      if (!canRefresh()) return cached;
      if (!cached) onLoading();
      try {
        const selected = location?.id ? location : (await lookup(location, 1, signal))[0];
        if (!selected) throw Error('weatherLocationMissing');
        const query = new URLSearchParams({ location: selected.id, lang });
        if (!host) query.set('key', key);
        const options = { signal, headers: host ? { 'X-QW-Api-Key': key } : undefined };
        const [now, forecast] = await Promise.all([
          json(`https://${host || 'devapi.qweather.com'}/v7/weather/now?${query}`, options),
          json(`https://${host || 'devapi.qweather.com'}/v7/weather/3d?${query}`, options)
        ]);
        if (!current()) return null;
        if (now.code !== '200' || forecast.code !== '200' || !now.now || !forecast.daily?.[0]) throw Error('weatherApiFailed');
        const data = { temp: Math.round(now.now.temp), feelsLike: Math.round(now.now.feelsLike), tempMax: Number(forecast.daily[0].tempMax), tempMin: Number(forecast.daily[0].tempMin) };
        if (!validData(data)) throw Error('weatherApiFailed');
        storage.setItem('weatherLocationData', JSON.stringify(selected));
        storage.setItem('weatherLocation', selected.name || selected.id);
        const fetchedAt = Date.now();
        storage.setItem('weatherCache', JSON.stringify({ locationId: selected.id, keyId, host, lang, fetchedAt, data }));
        storage.removeItem('weatherRetry');
        return { data, location: selected, fetchedAt, refreshAt: fetchedAt + CACHE_TTL };
      } catch (error) {
        if (!current() || error.name === 'AbortError') return null;
        active.abort();
        const failedAt = Date.now();
        storage.setItem('weatherRetry', JSON.stringify({ ...identity, failedAt, error: error.message }));
        error.retryAt = failedAt + RETRY_DELAY;
        throw error;
      }
    }
    return { lookup, load, cancel };
  }
  globalThis.StartPageWeather = { create, json, CACHE_TTL, RETRY_DELAY };
})();
