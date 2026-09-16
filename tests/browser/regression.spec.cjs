const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
async function home(page) {
  await page.addInitScript(() => localStorage.setItem('hasVisited','true'));
  await page.goto('/');
  await expect(page.locator('.groups .group')).toHaveCount(4);
}
async function settings(page) { await page.locator('#settings-icon').click(); }
async function importSettings(page, settings) {
  await page.locator('#importConfigInput').setInputFiles({name:'settings.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({schemaVersion:2,settings}))});
  await page.locator('#confirm-yes').click();
  await expect(page.locator('#customNoticeMessage')).toHaveText(/配置导入成功|Configuration imported/);
  await page.locator('#customNoticeClose').click();
}
test('an idle tab cannot overwrite another tab; independent edits merge',async({context,page})=>{
  await home(page); const second=await context.newPage(); await second.goto('/');
  await settings(page);await settings(second);
  await page.locator('#settings-groups-container input').first().fill('Changed');
  await expect.poll(()=>second.locator('#settings-groups-container input').first().inputValue()).toBe('Changed');
  await second.locator('#settings-close-button').click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(appStorage.getItem('siteData'))[0].title)).toBe('Changed');
  await page.evaluate(()=>{
    const remote=JSON.parse(appStorage.getItem('siteData'));
    siteData[0].title='Local pending'; remote[1].title='Remote pending';
    appStorage.setItem('siteData',JSON.stringify(remote));saveSiteData();
  });
  expect(await page.evaluate(()=>JSON.parse(appStorage.getItem('siteData')).slice(0,2).map(x=>x.title))).toEqual(['Local pending','Remote pending']);
});
test('same-field conflicts require an explicit choice',async({page})=>{
  await home(page);await settings(page);
  await page.evaluate(()=>{
    const remote=JSON.parse(appStorage.getItem('siteData'));remote[0].title='Remote';siteData[0].title='Local';
    appStorage.setItem('siteData',JSON.stringify(remote));saveSiteData();
  });
  await expect(page.locator('#customConfirmModal')).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(appStorage.getItem('siteData'))[0].title)).toBe('Remote');
  await page.locator('#confirm-no').click();
  await expect(page.locator('#settings-groups-container input').first()).toHaveValue('Remote');
});
test('engine reordering edits the visible item; new engine is a draft',async({page})=>{
  await home(page);await settings(page);await page.locator('#editEnginesBtn').click();
  const handles=page.locator('#settings-groups-container .handle');
  const from=await handles.nth(0).boundingBox(),to=await handles.nth(2).boundingBox();
  await page.mouse.move(from.x+8,from.y+8);await page.mouse.down();await page.mouse.move(to.x+8,to.y+to.height-2,{steps:20});await page.mouse.up();
  const name=await page.locator('.engine-name').first().textContent();
  await page.locator('.edit-eng-btn').first().click();await expect(page.locator('#engEditName')).toHaveValue(name);
  await page.locator('#backFromSingleEng').click();
  const count=await page.locator('.engine-name').count();await page.locator('#addEngBtn').click();await page.locator('#backFromSingleEng').click();
  await expect(page.locator('.engine-name')).toHaveCount(count);
  await page.locator('.handle').first().focus();await page.keyboard.press('Alt+ArrowDown');
  expect(await page.locator('.engine-name').nth(1).textContent()).toBe(name);
});
test('weather only accepts the newest city and failures do not close the location dialog',async({page})=>{
  await home(page);
  const result=await page.evaluate(async()=>{
    appStorage.setItem('qweatherApiKey','test-only');clearWeatherCache();
    const original=window.fetch;let release,started;
    const gate=new Promise(resolve=>release=resolve), start=new Promise(resolve=>started=resolve);
    window.fetch=async url=>{const old=new URL(url).searchParams.get('location')==='old';if(old){started();await gate;}return{ok:true,json:async()=>({code:'200',now:{temp:old?'10':'25',feelsLike:'20'},daily:[{tempMax:'30',tempMin:'10'}]})};};
    const pending=fetchWeatherData({id:'old',name:'Old'});await start;await fetchWeatherData({id:'new',name:'New'});release();await pending;
    window.fetch=original;
    return {temp:weatherTemp.textContent,city:getSavedWeatherLocation().id,cache:JSON.parse(appStorage.getItem('weatherCache')).locationId};
  });
  expect(result).toEqual({temp:'25°C',city:'new',cache:'new'});
  await page.route('https://*.qweather.com/**',r=>r.fulfill({json:{code:'500'}}));
  await page.locator('#weather').click();await page.locator('#saveLocationBtn').click();
  await expect(page.locator('#locationModal')).toBeVisible();await expect(page.locator('#locationError')).not.toBeEmpty();
});
test('clearing a location query prevents stale suggestions',async({page})=>{
  await home(page);
  await page.evaluate(()=>{appStorage.setItem('qweatherApiKey','test-only');});
  let respond;const pending=new Promise(resolve=>respond=resolve);
  await page.route('https://geoapi.qweather.com/**',async route=>{await pending;await route.fulfill({json:{code:'200',location:[{id:'x',name:'Old result'}]}}).catch(()=>{});});
  await page.locator('#weather').click();await page.locator('#locationInput').fill('Old');
  await page.waitForRequest('https://geoapi.qweather.com/**');
  await page.locator('#locationInput').fill('');respond();
  await expect(page.locator('#locationSuggestions')).not.toBeVisible();
});
test('temporary storage import stays in the current page',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError');}}));
  await page.goto('/');await page.locator('#welcome-skip').click();await expect(page.locator('#welcome-overlay')).not.toBeVisible();await settings(page);
  await expect(page.locator('#settings-status')).toContainText('本次打开');
  await importSettings(page,{userName:'Imported'});
  await expect(page.locator('#username-saved-text')).toHaveText('Imported');
  await expect(page.locator('#greeting')).toContainText('Imported');
});
test('layout fits a short desktop viewport; username edit is populated; invalid URL is retained',async({page})=>{
  await page.setViewportSize({width:1280,height:650});await home(page);await page.evaluate(()=>appStorage.setItem('userName','Existing'));await page.reload();await settings(page);
  const rect=await page.locator('#settingsModal .modal-content').boundingBox();expect(rect.y).toBeGreaterThanOrEqual(0);expect(rect.y+rect.height).toBeLessThanOrEqual(650);
  await page.locator('#editUsernameBtn').click();await expect(page.locator('#usernameInput')).toHaveValue('Existing');
  await page.locator('.edit-btn').first().click();const field=page.locator('.link-url-input').first();const before=await field.inputValue();
  await field.fill('javascript:alert(1)');await page.locator('#settings-title').click();
  await expect(field).toHaveValue('javascript:alert(1)');await expect(field).toHaveAttribute('aria-invalid','true');
  expect(await page.evaluate(()=>siteData[0].links[0].url)).toBe(before);
});
test('settings remain available without Sortable, with keyboard sorting',async({page})=>{
  await page.route('**/Sortable.min.js',route=>route.abort());await home(page);await settings(page);
  await expect(page.locator('#settingsModal')).toBeVisible();await expect(page.locator('#settings-status')).toContainText('Alt');
  const before=await page.locator('#settings-groups-container input').first().inputValue();
  await page.locator('#settings-groups-container .handle').first().focus();await page.keyboard.press('Alt+ArrowDown');
  await expect(page.locator('#settings-groups-container input').nth(1)).toHaveValue(before);
});
test('search and error translations do not guess custom endpoints',async({page})=>{
  await home(page);
  const values=await page.evaluate(()=>({custom:normalizeSearchEngineUrl('https://search.example.org/?q='),falseMatch:findEnginePresetByUrl('https://notgoogle.example/'),noMatches:t('locationNoMatches'),local:StartPageData.navigationUrl('localhost:3000')}));
  expect(values.custom).toBe('https://search.example.org/?q=');expect(values.falseMatch).toBeNull();expect(values.noMatches).toBe('没有匹配的城市');expect(values.local).toBe('http://localhost:3000/');
});
test('backup JSON round-trips defaults and optional Key; legacy import remains supported',async({page})=>{
  await home(page);await settings(page);await page.evaluate(()=>appStorage.setItem('qweatherApiKey','test-key'));
  async function download(withKey){
    await page.locator('#exportConfigBtn').click();await expect(page.locator('#includeApiKey')).not.toBeChecked();
    if(withKey)await page.locator('#includeApiKey').check();const event=page.waitForEvent('download');await page.locator('#confirmExportBtn').click();
    return JSON.parse(fs.readFileSync(await (await event).path(),'utf8'));
  }
  const plain=await download(false),key=await download(true);
  expect(plain.schemaVersion).toBe(2);expect(Array.isArray(plain.settings.siteData)).toBe(true);expect(plain.settings.qweatherApiKey).toBeUndefined();expect(key.settings.qweatherApiKey).toBe('test-key');
  await importSettings(page,{userName:'Roundtrip'});expect(await page.evaluate(()=>getApiKey())).toBe('test-key');
  await importSettings(page,{qweatherApiKey:'new-test-key'});expect(await page.evaluate(()=>getApiKey())).toBe('new-test-key');
  expect(await page.evaluate(()=>validateImportedSettings({schemaVersion:1,settings:{siteData:JSON.stringify(siteData)}}).siteData)).toBeTruthy();
});
test('repeated edits remain saved across debounce boundaries',async({page})=>{
  await home(page);await settings(page);
  const title=page.locator('#settings-groups-container input').first();
  await title.fill('First edit');await expect.poll(()=>page.evaluate(()=>JSON.parse(appStorage.getItem('siteData'))[0].title)).toBe('First edit');
  await title.fill('Second edit');await expect.poll(()=>page.evaluate(()=>JSON.parse(appStorage.getItem('siteData'))[0].title)).toBe('Second edit');
  await page.locator('.edit-btn').first().click();
  const name=page.locator('.link-name-input').first();
  await name.fill('First link');await expect.poll(()=>page.evaluate(()=>JSON.parse(appStorage.getItem('siteData'))[0].links[0].name)).toBe('First link');
  await name.fill('Second link');await expect.poll(()=>page.evaluate(()=>JSON.parse(appStorage.getItem('siteData'))[0].links[0].name)).toBe('Second link');
  await page.reload();await expect(page.locator('.group-title').first()).toHaveText('Second edit');await expect(page.locator('.group a').first()).toHaveText('Second link');
});
test('API Host validation, mobile dark layout and modal focus isolation',async({page})=>{
  await home(page);await page.evaluate(()=>{appStorage.setItem('theme','dark');applyTheme('dark');});
  await page.setViewportSize({width:390,height:700});await settings(page);
  await page.locator('#weatherHostInput').fill('https://unrelated.example');await page.locator('#saveWeatherHostBtn').click();
  await expect(page.locator('#weatherHostError')).not.toBeEmpty();expect(await page.evaluate(()=>appStorage.getItem('qweatherApiHost'))).toBeNull();
  await page.locator('#weatherHostInput').fill('https://account.xy.qweatherapi.com');await page.locator('#saveWeatherHostBtn').click();
  expect(await page.evaluate(()=>appStorage.getItem('qweatherApiHost'))).toBe('account.xy.qweatherapi.com');
  await page.locator('#exportConfigBtn').click();
  expect(await page.locator('#settingsModal').evaluate(el=>el.inert)).toBe(true);
  const rect=await page.locator('#exportConfigModal .modal-content').boundingBox();expect(rect.x).toBeGreaterThanOrEqual(0);expect(rect.x+rect.width).toBeLessThanOrEqual(390);
  await page.keyboard.press('Escape');await expect(page.locator('#exportConfigModal')).not.toBeVisible();expect(await page.locator('#settingsModal').evaluate(el=>el.inert)).toBe(false);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('oversized imports are rejected before reading; malformed saved data is recoverable',async({page})=>{
  await home(page);await settings(page);
  const read=await page.evaluate(async()=>{let read=false;await importConfig({size:StartPageData.limits.fileBytes+1,text:async()=>{read=true;return '{}';}});return read;});
  expect(read).toBe(false);await expect(page.locator('#customNoticeMessage')).toHaveText('配置文件无效');
  await page.evaluate(()=>appStorage.setItem('siteData','{broken'));await page.reload();await settings(page);
  expect(await page.evaluate(()=>appStorage.getItem('siteData.recovery'))).toBe('{broken');await expect(page.locator('#settings-status')).toContainText('恢复副本');
});
test('standalone file boots offline with denied storage, fonts and sorting embedded',async({browser})=>{
  const folder=fs.mkdtempSync(path.join(os.tmpdir(),'startpage-regression-'));const file=path.join(folder,'StartPage.html');fs.copyFileSync('StartPage.html',file);
  const context=await browser.newContext({offline:true,reducedMotion:'reduce'});
  await context.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError');}}));
  try{
    const page=await context.newPage(),errors=[],network=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().startsWith('http'))network.push(r.url());});
    await page.goto(pathToFileURL(file).href);await expect(page.locator('#welcome-skip')).toHaveText('Skip');await page.locator('#welcome-skip').click();await expect(page.locator('#welcome-overlay')).not.toBeVisible();
    await settings(page);await expect(page.locator('#exportConfigBtn')).toBeVisible();
    expect(await page.evaluate(async()=>{await document.fonts.ready;await document.querySelector('#current-engine-icon img').decode();return typeof Sortable==='function'&&document.fonts.check('16px "JetBrains Mono"');})).toBe(true);
    expect(errors).toEqual([]);expect(network).toEqual([]);
  }finally{await context.close();fs.rmSync(folder,{recursive:true,force:true});}
});
