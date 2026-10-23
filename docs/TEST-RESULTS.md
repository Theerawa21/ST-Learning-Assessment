# ผลการตรวจสอบ ST-Learning Assessment

ตรวจล่าสุดวันที่ 23 ตุลาคม 2569 — ใช้โค้ดจริงของแอปกับตัวจำลองบริการ Google ในเครื่อง และทดสอบหน้าเว็บผ่าน in-app browser ของ Codex

**สถานะส่งมอบ:** ซอร์สและหน้าเว็บทดสอบพร้อมตรวจรับ ระบบยังไม่ได้เผยแพร่เป็น Google Apps Script Web App ในบัญชีโรงเรียน ไม่ถือว่าผ่านการทดสอบใช้งานจริงบน Google

## Automated checks

คำสั่ง `node --test tests/*.test.cjs` และ `node tools/check.cjs` ใช้ Node.js v24.19.0 ไม่ต้องติดตั้ง dependencies

ขณะจัดทำรายงาน: 40 automated tests ผ่าน 40 ไม่มีล้มเหลว ครอบคลุม identity fail-closed, OAuth audience, inactive user, IDOR/role enforcement, CSV BOM/quoted newline, formula protection, mapping curriculum/grade, coverage, persistence, document revisions, approval/checklist/return flow, request replay, partial-write rollback, recovery read gate, stale actor permissions, co-teacher selection และเกิน 1,000 แถวในชีต

syntax check ผ่าน 20 หน่วยโค้ด Apps Script/JavaScript และ manifest JSON

ตัวจำลองเรียก logic จริง แต่ไม่สามารถพิสูจน์พฤติกรรม Session, Google token จริง, สิทธิ์ Drive, การส่งออกไฟล์ หรือระยะเวลา/โควตาของ Google ได้

## Browser QA

- URL ทดสอบ: `http://127.0.0.1:4187` บน loopback เท่านั้น
- ทดสอบ desktop ที่ 1440 × 1000 และ mobile ที่ 390 × 844; actual layout viewport มือถือวัดได้ 375px ภายใต้ browser override และ scrollWidth เท่ากับ clientWidth ไม่มีการล้นแนวนอนของทั้งหน้า
- Browser plugin แยกไม่อยู่ในรายการทักษะ จึงใช้ built-in IAB ผ่าน cua_repl
- ครั้งแรก IAB timeout เพราะ preview อยู่ใน sandbox; Playwright fallback ไม่มี bundled Chromium และ Edge ภายใต้ sandbox ปิดตัว ก่อนแก้โดยเปิด preview บน loopback นอก sandboxและกลับมาใช้ IAB ได้ จึงไม่ได้อ้างผลว่า Playwright QA ผ่าน
- หน้าเว็บมีเนื้อหา ไม่มี error overlay; console error/warn ที่ตรวจระหว่าง flow เป็นรายการว่าง

เส้นทางที่ตรวจผ่าน UI: โหลดข้อมูลทดสอบแยก → เลือกครูทดสอบ → เห็นรายวิชาที่ได้รับมอบหมายหนึ่งวิชา → เลือกตัวชี้วัดทดสอบห้าข้อในแถวเดียว → เลือกก่อนกลางภาคและปลายภาค → กำหนดเครื่องมือ/เกณฑ์ → บันทึก → ครอบคลุม 100% → ส่งตรวจและยืนยัน → เปลี่ยนผู้ตรวจระดับหนึ่ง/สอง/สาม → ตอบ checklist เก้าข้อทุกระดับ → รับรอง/อนุมัติและยืนยัน → เปิดรายงานเห็นอนุมัติสมบูรณ์และผู้ตรวจครบสามคน

ทดสอบมือถือเปิดเมนูแล้วกลับแดชบอร์ดได้และข้อมูลอนุมัติแสดงถูกต้อง ภาพหลักฐานบันทึกไว้ในโฟลเดอร์ visualization ของแชต ไม่รวมเป็นข้อมูลจริงใน src/

## เกณฑ์ต้นฉบับ 19 กรณี

