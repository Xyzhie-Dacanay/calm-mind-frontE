import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignupScreen from "./pages/SignupScreen";
import LoginScreen from "./pages/LoginScreen";
import Homepage from "./pages/Homepage";
import { useAuthStore } from "./store/authStore";

function App() {
    const { token: storeToken } = useAuthStore();
    const token = storeToken || localStorage.getItem("token"); // fallback to localStorage

  return (
    <Router>
      <Routes>
        {/* Default flow: signup → login → home */}
        <Route path="/" element={<SignupScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route
          path="/home"
          element={token ? <Homepage /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
