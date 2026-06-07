// frontend/src/App.jsx
// QR-Based Event Management System - Frontend
// Install: npm install react-router-dom

// External libraries
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Internal pages
import AuthPage from "./pages/AuthPage";
import CreateEventPage from "./pages/CreateEventPage";
import RegisterPage from "./pages/RegisterPage";
import ScannerPage from "./pages/ScannerPage";
import VerifyPage from "./pages/VerifyPage";
import FeedbackPage from "./pages/FeedbackPage";
import AdminDashboard from "./pages/AdminDashboard";
import LandingPage from "./pages/LandingPage";
import useAuthSession from "./hooks/useAuthSession";

// ════════════════════════════════════════════════════════════════
//  GLOBAL APP with Router + State
// ════════════════════════════════════════════════════════════════

export default function App() {
  // 'user' holds the logged-in organizer globally (null = not logged in)
  const {
      user,
      setUser,
    } = useAuthSession();

  return (
    <Router>
      <Routes>
        {/* Auth page: Login / Register toggle */}
        <Route path="/auth" element={<AuthPage user={user} setUser={setUser} />} />

        {/* Event creation form — protected */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/create"
          element={
            user
              ? (
                  <CreateEventPage
                    user={user}
                    setUser={setUser}
                  />
                )
              : (
                  <Navigate to="/auth" />
                )
          }
        />

        {/* Public attendee registration page */}
        <Route path="/register/:eventId" element={<RegisterPage />} />

        {/* Organizer dashboard — protected */}
        <Route
          path="/admin"
          element={user ? <AdminDashboard user={user} setUser={setUser} /> : <Navigate to="/auth" />}
        />

        {/* Gatekeeper QR scan page — public */}
        <Route path="/verify/:token" element={<VerifyPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/feedback/:token" element={<FeedbackPage />} />
      </Routes>
    </Router>
  );
}
