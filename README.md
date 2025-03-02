# Personal Blog

A modern blog website built with React, TypeScript, and Chakra UI. This project provides a clean and responsive interface for managing and displaying blog posts.

## Features

- 📱 Responsive design that works on desktop and mobile
- 🎨 Modern UI using Chakra UI components
- ✍️ Markdown support for blog posts
- 🔍 Search and filter functionality
- 👥 User authentication (Login/Register)
- 📝 Blog post editor with preview
- 📬 Contact form
- 🎯 SEO friendly

## Tech Stack

- React
- TypeScript
- Chakra UI
- React Router DOM
- React Query
- React Hook Form
- React Markdown
- React Icons
- React Toastify

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd personal-blog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

## Project Structure

```
src/
├── components/         # Reusable components
│   └── layout/        # Layout components (Navbar, Footer)
├── pages/             # Page components
│   ├── Home.tsx
│   ├── Blog.tsx
│   ├── About.tsx
│   ├── Contact.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── BlogEditor.tsx
├── App.tsx           # Main application component
└── main.tsx         # Application entry point
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