# Compact profile masthead implementation plan

Goal: implement the selected compact editorial composition inside the running icon-motion checkout.
Architecture: retain ProfileHeader workspace variant and ProfileHeaderCard authorization/data boundary. AvatarEditor owns optional preview control; caller provides existing callback. React, TypeScript, Chakra and existing design-system primitives.

## Tasks
1. Update `src/design-system/patterns/account/ProfileHeader.tsx` workspace grid: smaller portrait, name/edit flex row with wrapping, tighter rhythm, existing type tokens, unchanged stats.
2. Update `AvatarEditor.tsx`: optional `onOpenPreview?: () => void`, workspace camera/expand IconButtons with existing file and preview handlers. Preserve upload announcements and error text.
3. Update `src/features/profile/components/ProfileHeaderCard.tsx`: pass callback and remove separate preview button.
4. Exercise existing account/profile tests and extend meaningful accessible-control cases. Run targeted Vitest, TypeScript, lint and formatting.
5. Inspect running Storybook at desktop/mobile in dark/light modes and verify controls. Record source comparison and limitations in design-qa.md.

Constitution check: approved visual target; frontend-only scope; existing service boundaries; tokens and accessible actions retained; narrow verification first. No commit or push authorized.
