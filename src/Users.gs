function saveUser_(actor,input,requestId){authorize_(actor,'ADMIN');return mutate_(actor,requestId,'saveUser',hash_(input),function(){
 var old=input.id?findRecord_('Users',input.id):null,email=text_(input.email,254).toLowerCase();if(email&&!/^\S+@\S+\.\S+$/.test(email))fail_('INPUT','รูปแบบอีเมลไม่ถูกต้อง');
 var roles=Array.isArray(input.roles)?Array.from(new Set(input.roles)):[];if(!roles.length||roles.some(function(r){return ROLES_.indexOf(r)<0;}))fail_('INPUT','บทบาทไม่ถูกต้อง');
 var all=readRecords_('Users');if(all.some(function(u){return email&&u.email===email&&u.id!==input.id;}))fail_('DUPLICATE','อีเมลนี้มีอยู่แล้ว');
 var u={id:old?old.id:uid_(),email:email,name:required_(input.name,'ชื่อ',200),roles:roles,departmentIds:Array.isArray(input.departmentIds)?input.departmentIds:old&&old.departmentIds||[],active:input.active!==false,createdAt:old?old.createdAt:now_(),updatedAt:now_()};
 if(old&&hasRole_(old,'ADMIN')&&old.active&&(!hasRole_(u,'ADMIN')||!u.active)&&!all.some(function(x){return x.id!==u.id&&x.active&&hasRole_(x,'ADMIN');}))fail_('INPUT','ต้องคงผู้ดูแลที่ใช้งานอยู่อย่างน้อยหนึ่งคน');return upsert_('Users',u);
 });}
function saveReference_(actor,table,input,requestId){authorize_(actor,'ADMIN');if(['Departments','Curricula'].indexOf(table)<0)fail_('TABLE','ไม่อนุญาต');return mutate_(actor,requestId,'save'+table,hash_(input),function(){
 var old=input.id?findRecord_(table,input.id):null,r={id:old?old.id:uid_(),name:required_(input.name,'ชื่อ',200),active:input.active!==false};
 if(table==='Departments'){['headUserId','substituteReviewerId'].forEach(function(k){r[k]=text_(input[k],100);if(r[k]){var u=findRecord_('Users',r[k]);if(!u||!u.active||!hasRole_(u,'HEAD'))fail_('INPUT','ผู้ตรวจกลุ่มสาระต้องเป็นผู้ใช้บทบาทหัวหน้ากลุ่มสาระที่ใช้งานอยู่');}});}
 else {r.version=required_(input.version,'รุ่นหลักสูตร',100);r.startYear=required_(input.startYear,'ปีเริ่มใช้',10);r.reference=required_(input.reference,'แหล่งอ้างอิง',1000);}return upsert_(table,r);
 });}
