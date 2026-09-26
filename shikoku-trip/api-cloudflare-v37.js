/* v37 — 四國旅費 AI：正式改走識食同一個 Cloudflare Worker。
   流程：GitHub Pages -> Firebase ID token -> Cloudflare Worker /expense -> 同一份 Gemini secret。
   不再使用 Deno、Vertex service account、前端 Gemini key 或私人 access token。 */
(()=>{
  const API='https://nutrition-photo-service.misstryit01.workers.dev/expense';
  const STATUS='https://nutrition-photo-service.misstryit01.workers.dev/expense/status';
  let status37=null,statusPromise37=null;

  function error37(message,code){return Object.assign(new Error(message),{code});}

  async function statusCheck37(signal){
    if(status37?.ready&&status37?.authDomainReady)return status37;
    if(statusPromise37)return statusPromise37;
    statusPromise37=(async()=>{
      const response=await fetch(STATUS,{method:'GET',cache:'no-store',credentials:'omit',signal});
      let data=null;try{data=await response.json()}catch(_){}
      if(response.status===404)throw error37('Cloudflare Worker 尚未部署 /expense 路由','HTTP404');
      if(!response.ok)throw error37(String(data?.error||('Cloudflare API HTTP '+response.status)),'HTTP'+response.status);
      status37=data||{};
      if(status37.ready!==true)throw error37('識食 Cloudflare Worker 的 Gemini 服務尚未就緒','unconfigured');
      if(status37.authDomainReady!==true)throw error37('Firebase 登入網域尚未由 Cloudflare 完成設定','auth-domain');
      return status37;
    })().finally(()=>{statusPromise37=null;});
    return statusPromise37;
  }

  try{cloudEndpoint22=function(){return API};}catch(_){}
  try{hasAI23=function(){return true};}catch(_){}
  try{apiStatus23=function(){return status37?.ready?'AI 雲端已連線':'AI 雲端待測試'};}catch(_){}

  function panel37(){
    const good=status37?.ready===true&&status37?.authDomainReady===true;
    const state=good?'AI 雲端已連線':'AI 雲端待測試';
    return '<section class="exp30-api"><div class="exp30-api-head"><div><h3>AI 記帳 API</h3><p>與識食共用同一個 Cloudflare Worker、Firebase 登入與 Gemini 雲端金鑰；這個網頁不保存模型金鑰。</p></div><span class="exp30-api-state '+(good?'ok':'')+'">'+state+'</span></div></section>';
  }
  try{apiSettings25=panel37;cloudSettings22=panel37;}catch(_){}

  // 頁面開啟先呼叫 status；Cloudflare 會順便確認 GitHub Pages 已加入 Firebase authorizedDomains。
  try{statusCheck37().catch(()=>{});}catch(_){}

  try{
    apiAuth29=async function(signal){
      signal?.throwIfAborted?.();
      await statusCheck37(signal);
      signal?.throwIfAborted?.();
      if(typeof initAuth30==='function')await initAuth30();
      let user=(typeof auth30!=='undefined'&&auth30)?auth30.currentUser:null;
      if(!user){
        if(typeof loginExpense30!=='function')throw error37('Firebase 登入元件尚未就緒','auth');
        user=await loginExpense30();
      }
      if(!user)throw error37('AI 登入未完成','auth');
      const token=await user.getIdToken(true);
      signal?.throwIfAborted?.();
      return {Authorization:'Bearer '+token};
    };
  }catch(_){}

  try{
    sendAI23=async function(body,signal){
      const auth=await apiAuth29(signal);
      const headers=new Headers(auth||{});
      headers.set('Content-Type','application/json');
      headers.set('Accept','application/json');
      const response=await fetch(API,{
        method:'POST',
        headers,
        credentials:'omit',
        cache:'no-store',
        referrerPolicy:'no-referrer',
        body:JSON.stringify(body),
        signal
      });
      let data=null;try{data=await response.json()}catch(_){}
      if(!response.ok){
        const msg=String(data?.error||('AI HTTP '+response.status));
        throw error37(msg,'HTTP'+response.status);
      }
      if(typeof apiCloud29!=='undefined'){
        apiCloud29.state='ok';
        apiCloud29.http=response.status;
        apiCloud29.message='Cloudflare AI 已連線';
      }
      return normalizeResult23(data);
    };
  }catch(_){}

  // 不再降級成本機規則。AI 失敗就保留原始輸入並顯示真正原因。
  try{
    parse22=async function(){
      if(sheet22.busy)return;
      sheet22.text=document.getElementById('expense-text22')?.value??sheet22.text;
      const text=sheet22.text.trim();
      const images=sheet22.images.map(x=>({...x}));
      const session=sheet22.session,def=defaultCurrency22();
      if(!text&&!images.length){
        sheet22.msg='請先輸入內容或選照片。';
        redraw22();
        return;
      }
      const current=()=>session===sheet22.session&&session===seq22&&isSheet22();
      sheet22.busy=true;
      sheet22.msg='正在連接識食 Cloudflare AI…';
      sheet22.via23='';
      redraw22();
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),45000);
      try{
        const items=await sendAI23(requestBody23(text,images,def),controller.signal);
        if(!current())return;
        sheet22.items.push(...items);
        sheet22.via23='AI';
        sheet22.msg=items.length?'AI 已整理 '+items.length+' 筆，請確認後儲存。':'AI 沒有辨識出可記錄的項目，請補充內容。';
        if(items.length){sheet22.text='';sheet22.images=[];}
      }catch(e){
        if(!current())return;
        const code=String(e?.code||'');
        sheet22.msg=
          e?.name==='AbortError'?'AI 超過 45 秒未完成；原始輸入已保留。':
          code==='HTTP404'?'Cloudflare Worker 尚未部署旅費 /expense 路由；原始輸入已保留。':
          code==='HTTP401'?'AI 登入尚未完成或已失效；請再按一次「送出」。':
          code==='HTTP403'?'目前帳號或網站尚未獲 Cloudflare AI 授權。':
          code==='auth-domain'?'Firebase 登入網域正在同步；請重新整理後再按一次。':
          code==='unconfigured'?'識食 Cloudflare 的 Gemini 雲端服務尚未就緒。':
          'AI 連線未完成：'+String(e?.message||e||'未知錯誤').slice(0,240);
      }finally{
        clearTimeout(timer);
        if(current()){sheet22.busy=false;redraw22();}
      }
    };
  }catch(_){}
})();