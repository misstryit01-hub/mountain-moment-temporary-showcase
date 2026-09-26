/* v39 — dedicated Shikoku expense Worker; no calls or credentials shared with meal service. */
(()=>{
  const API='https://shikoku-travel-expense-api.misstryit01.workers.dev/expense';
  const STATUS='https://shikoku-travel-expense-api.misstryit01.workers.dev/expense/status';
  let status39=null,statusPromise39=null;

  function error39(message,code){return Object.assign(new Error(message),{code});}
  async function statusCheck39(signal){
    if(status39?.ready===true)return status39;
    if(statusPromise39)return statusPromise39;
    statusPromise39=(async()=>{
      const response=await fetch(STATUS,{method:'GET',cache:'no-store',credentials:'omit',signal});
      let data=null;try{data=await response.json()}catch(_){}
      if(response.status===404)throw error39('獨立旅費記帳 Worker 尚未部署','HTTP404');
      if(!response.ok)throw error39(String(data?.error||('記帳 API HTTP '+response.status)),'HTTP'+response.status);
      status39=data||{};
      if(status39.ready!==true)throw error39(String(data?.error||'獨立記帳服務尚待設定專用 Gemini 金鑰'),'unconfigured');
      return status39;
    })().finally(()=>{statusPromise39=null;});
    return statusPromise39;
  }

  function stateText39(){
    return apiCloud29.state==='ok'?'獨立記帳 API 已連線':apiCloud29.state==='testing'?'正在測試獨立 API…':apiCloud29.state==='error'?'獨立 API 待處理':'獨立記帳 API 待測試';
  }
  function panel39(){
    return '<section class="exp30-api"><div class="exp30-api-head"><div><h3>旅費 AI 記帳 API</h3><p>專用獨立服務；不共用用餐 Worker、登入或資料庫。Gemini 金鑰只設在此記帳 Worker。</p></div><span class="exp30-api-state '+(apiCloud29.state==='ok'?'ok':apiCloud29.state==='error'?'bad':'')+'">'+stateText39()+'</span></div><div class="exp30-api-actions"><button class="btn" type="button" data-api-test39>測試記帳 API</button></div>'+(apiCloud29.message?'<p class="micro">'+E.esc(apiCloud29.message)+'</p>':'')+'<details class="exp23-prompt"><summary>查看記帳辨識規則</summary><pre>'+E.esc(FORMAT21)+'</pre></details></section>';
  }

  try{cloudEndpoint22=function(){return API};}catch(_){}
  try{hasAI23=function(){return true};}catch(_){}
  try{apiStatus23=stateText39;}catch(_){}
  try{apiSettings25=panel39;cloudSettings22=panel39;}catch(_){}
  try{connectionBadge24=function(){return '<button type="button" class="exp24-ai '+(apiCloud29.state==='ok'?'ok':'')+'" data-api-test39>'+E.esc(stateText39())+'</button>'};}catch(_){}

  sendAI23=async function(body,signal){
    await statusCheck39(signal);
    if(signal.aborted)throw signal.reason;
    const response=await fetch(API,{
      method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
      credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',
      body:JSON.stringify(body),signal
    });
    apiCloud29.http=response.status;
    let data=null;try{data=await response.json()}catch(_){}
    if(!response.ok){
      const message=String(data?.error||('記帳 AI HTTP '+response.status));
      throw error39(message,data?.code||'HTTP'+response.status);
    }
    apiCloud29.state='ok';apiCloud29.message='獨立記帳 AI 最近一次辨識成功。';
    return normalizeResult23(data);
  };

  parse22=async function(){
    if(sheet22.busy)return;
    sheet22.text=document.getElementById('expense-text22')?.value??sheet22.text;
    const text=sheet22.text.trim(),images=sheet22.images.map(x=>({...x}));
    const session=sheet22.session,def=defaultCurrency22();
    if(!text&&!images.length){sheet22.msg='請輸入消費內容或選照片。';redraw22();return;}
    const current=()=>session===sheet22.session&&session===seq22&&isSheet22();
    sheet22.busy=true;sheet22.msg='正在連接獨立記帳 AI…';sheet22.via23='';redraw22();
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
    try{
      const items=await sendAI23(requestBody23(text,images,def),controller.signal);
      if(!current())return;
      sheet22.items.push(...items);sheet22.via23='AI';connection23.state='success';
      sheet22.msg=items.length?`AI 已整理 ${items.length} 筆，確認後儲存。`:'AI 沒有辨識出可記錄項目，請補充文字或手動新增。';
      if(items.length){sheet22.text='';sheet22.images=[];}
    }catch(error){
      if(!current()||error?.code==='cancelled')return;
      apiCloud29.state='error';apiCloud29.message=String(error?.message||'獨立記帳 API 未完成');connection23.state='error';
      let fallback=[];
      if(text){try{fallback=localText22(text,def)||[];}catch(_){fallback=[];}}
      if(fallback.length){sheet22.items.push(...fallback);sheet22.text='';sheet22.via23='本機規則（非 AI）';}
      sheet22.images=images;
      const reason=error?.name==='AbortError'?'AI 等待超過 45 秒':String(error?.message||'AI 連線未完成');
      sheet22.msg=reason+(fallback.length?`；已用本機規則整理 ${fallback.length} 筆文字，請確認。`:'；原始輸入已保留。')+(images.length?' 照片未交給本機規則辨識，仍保留供重試。':'');
    }finally{
      clearTimeout(timer);
      if(current()){sheet22.busy=false;redraw22();}
    }
  };

  async function testExpenseAPI39(){
    if(apiCloud29.state==='testing')return;
    apiCloud29.state='testing';apiCloud29.message='正在測試獨立旅費記帳 Worker…';
    const y=scrollY;render();scrollTo(0,y);
    try{
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
      let response,data;
      try{
        response=await fetch(STATUS,{method:'GET',cache:'no-store',credentials:'omit',signal:controller.signal});
        try{data=await response.json()}catch(_){data=null;}
      }finally{clearTimeout(timer);}
      apiCloud29.http=response.status;
      if(response.ok&&data?.ready===true){status39=data;apiCloud29.state='ok';apiCloud29.message='獨立旅費 API 與專用 Gemini 金鑰均已就緒。';}
      else if(response.ok){status39=data;apiCloud29.state='error';apiCloud29.message='獨立記帳 Worker 已回應，但專用 Gemini 金鑰尚未設定。';}
      else{apiCloud29.state='error';apiCloud29.message='獨立記帳 Worker 回應 HTTP '+response.status+'。';}
    }catch(error){apiCloud29.state='error';apiCloud29.message='獨立 API 測試未完成：'+(error?.name==='AbortError'?'8 秒逾時':String(error?.message||error));}
    const yy=scrollY;render();scrollTo(0,yy);
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-api-test39]');if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();testExpenseAPI39();
  },true);
  try{statusCheck39().catch(()=>{});}catch(_){}
})();
