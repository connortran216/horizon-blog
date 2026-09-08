# Screen coverage

24 product route patterns, represented by concrete demo URLs, plus two design review routes. Dynamic routes use representative fixtures.

| Area | Preview URL | Screen | Included UI |
| --- | --- | --- | --- |
| Public | / | Home | Featured writing, latest blogs and Series |
| Public | /blog | Blog discovery | Search, tags, sorting and pagination |
| Public | /blog/pGd90aWDFV | Blog reader | Prose, code, diagrams, comments and sharing |
| Public | /series | Series discovery | Connected writing, ordered by the author |
| Public | /series/database-in-technical-design | Series detail | Ordered parts and contextual reading |
| Public | /authors/connor-tran | Author | Public profile and published writing |
| Public | /about | About Horizon | The person and purpose behind the blog |
| Public | /contact | Contact | Direct email, phone and social links |
| Public | /cv | CV | Document-style experience and PDF printing |
| Account | /login | Sign in | Email and Google demo sign-in |
| Account | /login/callback | Sign-in callback | Connection success and retry |
| Account | /oauth/authorize | Connect MCP | Missing request, sign-in bridge and successful handoff |
| Account | /register | Create account | Form validation and verification handoff |
| Account | /forgot-password | Forgot password | Request and confirmation states |
| Account | /reset-password | Reset password | Validation and success states |
| Account | /verify-email | Verify email | Pending, verified and resend states |
| Author | /blog-editor | Editor | Markdown writing, formatting, images and preview |
| Author | /blog-editor/publish | Publish & schedule | Settings, Series assignment and preview |
| Author | /series/manage | Manage Series | Create, rename, reorder and delete |
| Author | /profile/connor-tran | My writing | Profile, drafts, published and scheduled writing |
| Author | /profile/connor-tran/blog/draft-web-server | Private preview | Read draft, return to editing and publish |
| Author | /analytics | Analytics overview | Date ranges, readers, trends and blog metrics |
| Author | /analytics/blog/pGd90aWDFV | Blog analytics | Completion, hearts, links and traffic sources |
| Admin | /admin/access | Access management | Search users and update demo roles |
| Design | /ui-kit | UI Kit | Tokens, components and interaction states |
| Design | /screens | All screens | The complete prototype map |

All screens share both themes and responsive layouts. The Explore prototype panel exposes generic loading, empty, error, permission-denied, not-found and success states on any route. Those controls are for design review; they do not represent real service failures. Public Contact retains direct contact links. OAuth is the MCP sign-in bridge rather than an invented scope-consent flow.

Screenshot archive: qa/*-light.png (desktop baseline), qa/*-mobile.png (light mobile baseline), qa/*-dark-desktop.png and qa/*-dark-mobile.png. Final homepage comparisons and any corrected screen captures supersede the earlier baseline.
