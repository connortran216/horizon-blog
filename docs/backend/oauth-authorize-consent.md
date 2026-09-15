# Backend requirement: request metadata for the MCP authorization consent screen

Status: proposed, not implemented. Written against `horizon-blog-y2e.sec.1`.
Owner: backend. Frontend counterpart: `src/features/oauth/pages/McpAuthorizePage.tsx`,
`src/features/oauth/mcpAuthorize.logic.ts`.

## Why this is needed

`GET /oauth/authorize` starts an MCP OAuth handoff and (per `api-docs.json`)
already takes `response_type`, `client_id`, `redirect_uri`, `state`, `scope`,
`resource`, `code_challenge` and `code_challenge_method` as query parameters.
The frontend never sees any of these. It only ever receives `request_id` in
the URL it is redirected to (`/oauth/authorize?request_id=...`), and the only
thing `POST /oauth/authorize/complete` gives back is `redirect_uri`
(`schemas.OAuthAuthorizeCompleteResponse`).

That was enough when this call fired automatically for a signed-in session -
the frontend never had to say anything about the request, so it never had to
know anything about it either. That auto-complete was itself the bug being
fixed: a signed-in reader who opened `/oauth/authorize?request_id=<attacker's>`
had a code minted and handed to whichever `redirect_uri` was registered for
that client, without ever being asked. The frontend fix adds a consent screen
the reader has to press through - see `McpAuthorizePage.tsx`'s header comment
for the full before/after - but that screen can currently only say "a request
wants access," because `request_id` is the only fact it has. It cannot name
the requesting application, list what it is asking for, or say where the
grant is headed, because the server has never told it.

**This document specs the one endpoint that closes that gap.** No frontend
change described here is blocked on it - the consent gate is already load-bearing
without it - but the consent screen stays honestly vague (deliberately: see
`mcpConsentCopy` in `mcpAuthorize.logic.ts`) until it ships.

## What the server already has

`POST /oauth/register` (`schemas.OAuthClientRegistrationInput` /
`...Response`) captures `client_name`, `redirect_uris`, `scope`,
`grant_types`, `response_types` and `token_endpoint_auth_method` per client at
registration time. `GET /oauth/authorize` then receives `client_id`,
`redirect_uri`, `scope` and `resource` for a specific authorization attempt,
and `POST /oauth/authorize/complete` is already able to resolve `request_id`
back to a `redirect_uri` that matches the client's registration - so the
server is, structurally, already holding client identity, requested scope,
redirect target and the resource being requested, keyed by `request_id`,
before the frontend ever loads. Nothing below asks for new data to be
captured; it asks for data the server already has to become readable once,
safely, before the mutating call.

## Proposed endpoint

```
GET /oauth/authorize/request/{request_id}
```

(Route naming is a suggestion, not a requirement - `GET
/oauth/authorize/request?request_id=...` works the same way. What matters is
that it is a distinct, read-only path from `POST .../complete`.)

### Authentication

Same session requirement as `POST /oauth/authorize/complete` today (i.e. the
caller must be signed in to Horizon). `request_id` is unguessable but should
not be treated as a bearer credential on its own - requiring the existing
session keeps this endpoint from becoming a way to probe arbitrary
`request_id` values signed out, and keeps its access model identical to the
endpoint it is informing.

### Response - `200 OK`

```jsonc
{
  // From the client's registration (`schemas.OAuthClientRegistrationInput`).
  // Null when the client registered without a `client_name` - the frontend
  // must render that as "this application did not provide a name," never
  // fall back to inventing one.
  "client_name": "string | null",

  // The registered redirect target's origin only (e.g. "https://mcp.example.com"),
  // not the full `redirect_uri` with its path/query - enough for the reader to
  // recognise where the grant is headed without the response doubling as a
  // second copy of the exact callback URL.
  "redirect_origin": "string",

  // Space-delimited, echoing the `scope` requested on the original
  // `GET /oauth/authorize` call (or the client's registered default scope, if
  // the authorize call omitted `scope`). Empty string if the deployment does
  // not yet model scopes - the frontend will render "no specific permissions
  // were listed" rather than inventing a scope name.
  "scope": "string",

  // Echoes `resource` from the original `GET /oauth/authorize` call, if present.
  "resource": "string | null",

  // ISO-8601. When this `request_id` stops being valid for `POST .../complete`.
  "expires_at": "string"
}
```

### Error responses

- **`404 Not Found`** - `request_id` does not exist (unknown, or already
  garbage-collected well after expiry). Body: `schemas.ErrorResponse`.
- **`410 Gone`** - `request_id` exists but is no longer usable: expired, or
  already consumed by a prior successful `POST .../complete`. Body:
  `schemas.ErrorResponse`.

Distinguishing 404 from 410 here is fine - unlike the *frontend's* copy (next
section), this is a server-to-frontend contract, not the sentence shown to
the reader. The frontend will fold both into the same generic "this link no
longer works" state rather than surfacing which one occurred; see
`mcpMissingRequestMessage` / `mcpAuthorizationFailureMessage` in
`mcpAuthorize.logic.ts`.

### Idempotency (the property this endpoint exists to have)

This call **must not** consume, extend, or otherwise mutate the
authorization request. A reader may load `McpAuthorizePage` more than once
for the same `request_id` - a slow connection retrying the page, a back
button followed by forward - and every one of those loads calls this endpoint
again before showing consent. If this endpoint had a side effect, that
back-and-forward would be exactly the kind of double-submit the frontend's
`canStartAuthorization` guard was built to prevent on the *mutating* call, and
none of that guard applies here since this is a different call by design.

`POST /oauth/authorize/complete` remains the only call that consumes
`request_id`. This new endpoint may be called any number of times against a
still-pending `request_id` and must keep returning the same answer each time.

## What does *not* change

- `POST /oauth/authorize/complete`'s request and response shape stay exactly
  as documented in `api-docs.json` today (`schemas.OAuthAuthorizeCompleteInput`
  / `...Response`). This proposal adds a sibling read, not a change to the
  mutating call.
- No new field is proposed on `GET /oauth/authorize`'s response - it already
  redirects the browser to the frontend with `request_id`, and that is
  sufficient; the new data only needs to be reachable from the frontend
  *after* that redirect, by `request_id`.
- Whether any of this requires a new persisted field, or is already
  reconstructable from what `POST .../complete` reads today, is a backend
  implementation decision this document does not make. If it needs a schema
  or migration change, that follows the repo's normal data-model consultation
  step before it is written - this document is the product requirement for
  that conversation, not a pre-approved schema.

## Frontend follow-up once this ships

`mcpConsentCopy()` in `src/features/oauth/mcpAuthorize.logic.ts` currently
takes no arguments and returns copy that names no client, because there is
nothing to name. Once this endpoint exists, that function's signature changes
to take the response above (`client_name`, `redirect_origin`, `scope`,
`resource`) and the consent screen renders the identity it was withholding.
Until then, the vague copy is intentional and should not be worked around by
inventing values on the frontend.
