#!/usr/bin/env bash
# Run from an authenticated Google Cloud Shell terminal.
set -euo pipefail
trap 'printf "\nหยุดที่บรรทัด %s: เผยแพร่ยังไม่ครบ กรุณาส่งข้อความผิดพลาดด้านบน\n" "$LINENO" >&2' ERR

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_ID='1jYB_yKewHv4j2XMXXlkQo1eAMOozrduwImMQdm35PtC4sdvdudGOIlfI'
DEPLOYMENT_ID='AKfycbzT73RC9lhyJV9yhn05QC-joBxuQBOFHqJYfu3H5B9YVbKLogmxxZHTZyFLI81u5XEa'
cd "$PROJECT_DIR"

printf '\n[1/5] ตรวจโค้ดและสร้างไฟล์\n'
node tools/check.cjs
node --test tests/*.test.cjs
node tools/build-pages.cjs
node tools/bundle-appsscript.cjs

printf '\n[2/5] ยืนยันบัญชีเจ้าของ Apps Script\n'
printf 'ใช้บัญชี numpanoof@gmail.com ตามลิงก์ที่แสดง ไม่ต้องส่งรหัสยืนยันในแชต\n'
printf 'ต้องเปิด Google Apps Script API ที่ https://script.google.com/home/usersettings ก่อน\n'
npx --yes @google/clasp login --no-localhost

printf '\n[3/5] สำรอง Apps Script เดิม\n'
BACKUP_DIR="$(mktemp -d "$HOME/st-learning-backup-XXXXXXXX")"
chmod 700 "$BACKUP_DIR"
cd "$BACKUP_DIR"
printf '{"scriptId":"%s","rootDir":"."}\n' "$SCRIPT_ID" > .clasp.json
npx --yes @google/clasp pull
test -s appsscript.json
printf 'สำรองไว้ที่ %s\n' "$BACKUP_DIR"

printf '\n[4/5] เผยแพร่ Apps Script ใน deployment เดิม\n'
cd "$PROJECT_DIR/release/editor-bundle"
printf '{"scriptId":"%s","rootDir":"."}\n' "$SCRIPT_ID" > .clasp.json
npx --yes @google/clasp push --force
npx --yes @google/clasp create-deployment --deploymentId "$DEPLOYMENT_ID" --description 'Name login and administrator password management'

printf '\n[5/5] เผยแพร่ Firebase Hosting\n'
cd "$PROJECT_DIR"
if command -v firebase >/dev/null 2>&1; then
  firebase deploy --only hosting --project st-learning-assessment-hosting --non-interactive
else
  npx --yes firebase-tools deploy --only hosting --project st-learning-assessment-hosting --non-interactive
fi
printf '\nเผยแพร่คำสั่งครบแล้ว: https://st-learning-assessment-hosting.web.app/\n'
printf 'ยังต้องตั้งรหัสผู้ดูแล หากยังไม่มี ดู docs/NAME-LOGIN-DEPLOY.md ข้อ 2\n'

