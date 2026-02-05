# AGENT.md

## 0. Scope and Usage
- This document is a living onboarding guide for Horizon Blog.
- Scope is frontend only unless a feature depends on the backend API.
- Use this file to preserve architectural intent and domain rules.
- Keep changes accurate to the codebase and current product decisions.
- Avoid adding speculative backend behavior.
- The owner runs the dev server and backend; do not run them yourself.
- Prefer concise PR descriptions, but keep this file descriptive.
- Use ASCII only in this file unless a non-ASCII value is required.

## 1. Persona and Golden Rules
- Persona: senior frontend architect and developer.
- Design system first: extend existing components instead of reinventing them.
- Use Chakra UI and the project theme tokens; avoid hardcoded styles.
- Build UI from small, composable React components.
- Follow SOLID principles and preserve DI and repository patterns.
- Use Yarn tooling for lint and format; avoid npm in this repo.
- Do not run dev server or backend commands; owner handles runtime.
- Minimize logging noise; prefer intentional, helpful logs.
- Document any architectural change in this file when it is non-obvious.
- Keep frontend and API contracts aligned; do not guess missing endpoints.

### 1.1 When you touch UI
- Reuse Chakra primitives with theme tokens.
- Prefer `src/components` or `src/features/<feature>/components` for UI.
- Keep layout in pages and logic in features or core services.
- Use responsive Chakra props for layout and spacing.
- Preserve a consistent visual language; do not mix new styles ad hoc.

### 1.2 When you touch business logic
- Follow the layering: repository -> service -> UI.
- Do not access `apiService` directly from pages if a service exists.
- Add types in `src/core/types` or `src/features/<feature>/*.types.ts`.
- Keep parsing and transform logic in services or utilities.
- Avoid side effects inside rendering paths.

## 2. Essential Commands (Yarn Only)
- Install dependencies: `yarn install`
- Build: `yarn build`
- Preview production build: `yarn preview`
- Lint: `yarn lint`
- Lint (fix): `yarn lint:fix`
- Format: `yarn format`
- Format (fix): `yarn format:fix`
- Do not run `yarn dev` or backend commands; owner handles runtime.

## 3. Project Summary
- Horizon Blog is a personal playground blog.
- It is used for daily writing about life, experience, and tech.
- It is free for anyone to create an account and read or publish content.
- The goal is to be a clean, well-architected frontend playground.
- The stack is React 18, TypeScript, Vite, Chakra UI, Milkdown.
- It demonstrates DI, repository pattern, and SOLID practices.
- The design system is Obsidian-inspired and Chakra-based.

## 4. Repository Map

### 4.1 Root Layout
- `AGENT.md`: onboarding guide (this file).
- `README.md`: project overview and quick start.
- `DESIGN_SYSTEM.md`: design system reference and components.
- `api-docs.json`: backend API reference snapshot.
- `index.html`: Vite entry HTML.
- `vite.config.ts`: Vite config.
- `tsconfig.json`: TS config.
- `tsconfig.node.json`: TS config for tooling.
- `package.json`: scripts and dependencies.
- `package-lock.json`: legacy lockfile; do not update with npm.
- `node_modules/`: dependencies; do not edit.
- `dist/`: build output; do not edit.
- `public/`: static assets.
- `src/`: application source.
- `server/`: backend placeholder; do not touch.

### 4.2 Source Tree (High Level)
- `src/App.tsx`: app shell and providers.
- `src/Routes.tsx`: router definitions.
- `src/index.css`: global styles.
- `src/theme/`: Chakra theme.
- `src/config/`: runtime and editor configuration.
- `src/context/`: global React context (auth).
- `src/core/`: DI, services, repositories, and domain types.
- `src/components/`: shared UI components.
- `src/pages/`: route-level pages.
- `src/utils/`: helper utilities (image upload).

