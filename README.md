# Horizon Blog

A modern, feature-rich blog website built with React, TypeScript, and Chakra UI. Features a sophisticated architecture with dependency injection, repository patterns, and comprehensive documentation. Perfect for learning advanced TypeScript patterns, React development, and modern frontend architecture.

## 🎯 Project Focus

This project demonstrates **advanced frontend development** with:
- **Advanced TypeScript** - Strict typing, interfaces, generics, and architectural patterns
- **React Architecture** - Context API, custom hooks, component composition, and performance optimization
- **Modern Frontend Patterns** - Repository pattern, dependency injection, error boundaries, and SOLID principles
- **Professional UI/UX** - Accessible design with Chakra UI, responsive layouts, and smooth interactions
- **Production-Ready Code** - Comprehensive error handling, logging, testing strategies, and refactoring plans

## Features

- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI** - Clean, accessible interface built with Chakra UI components
- 📝 **Rich Text Editor** - Milkdown editor (React wrapper around Lexical) with Markdown support
- 🔍 **Search & Filter** - Advanced search functionality with filters and sorting
- 👥 **Authentication System** - JWT-based auth with login/register and session management
- 📬 **Contact Form** - Contact form with validation and error handling
- 🎯 **SEO Optimized** - Built with search engine optimization in mind
- 🏗️ **Production Architecture** - SOLID principles, DI container, repository pattern
- 🧪 **Comprehensive Documentation** - Workflow documentation, refactoring plans, and technical guides

## Tech Stack

**Core Technologies:**
- **React 18** - Modern React with hooks, concurrent features, and performance optimization
- **TypeScript 5** - Strict type checking with advanced patterns and architectural types
- **Chakra UI 2** - Accessible component library with theme customization
- **React Router DOM 6** - Client-side routing with nested routes and navigation

**Rich Text Editing:**
- **Milkdown Editor** - React wrapper around Lexical for rich text editing
  - `@milkdown/core` - Core editor functionality
  - `@milkdown/preset-commonmark` - Common markdown features
  - `@milkdown/preset-gfm` - GitHub Flavored Markdown support
  - `@milkdown/react` - React integration
  - `@milkdown/theme-nord` - Code syntax highlighting theme
  - `@milkdown/plugin-history` - Undo/redo functionality
  - `@milkdown/plugin-clipboard` - Copy/paste support
  - `@milkdown/plugin-prism` - Code syntax highlighting

**Additional Libraries:**
- **Framer Motion** - Animation library for smooth transitions
- **React Icons** - Popular icon library
- **React Markdown** - Markdown rendering with extensions
- **jwt-decode** - JWT token decoding and validation
- **Prism.js & Highlight.js** - Code syntax highlighting

**Development Tools:**
- **Vite 6** - Fast build tool and development server
- **ESLint** - Code linting with TypeScript support
- **TypeScript Compiler** - Strict type checking and compilation

## Prerequisites

Before you begin, ensure you have:
- **Node.js (v18 or higher)** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Modern web browser** - Chrome, Firefox, Safari, or Edge
- **Basic TypeScript knowledge** - Recommended for optimal learning experience

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone git@github.com:connortran216/horizon-blog.git
cd horizon-blog
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open Your Browser
Visit `http://localhost:5173` to see your blog!

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📚 Learning Path

This project is designed for **intermediate to advanced developers** learning modern frontend architecture:

### **Phase 1: Foundation (Week 1-2)**
- **Understand the codebase structure** - Review `src/` folder organization and architectural patterns
- **Learn advanced TypeScript** - Study interfaces in `src/core/types/`, dependency injection patterns
- **Component architecture** - Examine page components, layout components, and custom hooks
- **State management** - Study context usage in `src/context/AuthContext.tsx` and custom hooks

### **Phase 2: Core Features (Week 3-4)**
- **Authentication system** - Study JWT implementation in `src/core/services/auth.service.ts`
- **Service layer architecture** - Understand repository pattern in `src/core/repositories/`
- **Rich text editing** - Learn Milkdown editor integration in `src/components/editor/`
- **Error handling** - Study error boundaries and centralized error management

