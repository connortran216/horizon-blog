# Frontend Contract Dependency

The backend source of truth is:

- [Backend API contract](../../../horizon-blog-be/specs/009-api-security-hardening/contracts/api-security-hardening.md)
- [Backend feature spec](../../../horizon-blog-be/specs/009-api-security-hardening/spec.md)

Frontend adapters must cover:

- pending registration `202` without auth response;
- verification and resend;
- login `EMAIL_VERIFICATION_REQUIRED`;
- Google `oauth_account_conflict` callback;
- password and Google reauthentication proof;
- password change, pending email change/confirmation, and proof-gated deletion;
- `RATE_LIMITED`, `REQUEST_TOO_LARGE`, proof/verification invalidity, duplicate email, and last-admin conflict;
- JPEG/PNG-only upload;
- analytics/reaction payloads without `visitor_id`.

No frontend endpoint or response field may be implemented before it appears in the approved backend contract and generated API snapshot.
