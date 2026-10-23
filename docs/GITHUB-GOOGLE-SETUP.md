# GitHub + Google Drive + Google Sheets

ผู้ใช้เลือกให้ GitHub เก็บซอร์ส และเปิดเว็บจาก Google Apps Script ตามสถาปัตยกรรมเดิม ไม่ใช้ GitHub Pages

## บริการที่เตรียมให้

- Repository ส่วนตัว: https://github.com/Theerawa21/ST-Learning-Assessment
- โครงการ Apps Script: https://script.google.com/home/projects/1jYB_yKewHv4j2XMXXlkQo1eAMOozrduwImMQdm35PtC4sdvdudGOIlfI/edit
- ฐานข้อมูล Google Sheets และโฟลเดอร์ Drive ถูกสร้างแยกจากซอร์ส ไม่เปิดข้อมูลเป็นสาธารณะ

ค่าติดตั้งเฉพาะบัญชีและ ID ฐานข้อมูลเก็บใน Script Properties ไฟล์ `.integration/` ในเครื่องไม่อยู่ใน GitHub และไม่มี OAuth token หรือรหัสผ่านในโค้ด

## ซิงก์โค้ดไป Apps Script

โฟลเดอร์ `src/` เป็นแหล่งโค้ดหลัก ใช้ `node tools/bundle-appsscript.cjs` สร้างชุดสำหรับ editor เพียง 3 ไฟล์ใน `release/editor-bundle/`: Code.gs รวม backend, Index.html รวม frontend และ appsscript.json

หากใช้ bundle ต้องนำทั้ง Code.gs และ Index.html จากชุดเดียวกันไปแทนไฟล์ใน editor อย่านำ bundle ไปวางร่วมกับไฟล์ .gs แยกชุดเดิม เพราะจะเกิดฟังก์ชันซ้ำ ซอร์สแยก 23 ไฟล์ยังใช้ได้ตามคู่มือเดิม

ก่อนอัปเดตให้รัน `node --test tests/*.test.cjs`, `node tools/check.cjs`, `node tools/package.cjs` และ `node tools/bundle-appsscript.cjs` แล้ว Deploy เป็นเวอร์ชันใหม่ใน deployment เดิม

## ข้อจำกัดการเผยแพร่ครั้งแรก

การสร้างโครงการและใส่โค้ดไม่เท่ากับอนุญาตให้สคริปต์เข้าถึง Drive/Sheets ต้องให้เจ้าของบัญชีตรวจและอนุญาต scopes ของ Google ก่อนเรียก setup และสร้าง deployment

บัญชีที่เชื่อมต่อเป็น Gmail ส่วนบุคคล การทดสอบครั้งแรกจึงควรจำกัดการเข้าถึงเฉพาะเจ้าของโครงการ การให้ครูหลายบัญชีใช้งานต้องตั้ง Google OAuth Client ID และ AUTH_MODE=OAUTH หรือย้ายโครงการไป Workspace ของโรงเรียนตาม INSTALL.md ห้ามแทนตัวตนจริงด้วย email หรือ role ที่หน้าเว็บส่งมา
