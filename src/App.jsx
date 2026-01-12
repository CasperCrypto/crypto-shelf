import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import ShelfBuilder from './pages/ShelfBuilder';
import ShelfDetail from './pages/ShelfDetail';
import Rankings from './pages/Rankings';
import AdminLayout from './pages/admin/AdminLayout';
import AdminAccessories from './pages/admin/AdminAccessories';
import AdminThemes from './pages/admin/AdminThemes';
import AdminModeration from './pages/admin/AdminModeration';
import { useAppStore } from './main';
import { LayoutGrid, Compass, Trophy, User, ShieldCheck, LogOut } from 'lucide-react';

const Nav = () => {
  const { currentUser, logout } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRestrictedLink = (e, path) => {
    if (!currentUser) {
      e.preventDefault();
      alert("Please log in to edit your shelf.");
      navigate('/');
    }
  };

  return (
    <nav className="bottom-nav">
      <Link to="/explore" className={isActive('/explore') ? 'active' : ''}>
        <Compass size={24} />
        <span>Explore</span>
      </Link>
      <Link to="/rankings" className={isActive('/rankings') ? 'active' : ''}>
        <Trophy size={24} />
        <span>Ranks</span>
      </Link>
      <Link
        to="/shelf/me"
        className={isActive('/shelf/me') ? 'active' : ''}
        onClick={(e) => handleRestrictedLink(e, '/shelf/me')}
      >
        <LayoutGrid size={24} />
        <span>My Shelf</span>
      </Link>
      {currentUser?.role === 'admin' && (
        <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
          <ShieldCheck size={24} />
          <span>Admin</span>
        </Link>
      )}
      {!currentUser ? (
        <Link to="/" className={isActive('/') ? 'active' : ''}>
          <User size={24} />
          <span>Login</span>
        </Link>
      ) : (
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} />
        </button>
      )}
    </nav>
  );
};

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser } = useAppStore();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/explore" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <main className="content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/explore" element={<Explore />} />
            <Route
              path="/shelf/me"
              element={
                <ProtectedRoute>
                  <ShelfBuilder />
                </ProtectedRoute>
              }
            />
            <Route path="/shelf/:id" element={<ShelfDetail />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<div className="admin-welcome"><h2>Admin Dashboard</h2><p>Select a section to manage.</p></div>} />
              <Route path="accessories" element={<AdminAccessories />} />
              <Route path="themes" element={<AdminThemes />} />
              <Route path="moderation" element={<AdminModeration />} />
            </Route>
          </Routes>
        </main>
        <Nav />
      </div>
    </Router>
  );
}

export default App;
