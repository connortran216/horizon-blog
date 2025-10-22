# Horizon Blog - Workflow Documentation

This document provides comprehensive documentation for all major workflows in the Horizon Blog application, including mermaid diagrams and detailed descriptions to facilitate backend integration and UIUX development.

---

## Table of Contents

1. [Authentication Flow](#1-authentication-flow)
2. [User Registration Flow](#2-user-registration-flow)
3. [Session Management Flow](#3-session-management-flow)
4. [Blog Creation & Publishing Flow](#4-blog-creation--publishing-flow)
5. [Blog Editing Flow](#5-blog-editing-flow)
6. [Draft Management Flow](#6-draft-management-flow)
7. [Blog Viewing Flow](#7-blog-viewing-flow)
8. [Blog Search & Filter Flow](#8-blog-search--filter-flow)
9. [User Profile Flow](#9-user-profile-flow)
10. [Contact Form Flow](#10-contact-form-flow)

---

## 1. Authentication Flow

### Overview
The authentication flow handles user login using email and password credentials. Upon successful authentication, the backend returns a JWT token which is stored in localStorage and used for subsequent authenticated requests.

### Key Components
- **Page**: `src/pages/Login.tsx`
- **Context**: `src/context/AuthContext.tsx`
- **Service**: `src/core/services/auth.service.ts`
- **API Service**: `src/core/services/api.service.ts`

### Workflow Diagram

```mermaid
sequenceDiagram
    actor User
    participant LoginPage as Login Page<br/>(Login.tsx)
    participant AuthContext as Auth Context<br/>(AuthContext.tsx)
    participant AuthService as Auth Service<br/>(auth.service.ts)
    participant API as API Service<br/>(api.service.ts)
    participant Backend as Backend API<br/>(POST /auth/login)
    participant LocalStorage as localStorage

    User->>LoginPage: Enter email & password
    User->>LoginPage: Click "Sign in"
    LoginPage->>AuthContext: login(email, password)
    AuthContext->>AuthService: login({email, password})

    AuthService->>AuthService: Validate input
    alt Invalid credentials format
        AuthService-->>AuthContext: throw InvalidCredentialsError
        AuthContext-->>LoginPage: setError()
        LoginPage-->>User: Show error toast
    end

    AuthService->>API: POST /auth/login
    API->>Backend: fetch(POST /auth/login)<br/>{email, password}

    alt Authentication Successful
        Backend-->>API: {token, data: {id, email, name, ...}, message}
        API-->>AuthService: AuthResponse
        AuthService->>LocalStorage: Store JWT token
        AuthService->>AuthService: transformApiUserToUser(data)
        AuthService-->>AuthContext: User object
        AuthContext->>AuthContext: setUser(user)
        AuthContext-->>LoginPage: Success
        LoginPage->>LoginPage: Show success toast
        LoginPage->>LoginPage: navigate('/')
    else Authentication Failed (401)
        Backend-->>API: 401 Error
        API-->>AuthService: throw error with status 401
        AuthService-->>AuthContext: throw InvalidCredentialsError
        AuthContext->>AuthContext: setError()
        AuthContext-->>LoginPage: throw error
        LoginPage-->>User: Show error toast
    else Other API Error
        Backend-->>API: Error response
        API-->>AuthService: throw error
        AuthService-->>AuthContext: throw AuthError
        AuthContext-->>LoginPage: error
        LoginPage-->>User: Show error toast
    end
```

### Data Flow

**Request to Backend:**
```json
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response from Backend:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Login successful"
}
```

**Transformed User Object (Frontend):**
```typescript
{
  username: "John Doe",  // Mapped from API 'name'
  email: "user@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John%20Doe"
}
```

### Error Handling

| Error Type | HTTP Status | Frontend Handling |
|------------|-------------|-------------------|
| Invalid Credentials | 401 | Display "Invalid username or password" |
| Network Error | - | Display "Login failed. Please try again." |
| Validation Error | - | Display specific validation message |
| Server Error | 500 | Display "Login failed. Please try again." |

### Storage

- **JWT Token**: Stored in `localStorage` with key `horizon_blog_token`
- **User Object**: Stored in React Context (memory only)

---

## 2. User Registration Flow

### Overview
New users can register by providing username, email, and password. The frontend validates input and sends registration data to the backend. Upon successful registration, the user is automatically logged in.

### Key Components
- **Page**: `src/pages/Register.tsx`
- **Context**: `src/context/AuthContext.tsx`
- **Service**: `src/core/services/auth.service.ts`
- **API Service**: `src/core/services/api.service.ts`

### Workflow Diagram

```mermaid
sequenceDiagram
    actor User
    participant RegisterPage as Register Page<br/>(Register.tsx)
    participant AuthContext as Auth Context<br/>(AuthContext.tsx)
    participant AuthService as Auth Service<br/>(auth.service.ts)
    participant API as API Service<br/>(api.service.ts)
    participant Backend as Backend API<br/>(POST /users)

    User->>RegisterPage: Enter username, email, password
    User->>RegisterPage: Click "Sign up"
    RegisterPage->>AuthContext: register(data)
    AuthContext->>AuthService: register(data)

    AuthService->>AuthService: validateRegistrationData()

    alt Validation Fails
        AuthService-->>AuthContext: throw AuthError
        AuthContext-->>RegisterPage: error
        RegisterPage-->>User: Show error toast
    end

    alt Username < 3 characters
        AuthService-->>User: "Username must be at least 3 characters"
    else Invalid Email Format
        AuthService-->>User: "Please enter a valid email address"
    else Password < 6 characters
        AuthService-->>User: "Password must be at least 6 characters"
    else Passwords Don't Match
        AuthService-->>User: "Passwords do not match"
    end

    AuthService->>API: POST /users<br/>{name, email, password}
    API->>Backend: fetch(POST /users)

    alt Registration Successful
        Backend-->>API: {token, data: {id, email, name, ...}, message}
        API-->>AuthService: AuthResponse
        AuthService->>AuthService: transformApiUserToUser(data)
        AuthService-->>AuthContext: User object
        AuthContext->>AuthContext: setUser(user)
        AuthContext-->>RegisterPage: Success
        RegisterPage->>RegisterPage: Show success toast
        RegisterPage->>RegisterPage: navigate('/')
    else User Already Exists (409)
        Backend-->>API: 409 Conflict
        API-->>AuthService: error with status 409
        AuthService-->>AuthContext: throw UserAlreadyExistsError
        AuthContext-->>RegisterPage: error
        RegisterPage-->>User: Show "User already exists" toast
    else Other Error
        Backend-->>API: Error response
        API-->>AuthService: throw error
        AuthService-->>AuthContext: throw AuthError
        AuthContext-->>RegisterPage: error
        RegisterPage-->>User: Show error toast
    end
```

### Data Flow

**Request to Backend:**
```json
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response from Backend:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "User created successfully"
}
```

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Username | Min 3 characters | "Username must be at least 3 characters long" |
| Email | Valid email format | "Please enter a valid email address" |
| Password | Min 6 characters | "Password must be at least 6 characters long" |
| Confirm Password | Match password | "Passwords do not match" |

---

## 3. Session Management Flow

### Overview
Session management handles maintaining user authentication state across page refreshes and managing logout. Uses JWT token stored in localStorage with Authorization headers for API requests.

### Key Components
- **Context**: `src/context/AuthContext.tsx`
- **Service**: `src/core/services/auth.service.ts`
- **Layout**: `src/components/layout/Navbar.tsx`

### Workflow Diagram

```mermaid
sequenceDiagram
    actor User
    participant App as App Component
    participant AuthContext as Auth Context
    participant LocalStorage as localStorage
    participant Navbar as Navbar Component
    participant AuthService as Auth Service
    participant APIService as API Service
    participant Backend as Backend API

    Note over App,LocalStorage: Session Initialization (Page Load)
    App->>AuthContext: Initialize AuthProvider
    AuthContext->>LocalStorage: Check for JWT token

    alt Token Exists
        AuthContext->>AuthService: getCurrentUser()
        AuthService->>APIService: GET /auth/me<br/>Authorization: Bearer {token}
        APIService->>Backend: Validate token
        Backend-->>APIService: User data
        APIService-->>AuthService: User object
        AuthService-->>AuthContext: Restored user
        AuthContext->>AuthContext: setUser(user)
    else Token Invalid/Expired
        Backend-->>APIService: 401 Error
        APIService-->>AuthService: Error
        AuthService-->>AuthContext: null
        AuthContext->>LocalStorage: Remove token
    else No Token
        AuthContext->>AuthContext: user = null
    end

    Note over User,APIService: Active Session (User Logged In)
    loop Every API Request
        App->>APIService: API call with headers
        APIService->>LocalStorage: Get JWT token
        APIService->>APIService: Add Authorization header
        APIService->>Backend: GET/POST/etc with Authorization

        alt Token Valid
            Backend-->>APIService: Success response
            APIService-->>App: Data
        else Token Expired/Invalid (401)
            Backend-->>APIService: 401 Error
            APIService->>APIService: Clear token + dispatch event
            APIService->>AuthContext: auth:unauthorized event
            AuthContext->>AuthContext: setUser(null)
            AuthContext->>AuthContext: setError('Session expired...')
            APIService->>APIService: Redirect to /login
        end
    end

    Note over User,AuthService: Logout Flow
    User->>Navbar: Click "Logout"
    Navbar->>AuthContext: logout()
    AuthContext->>AuthService: logout()
    AuthService->>LocalStorage: removeItem('horizon_blog_token')
    AuthService-->>AuthContext: Success
    AuthContext->>AuthContext: setUser(null)
    AuthContext-->>AuthContext: setError(null)
    AuthContext-->>Navbar: Complete
    Navbar->>Navbar: navigate('/login')
```

### Session Storage

**Current Implementation:**
- JWT token stored in `localStorage` with key `horizon_blog_token`
- User object stored in React Context (memory)
- Session restored on page refresh using `GET /auth/me` endpoint
- API requests include `Authorization: Bearer {token}` headers
- Automatic logout on expired/invalid tokens (401 responses)

---

## 4. Blog Creation & Publishing Flow

### Overview
Authenticated users can create and publish blog posts using the Lexical rich text editor. The editor supports auto-save to drafts and manual publishing.

### Key Components
- **Page**: `src/pages/BlogEditor.tsx`
- **Service**: `src/core/services/storage.service.ts`
- **Utils**: `src/core/utils/blog.utils.ts`
- **Editor**: `@lexical/react` (Lexical Editor)

### Workflow Diagram

```mermaid
sequenceDiagram
    actor User
    participant BlogEditor as Blog Editor Page<br/>(BlogEditor.tsx)
    participant LexicalEditor as Lexical Editor
    participant StorageService as Storage Service
    participant LocalStorage as localStorage
    participant Navbar as Navbar
    participant Backend as Backend API<br/>(POST /posts)

    Note over User,Backend: Editor Initialization
    User->>BlogEditor: Navigate to /blog-editor
    BlogEditor->>BlogEditor: Initialize new draft
    BlogEditor->>BlogEditor: Generate unique ID
    BlogEditor->>LexicalEditor: Initialize empty editor

    Note over User,Backend: Content Creation
    User->>BlogEditor: Enter blog title
    User->>LexicalEditor: Type content
    LexicalEditor->>BlogEditor: registerUpdateListener()
    LexicalEditor->>BlogEditor: Serialize editor state
    BlogEditor->>BlogEditor: setEditorState(serializedState)

    Note over User,Backend: Auto-Save (every 2 seconds)
    loop Every 2 seconds (if title and content exist)
        BlogEditor->>BlogEditor: autoSave()
        BlogEditor->>StorageService: saveBlogPost(draft)
        StorageService->>LocalStorage: Save draft post
        LocalStorage-->>StorageService: Success
        StorageService-->>BlogEditor: {success: true, data: BlogPost}
        BlogEditor->>BlogEditor: setIsSaving(false)
    end

    Note over User,Backend: Publishing Flow
    User->>Navbar: Click "Publish"
    Navbar->>BlogEditor: window.editorState.handlePublish()

    BlogEditor->>BlogEditor: Validate title
    alt Title is empty
        BlogEditor-->>User: Show error toast
    end

    BlogEditor->>BlogEditor: Create BlogPost object<br/>(status: 'published')
    BlogEditor->>StorageService: saveBlogPost(publishedPost)

    Note over StorageService,Backend: Current: localStorage<br/>Future: API call
    StorageService->>LocalStorage: Save published post
    LocalStorage-->>StorageService: Success

    Note over StorageService,Backend: Future Backend Integration
    StorageService->>Backend: POST /posts<br/>{title, content, author, ...}
    Backend-->>StorageService: {id, slug, ...}

    StorageService-->>BlogEditor: {success: true, data: BlogPost}
    BlogEditor->>BlogEditor: Show success toast
    BlogEditor->>BlogEditor: navigate(`/blog/${postId}`)
```

### Data Flow

**Blog Post Object Structure:**
```typescript
{
  id: "generated_id",
  title: "My Blog Post",
  content: {
    blocks: {
      root: {
        children: [...], // Lexical nodes
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1
      }
    }
  },
  author: {
    username: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John%20Doe"
  },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  status: "published", // or "draft"
  readingTime: 5,
  slug: "my-blog-post",
  viewCount: 0,
  likeCount: 0
}
```

**Backend API Request (Future):**
```json
POST /posts
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "title": "My Blog Post",
  "content": {
    "blocks": {...}
  },
  "status": "published",
  "slug": "my-blog-post"
}
```

**Backend API Response (Expected):**
```json
{
  "id": 123,
  "title": "My Blog Post",
  "content": {...},
  "author": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "slug": "my-blog-post",
  "status": "published",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Auto-Save Behavior

- **Trigger**: Content or title changes
- **Delay**: 2 seconds after last change
- **Condition**: Both title and content must exist
- **Status**: Saves as "draft"
- **Feedback**: Shows "Saving..." indicator

---

## 5. Blog Editing Flow

### Overview
Users can edit their existing blog posts (both drafts and published). The editor loads existing content and allows modifications.

### Key Components
- **Page**: `src/pages/BlogEditor.tsx`
- **Service**: `src/core/services/storage.service.ts`

### Workflow Diagram

```mermaid
sequenceDiagram
    actor User
    participant BlogPage as Blog/Profile Page
    participant BlogEditor as Blog Editor
    participant StorageService as Storage Service
    participant LocalStorage as localStorage
    participant LexicalEditor as Lexical Editor
    participant Backend as Backend API

    Note over User,Backend: Navigation to Editor
    User->>BlogPage: Click "Edit" on blog post
    BlogPage->>BlogEditor: navigate('/blog-editor?draftId=123')<br/>OR state: {blog: {...}}

    Note over User,Backend: Loading Existing Content
    BlogEditor->>BlogEditor: useEffect() on mount
    BlogEditor->>BlogEditor: Parse URL params or state

    alt Load by ID (from URL)
        BlogEditor->>StorageService: getBlogPost(draftId)
        StorageService->>LocalStorage: Retrieve post
        LocalStorage-->>StorageService: BlogPost data

        Note over StorageService,Backend: Future: GET /posts/{id}
        StorageService->>Backend: GET /posts/{id}
        Backend-->>StorageService: BlogPost data

        StorageService-->>BlogEditor: {success: true, data: BlogPost}
    else Load from state (from navigation)
        BlogEditor->>BlogEditor: Use blog from location.state
    end

    BlogEditor->>BlogEditor: setTitle(blog.title)
    BlogEditor->>BlogEditor: setBlogId(blog.id)
    BlogEditor->>BlogEditor: Extract content from blog
    BlogEditor->>LexicalEditor: Initialize with existing content
    LexicalEditor->>LexicalEditor: Render editor with content
    BlogEditor->>BlogEditor: setIsLoading(false)

    Note over User,Backend: Editing Content
    User->>LexicalEditor: Modify content
    LexicalEditor->>BlogEditor: Update editor state

    loop Auto-save every 2 seconds
        BlogEditor->>StorageService: updateBlogPost(id, updates)
        StorageService->>LocalStorage: Update post

        Note over StorageService,Backend: Future: PATCH /posts/{id}
        StorageService->>Backend: PATCH /posts/{id}
        Backend-->>StorageService: Updated post

        LocalStorage-->>BlogEditor: Success
    end

    Note over User,Backend: Re-Publishing
    User->>BlogEditor: Click "Publish"
    BlogEditor->>BlogEditor: Create updated BlogPost<br/>(preserve createdAt, update updatedAt)
    BlogEditor->>StorageService: saveBlogPost(updatedPost)
    StorageService->>LocalStorage: Save updated post

    Note over StorageService,Backend: Future: PUT /posts/{id}
    StorageService->>Backend: PUT /posts/{id}
    Backend-->>StorageService: Updated post

    StorageService-->>BlogEditor: Success
    BlogEditor->>BlogEditor: Show "updated successfully" toast
    BlogEditor->>BlogEditor: navigate(`/blog/${postId}`)
```

### URL Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `draftId` | ID of the blog post to edit | `/blog-editor?draftId=abc123` |

### State Navigation

```typescript
navigate('/blog-editor', {
  state: {
    blog: blogPostObject
  }
});
```

---

## 6. Draft Management Flow

### Overview
Users can view and manage their draft blog posts from their profile page.

### Key Components
- **Page**: `src/pages/Profile.tsx`
- **Service**: `src/core/services/storage.service.ts`

### Workflow Diagram

```mermaid
sequenceDiagram
    actor User
    participant ProfilePage as Profile Page<br/>(Profile.tsx)
    participant StorageService as Storage Service
    participant LocalStorage as localStorage
    participant BlogEditor as Blog Editor
    participant Backend as Backend API

    Note over User,Backend: Loading Drafts
    User->>ProfilePage: Navigate to /profile/:username
    ProfilePage->>ProfilePage: Click "Drafts" tab
    ProfilePage->>StorageService: getUserDrafts(username)

    StorageService->>LocalStorage: Get all posts
    StorageService->>StorageService: Filter by:<br/>- author.username === username<br/>- status === 'draft'

    Note over StorageService,Backend: Future: GET /users/{id}/posts?status=draft
    StorageService->>Backend: GET /users/{id}/posts?status=draft
    Backend-->>StorageService: Draft posts array

    LocalStorage-->>StorageService: Filtered drafts
    StorageService-->>ProfilePage: {success: true, data: drafts[]}
    ProfilePage->>ProfilePage: Display draft list

    Note over User,Backend: Continue Editing Draft
    User->>ProfilePage: Click on draft
    ProfilePage->>BlogEditor: navigate('/blog-editor?draftId=123')
    Note over BlogEditor: See Blog Editing Flow

    Note over User,Backend: Delete Draft
    User->>ProfilePage: Click "Delete" on draft
    ProfilePage->>ProfilePage: Show confirmation dialog
    User->>ProfilePage: Confirm deletion
    ProfilePage->>StorageService: deleteBlogPost(draftId)

    StorageService->>LocalStorage: Remove post by ID

    Note over StorageService,Backend: Future: DELETE /posts/{id}
    StorageService->>Backend: DELETE /posts/{id}
    Backend-->>StorageService: Success

    StorageService-->>ProfilePage: {success: true, data: true}
    ProfilePage->>ProfilePage: Remove from draft list
    ProfilePage->>ProfilePage: Show "Draft deleted" toast
```

---

## 7. Blog Viewing Flow

### Overview
Users can view published blog posts with rendered content from the Lexical editor.

### Key Components
- **Page**: `src/pages/BlogDetail.tsx`
- **Service**: `src/core/services/storage.service.ts`

### Workflow Diagram

```mermaid
sequenceDiagram
    actor User
    participant BlogList as Blog Listing
    participant BlogDetail as Blog Detail Page<br/>(BlogDetail.tsx)
    participant StorageService as Storage Service
    participant LocalStorage as localStorage
    participant LexicalEditor as Lexical Editor<br/>(Read-only)
    participant Backend as Backend API

    Note over User,Backend: Navigation
    User->>BlogList: Click on blog post
    BlogList->>BlogDetail: navigate('/blog/:id')

    Note over User,Backend: Loading Blog Post
    BlogDetail->>BlogDetail: Extract id from URL params
    BlogDetail->>StorageService: getBlogPost(id)

    StorageService->>LocalStorage: Retrieve post by ID

    Note over StorageService,Backend: Future: GET /posts/{id}
    StorageService->>Backend: GET /posts/{id}
    Backend-->>StorageService: BlogPost data

    alt Post Found
        LocalStorage-->>StorageService: BlogPost data
        StorageService-->>BlogDetail: {success: true, data: post}

        BlogDetail->>BlogDetail: Display metadata:<br/>- Title<br/>- Author<br/>- Date<br/>- Reading time

        BlogDetail->>LexicalEditor: Initialize with content<br/>(editable: false)
        LexicalEditor->>LexicalEditor: Render formatted content
        LexicalEditor-->>BlogDetail: Display rendered content

        Note over BlogDetail,Backend: Increment View Count
        BlogDetail->>StorageService: updateBlogPost(id, {viewCount: ++})
        StorageService->>LocalStorage: Update view count

        Note over StorageService,Backend: Future: POST /posts/{id}/view
        StorageService->>Backend: POST /posts/{id}/view
        Backend-->>StorageService: Updated view count

    else Post Not Found
        StorageService-->>BlogDetail: {success: false, error: "not found"}
        BlogDetail->>BlogDetail: Show "Post not found" message
        BlogDetail->>BlogDetail: navigate('/blog')
    end

    Note over User,Backend: Author Actions (if owner)
    alt User is author
        BlogDetail->>BlogDetail: Show "Edit" button
        User->>BlogDetail: Click "Edit"
        BlogDetail->>BlogEditor: navigate('/blog-editor', {state: {blog}})
    end
```

### Content Rendering

The blog detail page uses the Lexical editor in read-only mode to render rich text content with proper formatting:
- Headings (H1, H2, H3)
- Paragraphs
- Lists (ordered/unordered)
- Quotes
- Bold, italic, underline, strikethrough
- Links

---

## 8. Blog Search & Filter Flow

### Overview
Users can search and filter blog posts on the blog listing page.

### Key Components
- **Page**: `src/pages/Blog.tsx`
- **Service**: `src/core/services/storage.service.ts`

### Workflow Diagram

```mermaid
sequenceDiagram
    actor User
    participant BlogPage as Blog Page<br/>(Blog.tsx)
    participant StorageService as Storage Service
    participant LocalStorage as localStorage
    participant Backend as Backend API

    Note over User,Backend: Initial Load
    User->>BlogPage: Navigate to /blog
    BlogPage->>StorageService: getBlogPosts({status: 'published'})

    StorageService->>LocalStorage: Get all posts
    StorageService->>StorageService: Filter by status === 'published'
    StorageService->>StorageService: Sort by createdAt desc

    Note over StorageService,Backend: Future: GET /posts?status=published
    StorageService->>Backend: GET /posts?status=published&sort=created_at:desc
    Backend-->>StorageService: Published posts array

    LocalStorage-->>StorageService: Filtered posts
    StorageService-->>BlogPage: {success: true, data: posts[]}
    BlogPage->>BlogPage: Display blog list

    Note over User,Backend: Search Flow
    User->>BlogPage: Type in search box
    BlogPage->>BlogPage: Debounce input (500ms)
    BlogPage->>StorageService: getBlogPosts({query: "search term"})

    StorageService->>StorageService: Filter posts by:<br/>- title contains query<br/>- content contains query

    Note over StorageService,Backend: Future: GET /posts?q=search+term
    StorageService->>Backend: GET /posts?q=search+term
    Backend-->>StorageService: Matching posts

    StorageService-->>BlogPage: Filtered results
    BlogPage->>BlogPage: Update display

    Note over User,Backend: Filter by Tag
    User->>BlogPage: Click tag filter
    BlogPage->>StorageService: getBlogPosts({tags: ["react"]})

    StorageService->>StorageService: Filter posts where tags includes "react"

    Note over StorageService,Backend: Future: GET /posts?tags=react
    StorageService->>Backend: GET /posts?tags=react
    Backend-->>StorageService: Tagged posts

    StorageService-->>BlogPage: Filtered results
    BlogPage->>BlogPage: Update display

    Note over User,Backend: Sort Options
    User->>BlogPage: Select sort option
    BlogPage->>StorageService: getBlogPosts({<br/>  sortBy: "viewCount",<br/>  sortOrder: "desc"<br/>})

    StorageService->>StorageService: Sort posts by selected field

    Note over StorageService,Backend: Future: GET /posts?sort=view_count:desc
    StorageService->>Backend: GET /posts?sort=view_count:desc
    Backend-->>StorageService: Sorted posts

    StorageService-->>BlogPage: Sorted results
    BlogPage->>BlogPage: Update display

    Note over User,Backend: Pagination (Future)
    User->>BlogPage: Click "Load more" / Page number
    BlogPage->>StorageService: getBlogPosts({<br/>  limit: 10,<br/>  offset: 10<br/>})

    Note over StorageService,Backend: Future: GET /posts?limit=10&offset=10
    StorageService->>Backend: GET /posts?limit=10&offset=10
    Backend-->>StorageService: Next page posts

    StorageService-->>BlogPage: Next page results
    BlogPage->>BlogPage: Append/Replace display
```

### Search Options Interface

```typescript
interface BlogSearchOptions {
  query?: string;           // Text search
  author?: string;          // Filter by author username
  tags?: string[];          // Filter by tags
  status?: BlogStatus;      // Filter by status (draft/published)
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'viewCount' | 'author';
  sortOrder?: 'asc' | 'desc';
  limit?: number;           // Pagination limit
  offset?: number;          // Pagination offset
}
```

### Backend API Recommendations

```
GET /posts?q={query}&tags={tag1,tag2}&sort={field}:{order}&limit={n}&offset={m}

Examples:
- GET /posts?q=react&tags=javascript,frontend&sort=created_at:desc&limit=10&offset=0
- GET /posts?author=john-doe&status=published&sort=view_count:desc
```

---

## 9. User Profile Flow

### Overview
Users can view their profile with published posts and drafts tabs.

### Key Components
- **Page**: `src/pages/Profile.tsx`
- **Service**: `src/core/services/storage.service.ts`

### Workflow Diagram

```mermaid
sequenceDiagram
    actor User
    participant ProfilePage as Profile Page<br/>(Profile.tsx)
    participant StorageService as Storage Service
    participant LocalStorage as localStorage
    participant AuthContext as Auth Context
    participant Backend as Backend API

    Note over User,Backend: Profile Load
    User->>ProfilePage: Navigate to /profile/:username
    ProfilePage->>ProfilePage: Extract username from URL

    alt Viewing own profile
        ProfilePage->>AuthContext: Get current user
        AuthContext-->>ProfilePage: user object
        ProfilePage->>ProfilePage: isOwnProfile = true
    else Viewing other's profile
        ProfilePage->>ProfilePage: isOwnProfile = false
    end

    Note over User,Backend: Load Published Posts
    ProfilePage->>StorageService: getUserBlogPosts(username, {status: 'published'})

    StorageService->>LocalStorage: Get all posts
    StorageService->>StorageService: Filter by:<br/>- author.username === username<br/>- status === 'published'

    Note over StorageService,Backend: Future: GET /users/{id}/posts?status=published
    StorageService->>Backend: GET /users/{id}/posts?status=published
    Backend-->>StorageService: User's published posts

    StorageService-->>ProfilePage: {success: true, data: posts[]}
    ProfilePage->>ProfilePage: Display published posts

    Note over User,Backend: Switch to Drafts Tab (Own Profile Only)
    alt isOwnProfile
        User->>ProfilePage: Click "Drafts" tab
        ProfilePage->>StorageService: getUserDrafts(username)

        StorageService->>LocalStorage: Get all posts
        StorageService->>StorageService: Filter by:<br/>- author.username === username<br/>- status === 'draft'

        Note over StorageService,Backend: Future: GET /users/{id}/posts?status=draft
        StorageService->>Backend: GET /users/{id}/posts?status=draft
        Backend-->>StorageService: User's draft posts

        StorageService-->>ProfilePage: {success: true, data: drafts[]}
        ProfilePage->>ProfilePage: Display drafts with:<br/>- "Edit" button<br/>- "Delete" button
    end

    Note over User,Backend: Profile Statistics (Future)
    Note over ProfilePage,Backend: Future: GET /users/{id}/stats
    ProfilePage->>Backend: GET /users/{id}/stats
    Backend-->>ProfilePage: {<br/>  total_posts: 25,<br/>  total_views: 1234,<br/>  total_likes: 567<br/>}
    ProfilePage->>ProfilePage: Display statistics
```

### Profile Data Structure

```typescript
interface UserProfile {
  username: string;
  email?: string;      // Only visible to owner
  avatar: string;
  bio?: string;
  joinedDate: string;
  stats: {
    totalPosts: number;
    totalViews: number;
    totalLikes: number;
  };
}
```

---

## 10. Contact Form Flow

### Overview
Users can submit contact messages through a form. Currently stores locally but should send to backend.

### Key Components
- **Page**: `src/pages/Contact.tsx`

### Workflow Diagram

```mermaid
sequenceDiagram
    actor User
    participant ContactPage as Contact Page<br/>(Contact.tsx)
    participant ValidationService as Form Validation
    participant Backend as Backend API<br/>(POST /contact)
    participant EmailService as Email Service<br/>(Backend)

    Note over User,Backend: Form Interaction
    User->>ContactPage: Navigate to /contact
    ContactPage->>ContactPage: Display contact form

    User->>ContactPage: Enter name, email, message
    User->>ContactPage: Click "Submit"

    Note over User,Backend: Validation
    ContactPage->>ValidationService: Validate form data

    alt Validation Failed
        ValidationService-->>ContactPage: Validation errors
        ContactPage-->>User: Show field errors
    end

    ValidationService->>ValidationService: Check:<br/>- Name not empty<br/>- Valid email format<br/>- Message min length

    Note over User,Backend: Submit to Backend (Future)
    ContactPage->>Backend: POST /contact<br/>{name, email, message}

    alt Submission Successful
        Backend->>EmailService: Send notification email
        EmailService-->>Backend: Email sent
        Backend-->>ContactPage: {success: true, message: "Message sent"}
        ContactPage->>ContactPage: Clear form
        ContactPage->>ContactPage: Show success toast
    else Submission Failed
        Backend-->>ContactPage: {success: false, error: "..."}
        ContactPage->>ContactPage: Show error toast
        ContactPage->>ContactPage: Keep form data
    end

    Note over User,Backend: Admin Notification (Backend)
    EmailService->>Admin: Email: New contact message
```

### Contact Form Data

**Request Structure:**
```json
POST /contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about services",
  "message": "I would like to know more about..."
}
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Thank you for your message. We'll get back to you soon!",
  "id": 123
}
```

---

## Summary of Backend API Endpoints Needed

### Authentication Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/auth/login` | User login | Implemented |
| POST | `/users` | User registration | Implemented |
| GET | `/auth/me` | Get current user | Needed |
| POST | `/auth/logout` | Logout user | Needed |
| POST | `/auth/refresh` | Refresh token | Needed |

### Blog Post Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/posts` | List posts with filters | Needed |
| GET | `/posts/{id}` | Get single post | Needed |
| POST | `/posts` | Create new post | Needed |
| PUT | `/posts/{id}` | Update post | Needed |
| PATCH | `/posts/{id}` | Partial update | Needed |
| DELETE | `/posts/{id}` | Delete post | Needed |
| POST | `/posts/{id}/view` | Increment view count | Needed |
| POST | `/posts/{id}/like` | Like/unlike post | Needed |

### User Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/users/{id}` | Get user profile | Needed |
| GET | `/users/{id}/posts` | Get user's posts | Needed |
| GET | `/users/{id}/stats` | Get user statistics | Needed |
| PATCH | `/users/{id}` | Update user profile | Needed |

### Contact Endpoint
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/contact` | Submit contact form | Needed |

---

## Frontend-Backend Data Mapping

### User Object

| Frontend Field | Backend Field | Notes |
|----------------|---------------|-------|
| `username` | `name` | Frontend uses "username" |
| `email` | `email` | - |
| `avatar` | Generated | Frontend generates from username |
| - | `id` | Backend only |
| - | `created_at` | Backend only |
| - | `updated_at` | Backend only |

### Blog Post Object

| Frontend Field | Backend Field | Notes |
|----------------|---------------|-------|
| `id` | `id` | Generated by backend |
| `title` | `title` | - |
| `content.blocks` | `content` | Lexical JSON state |
| `author.username` | `author.name` | Mapping needed |
| `author.avatar` | Generated | Frontend generates |
| `createdAt` | `created_at` | ISO 8601 format |
| `updatedAt` | `updated_at` | ISO 8601 format |
| `status` | `status` | "draft" \| "published" \| "archived" |
| `slug` | `slug` | URL-friendly identifier |
| `readingTime` | Calculated | Minutes to read |
| `viewCount` | `view_count` | Default: 0 |
| `likeCount` | `like_count` | Default: 0 |
| `tags` | `tags` | Array of strings |
| `excerpt` | `excerpt` | Short description |
| `featuredImage` | `featured_image` | Image URL |

---

## Current vs Future State

### Current Implementation (localStorage)
- All data stored in browser localStorage
- No server persistence
- Data lost when localStorage cleared
- No multi-device sync
- No authentication persistence on refresh

### Future Implementation (Backend API)
- Data persisted in database
- Multi-device sync
- Proper authentication with JWT
- Session persistence
- Real-time updates (optional)
- Analytics and metrics
- Search optimization

---

## Integration Checklist

- [ ] Implement all backend API endpoints listed above
- [ ] Update frontend services to call backend APIs instead of localStorage
- [ ] Implement JWT authentication with refresh tokens
- [ ] Add `/auth/me` endpoint for session restoration
- [ ] Transform data between frontend and backend formats
- [ ] Implement proper error handling for API calls
- [ ] Add loading states for async operations
- [ ] Implement optimistic UI updates
- [ ] Add retry logic for failed requests
- [ ] Implement request caching where appropriate
- [ ] Add analytics tracking
- [ ] Implement rate limiting on sensitive endpoints
- [ ] Add input validation on backend
- [ ] Implement file upload for featured images
- [ ] Add email notifications
- [ ] Implement search indexing
- [ ] Add pagination for large datasets

---

## Technologies Used

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router DOM** - Client-side routing
- **Chakra UI** - UI component library
- **Lexical Editor** - Rich text editing
- **Context API** - State management

### Backend (Recommended)
- **Go (Golang)** - Backend language
- **Gin/Echo** - HTTP framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Redis** - Caching (optional)

---

## Notes for Backend Development

1. **Authentication**: Implement JWT with httpOnly cookies for security
2. **Content Storage**: Store Lexical JSON as JSONB in PostgreSQL
3. **Slug Generation**: Ensure unique slugs for blog posts
4. **Search**: Implement full-text search on title and content
5. **Validation**: Validate all inputs on backend
6. **Rate Limiting**: Protect endpoints from abuse
7. **CORS**: Configure properly for frontend domain
8. **Error Responses**: Use consistent error format
9. **Pagination**: Implement cursor or offset pagination
10. **Caching**: Cache frequently accessed posts

---

This documentation provides a comprehensive overview of all workflows in the Horizon Blog application. Use it as a reference for backend integration and frontend development.
