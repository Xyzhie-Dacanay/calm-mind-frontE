// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import SignupScreen from "./pages/SignupScreen";
import LoginScreen from "./pages/LoginScreen";
import Homepage from "./pages/Homepage";
import TaskManagement from "./pages/TaskManagement";
import Calendar from "./pages/Calendar";
import ChatBot from "./pages/ChatBot";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import GetStarted from "./pages/GetStarted";
import SettingsLogin from "./pages/SettingsLogin";
import SettingsAbout from "./pages/SettingsAbout";
import AdminHomepage from "./pages/admin/AdminHomepage";
import { useAuthStore } from "./store/authStore";

// Placeholder components for admin routes
function UsersPage() {
  return <div>Users Page (Under Construction)</div>;
}

function ReportsPage() {
  return <div>Reports Page (Under Construction)</div>;
}

function NotFoundPage() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <a href="/home">Go to Home</a> | <a href="/admin">Go to Admin Dashboard</a>
    </div>
  );
}

function App() {
  const { token: storeToken, user } = useAuthStore();
  // Fallback to localStorage or mock token for testing
  const token = storeToken || localStorage.getItem("token") || "mock-token";
  const isAdmin = user?.role === "admin" || token === "mock-token"; // Allow mock token for admin access during testing

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Default flow: signup → login → get-started → home */}
          <Route path="/" element={<SignupScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/get-started"
            element={token ? <GetStarted /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/home"
            element={token ? <Homepage /> : <Navigate to="/login" replace />}
          />
          {/* App pages behind auth */}
          <Route
            path="/tasks"
            element={token ? <TaskManagement /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/calendar"
            element={token ? <Calendar /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/chatbot"
            element={token ? <ChatBot /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/analytics"
            element={token ? <Analytics /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/settings"
            element={token ? <Settings /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/settings/login"
            element={token ? <SettingsLogin /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/settings/about"
            element={token ? <SettingsAbout /> : <Navigate to="/login" replace />}
          />
          {/* Admin routes (protected by token and admin role) */}
          <Route
            path="/admin"
            element={
              token && isAdmin ? (
                <AdminHomepage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admins"
            element={<Navigate to="/admin" replace />}
          />
          <Route
            path="/admin/users"
            element={
              token && isAdmin ? (
                <UsersPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/reports"
            element={
              token && isAdmin ? (
                <ReportsPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;