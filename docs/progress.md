# SDD ledger — plan: docs/superpowers/plans/2026-10-22-st-learning-assessment.md

Ruling: No Git repository exists. Use the new st-learning-assessment subdirectory as isolated project; preserve the existing DOCX. Git-only worktree/task scripts do not apply; record tasks here instead.
Pre-flight: Tasks 2–6 consume Task 1 Actor/repository/mutation interfaces; Tasks 3–5 consume subject scope and document revision. Interfaces match. api resolves identity before dispatch and never consumes actor from client payload.
Ruling: Implement native in this chat, as authorized by “ทำเลย” following the native recommendation. Do not create a hosted Sites replacement for the specified Apps Script service.
Ruling: Google integration tests require a school deployment; local mocks prove application logic only. Keep live installation verification explicitly pending.

Task 1: complete — foundation tests RED then GREEN, 6/6 passed.
Task 2: complete — catalog tests RED then GREEN, combined 10/10 passed.
Task 3: complete — analysis tests RED then GREEN, combined 15/15 passed.
Task 4: complete — workflow tests RED then GREEN, combined 20/20 passed.
Task 5: logic implemented — services tests RED then GREEN, combined 25/25 passed; live Drive/Docs export and restoration remain unverified.
Task 6: in progress — imagegen concept saved; client contract RED then GREEN. Approved tokens #711c32 wine, #f7f5f0 cream, white panels, 242px sidebar, Sarabun. Text and controls remain native HTML. No imagery asset needed in production.

Final review: independent read-only reviewer completed. Four important findings fixed: expected workflow status, curriculum mapping, co-teacher document selection, and save-in-flight editing. Checklist details and row numbers also exposed in history.
Ruling: expectedStatus is required for each review, in addition to expectedRevision, so multi-role users cannot replay one review against the next stage. Uncertain network retries retain the original request ID in the current browser session.
Task 5: source complete; live Google auth, exports, backup/restore integration pending a school deployment.
Task 6: source complete. Full suite on 2026-10-23: 40/40 PASS; syntax 20 units PASS. Latest browser save -> three reviewers -> approved report PASS; checklist feedback visible; console error/warn empty; mobile page width 375 equals scrollWidth 375.
Ruling: no Git repository exists, so finishing-branch merge/PR menu is inapplicable. Preserve project in place and deliver ZIP + Apps Script API payload. No deployment or live Google success is claimed.
Remaining work: install in school Google account, authorize services, import verified curriculum, deploy /exec, and run the integration acceptance matrix. No credentials or target Apps Script project has been provided.
