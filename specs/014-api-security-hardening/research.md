# Research and Decisions: API Security Hardening Frontend

## Decision 1: Backend contract is authoritative

Frontend types, services, and copy map the approved backend contract. UI does not infer account existence, provider identity, proof validity, retry policy, or session revocation.

## Decision 2: Registration is a pending journey

After `POST /users`, navigate to an auth-shell check-email state rather than AuthContext installation. Store no registration token. Resend accepts an email input and always uses neutral copy.

## Decision 3: Proof remains feature-local and ephemeral

The account-security flow owns proof state in memory for one action. It is not placed in AuthContext, access-token store, repository cache, URL state, storage, or cross-tab coordination.

## Decision 4: Proof-bound mutations are one-attempt operations

Sensitive mutations use a non-replaying transport mode. If access expires before submission, obtain a fresh session and proof; do not automatically replay a potentially consumed proof/body.

## Decision 5: Existing auth design language is sufficient

Verification and Google conflict reuse `AuthShell`. Account changes use calm profile panels and explicit confirmation states. No new token or shared component family is required unless implementation finds a repeated role.

## Decision 6: Remove client visitor authority

Analytics/reaction API adapters stop generating/sending visitor IDs. Existing `credentials: include` transport carries the backend-issued HttpOnly cookie without exposing it to JavaScript.

## Decision 7: Reject SVG before transport

Client accept lists and validation allow JPEG/PNG only. Backend `415` remains the authority. Existing read paths are not filtered by MIME so published legacy SVG can still render.
