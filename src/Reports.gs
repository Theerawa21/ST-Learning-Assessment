var STATUS_LABELS_={DRAFT:'ฉบับร่าง',REVISION_DRAFT:'ฉบับปรับปรุง',PENDING_HEAD:'รอหัวหน้ากลุ่มสาระ',PENDING_ASSESSMENT:'รองานวัดและประเมินผล',PENDING_ACADEMIC:'รอฝ่ายวิชาการ',RETURNED_HEAD:'หัวหน้ากลุ่มสาระส่งกลับ',RETURNED_ASSESSMENT:'งานวัดฯ ส่งกลับ',RETURNED_ACADEMIC:'ฝ่ายวิชาการส่งกลับ',APPROVED:'อนุมัติสมบูรณ์'};
var STAGE_LABELS_={HEAD:'หัวหน้ากลุ่มสาระ',ASSESSMENT:'หัวหน้างานวัดและประเมินผล',ACADEMIC:'ฝ่ายวิชาการ'};
var PERIOD_LABELS_={BEFORE_MIDTERM:'ก่อนกลางภาค',MIDTERM:'กลางภาค',AFTER_MIDTERM:'หลังกลางภาค',FINAL:'ปลายภาค'};
function exportCell_(value){var s=String(value==null?'':value);return /^[\s]*[=+\-@]/.test(s)?"'"+s:s;}
function buildReportModel_(actor,documentId,period){
 var loaded=getAnalysis_(actor,documentId),d=loaded.document;if(period&&PERIODS_.indexOf(period)<0)fail_('INPUT','ช่วงการประเมินไม่ถูกต้อง');
 var version=readRecords_('DocumentVersions').filter(function(v){return v.documentId===d.id&&v.revision===d.revision;}).pop(),snapshot=version&&version.snapshot,subject=snapshot&&snapshot.subject||loaded.subject,indicators=snapshot&&snapshot.indicators||loaded.requiredIndicators,groups=snapshot&&snapshot.groups||loaded.groups;
 var author=findRecord_('Users',d.authorId),department=findRecord_('Departments',subject.departmentId);
 return {document:d,subject:subject,departmentName:department?department.name:'',authorName:snapshot&&snapshot.authorName||author&&author.name||'',schoolName:'โรงเรียนเซนต์เทเรซา',title:'แบบวิเคราะห์ตัวชี้วัด/ผลการเรียนรู้และการวัดประเมินผล',rows:groups.filter(function(g){return !period||g.periods.indexOf(period)>=0;}).map(function(g){return [g.indicatorIds.map(function(id){var i=indicators.find(function(x){return x.id===id;});return i?i.code+' '+i.fullText:'ไม่พบข้อมูลอ้างอิง';}).join('\n\n'),g.assessment,g.tools.join('\n'),g.periods.map(function(p){return PERIOD_LABELS_[p];}).join('\n'),g.criteria];}),reviews:loaded.reviews.filter(function(r){return r.revision===d.revision;}),period:period||''};
}
function exportMime_(fileId,mime,name){var r=UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(fileId)+'/export?mimeType='+encodeURIComponent(mime),{headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true});if(r.getResponseCode()!==200)fail_('EXPORT','Google ไม่สามารถส่งออกไฟล์ได้ กรุณาตรวจ Drive API สิทธิ์ และโควตา (HTTP '+r.getResponseCode()+')');return r.getBlob().setName(name);}
function createReportFile_(actor,m,format){
 var folder=DriveApp.getFolderById(props_().getProperty('REPORT_FOLDER_ID')),name=m.subject.code+'-'+m.document.id.slice(0,8)+'-v'+m.document.revision+(m.period?'-'+m.period:''),headers=['ตัวชี้วัด/ผลการเรียนรู้','ประเมินอะไร','ใช้อะไรประเมิน','ช่วงการประเมิน','เกณฑ์การประเมิน'],file=null,temp=null;
 try{
  if(format==='XLSX'){
   var ss=SpreadsheetApp.create(name),sheet=ss.getSheets()[0];temp=DriveApp.getFileById(ss.getId());
   var rows=[[m.schoolName,'','','',''],[m.title,'','','',''],[m.subject.code+' '+m.subject.name,'ชั้น '+m.subject.grade,'ภาคเรียน '+m.subject.term,'ปี '+m.subject.year,'รุ่น '+m.document.revision],['ผู้จัดทำ '+m.authorName,'','','',''],headers].concat(m.rows).concat(m.reviews.map(function(r){return ['ผู้ตรวจ '+r.reviewerName,STAGE_LABELS_[r.stage]||r.stage,r.result==='APPROVE'?'ผ่านการตรวจสอบ':'ส่งกลับแก้ไข',r.createdAt,r.comment||''];}));
   sheet.getRange(1,1,rows.length,5).setNumberFormat('@').setValues(rows.map(function(row){return row.map(exportCell_);})).setFontFamily('Sarabun').setWrap(true);sheet.setFrozenRows(5);SpreadsheetApp.flush();file=folder.createFile(exportMime_(ss.getId(),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',name+'.xlsx'));
  }else{
   var doc=DocumentApp.create(name);temp=DriveApp.getFileById(doc.getId());var body=doc.getBody();body.setPageWidth(841.89).setPageHeight(595.28).setMarginTop(28).setMarginBottom(28).setMarginLeft(28).setMarginRight(28);body.setAttributes({[DocumentApp.Attribute.FONT_FAMILY]:'Sarabun',[DocumentApp.Attribute.FONT_SIZE]:11});
   body.appendParagraph(m.schoolName).setAlignment(DocumentApp.HorizontalAlignment.CENTER).editAsText().setBold(true).setFontSize(16);
   body.appendParagraph(m.title).setAlignment(DocumentApp.HorizontalAlignment.CENTER).editAsText().setBold(true).setFontSize(14);
   body.appendParagraph('กลุ่มสาระ '+m.departmentName+'   รายวิชา '+m.subject.code+' '+m.subject.name+'   ชั้น '+m.subject.grade);
   body.appendParagraph('ภาคเรียน '+m.subject.term+'  ปีการศึกษา '+m.subject.year+'  ผู้จัดทำ '+m.authorName+'  รุ่น '+m.document.revision+'  สถานะ '+STATUS_LABELS_[m.document.status]);
   if(m.document.status!=='APPROVED')body.appendParagraph('เอกสารนี้ยังไม่ใช่ฉบับอนุมัติสมบูรณ์');
   var table=body.appendTable([headers].concat(m.rows));[240,125,130,120,170].forEach(function(w,i){table.setColumnWidth(i,w);});for(var i=0;i<5;i++)table.getRow(0).getCell(i).setBackgroundColor('#f2e8e3');
   body.appendParagraph('ข้อมูลการตรวจสอบและรับรอง');body.appendParagraph('ผู้จัดทำ: '+m.authorName+' | วันที่จัดทำ: '+m.document.createdAt);
   ['HEAD','ASSESSMENT','ACADEMIC'].forEach(function(stage){var rr=m.reviews.filter(function(r){return r.stage===stage;}).pop();body.appendParagraph(STAGE_LABELS_[stage]+': '+(rr?rr.reviewerName+' | '+(rr.result==='APPROVE'?'ผ่านการตรวจสอบ':'ส่งกลับแก้ไข')+' | '+rr.createdAt+' | '+(rr.comment||''):'ยังไม่มีผลตรวจในรุ่นนี้'));});body.appendParagraph('การแสดงชื่อผู้ตรวจไม่ใช่การรับรองลายมือชื่ออิเล็กทรอนิกส์โดยอัตโนมัติ');body.editAsText().setFontFamily('Sarabun');doc.saveAndClose();
   if(format==='GOOGLE_DOC'){file=temp;file.moveTo(folder);temp=null;}else {var mime=format==='PDF'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document';file=folder.createFile(exportMime_(doc.getId(),mime,name+(format==='PDF'?'.pdf':'.docx')));}
  }
  if(format==='GOOGLE_DOC')file.addEditor(actor.email);else file.addViewer(actor.email);return {fileId:file.getId(),url:file.getUrl(),format:format};
 }catch(e){if(file)try{file.setTrashed(true);}catch(ignore){}throw e;}finally{if(temp)try{temp.setTrashed(true);}catch(ignore2){}}
}
function exportReport_(actor,input,requestId){authorize_(actor,'DOCUMENT_READ',findRecord_('AnalysisDocuments',input.documentId));if(['PDF','DOCX','XLSX','GOOGLE_DOC'].indexOf(input.format)<0)fail_('INPUT','รูปแบบส่งออกไม่ถูกต้อง');return mutate_(actor,requestId,'exportReport',hash_(input),function(){var model=buildReportModel_(actor,input.documentId,input.period);return createReportFile_(actor,model,input.format);});}
