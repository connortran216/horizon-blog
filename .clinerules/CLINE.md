# Horizon Blog Development Rules

This document establishes comprehensive coding standards, architectural patterns, and development guidelines for the Horizon Blog project. These rules ensure consistency, maintainability, and adherence to advanced React/TypeScript development practices.

## Table of Contents

1. [Project Structure & Organization](#project-structure--organization)
2. [TypeScript & Code Quality Standards](#typescript--code-quality-standards)
3. [SOLID Principles Implementation](#solid-principles-implementation)
4. [API & Service Layer Standards](#api--service-layer-standards)
5. [Component & UI Standards](#component--ui-standards)
6. [Code Formatting & Style](#code-formatting--style)
7. [Testing & Quality Assurance](#testing--quality-assurance)
8. [Build & Deployment Standards](#build--deployment-standards)
9. [Performance & Optimization](#performance--optimization)
10. [Security Standards](#security-standards)
11. [Backend Integration Rules](#backend-integration-rules)
12. [Error & Logging Standards](#error--logging-standards)
13. [Accessibility & UX Standards](#accessibility--ux-standards)

## Project Structure & Organization

### 1. File & Folder Naming Conventions

- **Folders**: lowercase-with-hyphens (e.g., `src/core/services/`)
- **Files**: lowercase-with-dashes (e.g., `auth.service.ts`)
- **Type Files**: `[feature].types.ts` (e.g., `blog.types.ts`)
- **Service Files**: `[feature].service.ts` (e.g., `auth.service.ts`)
- **Repository Files**: `[feature].repository.ts` (e.g., `blog.repository.ts`)
- **Component Files**: PascalCase.tsx (e.g., `MilkdownEditor.tsx`)

### 2. Architectural Layers

```
src/
├── core/              # Business logic & infrastructure
│   ├── components/    # Shared UI components (ErrorBoundary only)
│   ├── di/           # Dependency injection container
│   ├── repositories/ # Data access layer (Repository pattern)
│   ├── services/     # Business logic services
│   ├── types/        # Comprehensive TypeScript definitions
│   └── utils/        # Helper functions
├── components/       # UI components (feature-organized)
├── pages/            # Route-level page components
├── context/          # React Context providers
├── hooks/            # Custom React hooks (planned)
├── config/           # Configuration files
└── theme/            # Chakra UI theme customization
```

## TypeScript & Code Quality Standards

### 3. TypeScript Configuration

- **Strict Mode**: Fully enabled with no compromises
- **Interface Documentation**: Every interface must have JSDoc comments
- **Property Naming**: camelCase for properties, PascalCase for types/interfaces
- **Generic Constraints**: Use constrained generics where appropriate
- **Utility Types**: Leverage TypeScript's built-in utility types (`Pick<T>`, `Omit<T>`, `Partial<T>`)

### 4. Interface Design Patterns

```typescript
// ✅ Good: Comprehensive interface with proper extends/omits
export interface IBlogService {
  createPost(data: CreateBlogPostRequest): Promise<BlogPost>;
  updatePost(id: string, data: UpdateBlogPostRequest): Promise<BlogPost>;
  getPost(id: string): Promise<BlogPost | null>;
  searchPosts(query: string): Promise<BlogPost[]>;
}

// ✅ Good: Result types for consistent error handling
export interface BlogStorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 5. Class & Constructor Patterns

```typescript
// ✅ Good: Dependency injection constructor pattern
export class BlogService implements IBlogService {
  constructor(
    private blogRepository: IBlogRepository,
    private logger: ILogger
  ) {}
}
```

## SOLID Principles Implementation

### 6. Single Responsibility Principle (SRP)

- **Services**: Handle business logic only (no HTTP concerns)
- **Repositories**: Handle data access only (no business logic)
- **Components**: Handle UI concerns only (no data access)
- **Interceptors**: Handle authentication concerns only

### 7. Dependency Inversion Principle (DIP)

- All services must depend on abstractions (interfaces), not concrete implementations
- Use dependency injection container for service instantiation
- Never directly import implementation classes in services

### 8. Repository Pattern Usage

```typescript
// ✅ Good: Interface-first repository pattern
export interface IBlogRepository {
  save(post: BlogPost): Promise<BlogPost>;
  findById(id: string): Promise<BlogPost | null>;
  findByAuthor(authorId: string): Promise<BlogPost[]>;
  search(query: string): Promise<BlogPost[]>;
}
```

## API & Service Layer Standards

### 9. HTTP Method Conventions

- **GET**: Retrieve data (idempotent, no body)
- **POST**: Create resources (non-idempotent)
- **PUT**: Replace entire resource
- **PATCH**: Partial updates
- **DELETE**: Remove resources

### 10. Error Handling Patterns

```typescript
// ✅ Good: Custom error classes with specific codes
export class AuthError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
    public statusCode: number
  ) {
    super(message);
  }
}

// ✅ Good: Consistent error response format
{
  "success": false,
  "error": "Specific error message",
  "data": null
}
```

### 11. Authentication Patterns

- JWT tokens stored in localStorage with key `horizon_blog_token`
- Authorization headers: `Bearer ${token}`
- Automate token refresh on 401 errors
- Clear tokens and redirect on authentication failure

## Component & UI Standards

### 12. Component Organization

- **Pages**: `/pages/` directory - route-level components
- **Shared Components**: `/components/` directory - reusable components
- **Core Components**: `/core/components/` directory - infrastructure components (ErrorBoundary)
- **Feature Organization**: Group components by feature (`editor/`, `layout/`)

### 13. Custom Hook Patterns

```typescript
// ✅ Good: Custom hook for data fetching
export const useBlogPosts = (options?: BlogSearchOptions) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Implementation...
};
```

## Code Formatting & Style

### 14. ESLint Rules

- **Indentation**: 2 spaces
- **Quotes**: Single quotes (`'`)
- **Semicolons**: Required
- **Trailing Commas**: Required for multiline
- **Unused Variables**: Warn (ignore `_vars`)

### 15. Import Organization

```typescript
// ✅ Good: Grouped imports
import { useState, useEffect } from 'react';
import { Box, Heading } from '@chakra-ui/react';

import { IBlogService } from '../../core/types/service.types';
import { getCurrentUser } from '../../core/services/auth.service';
```

## Testing & Quality Assurance

### 16. Testing Strategy (Future Implementation)

- Unit tests for utilities and services (`*.test.ts`)
- Integration tests for component interactions
- E2E tests for critical user flows
- 80%+ coverage target
- Jest + React Testing Library + MSW for API mocking

### 17. Documentation Requirements

- **API Documentation**: `api-docs.json` for all endpoints
- **Workflow Documentation**: Mermaid diagrams for all user flows
- **Code Comments**: JSDoc for all public APIs
- **Architecture Decisions**: Documented in separate ADRs

## Build & Deployment Standards

### 18. Environment Configuration

- **Development**: `.env.development`
- **Production**: `.env.production`
- **Runtime Config**: Centralized in `/config/runtime.ts`
- **Validation**: Environment variables must be validated

### 19. Docker Standards

- **Multi-stage builds**: Development vs production
- **TypeScript compilation**: Must pass in production builds
- **Security**: Non-root user, minimal image size
- **Health checks**: Container health monitoring

## Performance & Optimization

### 20. Code Splitting Strategy

- **Route-based splitting**: Each route is lazy-loaded
- **Component chunks**: Large components split separately
- **Third-party chunks**: Vendor libraries separated

### 21. Caching Patterns

- **API responses**: Memory cache for frequently accessed data
- **Images**: CDN with proper caching headers
- **Static assets**: Long-term caching with content hashing

## Security Standards

### 22. Input Validation

- **Frontend**: Client-side validation with user feedback
- **Backend**: Server-side validation (future implementation)
- **Sanitization**: All user inputs must be sanitized
- **SQL Injection**: Prepared statements (backend responsibility)

### 23. Content Security Policy (CSP)

- **Inline scripts**: Avoid where possible
- **External resources**: Whitelist allowed domains
- **Frame ancestors**: Restrict iframe embedding
- **Mixed content**: Enforce HTTPS

## Backend Integration Rules

### 24. API Response Formats

```typescript
// ✅ Good: Consistent response structure
interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  success: boolean;
}

// ✅ Good: Pagination response
interface ListResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
```

### 25. Data Transformation Patterns

```typescript
// ✅ Good: Clear data mapping between frontend/backend
const transformApiUserToUser = (apiUser: ApiUser): User => ({
  username: apiUser.name,    // API uses 'name', frontend uses 'username'
  email: apiUser.email,
  avatar: generateAvatarUrl(apiUser.name),
});
```

## Error & Logging Standards

### 26. Logging Levels

- **ERROR**: Application errors, API failures
- **WARN**: Deprecated features, retry attempts
- **INFO**: User actions, important state changes
- **DEBUG**: Development debugging information

### 27. Error Tracking

- **Runtime errors**: Centralized error service
- **API errors**: Consistent error format across all endpoints
- **User feedback**: Toast notifications for user errors
- **Sentry integration**: Production error tracking (planned)

## Accessibility & UX Standards

### 28. Component Accessibility

- **Semantic HTML**: Proper heading hierarchy
- **ARIA labels**: Screen reader support
- **Keyboard navigation**: Full keyboard support
- **Color contrast**: WCAG AA compliance
- **Focus management**: Proper focus indicators

### 29. Loading State Management

- **Skeleton screens**: Use for better perceived performance
- **Loading indicators**: Consistent across the application
- **Error states**: User-friendly error messages
- **Retry mechanisms**: Failed requests should be retryable

---

## Rule Enforcement

### **Must Rules** (Block Merges)
- [ ] TypeScript compilation passes with strict mode
- [ ] ESLint passes with no errors
- [ ] All exported APIs have JSDoc documentation
- [ ] Repository pattern interfaces are implemented
- [ ] Dependency injection is used for service instantiation
- [ ] Authentication flow follows established patterns

### **Should Rules** (Code Review Discussion)
- [ ] Test coverage meets minimum thresholds
- [ ] Performance optimizations are implemented
- [ ] Accessibility requirements are met
- [ ] Code splitting is implemented for large features

### **Could Rules** (Optional Improvements)
- [ ] Comprehensive error handling
- [ ] Loading states and skeletons
- [ ] Advanced caching strategies
- [ ] Analytics integration

---

This rule set ensures the Horizon Blog maintains its status as a production-ready, architecturally sound application following modern React/TypeScript best practices. All development must adhere to these standards to preserve code quality and architectural integrity.