### **Phase 3: Advanced Topics (Week 5-6)**
- **API integration** - Study `src/core/services/api.service.ts` and HTTP client patterns
- **Dependency injection** - Understand DI container in `src/core/di/container.ts`
- **TypeScript patterns** - Learn from comprehensive type definitions in `src/core/types/`
- **Performance optimization** - Study lazy loading, error boundaries, and optimization patterns

### **Phase 4: Production Readiness (Week 7-8)**
- **SOLID principles** - Review refactoring plan in `REFACTORING_PLAN.md`
- **Testing strategies** - Study testing approach and test patterns
- **Production deployment** - Review Docker setup and build optimization
- **Monitoring and logging** - Study error tracking and performance monitoring

## 🏗️ Project Architecture

### **Core Concepts**
The project follows SOLID principles and modern architecture patterns:

- **`src/core/`** - Core business logic, types, utilities, and services
  - **`components/`** - Shared components (ErrorBoundary)
  - **`di/`** - Dependency injection container
  - **`repositories/`** - Data access layer with repository pattern
  - **`services/`** - Business logic services (auth, blog, API)
  - **`types/`** - Comprehensive TypeScript definitions
  - **`utils/`** - Helper functions and utilities

- **`src/components/`** - Reusable UI components
  - **`editor/`** - Milkdown editor components and plugins
  - **`layout/`** - Layout components (Navbar, Footer, Layout)

- **`src/pages/`** - Route-level components
  - **9 main pages** - Home, Blog listing, Blog detail, Editor, About, Contact, Login, Register, Profile

- **`src/context/`** - React context for global state
  - **AuthContext** - Authentication state management

- **`src/hooks/`** - Custom React hooks (to be added)

- **`src/config/`** - Configuration and environment setup

### **Current File Organization**
```
src/
├── core/              # Core business logic and architecture
│   ├── components/    # Shared components (ErrorBoundary)
│   ├── di/           # Dependency injection container
│   ├── repositories/ # Data access layer (repository pattern)
│   ├── services/     # Business logic services
│   │   ├── api.service.ts        # HTTP client with auth
│   │   ├── auth.service.ts       # Authentication logic
│   │   ├── blog.service.ts       # Blog business logic
│   │   ├── auth.interceptor.ts   # JWT token handling
│   │   └── storage.service.ts    # Data storage abstraction
│   ├── types/        # TypeScript type definitions
│   │   ├── auth.types.ts         # Authentication types
│   │   ├── blog.types.ts         # Blog post types
│   │   ├── blog-repository.types.ts # Repository interfaces
│   │   ├── blog-service.types.ts # Service interfaces
│   │   └── common.types.ts       # Common utility types
│   ├── utils/        # Utility functions
│   │   ├── blog.utils.ts         # Blog-related helpers
│   │   └── error.utils.ts        # Error handling utilities
│   └── index.ts      # Core exports
├── components/       # UI components organized by feature
│   ├── editor/       # Milkdown editor components
│   │   ├── MilkdownEditor.tsx    # Main editor component
│   │   └── plugins/              # Editor plugins
│   │       ├── hashtagPlugin.ts  # Hashtag functionality
│   │       └── wikiLinkPlugin.ts # Wiki link functionality
│   └── layout/       # Layout components
│       ├── Layout.tsx            # Main layout wrapper
│       ├── Navbar.tsx            # Navigation component
│       └── Footer.tsx            # Footer component
├── context/          # React context providers
│   └── AuthContext.tsx           # Authentication context
├── pages/            # Route-level page components
│   ├── Home.tsx              # Landing page
│   ├── Blog.tsx              # Blog listing with search
│   ├── BlogDetail.tsx        # Individual blog post view
│   ├── BlogEditor.tsx        # Rich text editor interface
│   ├── About.tsx             # About page
│   ├── Contact.tsx           # Contact form
│   ├── Login.tsx             # User login
│   ├── Register.tsx          # User registration
│   ├── Profile.tsx           # User profile page
│   └── ProfileBlogDetail.tsx # Profile blog detail view
├── config/           # Configuration files
│   ├── editor.config.ts      # Editor configuration
│   └── runtime.ts            # Runtime configuration
├── theme/            # Chakra UI theme customization
│   └── index.ts              # Theme configuration
├── App.tsx           # Main application component
├── Routes.tsx        # Route configuration
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## 🛠 Advanced TypeScript Patterns

### **Service Interface Pattern**
```typescript
// ✅ Good: Clear service interface
export interface IBlogService {
  createPost(data: CreateBlogPostRequest): Promise<BlogPost>;
  updatePost(id: string, data: UpdateBlogPostRequest): Promise<BlogPost>;
  getPost(id: string): Promise<BlogPost | null>;
  searchPosts(query: string): Promise<BlogPost[]>;
}

