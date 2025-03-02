import { Routes as RouterRoutes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import BlogEditor from './pages/BlogEditor';
import Profile from './pages/Profile';
import BlogDetail from './pages/BlogDetail';

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
      <Route path="/blog-editor" element={<BlogEditor />} />
      <Route path="/profile/:username" element={<Profile />} />
    </RouterRoutes>
  );
};

export default Routes; 