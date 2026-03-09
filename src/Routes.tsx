import { Routes as RouterRoutes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Contact from './pages/Contact'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import BlogEditor from './pages/BlogEditor'
import Profile from './pages/Profile'
import BlogDetail from './pages/BlogDetail'
import ProfileBlogDetail from './pages/ProfileBlogDetail'
import ProtectedRoute from './components/ProtectedRoute'

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:id" element={<BlogDetail />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/blog-editor"
        element={
          <ProtectedRoute>
            <BlogEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:username/blog/:id"
        element={
          <ProtectedRoute>
            <ProfileBlogDetail />
          </ProtectedRoute>
        }
      />
    </RouterRoutes>
  )
}

export default Routes
