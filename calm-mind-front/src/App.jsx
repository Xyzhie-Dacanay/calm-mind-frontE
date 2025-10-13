import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginScreen from './pages/LoginScreen';
import SignupScreen from './pages/SignupScreen';
import Homepage from './pages/Homepage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route is SignupScreen */}
        <Route path="/" element={<SignupScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/home" element={<Homepage />} />
      </Routes>
    </Router>
  );
}

export default App;
