import { lazy, Suspense } from 'react'
import { Center, Spinner } from '@chakra-ui/react'
import { Routes as RouterRoutes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

const Home = lazy(() => import('./pages/Home'))
const Blog = lazy(() => import('./pages/Blog'))
const Contact = lazy(() => import('./pages/Contact'))
const About = lazy(() => import('./pages/About'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const AuthorArchive = lazy(() => import('./pages/AuthorArchive'))
const BlogEditor = lazy(() => import('./pages/BlogEditor'))
const Profile = lazy(() => import('./pages/Profile'))
const BlogDetail = lazy(() => import('./pages/BlogDetail'))
const ProfileBlogDetail = lazy(() => import('./pages/ProfileBlogDetail'))

const Routes = () => {
  return (
    <Suspense
      fallback={
        <Center minH="50vh">
          <Spinner size="lg" color="accent.primary" />
        </Center>
      }
    >
      <RouterRoutes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/authors/:authorName" element={<AuthorArchive />} />
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
    </Suspense>
  )
}

export default Routes
