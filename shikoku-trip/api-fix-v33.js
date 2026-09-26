/* v33 — 四國旅費 AI：提早載入 Firebase，第一次按 AI 時自動登入後再送 API。
   Gemini / Vertex 金鑰仍只在雲端，這裡不保存模型金鑰。 */
(()=>{
  const safeMessage=e=>String(e?.message||e||'登入未完成').replace(/^Firebase:\s*/,'').slice(0,220);

  // 先在背景把 Firebase/Auth 載好，避免使用者第一次按「AI 辨識」才開始載 SDK。
  try{
    if(typeof initAuth30==='function') initAuth30().catch(()=>{});
  }catch(_){}

  // 任何 API 呼叫若尚未登入，直接啟動既有 Google 登入，再取得短效 Firebase ID token。
  try{
    apiAuth29=async function(signal){
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

  // 原本 v32 在未登入時會直接丟錯，接著偷偷改用「本機規則」。
  // v33 改成：第一次使用先登入；登入完成後繼續原本同一筆 AI 請求。
  try{
    const parseBase33=parse22;
    parse22=async function(){
      if(typeof sheet22!=='undefined'&&sheet22.busy)return;
      try{
        if(typeof initAuth30==='function') await initAuth30();
        let user=(typeof auth30!=='undefined'&&auth30)?auth30.currentUser:null;
        if(!user){
          if(typeof sheet22!=='undefined'&&typeof redraw22==='function'){
            sheet22.msg='首次使用 AI：正在開啟 Google 登入。登入一次後，此瀏覽器會記住登入狀態。';
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
            code==='auth/unauthorized-domain'?'目前網站網域尚未列入 Firebase 登入授權；原始輸入仍保留。':
            'AI 登入未完成：'+safeMessage(e);
          redraw22();
        }
        return;
      }
      return parseBase33.apply(this,arguments);
    };
  }catch(_){}
})();