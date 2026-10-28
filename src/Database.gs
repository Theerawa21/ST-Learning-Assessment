/* Sheets repository. Cells use j: JSON encoding to preserve types and prevent formulas. */
var SCHEMA_ = {
 Users:['id','email','name','roles','departmentIds','active','createdAt','updatedAt'],
 Departments:['id','name','headUserId','substituteReviewerId','active'],
 Curricula:['id','name','version','startYear','reference','active'],
 Subjects:['id','code','name','type','grade','departmentId','curriculumId','term','year','active','updatedAt'],
 TeachingAssignments:['id','subjectId','teacherId'],
 Indicators:['id','curriculumId','departmentId','standard','code','fullText','grade','kind','reference','active'],
 SubjectIndicators:['id','subjectId','indicatorId'],
 AnalysisDocuments:['id','subjectId','authorId','status','revision','parentDocumentId','createdAt','updatedAt'],
 AssessmentGroups:['id','documentId','order'],GroupIndicators:['id','groupId','indicatorId'],
 AssessmentItems:['id','groupId','assessment','tools','criteria'],AssessmentPeriods:['id','itemId','periodCode'],
 ReviewRecords:['id','documentId','revision','reviewerId','reviewerName','stage','result','comment','rowComments','createdAt'],
 ReviewChecklist:['id','reviewId','number','value','reason','comment'],
 DocumentVersions:['id','documentId','revision','snapshot','actorId','createdAt'],
 Notifications:['id','recipientId','documentId','message','readAt','emailStatus','createdAt'],
 ActivityLogs:['id','actorId','action','entityId','requestId','createdAt'],Settings:['id','value'],
 OperationRequests:['id','actorId','operation','payloadHash','status','result','snapshotFileId','error','createdAt','updatedAt']
};
var DB_TX_=null,DB_REQUEST_CACHE_=null,DB_REQUEST_BOOK_=null;
function props_(){return PropertiesService.getScriptProperties();}
function now_(){return new Date().toISOString();}
function uid_(){return Utilities.getUuid();}
function fail_(code,message){var e=new Error(code+': '+message);e.code=code;throw e;}
function text_(value,max){var s=String(value==null?'':value).trim();if(s.length>(max||4000))fail_('INPUT','ข้อความยาวเกินกำหนด');return s;}
function required_(value,label,max){var s=text_(value,max);if(!s)fail_('INPUT','กรุณาระบุ'+label);return s;}
function hash_(value){return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify(value),Utilities.Charset.UTF_8));}
function book_(){var id=props_().getProperty('DATABASE_ID');if(!id)fail_('SETUP','ยังไม่ได้ตั้งค่าฐานข้อมูล กรุณาติดต่อผู้ดูแล');if(DB_REQUEST_CACHE_!==null){if(!DB_REQUEST_BOOK_)DB_REQUEST_BOOK_=SpreadsheetApp.openById(id);return DB_REQUEST_BOOK_;}return SpreadsheetApp.openById(id);}
function rawRead_(table){
 if(!Object.prototype.hasOwnProperty.call(SCHEMA_,table))fail_('TABLE','ไม่พบตาราง');
 var s=book_().getSheetByName(table);if(!s)fail_('SETUP','ไม่พบชีต '+table);
 if(s.getLastRow()<2)return [];
 return s.getRange(2,1,s.getLastRow()-1,SCHEMA_[table].length).getValues().filter(function(r){return r[0]!=='';}).map(function(row){var record={};SCHEMA_[table].forEach(function(key,i){var cell=row[i];record[key]=typeof cell==='string'&&cell.indexOf('j:')===0?JSON.parse(cell.slice(2)):cell;});return record;});
}
function rawWrite_(table,records){
 if(DB_REQUEST_CACHE_)delete DB_REQUEST_CACHE_[table];
 var s=book_().getSheetByName(table),keys=SCHEMA_[table];if(!s||!keys)fail_('TABLE','ไม่พบตาราง');
 ensureRows_(s,records.length+1);
 var rows=records.map(function(r){return keys.map(function(k){var v='j:'+JSON.stringify(r[k]===undefined?null:r[k]);if(v.length>45000)fail_('LIMIT','ข้อมูลหนึ่งช่องยาวเกินขีดจำกัด กรุณาแยกเอกสาร');return v;});});
 if(rows.length)s.getRange(2,1,rows.length,keys.length).setNumberFormat('@').setValues(rows);
 var old=s.getLastRow()-1;if(old>rows.length)s.getRange(rows.length+2,1,old-rows.length,keys.length).clearContent();
}
function ensureRows_(sheet,count){var current=sheet.getMaxRows();if(count>current)sheet.insertRowsAfter(current,count-current);}
function readRecords_(table){if(DB_TX_){if(!DB_TX_.data[table])DB_TX_.data[table]=rawRead_(table);return JSON.parse(JSON.stringify(DB_TX_.data[table]));}if(DB_REQUEST_CACHE_){if(!Object.prototype.hasOwnProperty.call(DB_REQUEST_CACHE_,table))DB_REQUEST_CACHE_[table]=rawRead_(table);return JSON.parse(JSON.stringify(DB_REQUEST_CACHE_[table]));}return rawRead_(table);}
function writeRecords_(table,records){if(DB_TX_){DB_TX_.data[table]=JSON.parse(JSON.stringify(records));DB_TX_.dirty[table]=true;}else rawWrite_(table,records);}
function findRecord_(table,id){return readRecords_(table).find(function(r){return r.id===id;})||null;}
function upsert_(table,record){var rows=readRecords_(table),i=rows.findIndex(function(r){return r.id===record.id;});if(i<0)rows.push(record);else rows[i]=record;writeRecords_(table,rows);return record;}
function append_(table,record){record.id=record.id||uid_();upsert_(table,record);return record;}
function removeWhere_(table,predicate){writeRecords_(table,readRecords_(table).filter(function(r){return !predicate(r);}));}
function mutate_(actor,requestId,operation,payloadHash,callback){
 if(DB_REQUEST_CACHE_)DB_REQUEST_CACHE_={};
 requestId=required_(requestId,'รหัสคำสั่ง',100);if(requestId.length<8)fail_('REQUEST','รหัสคำสั่งสั้นเกินไป');
 var lock=LockService.getScriptLock();lock.waitLock(30000);var op=null,snapshot=null,snapshotFile=null;
 try{
  var current=rawRead_('Users').find(function(u){return u.id===actor.id;});if(!current||!current.active||current.email!==actor.email||hash_(current.roles)!==hash_(actor.roles))fail_('ACCESS','สิทธิ์ผู้ใช้เปลี่ยนแปลง กรุณาเข้าสู่ระบบใหม่');
  var previous=rawRead_('OperationRequests').find(function(r){return r.id===requestId;});
  if(previous){if(previous.actorId!==actor.id||previous.operation!==operation||previous.payloadHash!==payloadHash)fail_('REQUEST','รหัสคำสั่งถูกใช้กับข้อมูลอื่นแล้ว');if(previous.status==='COMMITTED')return previous.result;fail_('REQUEST','คำสั่งเดิมไม่เสร็จสมบูรณ์ กรุณาตรวจสอบประวัติก่อนลองใหม่');}
  var unresolved=rawRead_('OperationRequests').some(function(r){return r.status==='STARTED'||r.status==='RECOVERY_REQUIRED';});if(unresolved)fail_('RECOVERY','ระบบมีรายการค้าง ต้องให้ผู้ดูแลตรวจและกู้คืนก่อนบันทึกเพิ่ม');
  op={id:requestId,actorId:actor.id,operation:operation,payloadHash:payloadHash,status:'STARTED',createdAt:now_(),updatedAt:now_()};
  upsert_('OperationRequests',op);DB_TX_={data:{},dirty:{}};
  var result=callback();append_('ActivityLogs',{actorId:actor.id,action:operation,entityId:result&&result.id||'',requestId:requestId,createdAt:now_()});
  snapshot={};Object.keys(DB_TX_.dirty).forEach(function(t){snapshot[t]=rawRead_(t);});
  snapshotFile=DriveApp.getFolderById(props_().getProperty('BACKUP_FOLDER_ID')).createFile('operation-'+requestId+'.json',JSON.stringify(snapshot),'application/json');
  op.snapshotFileId=snapshotFile.getId();
  // Persist recovery location before touching business tables.
  var journal=rawRead_('OperationRequests'),oi=journal.findIndex(function(r){return r.id===op.id;});journal[oi]=op;rawWrite_('OperationRequests',journal);SpreadsheetApp.flush();
  var tx=DB_TX_;DB_TX_=null;Object.keys(tx.dirty).forEach(function(t){rawWrite_(t,tx.data[t]);});SpreadsheetApp.flush();
  op.status='COMMITTED';op.result=result===undefined?null:result;op.updatedAt=now_();upsert_('OperationRequests',op);SpreadsheetApp.flush();try{snapshotFile.setTrashed(true);}catch(cleanupError){/* Cleanup failure must never undo a committed operation. */}return op.result;
 }catch(e){
  DB_TX_=null;
  if(op){var recovered=true;if(snapshot)Object.keys(snapshot).forEach(function(t){try{rawWrite_(t,snapshot[t]);}catch(ignore){recovered=false;}});op.status=recovered?'FAILED':'RECOVERY_REQUIRED';op.error=text_(e.message,4000);op.updatedAt=now_();try{upsert_('OperationRequests',op);SpreadsheetApp.flush();}catch(ignore2){/* STARTED remains and blocks future writes. */}}
  throw e;
 }finally{DB_TX_=null;lock.releaseLock();}
}
function expectRevision_(document,expected){if(!Number.isInteger(Number(expected))||document.revision!==Number(expected))fail_('CONFLICT','เอกสารถูกเปลี่ยนแล้ว กรุณาโหลดข้อมูลใหม่ก่อนดำเนินการ');}
