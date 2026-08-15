# Verification Guide: API Security Hardening Frontend

## Contract prerequisites

1. Backend contract is approved and available in a test environment.
2. Registration compatibility stage is known.
3. Verification email links target the approved frontend route.
4. Google reauthentication callback and proof completion are available.
5. Legacy endpoint cutoff and visitor-ID compatibility dates are recorded.

## Automated acceptance

- Registration installs no auth state.
- Verification token is exchanged once and removed from history.
- Google account conflict remains signed out.
- Proof never reaches storage, URL, logs, or cross-tab messages.
- Proof-bound mutations submit once and clear proof.
- Success clears session and requires login.
- `429`, `413`, invalid/expired proof, duplicate email, and last-admin states are explicit.
- Upload adapter accepts JPEG/PNG, rejects SVG, and existing media render path is unchanged.
- Analytics/reaction payloads contain no visitor ID.
- Existing refresh, `401`, `403`, RBAC, editor, and public reading tests pass.

## Commands

```bash
rtk yarn test
rtk yarn tsc --noEmit
rtk yarn lint
rtk yarn format
rtk yarn build
```

## Manual staging journey

1. Register and verify a new local account.
2. Exercise expired verification and resend rate limit.
3. Confirm an existing linked Google user still signs in.
4. Trigger Google account conflict and recover through login/forgot password.
5. Change password and email using fresh proofs; confirm signed-out behavior.
6. Attempt proof replay, expiry, wrong action, and last-admin deletion.
7. Trigger safe `429`, `413`, and SVG `415` responses without high-volume traffic.
8. Heart/read anonymously and confirm no visitor identifier exists in browser-readable storage or request JSON.

## Stop conditions

- Registration creates AuthContext state before verification.
- Any proof/token/password appears in storage, URL, logs, or channel messages.
- Sensitive mutation is replayed automatically.
- Existing linked Google login breaks.
- Existing published SVG stops rendering because of client-side filtering.
- Frontend ships before the matching backend compatibility stage.
