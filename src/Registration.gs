/* Registration never trusts a submitted email or role. Google identity is required. */
function registrationInfo_(context){var email=identityEmail_(context),user=readRecords_('Users').find(function(u){return u.email===email;});if(user&&user.active!==true)fail_('ACCESS','บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแล');return {email:email,registered:!!user,enabled:props_().getProperty('SELF_REGISTRATION_ENABLED')!=='false'};}
function registerTeacher_(context,input){
 var email=identityEmail_(context);if(props_().getProperty('SELF_REGISTRATION_ENABLED')==='false')fail_('ACCESS','ขณะนี้ปิดรับสมัคร');
 if(text_(input.registrationCode,100)!==(props_().getProperty('REGISTRATION_CODE')||'123456'))fail_('INPUT','รหัสสมัครไม่ถูกต้อง');
 var profile={name:required_(input.name,'ชื่อ–นามสกุล',200),position:required_(input.position,'ตำแหน่ง',100),department:required_(input.department,'กลุ่มสาระที่สอน',200),grades:required_(input.grades,'ระดับชั้นที่สอน',200),phone:text_(input.phone,30)};
 var lock=LockService.getScriptLock();lock.waitLock(30000);var snapshot=null;
 try{var users=readRecords_('Users'),old=users.find(function(u){return u.email===email;});if(old){if(old.active!==true)fail_('ACCESS','บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแล');return {registered:true,user:old};}
  if(readRecords_('OperationRequests').some(function(o){return o.status==='STARTED'||o.status==='RECOVERY_REQUIRED';}))fail_('RECOVERY','ระบบอยู่ระหว่างกู้คืน กรุณาลองใหม่ภายหลัง');
  var user={id:uid_(),email:email,name:profile.name,roles:['TEACHER'],departmentIds:[],active:true,createdAt:now_(),updatedAt:now_()};
  snapshot={Settings:rawRead_('Settings'),Users:rawRead_('Users'),ActivityLogs:rawRead_('ActivityLogs')};
  upsert_('Settings',{id:'profile:'+user.id,value:profile});append_('Users',user);append_('ActivityLogs',{id:uid_(),actorId:user.id,action:'selfRegister',entityId:user.id,createdAt:now_()});SpreadsheetApp.flush();return {registered:true,user:user};
 }catch(e){if(snapshot)Object.keys(snapshot).forEach(function(t){rawWrite_(t,snapshot[t]);});throw e;}finally{lock.releaseLock();}
}

