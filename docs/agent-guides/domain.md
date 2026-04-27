# Domain Guide

Use this guide for blog, auth, API, profile, CV/about content, editor, media, and markdown behavior.

## Blog Rules

- Valid product statuses are `draft` and `published`.
- `archived` exists as a legacy type value; do not add new archived behavior without backend support.
- Published posts are public.
- Draft posts are only visible to the owner.
- Only authenticated owners may edit or delete their drafts/posts.
- Use backend-provided slugs/ids; do not generate client slugs as source of truth.
- Tags are freeform and backend-ordered; avoid duplicate tags but do not normalize or re-sort returned tags.
- Reading time and excerpts derive from markdown.

## Content Model

- Markdown is the canonical content format.
- Use `content_markdown` for rendering and summaries.
- `content_json` may exist in API responses for legacy compatibility.
- Lexical JSON is deprecated; avoid extending Lexical helpers for new behavior.
- `MarkdownReader.tsx` is the primary public read-only blog renderer.
- `MilkdownReader.tsx` remains legacy and should not become the default public reader.

## Editor

- Editor config lives in `src/config/editor.config.ts`.
- Crepe config lives in `src/config/crepe.config.ts`.
- Wiki links, hashtags, code blocks, lists, headings, tables, and image support are configured features.
- Prefer extending Crepe's code-block preview pipeline for diagram features such as Mermaid.
- Keep diagram content in raw fenced markdown, for example fenced `mermaid` blocks.
- Do not persist rendered SVG or HTML for diagrams.
- Reuse the read-only Crepe path for preview and public reader surfaces when possible.
- Mermaid HTML labels such as `<br/>` inside node text are valid and should be preserved.
- When debugging Mermaid labels, verify populated `foreignObject` children in the rendered DOM.

## API Integration

- Runtime base URL is chosen by `getRuntimeConfig()`.
- `BE_HOST` overrides backend host.
- Local development currently targets `https://blog-api.connortran.io.vn` unless configured otherwise.
- `apiService` uses JSON by default, handles FormData uploads, parses JSON bodies, handles 204, and throws `ApiError` on non-2xx responses.
- Auth interceptor adds `Authorization: Bearer <token>` and dispatches unauthorized behavior on 401.

## Observed Endpoints

- Auth: `POST /auth/login`, `GET /auth/providers/google/start`, `POST /auth/forgot-password`, `POST /auth/reset-password`.
- Users: `POST /users`, `GET /users/me`, `PATCH /users/me`, avatar upload/delete endpoints.
- Posts: `GET /posts`, `GET /posts/:id`, `POST /posts`, `PUT /posts/:id`, `PATCH /posts/:id`, `DELETE /posts/:id`, `GET /posts/search`, `GET /users/me/posts`.
- Authors: `GET /users/:id/public-profile`, `GET /users/:id/posts`.
- Media/images: `POST /images/upload` and media endpoints in `src/features/media/media.api.ts`.
- Public author links render as `/authors/:authorName` and carry `authorId` in router state because backend still resolves public author data by id.

## Auth

- Token key: `horizon_blog_token`.
- Reserved keys: `horizon_blog_user`, `horizon_blog_refresh_token`.
- Login validates credentials, posts email/password, stores JWT, decodes initial user data, then refreshes `/users/me` on session restore.
- Google OpenID returns to `/login/callback` with `token`, `redirect_to`, and optional `error` in URL hash.
- Register sends `name`, `email`, and `password` to `POST /users`.
- Session restore removes invalid/expired tokens.
- Forgot/reset password use the corresponding auth endpoints.
- Reset token should stay in page state only.

## Content Pages

- CV/resume: user-provided resume text/PDF is source of truth. Improve wording but do not invent employers, dates, responsibilities, metrics, or outcomes.
- About page: frame Horizon around curiosity, useful notes, and endless learning. Avoid manifesto, defensive, or overly corporate language unless requested.

