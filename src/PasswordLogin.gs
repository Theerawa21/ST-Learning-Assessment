/* Name login: shared password is limited to accounts with TEACHER role only. */
function privilegedLogin_(user){return user.roles.some(function(role){return role!=='TEACHER';});}
function loginNames_(query){query=text_(query,100).toLowerCase();if(query.length<2)return [];return readRecords_('Users').filter(function(u){return u.active===true&&u.name.toLowerCase().indexOf(query)>=0;}).slice(0,20).map(function(u){return {id:u.id,name:u.name};});}
function sessionKey_(token){return 'session:'+hash_(token);}
function passwordLogin_(input){
 var id=required_(input.userId,'ชื่อผู้ใช้งาน',100),password=String(input.password||'');if(password.length>200)fail_('LOGIN','ชื่อหรือรหัสไม่ถูกต้อง');
 var cache=CacheService.getScriptCache(),key='login-attempt:'+hash_(id),lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  var attempts=Number(cache.get(key)||0);if(attempts>=5)fail_('RATE','ลองเข้าสู่ระบบหลายครั้ง กรุณารอ 10 นาที');
  var user=findRecord_('Users',id),valid=false,credential=props_().getProperty('LOCAL_CREDENTIAL_'+id);
  if(user&&user.active===true){
   if(privilegedLogin_(user)){if(credential){var stored=JSON.parse(credential);valid=hash_({salt:stored.salt,password:password})===stored.digest;}}
   else valid=hasRole_(user,'TEACHER')&&password===(props_().getProperty('TEACHER_LOGIN_CODE')||'123456');
  }
  if(!valid){cache.put(key,String(attempts+1),600);fail_('LOGIN','ชื่อหรือรหัสไม่ถูกต้อง (บัญชีผู้ดูแลต้องตั้งรหัสส่วนตัวก่อน)');}
  cache.remove(key);var token=uid_()+uid_(),expiresAt=Date.now()+4*60*60*1000;
  cache.put(sessionKey_(token),JSON.stringify({id:user.id,roles:hash_(user.roles),credential:credential||'',expiresAt:expiresAt}),14400);
  return {sessionToken:token,expiresAt:expiresAt};
 }finally{lock.releaseLock();}
}
function sessionActor_(token){
 if(typeof token!=='string'||token.length>200)fail_('SESSION','กรุณาเข้าสู่ระบบใหม่');
 var stored=CacheService.getScriptCache().get(sessionKey_(token));if(!stored)fail_('SESSION','หมดเวลาใช้งาน กรุณาเข้าสู่ระบบใหม่');
 var session=JSON.parse(stored),user=findRecord_('Users',session.id);
 if(!user||user.active!==true||session.expiresAt<=Date.now()||session.roles!==hash_(user.roles)||session.credential!==(props_().getProperty('LOCAL_CREDENTIAL_'+user.id)||''))fail_('SESSION','สิทธิ์เปลี่ยนแปลง กรุณาเข้าสู่ระบบใหม่');
 return user;
}
function setMyLoginPassword_(actor,input){
 return setUserLoginPassword_(actor,{userId:actor.id,password:input.password});
}
function setUserLoginPassword_(actor,input){
 authorize_(actor,'ADMIN');var password=String(input.password||'');
 if(password.length<16||password.length>128||password===password.charAt(0).repeat(password.length))fail_('INPUT','ใช้รหัสผู้ดูแลอย่างน้อย 16 ตัวอักษรและไม่ซ้ำตัวเดียวทั้งหมด');
 var user=findRecord_('Users',required_(input.userId,'บัญชีผู้ใช้',100));
 if(!user||user.active!==true||!privilegedLogin_(user))fail_('INPUT','เลือกบัญชีผู้ดูแลหรือฝ่ายตรวจที่เปิดใช้งาน');
 var lock=LockService.getScriptLock();lock.waitLock(30000);
 try{var salt=uid_()+uid_();props_().setProperty('LOCAL_CREDENTIAL_'+user.id,JSON.stringify({salt:salt,digest:hash_({salt:salt,password:password})}));CacheService.getScriptCache().remove('login-attempt:'+hash_(user.id));return {saved:true};}finally{lock.releaseLock();}
}
/* Editor-only recovery; never exposed through api(). */
function recoverOwnerLogin_(){
 var email=String(Session.getActiveUser().getEmail()||'').toLowerCase(),owner=String(props_().getProperty('SETUP_OWNER_EMAIL')||'').toLowerCase();
 if(!owner||email!==owner)fail_('ACCESS','ต้องเรียกจากเจ้าของโครงการที่กำหนดไว้เท่านั้น');
 var user=readRecords_('Users').filter(function(u){return String(u.email||'').toLowerCase()===owner&&u.active===true&&hasRole_(u,'ADMIN');})[0];
 if(!user)fail_('ACCESS','ไม่พบบัญชีเจ้าของระบบ');
 var password=props_().getProperty('OWNER_RECOVERY_PASSWORD');
 if(!password)fail_('INPUT','เพิ่ม Script Property ชื่อ OWNER_RECOVERY_PASSWORD เป็นรหัสใหม่อย่างน้อย 16 ตัวอักษร แล้วเรียกอีกครั้ง');
 var result=setMyLoginPassword_(user,{password:password});props_().deleteProperty('OWNER_RECOVERY_PASSWORD');return result;
}

