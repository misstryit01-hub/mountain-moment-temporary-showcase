/* v34 — 四國旅費 AI：自動完成 Firebase 網域授權 readiness，再登入並送 API。
   Gemini / Vertex 金鑰仍只保留在雲端，不進前端。 */
(()=>{
  const AUTH_READY_URL='https://nutrition-photo-service.misstryit01.deno.net/expense/status';
  let authReadyPromise=null;

  function safeMessage(e){
    return String(e?.message||e||'登入未完成').replace(/^Firebase:\s*/,'').slice(0,220);
  }

  function ensureAuthReady34(){
    if(authReadyPromise)return authReadyPromise;
    authReadyPromise=(async()=>{
      const c=new AbortController();
      const t=setTimeout(()=>c.abort(),15000);
      try{
        const r=await fetch(AUTH_READY_URL,{method:'GET',mode:'cors',cache:'no-store',credentials:'omit',signal:c.signal});
        if(!r.ok)throw new Error('AI 授權準備服務 HTTP '+r.status);
        return true;
      }finally{
        clearTimeout(t);
      }
    })().catch(e=>{
      authReadyPromise=null;
      throw e;
    });
    return authReadyPromise;
  }

  // 頁面開啟就先背景準備；使用者按「送出」時仍會再等待完成。
  try{ensureAuthReady34().catch(()=>{});}catch(_){}
  try{
    if(typeof initAuth30==='function') initAuth30().catch(()=>{});
  }catch(_){}

  // API 呼叫一律先確認 GitHub Pages 已加入 Firebase authorizedDomains。
  try{
    apiAuth29=async function(signal){
      signal?.throwIfAborted?.();
      await ensureAuthReady34();
      signal?.throwIfAborted?.();
      if(typeof initAuth30==='function') await initAuth30();
      let user=(typeof auth30!=='undefined'&&auth30)?auth30.currentUser:null;
      if(!user&&typeof loginExpense30==='function') user=await loginExpense30();
      if(!user) throw error23('AI 登入未完成','auth');
      const token=await user.getIdToken(true);
      signal?.throwIfAborted?.();
      return {Authorization:'Bearer '+token};
    };
  }catch(_){}

  // 第一次按 AI：先完成網域授權 readiness，再開 Google 登入；成功後繼續同一筆辨識。
  try{
    const parseBase34=parse22;
    parse22=async function(){
      if(typeof sheet22!=='undefined'&&sheet22.busy)return;
      try{
        if(typeof sheet22!=='undefined'&&typeof redraw22==='function'){
          sheet22.msg='正在連接 AI…';
          redraw22();
        }
        await ensureAuthReady34();
        if(typeof initAuth30==='function') await initAuth30();
        let user=(typeof auth30!=='undefined'&&auth30)?auth30.currentUser:null;
        if(!user){
          if(typeof sheet22!=='undefined'&&typeof redraw22==='function'){
            sheet22.msg='首次使用需登入 Google；登入後會自動繼續這一筆。';
            redraw22();
          }
          if(typeof loginExpense30!=='function') throw error23('AI 登入元件尚未就緒','auth');
          user=await loginExpense30();
        }
        if(!user) throw error23('AI 登入未完成','auth');
      }catch(e){
        if(typeof sheet22!=='undefined'&&typeof redraw22==='function'&&typeof isSheet22==='function'&&isSheet22()){
          const code=String(e?.code||'');
          sheet22.msg=
            code==='auth/popup-closed-by-user'?'已取消 Google 登入；原始輸入仍保留。':
            code==='auth/popup-blocked'?'瀏覽器擋住 Google 登入視窗；請允許此網站開啟彈出式視窗後再按一次。':
            code==='auth/unauthorized-domain'?'Firebase 網域授權尚未同步完成；請直接再按一次「送出」。':
            e?.name==='AbortError'?'AI 授權準備逾時；原始輸入仍保留，請直接再按一次「送出」。':
            'AI 登入未完成：'+safeMessage(e);
          redraw22();
        }
        return;
      }
      return parseBase34.apply(this,arguments);
    };
  }catch(_){}
})();