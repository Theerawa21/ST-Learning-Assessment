var ROLES_=['ADMIN','TEACHER','HEAD','ASSESSMENT','ACADEMIC'];
function identityEmail_(context){
 var mode=props_().getProperty('AUTH_MODE')||'WORKSPACE',email='';
 if(mode==='OAUTH'){
  var client=props_().getProperty('OAUTH_CLIENT_ID'),token=context&&context.idToken;if(!client||!token)fail_('IDENTITY','กรุณาเข้าสู่ระบบด้วย Google');
  var response=UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token='+encodeURIComponent(token),{muteHttpExceptions:true});
  if(response.getResponseCode()!==200)fail_('TOKEN','ไม่สามารถยืนยันบัญชี Google ได้');
  var claim=JSON.parse(response.getContentText());
  if(['accounts.google.com','https://accounts.google.com'].indexOf(claim.iss)<0||claim.aud!==client||Number(claim.exp)<=Date.now()/1000||!(claim.email_verified===true||claim.email_verified==='true'))fail_('TOKEN','ข้อมูลยืนยันบัญชีไม่ถูกต้องหรือหมดอายุ');email=claim.email;
 }else if(mode==='WORKSPACE'){email=Session.getActiveUser().getEmail();}else fail_('SETUP','AUTH_MODE ไม่ถูกต้อง');
 email=text_(email,254).toLowerCase();if(!email||!/^\S+@\S+\.\S+$/.test(email))fail_('IDENTITY','ไม่สามารถอ่านตัวตน Google ได้ กรุณาติดต่อผู้ดูแลเพื่อตรวจการเผยแพร่หรือใช้ OAuth');
 var domain=props_().getProperty('ALLOWED_DOMAIN');if(domain&&email.split('@')[1]!==domain.toLowerCase())fail_('ACCESS','บัญชีนี้อยู่นอกโดเมนที่อนุญาต');return email;
}
function requireActor_(context){var email=identityEmail_(context);var user=readRecords_('Users').find(function(u){return u.email===email;});if(!user||user.active!==true)fail_('ACCESS','บัญชีนี้ยังไม่ได้รับอนุญาตหรือถูกปิดใช้งาน');return user;}
function hasRole_(actor,role){return (actor.roles||[]).indexOf(role)>=0;}
function isTeacherOf_(actor,subject){return readRecords_('TeachingAssignments').some(function(a){return a.subjectId===subject.id&&a.teacherId===actor.id;});}
function headOf_(actor,subject){var d=findRecord_('Departments',subject.departmentId);return hasRole_(actor,'HEAD')&&d&&(d.headUserId===actor.id||d.substituteReviewerId===actor.id);}
function canReadSubject_(actor,subject){return hasRole_(actor,'ADMIN')||isTeacherOf_(actor,subject)||headOf_(actor,subject)||hasRole_(actor,'ASSESSMENT')||hasRole_(actor,'ACADEMIC');}
function authorize_(actor,action,resource){
 if(action==='ADMIN'){if(!hasRole_(actor,'ADMIN'))fail_('ACCESS','ต้องใช้สิทธิ์ผู้ดูแลระบบ');return;}
 if(action==='SUBJECT_READ'){if(!resource||!canReadSubject_(actor,resource))fail_('ACCESS','ไม่มีสิทธิ์เข้าถึงรายวิชานี้');return;}
 if(action==='SUBJECT_EDIT'){if(!resource||!hasRole_(actor,'TEACHER')||!isTeacherOf_(actor,resource))fail_('ACCESS','แก้ไขได้เฉพาะรายวิชาที่ได้รับมอบหมาย');return;}
 if(action==='DOCUMENT_READ'){
  if(!resource)fail_('NOT_FOUND','ไม่พบเอกสาร');var s=findRecord_('Subjects',resource.subjectId);
  if(hasRole_(actor,'ADMIN')||resource.authorId===actor.id){authorize_(actor,'SUBJECT_READ',s);return;}
  var stages={PENDING_HEAD:'HEAD',RETURNED_HEAD:'HEAD',PENDING_ASSESSMENT:'ASSESSMENT',RETURNED_ASSESSMENT:'ASSESSMENT',PENDING_ACADEMIC:'ACADEMIC',RETURNED_ACADEMIC:'ACADEMIC',APPROVED:'ALL'};
  var stage=stages[resource.status];if(stage==='ALL'&&canReadSubject_(actor,s))return;
  if(stage==='HEAD'&&headOf_(actor,s))return;if(stage==='ASSESSMENT'&&hasRole_(actor,'ASSESSMENT'))return;if(stage==='ACADEMIC'&&hasRole_(actor,'ACADEMIC'))return;
  if(readRecords_('ReviewRecords').some(function(r){return r.documentId===resource.id&&r.reviewerId===actor.id;}))return;
  fail_('ACCESS','เอกสารนี้ยังไม่อยู่ในขอบเขตหรือขั้นตอนที่ท่านตรวจได้');
 }
 fail_('ACCESS','ไม่อนุญาตการกระทำนี้');
}
