/* v35 — 四國旅費 AI：改成私有連結授權，不再依賴 Firebase 登入。
   模型/Vertex 憑證只存在雲端；公開 GitHub Pages 不包含模型金鑰。 */
(()=>{
  const API='https://nutrition-photo-service.misstryit01.deno.net/expense';
  const STATUS='https://nutrition-photo-service.misstryit01.deno.net/expense/status';
  const KEY_STORE='shikoku-travel-ai-access-v35';

  function readAccessKey(){
    try{
      const h=new URLSearchParams(location.hash.replace(/^#/,''));
      const incoming=(h.get('access')||'').trim();
      if(/^[a-f0-9]{64}$/i.test(incoming)){
        localStorage.setItem(KEY_STORE,incoming);
        h.delete('access');
        const rest=h.toString();
        history.replaceState(null,'',location.pathname+location.search+(rest?'#'+rest:''));
      }
      const saved=(localStorage.getItem(KEY_STORE)||'').trim();
      return /^[a-f0-9]{64}$/i.test(saved)?saved:'';
    }catch(_){return '';}
  }

  let accessKey=readAccessKey();
  const hasKey=()=>!!accessKey;

  // 讓舊 UI 知道後端已存在；不再顯示「登入 AI」。
  try{cloudEndpoint22=function(){return API};}catch(_){}
  try{hasAI23=function(){return true};}catch(_){}
  try{apiStatus23=function(){return hasKey()?'AI 雲端已連線':'AI 專用連結尚未授權'};}catch(_){}
  try{connectionBadge24=function(){return '<span class="exp24-ai '+(hasKey()?'ok':'')+'">'+(hasKey()?'AI 雲端已連線':'AI 尚未授權')+'</span>';};}catch(_){}

  function panel35(){
    const state=hasKey()?'AI 雲端已連線':'AI 專用連結尚未授權';
    return '<section class="exp30-api"><div class="exp30-api-head"><div><h3>AI 記帳 API</h3><p>比照識食：前端只送文字／照片，模型憑證留在雲端。這個旅遊頁使用獨立私人連結授權，不需要 Firebase 登入。</p></div><span class="exp30-api-state '+(hasKey()?'ok':'bad')+'">'+state+'</span></div></section>';
  }
  try{apiSettings25=panel35;cloudSettings22=panel35;}catch(_){}

  // 預熱後端，不影響使用；失敗時真正送出會顯示明確錯誤。
  fetch(STATUS,{cache:'no-store',credentials:'omit'}).catch(()=>{});

  try{
    apiAuth29=async function(signal){
      signal?.throwIfAborted?.();
      accessKey=readAccessKey();
      if(!accessKey)throw error23('此瀏覽器還沒有旅費 AI 私人授權','auth');
      return {'X-Travel-Key':accessKey};
    };
  }catch(_){}

  // 完全覆蓋舊的 Firebase 送出路徑。
  try{
    sendAI23=async function(body,signal){
      const auth=await apiAuth29(signal);
      const headers=new Headers(auth);
      headers.set('Content-Type','application/json');
      headers.set('Accept','application/json');
      const response=await fetch(API,{
        method:'POST',headers,credentials:'omit',cache:'no-store',
        referrerPolicy:'no-referrer',body:JSON.stringify(body),signal
      });
      let data=null;try{data=await response.json()}catch(_){}
      if(!response.ok){
        const message=String(data?.error||'AI HTTP '+response.status);
        if(response.status===401||response.status===403)throw error23(message,'HTTP'+response.status);
        if(response.status===429)throw error23(message,'HTTP429');
        throw error23(message,'HTTP'+response.status);
      }
      if(typeof apiCloud29!=='undefined'){
        apiCloud29.state='ok';apiCloud29.http=response.status;apiCloud29.message='AI 已連線';
      }
      return normalizeResult23(data);
    };
  }catch(_){}

  // 不再失敗後偷偷改成本機規則；AI 沒成功就保留原始輸入，明確告知。
  try{
    parse22=async function(){
      if(sheet22.busy)return;
      sheet22.text=document.getElementById('expense-text22')?.value??sheet22.text;
      const text=sheet22.text.trim();
      const images=sheet22.images.map(x=>({...x}));
      const session=sheet22.session,def=defaultCurrency22();
      if(!text&&!images.length){
        sheet22.msg='請先輸入內容或選照片。';redraw22();return;
      }
      accessKey=readAccessKey();
      if(!accessKey){
        sheet22.msg='這個瀏覽器尚未取得旅費 AI 私人授權；請用專用連結重新開啟一次。';
        redraw22();return;
      }
      const current=()=>session===sheet22.session&&session===seq22&&isSheet22();
      sheet22.busy=true;sheet22.msg='AI 辨識中…';sheet22.via23='';redraw22();
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),45000);
      try{
        const items=await sendAI23(requestBody23(text,images,def),controller.signal);
        if(!current())return;
        sheet22.items.push(...items);
        sheet22.via23='AI';
        sheet22.msg=items.length?'AI 已整理 '+items.length+' 筆，請確認後儲存。':'AI 沒有辨識出可記錄的項目，請補充文字或照片。';
        if(items.length){sheet22.text='';sheet22.images=[];}
      }catch(e){
        if(!current())return;
        const code=String(e?.code||'');
        sheet22.msg=
          e?.name==='AbortError'?'AI 超過 45 秒未完成；原始輸入已保留。':
          code==='HTTP401'||code==='HTTP403'?'旅費 AI 私人授權無效；請用專用連結重新開啟一次。':
          code==='HTTP429'?'AI 使用頻率暫時受限，稍後再送一次。':
          'AI 連線未完成：'+String(e?.message||e||'未知錯誤').slice(0,220);
      }finally{
        clearTimeout(timer);
        if(current()){sheet22.busy=false;redraw22();}
      }
    };
  }catch(_){}
})();