// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignupScreen from "./pages/SignupScreen";
import LoginScreen from "./pages/LoginScreen";
import Homepage from "./pages/Homepage"; // ensure filename/case matches
import { useAuthStore } from "./store/authStore";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";

function App() {
  const { token: storeToken } = useAuthStore();
  const token = storeToken || localStorage.getItem("token");

  return (
    <MantineProvider defaultColorScheme="light">
      <DatesProvider settings={{ consistentWeeks: true, firstDayOfWeek: 0 }}>
        <Router>
          <Routes>
            <Route path="/" element={<SignupScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route
              path="/home"
              element={token ? <Homepage /> : <Navigate to="/login" replace />}
            />
          </Routes>
        </Router>
      </DatesProvider>
    </MantineProvider>
  );
}

export default App;