### 4.3 Core Layer
- `src/core/di/container.ts`: DI container and service registry.
- `src/core/services/api.service.ts`: fetch wrapper with auth integration.
- `src/core/services/auth.service.ts`: login/register and token handling.
- `src/core/services/blog.service.ts`: blog business rules.
- `src/core/repositories/blog.repository.ts`: API data access and caching.
- `src/core/types/*.ts`: domain and API types.
- `src/core/utils/blog.utils.ts`: legacy lexical helpers.
- `src/core/utils/error.utils.ts`: error helpers.

### 4.4 Components Layer
- `src/components/layout/`: layout components (Navbar, Footer, Layout).
- `src/components/editor/`: editor components and plugins.
- `src/components/reader/`: reading components.
- `src/components/core/animations/`: animation primitives.
- `src/components/ProtectedRoute.tsx`: auth gate for protected routes.
- `src/components/Pagination*.tsx`: list pagination UI.

### 4.5 Pages Layer
- `src/pages/Home.tsx`: landing page.
- `src/pages/Blog.tsx`: list and search posts.
- `src/pages/BlogDetail.tsx`: public blog detail.
- `src/pages/BlogEditor.tsx`: create or edit blog post.
- `src/pages/Profile.tsx`: user profile and posts.
- `src/pages/ProfileBlogDetail.tsx`: profile detail view.
- `src/pages/About.tsx`: about page.
- `src/pages/Contact.tsx`: contact form.
- `src/pages/Login.tsx`: login page.
- `src/pages/Register.tsx`: registration page.

## 5. Architecture and Patterns

### 5.1 Layering and Flow
- UI components should not know the backend API shape.
- Pages compose data from services and display components.
- Services apply business rules and formatting.
- Repositories handle data access and API calls.
- DI container wires service and repository instances.

### 5.2 Dependency Injection
- DI container is in `src/core/di/container.ts`.
- Register services by interface tokens, not concrete types.
- `SERVICE_TOKENS` are the canonical keys.
- Use `getBlogService()` or `getBlogRepository()` helpers.
- Only create new services in the container if they are shared.

### 5.3 Repository Pattern
- `IBlogRepository` is the contract for blog data access.
- `ApiBlogRepository` is the concrete HTTP implementation.
- Repository implements caching and retry configuration.
- Cache uses a simple `Map` with TTL and max size.
- Repository returns a `RepositoryResult<T>` to normalize errors.
- Repository methods are async and return result objects.

### 5.4 Service Pattern
- `IBlogService` defines business logic operations.
- `BlogService` depends on `IBlogRepository` (via DI).
- It generates excerpts and reading time.
- It maps API models to UI display models.
- It should be the main interface for blog logic.

### 5.5 Error Handling
- API errors are thrown as `ApiError` with status codes.
- `authInterceptor` listens to 401 and triggers logout.
- `error.utils.ts` provides helpers for AppError and logging.
- Use `logError` sparingly; avoid noisy logs in production flows.

### 5.6 Feature-First Guidance (from lgk-fe)
- New features should live in `src/features/<feature>/`.
- A feature should include:
- `*.api.ts` for API calls.
- `*.types.ts` for feature types.
- `use<Feature>.ts` for hooks.
- `components/` for feature UI.
- Optional files like `*.format.ts`, `*.range.ts`, `*.utils.ts`.
- Pages should compose feature UI and orchestrate flows.

### 5.7 Route Composition
- `src/Routes.tsx` is the route source of truth.
- Protected routes use `ProtectedRoute`.
- Auth status is read from `AuthContext`.
- Route paths are explicit; keep this file updated when adding pages.

## 6. Tech Stack

### 6.1 Runtime
- React 18 with hooks.
- TypeScript 5 with strict typing.
- Vite 6 for build and dev.
- Chakra UI 2 for components and theming.
- React Router DOM 6 for routing.

### 6.2 Editor
- Milkdown and Crepe provide the editor experience.
- Markdown is the canonical content format.
- Lexical JSON is deprecated but still present in types.

