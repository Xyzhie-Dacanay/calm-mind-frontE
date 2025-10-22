import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';
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
import { useAuthStore } from "./store/authStore";



function App() {
    const { token: storeToken } = useAuthStore();
    const token = storeToken || localStorage.getItem("token"); // fallback to localStorage

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
        <Route path="/tasks" element={token ? <TaskManagement /> : <Navigate to="/login" replace />} />
        <Route path="/calendar" element={token ? <Calendar /> : <Navigate to="/login" replace />} />
        <Route path="/chatbot" element={token ? <ChatBot /> : <Navigate to="/login" replace />} />
        <Route path="/analytics" element={token ? <Analytics /> : <Navigate to="/login" replace />} />
        <Route path="/settings" element={token ? <Settings /> : <Navigate to="/login" replace />} />
        <Route path="/settings/login" element={token ? <SettingsLogin /> : <Navigate to="/login" replace />} />
        <Route path="/settings/about" element={token ? <SettingsAbout /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;