| # | กรณี | หลักฐานในเครื่อง | ต้องตรวจหลังติดตั้ง Google |
|---|---|---|---|
| 1 | ครูเข้าสู่ระบบ/เห็นเฉพาะวิชาตน | logic PASS และ browser PASS ด้วยบัญชีทดสอบ | Google login/allowlist บัญชีจริง |
| 2 | เลือกตัวชี้วัดจากคลัง | browser PASS | ข้อมูลหลักสูตรจริง |
| 3 | หลายตัวชี้วัดในแถวเดียว | logic/browser PASS | ยืนยันข้อมูลจริงครบ |
| 4 | หลายช่วงประเมิน | logic/browser PASS | ตรวจเกณฑ์รายวิชา |
| 5 | บันทึก/โหลดครบ | logic/browser PASS | Sheets persistence จริง |
| 6 | พบตัวชี้วัดที่ยังไม่ได้วิเคราะห์ | logic PASS (4/5 = 80%) | ลองกับหลักสูตรจริง |
| 7 | ส่งงานไม่ครบไม่ได้ | logic PASS | ทดสอบ UI บน deployment |
| 8 | หัวหน้ารับรอง | logic/browser PASS | บัญชีหัวหน้าจริง |
| 9 | งานวัดฯ ตรวจหลังขั้นแรก | logic/browser PASS | สิทธิ์จริง |
| 10 | วิชาการอนุมัติหลังสองขั้น | logic/browser PASS | สิทธิ์จริง |
| 11 | ส่งกลับและความคิดเห็น | logic PASS | ทดลองส่งกลับจริงและเปิดความเห็นรายข้อ |
| 12 | ส่งใหม่เริ่มที่หัวหน้า | logic PASS | ครบเส้นทางจริง |
| 13 | ห้ามตรวจตนเอง | logic PASS รวมหลายบทบาท | บัญชีผู้ตรวจแทนจริง |
| 14 | ล็อกฉบับอนุมัติ | logic PASS | ทดสอบแก้จากแท็บเก่าบน Google |
| 15 | PDF ภาษาไทย | report model PASS เท่านั้น | ยังไม่ทดสอบ PDF/Docs/DOCX/XLSX จริงและการแบ่งหน้า |
| 16 | คอมพิวเตอร์/มือถือ | IAB desktop/mobile PASS | อุปกรณ์จริงและเบราว์เซอร์โรงเรียน |
| 17 | ป้องกันข้อมูลผู้อื่น | logic PASS | ทดสอบ URL ไฟล์/บัญชี Google ที่ไม่มีสิทธิ์ |
| 18 | การทำงานพร้อมกัน | stale revision/status/retry/rollback PASS | LockService และความล้มเหลวข้ามชีตจริง |
| 19 | สำรอง/กู้คืน | JSON backup → distinct spreadsheet copy PASS ใน mock | Trigger รายวันและกู้คืนบน Google จริง |

## ผล code review

มี reviewer อิสระตรวจแบบ read-only พบและแก้ประเด็นสำคัญ: expectedStatus ป้องกันผู้ตรวจหลายบทบาทอนุมัติข้ามคิวจากหน้าเดิม, รักษา request ID เมื่อตอบกลับเครือข่ายไม่แน่นอน, ล้าง mapping เมื่อเปลี่ยนหลักสูตรและตรวจซ้ำตอนใช้, เลือกเอกสารของครูสอนร่วมให้ถูกคน, ปิด editor ระหว่างบันทึกไม่ให้ข้อมูลใหม่ถูกทับ

ปรับเพิ่มเติมให้แสดง checklist feedback ที่บันทึกไว้และเลขรายการสำหรับความเห็นรายแถว แก้ cleanup failure ไม่ให้ย้อนรายการที่ commit แล้ว และบล็อกการอ่านขณะมีคำสั่งค้าง

ไม่ได้ถือว่าการตรวจโค้ดนี้รับรอง live Google integration ผู้ตรวจระบุให้ทดสอบ Workspace/GIS, Drive sharing/export, PDF ภาษาไทยและโควตาบน deployment จริงก่อนรับงานโรงเรียน

## ข้อจำกัดที่ต้องคงไว้ในการส่งมอบ

1. ยังไม่มี URL ใช้งานจริง/บัญชีโรงเรียน/ข้อมูลตัวชี้วัดจริงในระบบ
2. โหมด preview ใช้ fixture ที่ติดป้ายข้อมูลทดสอบและไม่บันทึกถาวร
3. Drive/Docs export และรูปแบบกระดาษยังต้องตรวจจริง แม้ code/model พร้อมและใช้ API ตามเอกสาร Google
4. Sheets ไม่ใช่ transactional database: journal+lock+snapshot ลดความเสี่ยง แต่ต้องซ้อม recovery บน Google
5. มีขนาด snapshot/request/import ตาม README และยังไม่ทำ load test ระดับผู้ใช้จำนวนมาก