### 6.3 Supporting Libraries
- `framer-motion` for animations.
- `jwt-decode` for JWT parsing.
- `react-markdown` with `remark-gfm` and `rehype` plugins.
- `highlight.js` and `prismjs` for syntax highlighting.

## 7. Routing and Navigation

### 7.1 Route List (from `src/Routes.tsx`)
- `/` -> `Home`
- `/blog` -> `Blog`
- `/blog/:id` -> `BlogDetail`
- `/contact` -> `Contact`
- `/about` -> `About`
- `/login` -> `Login`
- `/register` -> `Register`
- `/blog-editor` -> `BlogEditor` (protected)
- `/profile/:username` -> `Profile` (protected)
- `/profile/:username/blog/:id` -> `ProfileBlogDetail` (protected)

### 7.2 Protected Routes
- `ProtectedRoute` checks auth status and user.
- If `status === loading`, show a Chakra `Spinner`.
- If unauthenticated, redirect to `/login` and preserve destination.
- Protected routes are for authoring and profile content.

## 8. Domain-Specific Concepts

### 8.1 Blog Status
- Only two statuses are valid: `draft` and `published`.
- The type system includes `archived`, but domain rules ignore it.
- Do not add new statuses without backend support.

### 8.2 Visibility
- Published posts are public to all readers.
- Draft posts are only visible to the owner.
- The profile view can include drafts for the owner.

### 8.3 Ownership and Auth
- Any user can read published posts.
- Only the owner can edit or delete drafts.
- Editing or deletion is reserved for authenticated owners.

### 8.4 Content Model
- Markdown is the source of truth for content.
- Lexical JSON is deprecated and should not be used for new logic.
- `content_markdown` is used for rendering and summaries.
- `content_json` may still exist in API responses.

### 8.5 Tags
- Tags are freeform text with no fixed taxonomy.
- Duplicate tags should be avoided by the frontend.
- Tag ordering is provided by the backend; do not re-sort.
- Display tags as returned, without normalization.

### 8.6 Slugs and URLs
- Use the slug provided by the backend.
- Current code often uses the post `id` as slug.
- Do not generate slugs on the client as a source of truth.

### 8.7 Reading Time and Excerpts
- Reading time is derived from word count.
- `BlogService` calculates reading time from markdown.
- `BlogRepository` also has a reading time helper.
- Excerpts are derived from markdown content.

### 8.8 Editor Features
- Wiki links and hashtags are supported in editor config.
- Editor supports code blocks, lists, headings, and tables.
- Image support is enabled via Crepe and the image upload handler.

## 9. API Integration

### 9.1 Base URL
- `getRuntimeConfig()` chooses API base URL at runtime.
- Localhost uses `http://localhost:8080`.
- Production uses `https://blog-api.connortran.io.vn`.

### 9.2 API Service (`api.service.ts`)
- Uses `fetch` with JSON by default.
- Handles FormData differently for file uploads.
- Throws `ApiError` on non-2xx responses.
- Parses JSON response bodies.
- Handles 204 with an empty object.

### 9.3 Auth Interceptor
- Adds `Authorization: Bearer <token>` when token exists.
- Removes token and dispatches `auth:unauthorized` on 401.
- Skips redirect for login/register endpoints.

### 9.4 Observed Endpoints
- `POST /auth/login` for login.
- `POST /users` for registration.
- `GET /posts` for list with query params.
- `GET /posts/:id` for detail.
- `POST /posts` for create.
- `PUT /posts/:id` for update.
- `PATCH /posts/:id` for patch update.
- `DELETE /posts/:id` for delete.
- `GET /posts/search` for search.
- `GET /users/me/posts` for current user posts.
- `POST /images/upload` for image uploads.

### 9.5 API Data Shapes (Observed)
- `ApiBlogPost` fields include:
- `id`, `title`, `content_markdown`, `content_json`, `status`.
- `user_id`, `created_at`, `updated_at`, `user`.
- `ApiListPostsResponse` includes `data`, `page`, `limit`, `total`.

