# คู่มือติดตั้งและเผยแพร่

## 1. เตรียมบัญชีและโครงการ

แนะนำบัญชี Google Workspace ของโรงเรียนที่ได้รับมอบหมายให้เป็นเจ้าของระบบ ใช้โครงการทดสอบแยกจากโครงการใช้งานจริง ไม่ใช้บัญชีส่วนตัวเก็บฐานข้อมูลโรงเรียนถาวร

เข้า [Google Apps Script](https://script.google.com/) สร้าง New project ตั้งชื่อ ST-Learning Assessment และเปิด Project Settings → Show appsscript.json manifest file

สร้างไฟล์ Script และ HTML ให้ตรงชื่อใน `src/` แล้วคัดลอกเนื้อหาเข้าไปทั้งหมด ไฟล์ .gs เป็น Script ส่วนไฟล์ .html เป็น HTML แทนที่ manifest ด้วย `src/appsscript.json` ไม่ต้องติดตั้งไลบรารีหรือ Advanced Google Service เพิ่มเพื่อเรียก SpreadsheetApp/DriveApp/DocumentApp

อีกทางหนึ่ง `node tools/package.cjs` สร้าง `release/appsscript-project.json` เป็น payload สำหรับ Apps Script API `projects.updateContent` โดยแยกชนิด SERVER_JS/HTML/JSON ถูกต้อง นี่ไม่ใช่ไฟล์ที่ editor นำเข้าได้ด้วยปุ่ม upload และยังต้องมีสิทธิ์ OAuth สำหรับ Script API หากใช้วิธีอัตโนมัติ

ไฟล์สำคัญ: Main.gs ให้บริการเว็บและ API; Auth.gs ตรวจตัวตน/สิทธิ์; Database.gs จัดการ schema/locks/journal; Setup.gs ตั้งค่า/สำรอง/กู้คืน; Users/Subjects/Indicators จัดการข้อมูลหลัก; Analysis/Workflow จัดทำและตรวจ; Reports/Notifications รายงานและแจ้งเตือน; ApiRoutes.gs ลงทะเบียนคำสั่งที่อนุญาต หน้า HTML ต่าง ๆ ประกอบผ่าน Index.html

## 2. Script Properties

Project Settings → Script Properties → Add script property

| Property | ค่าที่ตั้ง |
|---|---|
| SETUP_OWNER_EMAIL | อีเมลจริงของผู้ดูแลที่จะรัน setupSystem ต้องตรงบัญชีที่ลงชื่อเข้าใช้ |
| AUTH_MODE | WORKSPACE เป็นค่าเริ่มต้น หรือ OAUTH เมื่อจัดเตรียม Client ID แล้ว |
| ALLOWED_DOMAIN | โดเมนโรงเรียน เช่นค่าจริงหลัง @ ของบัญชีโรงเรียน ไม่ใส่ @; เว้นว่างเฉพาะเมื่อโรงเรียนอนุญาตบัญชีนอกโดเมน |
| EMAIL_ENABLED | false ในช่วงติดตั้ง/ทดสอบ; เปลี่ยนเป็น true เมื่อพร้อมส่งอีเมลจริง |
| BACKUP_RETENTION_DAYS | 30 หรือจำนวนวันที่โรงเรียนกำหนด |
| OAUTH_CLIENT_ID | ใช้เฉพาะ AUTH_MODE=OAUTH ตามหัวข้อ 5 |

ห้ามใส่รหัสผ่านหรือรหัสกลาง ไม่มี API key ของ OpenAI ที่ต้องใช้

เลือกฟังก์ชัน `setupSystem` ใน editor แล้ว Run อนุญาตสิทธิ์ด้วยบัญชีผู้ดูแลที่ระบุไว้ ฟังก์ชันสร้าง Spreadsheet/โฟลเดอร์รายงาน/โฟลเดอร์สำรอง และบันทึก DATABASE_ID, REPORT_FOLDER_ID, BACKUP_FOLDER_ID ใน Script Properties อัตโนมัติ จากนั้นสร้างหัวชีตและลงทะเบียนผู้ดูแลคนแรกจากตัวตนจริง รันซ้ำได้โดยไม่ล้างข้อมูล

หากมี Spreadsheet เดิม ให้ใช้สำเนาทดสอบและตรวจ schema ก่อนตั้ง DATABASE_ID เอง โค้ดจัดเก็บค่าเซลล์ด้วย prefix `j:` และ JSON เพื่อรักษาชนิดข้อมูลและป้องกันสูตรแฝง จึงควรจัดการข้อมูลผ่านเว็บ ห้ามแก้ raw cells หรือหัวตารางโดยไม่เข้าใจ encoding

## 3. สิทธิ์และ Google Cloud

manifest ขอสิทธิ์ Sheets, Drive, Docs, userinfo.email, external requests, triggers และ send_mail โควตา Google ใช้กับบัญชีผู้เผยแพร่ตามโหมดการรัน ต้องตรวจนโยบาย Workspace/Google Cloud ของโรงเรียน

การส่งออก DOCX/XLSX/PDF ใช้ Drive REST API `files.export` ด้วย token ของ ScriptApp หากใช้ standard Cloud project ให้เปิด Google Drive API ใน Cloud Console ของโครงการนั้น และตั้ง OAuth consent screen ให้เหมาะกับองค์กร

ไม่แชร์ฐานข้อมูลหรือโฟลเดอร์รายงานเป็น Anyone/Anyone with link ไม่ต้องให้ครูเข้าถึง Spreadsheet โดยตรงเมื่อใช้ execute as ผู้เผยแพร่ ไฟล์รายงานที่สร้างให้สิทธิ์อ่านเฉพาะผู้สั่งสร้างและเจ้าของไฟล์ ไม่เปิดลิงก์สาธารณะ Google Docs ที่ส่งออกให้ผู้สั่งสร้างเป็น Editor เฉพาะไฟล์สำเนานั้นเพื่อแก้ไขต่อได้ การแก้สำเนาไม่เปลี่ยนข้อมูลและผลรับรองในระบบ

ไม่มอบสิทธิ์แก้ไข Apps Script project ให้ผู้ใช้งานทั่วไป เพราะผู้แก้โครงการอ่านฐานข้อมูลและเปลี่ยนระบบสิทธิ์ได้

## 4. เผยแพร่สำหรับ Google Workspace

1. Deploy → New deployment → เลือก Web app
2. Execute as: บัญชีผู้เผยแพร่/Me เพื่อให้ฐานข้อมูลยังเป็นส่วนตัว
3. Who has access: เฉพาะองค์กร/โดเมนของโรงเรียน ตัวเลือกชื่ออาจต่างกันตามชนิดบัญชี ไม่เลือกเปิดให้บุคคลทั่วไป
4. Deploy แล้วใช้ URL ที่ลงท้าย `/exec` สำหรับผู้ใช้จริง ส่วน `/dev` ใช้ทดสอบโดยผู้แก้โครงการเท่านั้น
5. ทดสอบด้วยบัญชีครูในโดเมนจริง หาก Session ไม่ให้ email ระบบจะปฏิเสธ ห้ามเปลี่ยนไปเชื่อ email จาก browser หรือใช้ EffectiveUser แทนผู้เข้าเว็บ

เอกสาร Google ระบุว่า email จาก Session ขึ้นกับบริบทการรัน/โดเมน ไม่รับประกันว่าจะมีทุก deployment ต้องทดสอบด้วยบัญชีผู้ใช้จริงที่ไม่ใช่เจ้าของสคริปต์

เมื่อแก้โค้ด: Deploy → Manage deployments → Edit → New version → Deploy โดยคง URL เดิมตาม deployment ที่เลือก การบันทึกโค้ดใน editor อย่างเดียวไม่อัปเดตเวอร์ชันที่เผยแพร่

## 5. OAuth สำหรับบัญชีต่างโดเมน (ทางเลือก)

โค้ดรองรับ Google Identity Services และตรวจ ID token ที่ server ผ่าน Google tokeninfo ต้องตั้ง OAuth Client ID ชนิด Web application พร้อม consent screen/audience/test users และ Authorized JavaScript origins ให้ตรงบริบทเว็บที่ Google ยอมรับ รวมถึงโดเมนที่ให้บริการ HTML Service จริง ตั้ง AUTH_MODE=OAUTH และ OAUTH_CLIENT_ID

การใช้งาน GIS ภายใน iframe/ข้อจำกัดเบราว์เซอร์และ consent configuration ต้องทดสอบใน deployment จริง หากเกิด origin mismatch หรือแสดงปุ่มไม่ได้ ห้ามปิดการตรวจ token เพื่อแก้ปัญหา ให้ผู้ดูแล Cloud แก้ origin/นโยบาย หรือใช้ Workspace ภายในองค์กรก่อน

เซิร์ฟเวอร์ตรวจ issuer, audience, expiry, email_verified และ Users.active ทุกครั้ง ไม่รับบทบาทจาก token หรือข้อมูลหน้าเว็บเป็นสิทธิ์ระบบ หาก ALLOWED_DOMAIN ถูกตั้งไว้ บัญชีนอกโดเมนยังถูกปฏิเสธแม้ token ถูกต้อง

ยังไม่ได้พิสูจน์ OAuth flow บนบัญชีโรงเรียนในชุดส่งมอบนี้ และไม่ควรถือว่าเปิดพร้อมใช้ต่างโดเมนก่อนทดสอบ

## 6. ตั้งข้อมูลจริง

1. เปิดเว็บด้วยผู้ดูแล → ตั้งค่าระบบ → ผู้ใช้งาน เพิ่มอีเมลจริงและบทบาทที่จำเป็น
2. เพิ่มหัวหน้ากลุ่มสาระและผู้ตรวจแทนก่อนสร้างกลุ่มสาระ ผู้ตรวจแทนต้องเป็นคนอื่นเมื่อหัวหน้าเป็นผู้จัดทำ
3. เพิ่มกลุ่มสาระ หลักสูตร รุ่น ปีเริ่มใช้ และแหล่งอ้างอิง
4. เพิ่มรายวิชา รหัส ประเภท ชั้น ภาคเรียน ปี และครูผู้สอน
5. เพิ่ม/นำเข้าตัวชี้วัดจริง แล้วหน้ารายวิชา → กำหนดตัวชี้วัด ให้ครอบคลุมชุดที่ต้องประเมินทั้งหมด
6. ให้ครูเริ่มจัดทำแบบวิเคราะห์

CSV UTF-8 รองรับ BOM และข้อความหลายบรรทัดใน double quotes หัวคอลัมน์: `code,fullText,grade,curriculumId,departmentId,reference` คอลัมน์เสริม `standard,kind` ใช้ ID หลักสูตร/กลุ่มสาระจากหน้าตั้งค่า ไม่ใช้ชื่อแทน ID และ grade ต้องตรงรายวิชา ข้อมูลซ้ำตรวจตามหลักสูตร+กลุ่มสาระ+ชั้น+รหัส

การแก้ข้อความตัวชี้วัดที่ถูกใช้แล้วถูกล็อกเพื่อรักษาหลักฐาน ให้สร้างหลักสูตรรุ่นใหม่ การเปลี่ยนหลักสูตร/ชั้น/กลุ่มสาระของรายวิชาที่ยังไม่มีเอกสารจะล้างชุดตัวชี้วัดเดิมและต้องกำหนดใหม่ หากมีเอกสารแล้วต้องสร้างรายวิชาใหม่

## 7. สำรองและกู้คืน

ตั้งค่าระบบ → ระบบและสำรองข้อมูล → สำรองข้อมูลตอนนี้ จากนั้นติดตั้ง Trigger อัตโนมัติ ระบบสำรองทุกวันช่วงชั่วโมง 02:00 ตาม Asia/Bangkok (Google กำหนดเวลาจริงภายในช่วง) และเก็บเริ่มต้น 30 วัน

ไฟล์ `backup-*.json` อยู่ในโฟลเดอร์สำรองที่จำกัดสิทธิ์ ปุ่มกู้คืนสร้าง Spreadsheet สำเนา **ไม่เปลี่ยน DATABASE_ID** ตรวจจำนวนแถว เอกสาร รุ่น ประวัติตรวจ และสิทธิ์ด้วยสำเนาก่อน ผู้ดูแลโครงการเท่านั้นจึงค่อยสลับ DATABASE_ID ตามแผนกู้คืนของโรงเรียน เมื่อสลับฐานข้อมูล ให้ตรวจ OperationRequests ว่าไม่มีสถานะ STARTED/RECOVERY_REQUIRED จาก snapshot ที่กำลังบันทึก

หากคำสั่งเขียนค้าง STARTED หรือ RECOVERY_REQUIRED ระบบบล็อกการเขียนและการอ่านข้อมูลธุรกิจ ผู้ดูแลยังเปิดหน้าตั้งค่าได้ ตรวจ operation ID และ snapshot ก่อนกดกู้คืน คำสั่งกู้คืนใช้ snapshot ก่อนทำรายการและเปลี่ยนสถานะเป็น FAILED ห้ามกู้คืนย้อนหลังของคำสั่งที่ COMMITTED แล้ว

Sheets ไม่มี transaction จริง และความล้มเหลวระดับบริการ/หมดเวลาระหว่าง journal เป็นกรณีที่ต้องซ้อมบนระบบทดสอบก่อนเปิดใช้งาน

## 8. อีเมลและ Trigger

ค่าเริ่มต้นปิดอีเมล การแจ้งเตือนในเว็บยังใช้งานได้ เมื่อโรงเรียนอนุญาตให้ส่งจริง ตั้ง EMAIL_ENABLED=true แล้วติดตั้ง Trigger ใหม่ ระบบส่งรายการที่รอทุก 10 นาที ครั้งละไม่เกิน 20 รายการตามโควตา

การส่งอีเมลเป็นงานภายหลัง ไม่ทำให้การอนุมัติย้อนกลับหากส่งไม่สำเร็จ สถานะ PENDING/SENDING/SENT/FAILED ดูได้ที่ Notifications ในฐานข้อมูล ผู้ดูแลต้องตรวจรายการ SENDING ค้างก่อน retry เพื่อหลีกเลี่ยงการส่งซ้ำ ไม่ resend อัตโนมัติเมื่อไม่รู้ผลการส่ง

## 9. ตรวจรับก่อนใช้งานจริง

ใช้ฐานทดสอบและบัญชีที่โรงเรียนจัดให้ ทดลองครบ 19 กรณีใน TEST-RESULTS.md เปิด PDF ภาษาไทยที่มีข้อความยาวหลายหน้า ตรวจ A4 แนวนอนและทุกคอลัมน์ ทดสอบ Chrome/Edge และมือถือจริง ตรวจว่าบัญชีที่ไม่อยู่ใน Users ถูกปฏิเสธและไม่เข้าถึงฐาน/ไฟล์คนอื่น

ข้อจำกัด: snapshot เอกสารไม่เกิน 40,000 ตัวอักษร/150 แถว, API 100,000 ตัวอักษร, import สูงสุด 500 แถวต่อครั้งภายใต้ขนาดคำสั่ง, UI โหลดรายการเลือกได้สูงสุด 5,000 รายการด้วย pagination API รายการทั่วไปแบ่งหน้า 20 รายการ ควรแยกหลักสูตรและปีให้เหมาะสม

## แหล่งอ้างอิงทางเทคนิค

- [Session และข้อจำกัดอีเมล](https://developers.google.com/apps-script/reference/base/session)
- [เผยแพร่ Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)
- [Document Body และขนาดกระดาษ](https://developers.google.com/apps-script/reference/document/body)
- [Drive files.export](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/export)
- [ตรวจ Google ID token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)