// ✅ Good: Dependency injection support
export class BlogService implements IBlogService {
  constructor(
    private blogRepository: IBlogRepository,
    private logger: ILogger
  ) {}
}
```

### **Repository Pattern**
```typescript
// ✅ Good: Abstract data access
export interface IBlogRepository {
  save(post: BlogPost): Promise<BlogPost>;
  findById(id: string): Promise<BlogPost | null>;
  findByAuthor(authorId: string): Promise<BlogPost[]>;
  search(query: string): Promise<BlogPost[]>;
}

// ✅ Good: Multiple implementations
export class LocalStorageBlogRepository implements IBlogRepository { ... }
export class APIBlogRepository implements IBlogRepository { ... }
```

### **Error Handling Pattern**
```typescript
// ✅ Good: Specific error types
export class AuthError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
    public statusCode: number
  ) {
    super(message);
  }
}

// ✅ Good: Centralized error handling
export class ErrorService {
  handle(error: Error): void {
    if (error instanceof AuthError) {
      this.handleAuthError(error);
    } else if (error instanceof BlogError) {
      this.handleBlogError(error);
    }
  }
}
```

## 🔧 Troubleshooting

### **Common Issues**

**❌ `npm install` fails**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**❌ TypeScript errors**
```bash
# Run type checking
npm run type-check

