/* v38 — 四國旅費 AI：公開使用，不需要 Firebase/Google 登入。
   GitHub Pages -> Cloudflare Worker /expense -> Cloudflare 既有 GEMINI_API_KEY。 */
(()=>{
  const API='https://nutrition-photo-service.misstryit01.workers.dev/expense';
  const STATUS='https://nutrition-photo-service.misstryit01.workers.dev/expense/status';
  let status38=null,statusPromise38=null;

  function error38(message,code){return Object.assign(new Error(message),{code});}

  async function statusCheck38(signal){
    if(status38?.ready)return status38;
    if(statusPromise38)return statusPromise38;
    statusPromise38=(async()=>{
      const response=await fetch(STATUS,{method:'GET',cache:'no-store',credentials:'omit',signal});
      let data=null;try{data=await response.json()}catch(_){}
      if(response.status===404)throw error38('Cloudflare Worker 尚未部署 /expense 路由','HTTP404');
      if(!response.ok)throw error38(String(data?.error||('Cloudflare API HTTP '+response.status)),'HTTP'+response.status);
      status38=data||{};
      if(status38.ready!==true)throw error38('Cloudflare 的 Gemini 服務尚未就緒','unconfigured');
      return status38;
    })().finally(()=>{statusPromise38=null;});
    return statusPromise38;
  }

  try{cloudEndpoint22=function(){return API};}catch(_){}
  try{hasAI23=function(){return true};}catch(_){}
  try{apiStatus23=function(){return status38?.ready?'AI 雲端已連線':'AI 雲端待測試'};}catch(_){}

  function panel38(){
    const good=status38?.ready===true;
    const state=good?'AI 雲端已連線':'AI 雲端待測試';
    return '<section class="exp30-api"><div class="exp30-api-head"><div><h3>AI 記帳 API</h3><p>直接使用，不需要登入。模型金鑰只保存在 Cloudflare Worker。</p></div><span class="exp30-api-state '+(good?'ok':'')+'">'+state+'</span></div></section>';
  }
  try{apiSettings25=panel38;cloudSettings22=panel38;}catch(_){}

  try{statusCheck38().catch(()=>{});}catch(_){}

  try{
    apiAuth29=async function(signal){
      signal?.throwIfAborted?.();
      await statusCheck38(signal);
      signal?.throwIfAborted?.();
      return {};
    };
  }catch(_){}

  try{
    sendAI23=async function(body,signal){
      await statusCheck38(signal);
      const headers=new Headers();
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
        throw error38(msg,'HTTP'+response.status);
      }
      if(typeof apiCloud29!=='undefined'){
        apiCloud29.state='ok';
        apiCloud29.http=response.status;
        apiCloud29.message='Cloudflare AI 已連線';
      }
      return normalizeResult23(data);
    };
  }catch(_){}

  // 不再登入，也不再降級成本機規則。
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
      sheet22.msg='正在連接 AI…';
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
          code==='HTTP429'?'操作太頻繁，請稍後再試。':
          code==='unconfigured'?'Cloudflare 的 Gemini 雲端服務尚未就緒。':
          'AI 連線未完成：'+String(e?.message||e||'未知錯誤').slice(0,300);
      }finally{
        clearTimeout(timer);
        if(current()){sheet22.busy=false;redraw22();}
      }
    };
  }catch(_){}
})();