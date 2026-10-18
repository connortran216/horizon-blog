# Tasks
- [x] Resolve approved image and running checkout; load workflow/design/domain/constitution.
- [x] Specify outcome and scoped implementation plan.
- [x] Implement compact workspace composition and portrait controls.
- [x] Run targeted checks and browser verification.
- [x] Record evidence and hand off local changes.

Validation: 27 tests passed; yarn tsc --noEmit, yarn lint, targeted Prettier, yarn build and git diff --check passed. Browser checks cover 375/768/1024/1440px, dark/light, avatar modal, and local edit-save. Authenticated backend upload was not exercised.
