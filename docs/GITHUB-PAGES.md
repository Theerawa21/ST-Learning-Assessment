# เปิดเว็บจาก GitHub Pages

หน้าเว็บอยู่บน GitHub Pages ส่วน Apps Script ตรวจบัญชีและอ่านเขียน Sheets/Drive เดิม ไม่ต้องแชร์ฐานข้อมูลเป็นสาธารณะ และไม่ใส่ client secret ใน repository

## สถานะ

เตรียมโค้ดและ workflow แล้ว การเปิดใช้จริงยังต้องตั้งค่า GitHub, Google OAuth และเผยแพร่ backend รุ่นใหม่ จากนั้นทดสอบบัญชีจริงในเบราว์เซอร์

## ตั้งค่าครั้งแรก

1. ที่ repository Settings → General → Danger Zone เปลี่ยน visibility เป็น Public ตามที่เจ้าของอนุญาต ก่อนเปลี่ยนต้องตรวจไฟล์และประวัติ repository ว่าไม่มีข้อมูลส่วนตัวหรือ secret
2. Settings → Pages → Build and deployment → Source เลือก **GitHub Actions**
3. ใน Google Cloud โครงการ `prismatic-vim-512508-g3` เปิด OAuth client เดิม เพิ่ม Authorized JavaScript origin **`https://theerawa21.github.io`** (ไม่มี path) และคง redirect URI เดิมไว้
4. รัน `node tools/bundle-appsscript.cjs` แล้วอัปเดต Apps Script ด้วย Code.gs, Index.html และ **StaticBridge.html** จาก `release/editor-bundle/` คง manifest และ Script Properties เดิม จากนั้นแก้ deployment เดิมให้เป็นรุ่นใหม่
5. เปิด Actions → Publish GitHub Pages → Run workflow หรือ push โค้ดเข้า main
6. หลัง workflow สำเร็จ เปิด `https://theerawa21.github.io/ST-Learning-Assessment/`

URL นี้เป็นปลายทางที่กำหนดไว้ ยังไม่ใช่หลักฐานว่าเว็บไซต์เผยแพร่แล้ว

## ตรวจรับก่อนใช้งาน

- ทดสอบ Google sign-in กับเจ้าของและ Gmail ครูอีกบัญชี สมัครใหม่ และเข้าใช้งานตามสิทธิ์จริง
- เปิดรายวิชา เลือกหลายตัวชี้วัดและช่วงเวลา บันทึก โหลดกลับ ส่งตรวจ และส่งออกรายงาน
- ตรวจว่าบัญชีที่ปิดใช้งานถูกปฏิเสธ และยังเปิดฐานข้อมูล/ไฟล์รายงานโดยไม่รับสิทธิ์ไม่ได้
- ทดสอบมือถือและกรณี browser บล็อก third-party cookies หาก bridge ไม่พร้อม ระบบจะแจ้งข้อผิดพลาดและไม่รายงานว่าบันทึกสำเร็จ

## การดูแล

แก้ UI ใน src แล้ว push main เพื่อ build หน้าเว็บใหม่ ถ้าแก้ backend .gs หรือ StaticBridge.html ต้องเผยแพร่ Apps Script รุ่นใหม่ด้วย

ใช้ `node tools/build-pages.cjs` สร้างไฟล์เผยแพร่ใน public/ Workflow อัปโหลดเฉพาะ public/ ไม่มี fixtures, CSV ของโรงเรียน หรือข้อมูลจาก .integration/

Bridge ยอมรับเฉพาะ origin ของ Pages ที่กำหนดและตรวจ channel/window ของข้อความ โดยทุกคำสั่งยังผ่าน API ตรวจ Google token และบทบาทเดิม บัญชี Google และ token ไม่ถูกส่งผ่าน URL และไม่เก็บใน localStorage
