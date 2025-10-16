# Personal Blog

A modern, beginner-friendly blog website built with React, TypeScript, and Chakra UI. Perfect for learning TypeScript and modern frontend development with hands-on experience in building responsive web applications.

## 🎯 Learning Focus

This project is designed for **frontend newbies** learning:
- **TypeScript fundamentals** - Type safety, interfaces, and modern JavaScript
- **React concepts** - Components, hooks, state management, and props
- **Modern frontend architecture** - Component structure, routing, and best practices
- **UI/UX with Chakra UI** - Responsive design and accessible components

## Features

- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎨 **Modern UI** - Clean interface built with Chakra UI components
- 📝 **Rich Text Editor** - Lexical-based editor with formatting options
- 🔍 **Search & Filter** - Find posts quickly with search functionality
- 👥 **Authentication System** - Login/Register with form validation
- 📬 **Contact Form** - Get in touch with site visitors
- 🎯 **SEO Optimized** - Built with search engines in mind

## Tech Stack

**Core Technologies:**
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript for better development experience
- **Chakra UI** - Accessible component library for beautiful interfaces
- **React Router DOM** - Client-side routing

**Rich Text Editing:**
- **Lexical Editor** - Extensible rich text editor by Facebook
  - `@lexical/react` - Core React integration
  - `@lexical/rich-text` - Rich text capabilities
  - `@lexical/markdown` - Markdown support
  - `@lexical/list` - List formatting
  - `@lexical/table` - Table support
  - `@lexical/code` - Code highlighting
  - `@lexical/link` - Link handling

**Additional Libraries:**
- **React Icons** - Popular icon library
- **Framer Motion** - Animation library for smooth transitions

## Prerequisites

Before you begin, ensure you have:
- **Node.js (v18 or higher)** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Modern web browser** - Chrome, Firefox, Safari, or Edge

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd personal-blog
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

**Need help?** Check the troubleshooting section below if you encounter issues.

## 📚 Learning Path

New to TypeScript or React? Follow this structured learning path:

### **Phase 1: Foundation (Week 1-2)**
- **Understand the codebase structure** - Review `src/` folder organization
- **Learn TypeScript basics** - Study type definitions in `src/core/types/`
- **Component architecture** - Examine how pages and components are structured
- **State management** - Look at context usage in `src/context/`

### **Phase 2: Core Features (Week 3-4)**
- **Authentication system** - Study `src/pages/Login.tsx`, `src/pages/Register.tsx`, and `src/context/AuthContext.tsx`
- **Blog functionality** - Understand CRUD operations in `src/pages/Blog.tsx` and `src/services/blogStorage.ts`
- **Rich text editing** - Learn Lexical editor in `src/components/editor/ToolbarPlugin.tsx`
- **Component architecture** - Study layout components in `src/components/layout/`

### **Phase 3: Advanced Topics (Week 5-6)**
- **API integration** - Plan backend connectivity (currently uses localStorage)
- **Error handling** - Study error boundaries in `src/core/components/ErrorBoundary.tsx`
- **TypeScript patterns** - Learn from type definitions in `src/core/types/`
- **State management** - Understand context patterns and prop drilling

## 🛠 TypeScript Best Practices

### **Type Definitions**
```typescript
// ✅ Good: Clear interface
interface User {
  id: number;
  name: string;
  email: string;
}

// ✅ Good: Optional properties
interface BlogPost {
  id: number;
  title: string;
  content?: string; // Optional
  published: boolean;
}
```

### **Component Props**
```typescript
// ✅ Good: Proper typing
interface NavbarProps {
  isAuthenticated: boolean;
  userName?: string;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  isAuthenticated,
  userName,
  onLogout
}) => {
  // Component logic here
};
```

## 🏗 Project Architecture

### **Core Concepts**
- **`src/core/`** - Shared business logic, types, utilities, and services
- **`src/components/`** - Reusable UI components (layout, editor)
- **`src/pages/`** - Route-level components (all main pages)
- **`src/services/`** - Data storage and API management
- **`src/context/`** - React context for global state (authentication)
- **`src/types/`** - Additional TypeScript type definitions

### **File Organization**
```
src/
├── core/              # Business logic layer
│   ├── components/    # Shared components (ErrorBoundary)
│   ├── services/      # Core services (auth, storage)
│   ├── types/         # TypeScript definitions
│   └── utils/         # Helper functions
├── components/        # Feature-specific components
│   ├── layout/        # Layout components (Navbar, Footer)
│   └── editor/        # Editor components (ToolbarPlugin)
├── pages/             # Page components (9 pages total)
│   ├── Home.tsx       # Landing page
│   ├── Blog.tsx       # Blog listing with search
│   ├── BlogDetail.tsx # Individual blog post view
│   ├── BlogEditor.tsx # Rich text editor interface
│   ├── About.tsx      # About page
│   ├── Contact.tsx    # Contact form
│   ├── Login.tsx      # User login
│   ├── Register.tsx   # User registration
│   └── Profile.tsx    # User profile page
├── context/           # Global state management
│   └── AuthContext.tsx # Authentication context
├── services/          # Data management
│   └── blogStorage.ts # Blog data storage service
└── types/             # Additional type definitions
    └── blog.ts        # Blog-specific types
```

## 🔧 Troubleshooting

### **Common Issues**

**❌ `npm install` fails**
```bash
# Clear npm cache and try again
npm cache clean --force
npm install
```