# Common fixes:
# 1. Check import paths and relative imports
# 2. Verify interface implementations
# 3. Ensure all required properties are provided
# 4. Check generic type constraints
```

**❌ Port 5173 already in use**
```bash
# Kill process using the port
npx kill-port 5173
# Or use different port
npm run dev -- --port 3000
```

**❌ Milkdown editor not loading**
- Ensure all @milkdown packages are properly installed
- Check editor configuration in `src/config/editor.config.ts`
- Verify CSS imports for editor themes

**❌ Authentication issues**
- Check localStorage for `horizon_blog_token`
- Verify JWT token format and expiration
- Review AuthContext state management

## 🗺 Development Roadmap

The project has a comprehensive refactoring plan documented in `REFACTORING_PLAN.md` that covers:

### **Phase 1: SOLID Principles Implementation**
- [ ] Extract authentication interceptor
- [ ] Create blog service layer
- [ ] Refactor AuthContext interfaces
- [ ] Complete repository pattern integration
- [ ] Implement dependency injection container

### **Phase 2: Production Infrastructure**
- [ ] Setup testing framework (Jest + React Testing Library)
- [ ] Implement centralized error handling
- [ ] Add structured logging
- [ ] Fix Docker build process
- [ ] Implement input validation

### **Phase 3: Performance & Security**
- [ ] Create custom data fetching hooks
- [ ] Implement error boundaries
- [ ] Add caching layer
- [ ] Implement lazy loading
- [ ] Add loading states & skeletons

### **Phase 4: Advanced Features**
- [ ] Add rate limiting considerations
- [ ] Implement environment variable management
- [ ] Add Content Security Policy
- [ ] Integrate error tracking (Sentry)
- [ ] Add analytics integration

### **Phase 5: Code Quality & Documentation**
- [ ] Add code quality tools (Prettier, Husky)
- [ ] Implement comprehensive testing (80%+ coverage)
- [ ] Update API documentation
- [ ] Add component documentation (Storybook)
- [ ] Create Architecture Decision Records

## 📖 Documentation

This project includes comprehensive documentation:

- **[REFACTORING_PLAN.md](./REFACTORING_PLAN.md)** - Detailed refactoring plan following SOLID principles
- **[WORKFLOW_DOCUMENTATION.md](./WORKFLOW_DOCUMENTATION.md)** - Complete workflow documentation with mermaid diagrams
- **[api-docs.json](./api-docs.json)** - API documentation for backend integration
- **Inline documentation** - Comprehensive JSDoc comments throughout the codebase

## 🏗️ Architecture Principles

### **SOLID Principles**
- **Single Responsibility**: Each class/function has one clear purpose
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes can be substituted for their base types
- **Interface Segregation**: Clients shouldn't depend on interfaces they don't use
- **Dependency Inversion**: Depend on abstractions, not concrete implementations

### **Design Patterns Used**
- **Repository Pattern** - Abstract data access
- **Dependency Injection** - Manage service dependencies
- **Factory Pattern** - Create service instances
- **Observer Pattern** - React context and event handling
- **Strategy Pattern** - Different storage implementations

## Backend Integration

This frontend is designed to work with a backend API. The project includes:

- **API Service Layer** - Centralized HTTP client in `src/core/services/api.service.ts`
- **Authentication Interceptor** - JWT token management
- **Repository Pattern** - Abstract data access for easy backend switching
- **Type Safety** - Comprehensive TypeScript interfaces for API communication

### **Required Backend Endpoints**

**Authentication:**
- `POST /auth/login` - User login
- `POST /users` - User registration
- `GET /auth/me` - Get current user

**Blog Posts:**
- `GET /posts` - List posts with filters
- `GET /posts/{id}` - Get single post
- `POST /posts` - Create new post
- `PUT /posts/{id}` - Update post
- `DELETE /posts/{id}` - Delete post

**User Management:**
- `GET /users/{id}` - Get user profile
- `GET /users/{id}/posts` - Get user's posts

See `WORKFLOW_DOCUMENTATION.md` for detailed API specifications.

## Rich Text Editor

The project uses **Milkdown** as its rich text editor, which is a React wrapper around Lexical. Milkdown provides:

### **Editor Features**
- Rich text formatting (bold, italic, underline, strikethrough)
- Headings (H1, H2, H3)
- Lists (ordered and unordered)
- Blockquotes
- Code blocks with syntax highlighting
- Tables (planned)
- Links and images (planned)
- Markdown shortcuts
- History (undo/redo)
- Auto-save functionality
- Custom plugins for hashtags and wiki links

### **Implementation Details**
The editor is implemented in:
- `src/components/editor/MilkdownEditor.tsx` - Main editor component
- `src/config/editor.config.ts` - Editor configuration
- `src/components/editor/plugins/` - Custom editor plugins
- `src/pages/BlogEditor.tsx` - Blog editor page
- `src/pages/BlogDetail.tsx` - Blog reader component

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the coding standards and add TypeScript types
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### **Contribution Guidelines**
- Follow the existing TypeScript patterns and interfaces
- Add proper error handling for all new features
- Include JSDoc comments for public APIs
- Ensure all components are accessible
- Test your changes thoroughly
- Update documentation as needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Chakra UI](https://chakra-ui.com/) for the component library
- [React Icons](https://react-icons.github.io/react-icons/) for the icons
- [Milkdown](https://milkdown.dev/) for the rich text editor
- [React Markdown](https://github.com/remarkjs/react-markdown) for markdown rendering
- [Vite](https://vitejs.dev/) for the build tool
- [TypeScript](https://www.typescriptlang.org/) for type safety

---

**Note**: This project is actively maintained and includes comprehensive documentation for developers who want to learn modern frontend development patterns, advanced TypeScript usage, and production-ready React applications.
