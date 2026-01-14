import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
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
import './App.css';

const Nav = () => {
  const { currentUser, logout } = useAppStore();
  const { logout: privyLogout } = usePrivy();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = currentUser && (currentUser.handle === "@hermes" || currentUser.username === "@hermes");

  const handleLogout = async () => {
    await privyLogout();
    logout();
    navigate('/');
  };

  return (
    <nav className="bottom-nav">
      <NavLink to="/explore" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Compass size={24} />
        <span>Explore</span>
      </NavLink>
      <NavLink to="/rankings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Trophy size={24} />
        <span>Ranks</span>
      </NavLink>
      <NavLink to="/shelf/me" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <LayoutGrid size={24} />
        <span>My Shelf</span>
      </NavLink>
      {isAdmin && (
        <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShieldCheck size={24} />
          <span>Admin</span>
        </NavLink>
      )}
      {currentUser && (
        <button onClick={handleLogout} className="logout-btn-nav">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      )}
    </nav>
  );
};

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser } = useAppStore();
  const isAdmin = currentUser && (currentUser.handle === "@hermes" || currentUser.username === "@hermes");

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/explore" replace />;
  }

  return children;
};

function App() {
  const { user: privyUser, ready, authenticated } = usePrivy();
  const { currentUser, setCurrentUser } = useAppStore();

  useEffect(() => {
    if (ready && authenticated && privyUser) {
      // Map Privy user to App user
      const wallet = privyUser.wallet?.address;
      // Check both direct email auth and Google auth for email
      const email = privyUser.email?.address || privyUser.google?.email;
      const twitter = privyUser.twitter?.username;

      console.log("Privy User Debug:", {
        id: privyUser.id,
        emailObj: privyUser.email,
        googleObj: privyUser.google,
        twitterObj: privyUser.twitter,
        extractedEmail: email
      });

      // Include potential typo variant just in case
      const ADMIN_EMAILS = ['hermescrypto33@gmail.com', 'hermescrytpo33@gmail.com'];
      const isAdmin = email && ADMIN_EMAILS.includes(email.toLowerCase());

      let handle = "@anon";
      if (twitter) handle = "@" + twitter;
      else if (email) handle = "@" + email.split("@")[0];
      else if (wallet) handle = wallet.slice(0, 6);

      const mappedUser = {
        id: privyUser.id,
        handle: handle,
        username: twitter || (email ? email.split("@")[0] : "anon"),
        avatar: null, // Privy doesn't provide avatar by default unless social login
        address: wallet,
        email: email,
        role: isAdmin ? 'admin' : 'user'
      };

      console.log("Mapped User Role:", mappedUser.role);

      // Only update if changed to avoid loops
      if (!currentUser || currentUser.id !== mappedUser.id) {
        setCurrentUser(mappedUser);
      }
    } else if (ready && !authenticated) {
      if (currentUser) setCurrentUser(null);
    }
  }, [ready, authenticated, privyUser, setCurrentUser, currentUser]);

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
