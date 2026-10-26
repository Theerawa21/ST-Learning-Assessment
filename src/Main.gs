function doGet(event){if(event&&event.parameter&&event.parameter.mode==='bridge')return HtmlService.createHtmlOutputFromFile('StaticBridge').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);return HtmlService.createTemplateFromFile('Index').evaluate().setTitle('ST-Learning Assessment | โรงเรียนเซนต์เทเรซา').addMetaTag('viewport','width=device-width, initial-scale=1');}
function include_(name){return HtmlService.createHtmlOutputFromFile(name).getContent();}
function api(request){
 var readLock=null;
 try{
  request=request||{};if(JSON.stringify(request).length>100000)fail_('LIMIT','ข้อมูลคำสั่งมีขนาดใหญ่เกินไป');
  if(request.action==='registrationInfo')return {ok:true,data:registrationInfo_({idToken:request.idToken})};
  if(request.action==='register')return {ok:true,data:registerTeacher_({idToken:request.idToken},request.payload||{})};
  var reads=['bootstrap','subjects','indicators','dashboard','documents','queue','users','adminData','analysis','analysisContext','subjectMapping','reportModel','notifications','documentAuthors'];
  if(reads.indexOf(request.action)>=0){readLock=LockService.getScriptLock();readLock.waitLock(30000);}
  var actor=requireActor_({idToken:request.idToken}),p=request.payload||{},id=request.requestId;
  if(readLock&&readRecords_('OperationRequests').some(function(o){return o.status==='STARTED'||o.status==='RECOVERY_REQUIRED';})&&!(hasRole_(actor,'ADMIN')&&['bootstrap','adminData'].indexOf(request.action)>=0))fail_('RECOVERY','มีรายการบันทึกค้าง กรุณาให้ผู้ดูแลกู้คืนก่อนเปิดข้อมูล');
  var routes={bootstrap:function(){return bootstrap_(actor);}};
  if(typeof extraRoutes_==='function')Object.assign(routes,extraRoutes_(actor,p,id));
  if(!Object.prototype.hasOwnProperty.call(routes,request.action))fail_('ACTION','ไม่รองรับคำสั่งนี้');
  return {ok:true,data:routes[request.action]()};
 }catch(e){return {ok:false,error:{code:e.code||'SERVER',message:e.code?e.message:'ไม่สามารถดำเนินการได้ กรุณาลองใหม่หรือติดต่อผู้ดูแล'}};}finally{if(readLock)readLock.releaseLock();}
}
function bootstrap_(actor){return {user:actor,schoolName:'โรงเรียนเซนต์เทเรซา',departments:readRecords_('Departments').filter(function(r){return r.active!==false;}),curricula:readRecords_('Curricula').filter(function(r){return r.active!==false;}),oauthClientId:props_().getProperty('OAUTH_CLIENT_ID')||''};}
function loginConfig(){return {authMode:props_().getProperty('AUTH_MODE')||'WORKSPACE',oauthClientId:props_().getProperty('OAUTH_CLIENT_ID')||'',redirectUri:ScriptApp.getService().getUrl()};}
