# Firebase Hosting

โครงการ Hosting: st-learning-assessment-hosting (Spark ไม่ผูก Billing)

หน้าเว็บใช้ Apps Script/Sheets/Drive เดิมผ่าน bridge ที่อนุญาตเฉพาะ GitHub Pages และสองโดเมน Firebase ของโครงการนี้ ไม่ย้ายฐานข้อมูล

## เผยแพร่

ใช้ Firebase CLI ที่ลงชื่อเข้าบัญชีเจ้าของโครงการ หรือ Google Cloud Shell:

```sh
node tools/build-pages.cjs
firebase deploy --only hosting --project st-learning-assessment-hosting
```

อัปโหลดเฉพาะ public/ ห้ามอัปโหลด .integration/ หรือข้อมูลรายชื่อครู

เมื่อแก้ src/StaticBridge.html ต้องนำไฟล์ไปบันทึกใน Apps Script และอัปเดต deployment เดิมด้วย หน้าเว็บมี query version ของไฟล์ JS ป้องกันโหลดตัวเชื่อมต่อเก่าจากแคช

ไม่เปิด Firestore, Storage, Functions, Analytics หรือ Gemini สำหรับ Hosting นี้ และไม่ใช้กุญแจ service account