### 9.6 Frontend Data Shapes
- `BlogPost` extends `BaseEntity` and `BlogMetadata`.
- `BlogMetadata` includes title, subtitle, excerpt, tags, status.
- `BlogContent` includes `content_markdown` and `content_json`.
- `BlogPostSummary` is used for listings.

## 10. Authentication Model

### 10.1 Auth Types
- `LoginCredentials`: email + password.
- `RegisterData`: username, email, password, confirmPassword.
- `AuthState`: user, status, isLoading, error.

### 10.2 Storage Keys
- Token key: `horizon_blog_token`.
- User key: `horizon_blog_user` (reserved for future).
- Refresh token key: `horizon_blog_refresh_token` (reserved for future).

### 10.3 Login Flow
- `AuthService.login` validates input.
- Calls `POST /auth/login` with email and password.
- Stores JWT in localStorage.
- Decodes JWT for user profile.
- `AuthContext` updates status and user.

### 10.4 Register Flow
- `AuthService.register` validates inputs.
- Sends `name`, `email`, `password` to `POST /users`.
- Stores JWT in localStorage.
- `AuthContext` updates status and user.

### 10.5 Session Handling
- `AuthContext` restores session on startup.
- Invalid or expired tokens are removed.
- 401 triggers `auth:unauthorized` event.
- Auth context sets error on unauthorized event.
- Redirect behavior is in `auth.interceptor.ts`.

### 10.6 Validation Rules (Short)
- Username length >= 3.
- Password length >= 6.
- Email format must be valid.
- Password and confirm must match.

## 11. Editor and Content Pipeline

### 11.1 Editor Components
- `MilkdownEditor.tsx`: Milkdown-based editor.
- `MarkdownEditor.tsx`: markdown editing UI.
- `CrepeEditor.tsx`: Crepe editor wrapper.
- `CrepePreview.tsx`: preview component.
- `MilkdownReader.tsx`: read-only rendering.

### 11.2 Editor Configuration (`editor.config.ts`)
- Behavior: renderTiming (instant or blur), editGranularity (block, line, document), toggleMode (global, live, none), preservePosition, autoSave (localStorage, backend).
- Features: syntaxHighlighting, wikiLinks, hashtags, codeBlockHighlighting, gfm, history, clipboard, imageSupport.
- UI: toolbarType (floating, fixed, none), toolbarButtons, theme (nord, light, dark, custom), minHeight, placeholder, showLineNumbers, viewStyle (blog, obsidian).
- Plugins: prism theme and languages, block handles and dragDrop, tooltip delay and position.
- Custom syntax: wikiLink pattern/urlTemplate/className; hashtag pattern/urlTemplate/className.
- Shortcuts: bold, italic, strikethrough, code, link, toggleMode.
- Debug: logLifecycle, logPerformance, logDocumentStructure, enableProfiling.

### 11.3 Crepe Configuration (`crepe.config.ts`)
- Features: toolbar, imageBlock, codeBlocks, tables; latex/textColor/highlight/alignment/videoEmbed are disabled (phase 2).
- Upload: endpoint `/images/upload`, maxFileSize 10 MB, allowedTypes jpeg/png/gif/webp.
- Theme: accentColor `#8b7fc7`, useFrame true.
- Behavior: placeholder text, readOnly false, spellCheck true.

### 11.4 Image Upload Pipeline
- `ImageUploadHandler` lives in `src/utils/imageUpload.ts`.
- It validates size and MIME type from `CREPE_CONFIG`.
- It uses `FormData` and `apiService.post`.
- It expects `{ data: { url } }` response shape.
- It returns a public URL for the inserted image.

### 11.5 Markdown as Source of Truth
- Content should be stored and rendered as markdown.
- Any new logic should ignore Lexical JSON.
- Legacy code uses Lexical helper utilities; avoid extending them.