**❌ TypeScript errors**
```bash
# Run type checking
npm run type-check

# Common fixes:
# 1. Check import paths are correct
# 2. Verify interface definitions
# 3. Ensure all required props are passed
```

**❌ Port 5173 already in use**
```bash
# Kill process using the port
npx kill-port 5173
# Or use different port
npm run dev -- --port 3000
```

**❌ Chakra UI components not styling**
- Ensure ChakraProvider wraps your App component
- Check if CSS imports are correct in `main.tsx`

## 🗺 Roadmap & Enhancement Plan

### **Phase 1: Core Improvements (Next 2-3 months)**
- [ ] **Enhanced Type Safety**
  - Add strict TypeScript configuration
  - Implement comprehensive error types
  - Add API response typing
  - Create custom hooks with proper typing

- [ ] **Performance Optimization**
  - Implement code splitting for routes
  - Add lazy loading for components
  - Optimize bundle size analysis
  - Add React.memo for expensive components

- [ ] **Testing Strategy**
  - Unit tests for utilities and services
  - Component testing with React Testing Library
  - Integration tests for user flows
  - E2E testing setup with Playwright

### **Phase 2: Feature Enhancements (3-6 months)**
- [ ] **Advanced Editor Features**
  - Image upload and media management
  - Table support in Lexical editor
  - Code syntax highlighting
  - Collaborative editing capabilities

- [ ] **User Experience**
  - Dark/light theme toggle
  - PWA (Progressive Web App) features
  - Offline reading support
  - Advanced search with filters

- [ ] **Content Management**
  - Post categories and tags
  - Comment system implementation
  - Draft/publish workflow
  - Content versioning

### **Phase 3: Advanced Features (6-12 months)**
- [ ] **Backend Integration**
  - RESTful API development
  - Database design and implementation
  - Authentication with JWT
  - Real-time updates with WebSocket

- [ ] **Analytics & SEO**
  - Google Analytics integration
  - Sitemap generation
  - Meta tag management
  - Social media sharing

- [ ] **Deployment & DevOps**
  - CI/CD pipeline setup
  - Production build optimization
  - Docker containerization
  - Cloud deployment (Vercel/Netlify)

### **Learning Milestones**
- **Month 1-2**: Master TypeScript interfaces and React patterns
- **Month 3-4**: Implement complex features with proper typing
- **Month 5-6**: Build and deploy full-stack application
- **Month 7-8**: Performance optimization and testing
- **Month 9-12**: Advanced React patterns and architecture

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── layout/        # Layout components
│   │   ├── Navbar.tsx # Navigation bar
│   │   └── Footer.tsx # Footer component
│   └── editor/        # Editor components
│       └── ToolbarPlugin.tsx # Lexical editor toolbar
├── pages/             # Page components (9 total)
│   ├── Home.tsx       # Landing page
│   ├── Blog.tsx       # Blog listing with search
│   ├── BlogDetail.tsx # Individual blog post display
│   ├── BlogEditor.tsx # Rich text editor interface
│   ├── About.tsx      # About page
│   ├── Contact.tsx    # Contact form
│   ├── Login.tsx      # User authentication
│   ├── Register.tsx   # User registration
│   └── Profile.tsx    # User profile page
├── core/              # Business logic layer
│   ├── components/    # Shared components
│   │   └── ErrorBoundary.tsx # Error handling
│   ├── services/      # Core services
│   │   ├── auth.service.ts   # Authentication logic
│   │   └── storage.service.ts # Data storage
│   ├── types/         # TypeScript definitions
│   │   ├── auth.types.ts     # Auth-related types
│   │   ├── blog.types.ts     # Blog-related types
│   │   └── common.types.ts   # Common types
│   ├── utils/         # Utility functions
│   │   ├── blog.utils.ts     # Blog helpers
│   │   └── error.utils.ts    # Error handling utils
│   └── index.ts       # Core exports
├── context/           # Global state management
│   └── AuthContext.tsx # Authentication context
├── services/          # Data management services
│   └── blogStorage.ts # Blog data operations
├── types/             # Additional type definitions
│   └── blog.ts        # Blog-specific types
├── App.tsx           # Main application component
├── Routes.tsx        # Route configuration
└── main.tsx          # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Backend Integration

This frontend is designed to work with a Django backend (to be implemented). Currently, it uses dummy data that will be replaced with actual API calls. The following endpoints will be required:

- `/api/auth/login` - User login
- `/api/auth/register` - User registration
- `/api/posts` - CRUD operations for blog posts
- `/api/contact` - Contact form submission

## Blog Editor
The blog uses [Lexical](https://lexical.dev/) as its rich text editor. Lexical is a powerful, extensible text editor framework developed by Facebook that provides a modern, flexible, and accessible editing experience.

### Editor Features
- Rich text formatting (bold, italic, underline, strikethrough)
- Headings (H1, H2, H3)
- Lists (ordered and unordered)
- Blockquotes
- Markdown shortcuts
- History (undo/redo)

### Implementation
The editor integration is implemented in the following files:
- `src/pages/BlogEditor.tsx` - Main editor component
- `src/components/editor/ToolbarPlugin.tsx` - Toolbar with formatting options
- `src/pages/BlogDetail.tsx` - Renders the saved Lexical content

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Chakra UI](https://chakra-ui.com/) for the component library
- [React Icons](https://react-icons.github.io/react-icons/) for the icons
- [React Markdown](https://github.com/remarkjs/react-markdown) for markdown rendering
