# Frontend State Model: API Security Hardening

No persistent frontend entity is added.

## Registration state

- `idle`
- `submitting`
- `pending`
- `rate_limited`
- `failed`

Registration state contains form values only as needed for rendering. Password clears after every submission result. Email may be kept in component state for resend convenience but is never treated as proof that an account exists.

## Verification state

- `verifying`
- `verified`
- `invalid_or_expired`
- `rate_limited`
- `failed`

The URL token is read once into page memory and removed from browser history using route replacement after exchange.

## Sensitive action state

```text
select action -> reauthenticate -> proof ready -> submit once -> signed out or pending confirmation
                         \-> expired/cancelled -> clear proof
```

Proof state fields:

- action enum;
- opaque proof value;
- client-side expiry hint;
- status;
- no persistence or serialization.

## Pending email state

The UI may display the proposed email during the current page lifecycle, but `/users/me` remains authoritative and continues showing the current verified email until confirmation.

## Retry state

Rate-limit UI stores only the retry deadline/seconds and operation name. It stores no raw limiter key, email hash, IP, token, or backend policy values.

## Security invariants

1. Password, verification token, reset token, provider response, and proof never enter persistent storage or logs.
2. Proof never crosses action boundaries.
3. Sensitive mutation is submitted at most once per proof.
4. Successful credential/identity mutation clears AuthSessionService state.
5. `403` remains authorization denial and never becomes reauthentication automatically.