## 12. Design System and Theme

### 12.1 Design System Principles
- Built on Chakra UI with Obsidian-inspired tokens.
- Reuse tokens instead of hardcoded colors.
- Prefer composition over custom styling.
- Layout is responsive and accessible.

### 12.2 Theme File (`src/theme/index.ts`)
- `initialColorMode` is `light`.
- `useSystemColorMode` is false.
- Semantic tokens define `bg`, `text`, `border`, `accent`, `link`.
- Card, Button, Input, Textarea, Menu, Modal, Link are overridden.
- Typography uses Inter for heading and body.
- Shadows and radii are custom.

### 12.3 Semantic Tokens (Quick List)
- Background: `bg.page`, `bg.secondary`, `bg.tertiary`, `bg.elevated`.
- Borders: `border.default`, `border.subtle`.
- Text: `text.primary`, `text.secondary`, `text.tertiary`.
- Accents: `accent.primary`, `accent.hover`.
- Links: `link.default`, `link.hover`.

### 12.4 Color Palette Notes
- `obsidian.light` and `obsidian.dark` palettes exist.
- Accent colors are purple and blue variants.
- Link colors are distinct from accent colors.

### 12.5 Typography Notes
- Headings and body use Inter in theme.
- Mono font is Monaco or Menlo.
- Use `fontSizes` from theme tokens.

### 12.6 Animation and Motion
- Use `framer-motion` for complex motion.
- Use design system components like `MotionWrapper` and `ShimmerLoader`.
- Respect `useReducedMotion` when needed.

### 12.7 Design System Reference
- See `DESIGN_SYSTEM.md` for detailed component patterns.
- Keep updates in sync with the design system doc.

## 13. Component Architecture

### 13.1 Shared Components
- `src/components/layout/Layout.tsx` is the main shell.
- `src/components/layout/Navbar.tsx` and `Footer.tsx` define nav.
- `Pagination` components handle list pagination UI.
- `ProtectedRoute` gates protected routes.

### 13.2 Animation Components
- `AnimatedButton` variants are preferred for CTA buttons.
- `AnimatedCard` for interactive cards.
- `ShimmerLoader` for skeleton states.
- `ParticleSystem` and `Glassmorphism` are optional visuals.

### 13.3 Editor Components
- Editor components live under `src/components/editor`.
- Editor plugins live under `src/components/editor/plugins`.
- Plugins include hashtag and wiki link support.

### 13.4 Reader Components
- `MilkdownReader.tsx` is the read-only view.
- Use it for post detail pages.

## 14. Data Modeling

### 14.1 Core Types
- `BaseEntity`: `id`, `createdAt`, `updatedAt`.
- `User`: `id`, `username`, `avatar`, `email`.
- `Author`: `username`, `avatar`.

### 14.2 Blog Types
- `BlogStatus`: `draft`, `published`, `archived` (legacy).
- `BlogMetadata`: title, subtitle, excerpt, tags, featuredImage, status.
- `BlogContent`: `content_markdown`, `content_json`.
- `BlogPost`: base entity + metadata + author + content.
- `BlogPostSummary`: listing subset of fields.
- `BlogSearchOptions`: query, author, tags, status, sortBy, sortOrder.

### 14.3 API Types
- `ApiBlogPost`: fields match backend response.
- `ApiListPostsResponse`: list response with pagination.
- `CreatePostRequest`: fields for create.
- `UpdatePostRequest`: fields for update.
- `PatchPostRequest`: fields for patch.

## 15. Auth and Route Guards

### 15.1 AuthContext
- `AuthContext` holds `user`, `status`, `isLoading`, `error`.
- `login` and `register` functions update state.
- `logout` clears auth and user.

### 15.2 Unauthorized Handling
- `auth.interceptor` dispatches `auth:unauthorized`.
- `AuthContext` listens for this event and clears state.

