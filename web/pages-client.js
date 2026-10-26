/* GitHub Pages transport. Credentials remain in memory, never in URLs. */
(()=>{
 const config=window.ST_PAGES_CONFIG,channel=crypto.randomUUID(),pending=new Map();
 let peer=null,peerOrigin=null,ready=null,frame=null,nonce=null,signInLoaded=null,initialized=false;
 const failure=message=>Object.assign(new Error(message),{code:'CONNECTION'});
 window.addEventListener('message',event=>{
  const data=event.data;
  if(!data||data.channel!==channel||!/^https:\/\/[a-z0-9-]+\.googleusercontent\.com$/.test(event.origin))return;
  if(data.type==='st:ready'&&ready&&!peer){peer=event.source;peerOrigin=event.origin;ready.resolve();return;}
  if(event.source!==peer||event.origin!==peerOrigin||data.type!=='st:response')return;
  const job=pending.get(data.id);if(!job)return;
  clearTimeout(job.timer);pending.delete(data.id);job.resolve(data.result);
 });
 function connect(){
  if(ready)return ready.promise;
  ready={};ready.promise=new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{frame?.remove();frame=null;ready=null;peer=null;peerOrigin=null;reject(failure('ยังเชื่อมต่อระบบข้อมูลไม่ได้ กรุณาตรวจว่าได้เผยแพร่ Apps Script รุ่นที่รองรับ GitHub Pages แล้ว'));},30000);
   ready.resolve=()=>{clearTimeout(timer);resolve();};
  });
  const url=new URL(config.apiUrl);url.searchParams.set('mode','bridge');url.searchParams.set('channel',channel);
  frame=document.createElement('iframe');frame.hidden=true;frame.title='เชื่อมต่อข้อมูลโรงเรียน';frame.referrerPolicy='no-referrer';frame.src=url.href;document.body.append(frame);
  return ready.promise;
 }
 async function request(req){
  if(!req.idToken)return {ok:false,error:{code:'IDENTITY',message:'กรุณาเข้าสู่ระบบด้วย Google'}};
  await connect();
  return new Promise((resolve,reject)=>{
   const id=crypto.randomUUID(),timer=setTimeout(()=>{pending.delete(id);reject(failure('การเชื่อมต่อหมดเวลา กรุณาลองอีกครั้ง'));},60000);
   pending.set(id,{resolve,reject,timer});
   peer.postMessage({type:'st:request',channel,id,request:req},peerOrigin);
  });
 }
 function loadSignIn(){
  if(!signInLoaded)signInLoaded=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;
   script.onload=resolve;script.onerror=()=>{signInLoaded=null;reject(failure('โหลดหน้าลงชื่อเข้าใช้ Google ไม่สำเร็จ กรุณาลองใหม่'));};document.head.append(script);
  });return signInLoaded;
 }
 async function renderSignIn(container){
  try{
   await loadSignIn();if(!container.isConnected)return;
   if(!initialized){
    nonce=crypto.randomUUID()+crypto.randomUUID();
    google.accounts.id.initialize({client_id:config.clientId,nonce,auto_select:false,callback:async response=>{
     try{
      const token=response.credential,part=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'),claim=JSON.parse(atob(part));
      if(claim.nonce!==nonce)throw new Error('ไม่สามารถยืนยันการเข้าสู่ระบบ กรุณาลองใหม่');
      window.ST.state.idToken=token;await window.ST.init();
     }catch(error){window.ST.toast(error.message,true);}
    }});initialized=true;
   }
   container.replaceChildren();google.accounts.id.renderButton(container,{type:'standard',theme:'filled_blue',size:'large',text:'continue_with',locale:'th',width:280});
  }catch(error){container.textContent=error.message;}
 }
 window.ST_HOST={request,renderSignIn};
})();
