import { lazy, Suspense } from 'react'
import { Routes as RouterRoutes, Route } from 'react-router-dom'
import { LoadingScreen } from './core'
import ProtectedRoute from './components/ProtectedRoute'

const Home = lazy(() => import('./pages/Home'))
const Blog = lazy(() => import('./pages/Blog'))
const Contact = lazy(() => import('./pages/Contact'))
const About = lazy(() => import('./pages/About'))
const Cv = lazy(() => import('./pages/Cv'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const LoginCallback = lazy(() => import('./features/auth/pages/LoginCallbackPage'))
const OAuthAuthorize = lazy(() => import('./pages/OAuthAuthorize'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const AuthorArchive = lazy(() => import('./pages/AuthorArchive'))
const BlogEditor = lazy(() => import('./pages/BlogEditor'))
const PublishBlog = lazy(() => import('./pages/PublishBlog'))
const Profile = lazy(() => import('./pages/Profile'))
const BlogDetail = lazy(() => import('./pages/BlogDetail'))
const ProfileBlogDetail = lazy(() => import('./pages/ProfileBlogDetail'))
const Analytics = lazy(() => import('./pages/Analytics'))
const BlogAnalytics = lazy(() => import('./pages/BlogAnalytics'))
const Series = lazy(() => import('./pages/Series'))
const ManageSeries = lazy(() => import('./pages/ManageSeries'))
const AccessManagement = lazy(
  () => import('./features/access-management/pages/AccessManagementPage'),
)

const Routes = () => {
  return (
    <Suspense
      fallback={
        <LoadingScreen
          label="Loading page"
          description="Preparing the next reading surface."
          minH="50vh"
        />
      }
    >
      <RouterRoutes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/series/:slug" element={<Series />} />
        <Route path="/authors/:authorName" element={<AuthorArchive />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/cv" element={<Cv />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/callback" element={<LoginCallback />} />
        <Route path="/oauth/authorize" element={<OAuthAuthorize />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/blog-editor"
          element={
            <ProtectedRoute requiredPermission="content:manage:own">
              <BlogEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog-editor/publish"
          element={
            <ProtectedRoute requiredPermission="content:manage:own">
              <PublishBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/series/manage"
          element={
            <ProtectedRoute requiredPermission="content:manage:own">
              <ManageSeries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute requiredPermission="analytics:read:own">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:username/blog/:id"
          element={
            <ProtectedRoute requiredPermission="analytics:read:own">
              <ProfileBlogDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/blog/:id"
          element={
            <ProtectedRoute>
              <BlogAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/access"
          element={
            <ProtectedRoute requiredPermission="roles:assign">
              <AccessManagement />
            </ProtectedRoute>
          }
        />
      </RouterRoutes>
    </Suspense>
  )
}

export default Routes
