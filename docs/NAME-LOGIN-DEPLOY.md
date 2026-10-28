# เผยแพร่ระบบชื่อและรหัสผ่าน

ครูที่มีบทบาท TEACHER เท่านั้นใช้รหัสโรงเรียนเดิม ส่วนผู้ดูแล หัวหน้า งานวัดผล และวิชาการใช้รหัสส่วนตัวอย่างน้อย 16 ตัวอักษร

## 1. อัปเดต Apps Script ก่อน

รัน `node tools/bundle-appsscript.cjs` แล้วนำไฟล์จาก `release/editor-bundle` ไปแทนไฟล์เดิมในโครงการ Apps Script: Code.gs (หรือ รหัส.gs), Index.html, StaticBridge.html และ appsscript.json โดยไม่เพิ่ม Code.gs ซ้ำกับ รหัส.gs ที่มีโค้ดเดิมอยู่

บันทึก แล้วเลือก Deploy → Manage deployments → Edit → New version → Deploy โดยใช้ deployment เดิมและสิทธิ์เดิม

## 2. กู้คืนผู้ดูแลโดยไม่ผ่านหน้า Google ของเว็บไซต์

ทำใน Apps Script editor ด้วยบัญชีเจ้าของโครงการเท่านั้น:

1. เปิด Project Settings → Script properties
2. ตรวจ SETUP_OWNER_EMAIL ให้เป็นอีเมลเจ้าของระบบเดิม ห้ามเปลี่ยนเป็นบุคคลอื่น
3. เพิ่ม OWNER_RECOVERY_PASSWORD เป็นรหัสใหม่ส่วนตัวอย่างน้อย 16 ตัวอักษร ห้ามใส่ใน GitHub หรือส่งในแชต
4. กลับ Editor เลือกฟังก์ชัน recoverOwnerLogin_ แล้วกด Run
5. เมื่อสำเร็จ ระบบลบ property รหัสชั่วคราว ปลดล็อกการลองรหัส และบันทึกเฉพาะ salt/digest
6. เข้าหน้าเว็บด้วยชื่อผู้ดูแลและรหัสที่ตั้งไว้

## 3. อัปเดต Firebase

ใน Cloud Shell:

```bash
cd ~/st-learning-firebase-20261028 && git pull --ff-only && node tools/build-pages.cjs && firebase deploy --only hosting --project st-learning-assessment-hosting --non-interactive
```

เมื่อขึ้น Deploy complete ให้รีเฟรชหน้าเว็บ เข้าระบบ แล้วไป ตั้งค่าระบบ → ผู้ใช้งาน → ตั้งรหัสเข้าใช้ สำหรับบัญชีฝ่ายตรวจ ส่งรหัสให้เจ้าของบัญชีผ่านช่องทางส่วนตัว

การเผยแพร่ Hosting อย่างเดียวไม่เปลี่ยน backend ต้องทำข้อ 1 ด้วย ฐานข้อมูล Sheets/Drive เดิมไม่ต้องสร้างใหม่หรือเปิดสาธารณะ