### 15.3 ProtectedRoute Behavior
- Shows loading spinner while status is loading.
- Redirects to `/login` when unauthenticated.
- Preserves `location.pathname` for redirect back.

## 16. Styling Conventions

### 16.1 Chakra Usage
- Use Chakra components for layout and UI.
- Prefer theme tokens over hardcoded colors.
- Use `bg.page`, `text.primary`, `accent.primary`, etc.
- Avoid inline styles unless necessary.

### 16.2 CSS
- Global styles are in `src/index.css`.
- Editor theme CSS lives in `src/components/editor/crepe-theme.css`.
- Prefer CSS modules or Chakra props over global CSS.

### 16.3 Dark and Light Mode
- Theme supports both light and dark tokens.
- Use semantic tokens for color mode switching.
- Do not hardcode light or dark palette values.

## 17. Development Workflow

### 17.1 Commit Message Structure
- Use informative structure for future scaling.
- Format: `type(scope): short summary`.
- Example: `feat(editor): add crepe image upload flow`.
- Use concise, present-tense language.
- Add body text only when it adds clarity.

### 17.2 Feature Work Order
- Start with types and data shapes.
- Implement API layer functions if needed.
- Add or extend repository functions.
- Add or extend service functions.
- Implement UI components.
- Compose in pages.

### 17.3 Refactor Direction
- Current code is page-driven.
- Gradually refactor toward feature-first modules.
- Mirror `lgk-fe` patterns for features and pages.

### 17.4 Backend Dependencies
- If backend support is missing, do not stub or mock.
- Wait for backend support before wiring UI.

## 18. Testing Strategy
- There are no frontend tests today.
- Rely on lint and format checks.
- Consider tests only when requested by the owner.

## 19. Environment and Configuration

### 19.1 Environment Files
- `.env.development` exists.
- `.env.production` exists.
- Do not add new env files without agreement.

### 19.2 Runtime Config
- `src/config/runtime.ts` chooses API host.
- Uses localhost for dev environment.
- Uses production host otherwise.

### 19.3 Editor Config
- `src/config/editor.config.ts` is the canonical editor config.
- Use this config rather than hardcoding behavior.

### 19.4 Crepe Config
- `src/config/crepe.config.ts` defines Crepe features and upload.
- Update this config for feature toggles or upload limits.

## 20. Observability and Logging
- Logging is minimal and intentional.
- Use `console.error` for failures that require attention.
- Prefer structured error objects when possible.
- Avoid excessive `console.log` in render loops.

## 21. Common Recipes

### 21.1 Add a New Page
- Create a page component in `src/pages`.
- Add a route entry in `src/Routes.tsx`.
- If the page is protected, wrap in `ProtectedRoute`.
- Use `Layout` and existing UI components where possible.

### 21.2 Add a New Feature Module
- Create `src/features/<feature>/`.
- Add `feature.types.ts` for domain types.
- Add `feature.api.ts` for API calls.
- Add `useFeature.ts` for hooks and state.
- Add `components/` for UI.
- Use pages for composition and routing.

### 21.3 Add a New API Call
- Add a function in `*.api.ts` or repository.
- Define types for response and request.
- Use `apiService` to handle HTTP.
- Return consistent shapes for UI consumption.
- Handle 401 and errors through standard pathways.

### 21.4 Add a New Design System Component
- Prefer Chakra primitives and theme tokens.
- Put reusable UI into `src/components` or `src/components/core`.
- Keep props typed and documented.
- Update `DESIGN_SYSTEM.md` if the component is reusable.

### 21.5 Add Editor Features
- Update `editor.config.ts` for behavior changes.
- Update `crepe.config.ts` for Crepe features.
- Add or update editor plugins under `src/components/editor/plugins`.
- Ensure markdown remains source of truth.

## 22. Additional Notes
- Avoid touching `dist/`, `node_modules/`, and `package-lock.json`.
- Keep markdown content as the canonical source.
- Follow the design system instead of one-off styling.
- Keep this document updated when decisions change.
