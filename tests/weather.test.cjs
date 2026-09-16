const test = require('node:test');
const assert = require('node:assert/strict');
require('../weather-client.js');
function setup() {
  const memory = new Map();
  const storage = {getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)};
  let key='test-key',lang='en',host='account.xy.qweatherapi.com';
  const client=StartPageWeather.create({storage,getKey:()=>key,getLang:()=>lang,getHost:()=>host});
  return {client,memory,setKey:value=>key=value,setLang:value=>lang=value,setHost:value=>host=value};
}
const response=()=>({ok:true,json:async()=>({code:'200',now:{temp:'20',feelsLike:'18'},daily:[{tempMax:'22',tempMin:'16'}]})});
test('cache identity includes location, key, language and API Host; dedicated hosts use header auth',async()=>{
  const original=global.fetch,requests=[];global.fetch=async(url,options)=>{requests.push({url,options});return response();};
  try{
    const state=setup();await state.client.load({id:'A',name:'A'});await state.client.load({id:'A',name:'A'});assert.equal(requests.length,2);
    assert.ok(requests[0].url.startsWith('https://account.xy.qweatherapi.com/'));
    assert.ok(!requests[0].url.includes('test-key'));assert.equal(requests[0].options.headers['X-QW-Api-Key'],'test-key');
    state.setLang('zh-hans');await state.client.load({id:'A',name:'A'});assert.equal(requests.length,4);
    state.setKey('other-key');await state.client.load({id:'A',name:'A'});assert.equal(requests.length,6);
    state.setHost('other.xy.qweatherapi.com');await state.client.load({id:'A',name:'A'});assert.equal(requests.length,8);
    await state.client.load({id:'B',name:'B'});assert.equal(requests.length,10);
  }finally{global.fetch=original;}
});
test('timeouts are translated error codes and never include credentials',async()=>{
  const original=global.fetch;
  global.fetch=(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError'))));
  try{await assert.rejects(StartPageWeather.json('https://example.com?key=test-secret',{timeout:5}),error=>error.message==='requestTimeout');}
  finally{global.fetch=original;}
});
test('cancelling a weather request prevents late results from touching cache',async()=>{
  const original=global.fetch;let release,started;const gate=new Promise(resolve=>release=resolve),ready=new Promise(resolve=>started=resolve);
  global.fetch=async()=>{started();await gate;return response();};
  try{
    const state=setup();const pending=state.client.load({id:'A',name:'A'});await ready;state.client.cancel();release();
    assert.equal(await pending,null);assert.equal(state.memory.has('weatherCache'),false);
  }finally{global.fetch=original;}
});
