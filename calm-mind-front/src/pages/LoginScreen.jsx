import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [formAnimation, setFormAnimation] = useState("animate-swap-in-left");
  const [imageAnimation, setImageAnimation] = useState("animate-swap-in-left");
  const [showPassword, setShowPassword] = useState(false);

  // Local state for handling errors and loading in the login form
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login: _storeLogin, loading: _storeLoading, error: _storeError } = useAuthStore();

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    setError("");
    setLoading(true);

    const response = await fetch("http://localhost:4000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        password,
      }),
    });

    const data = await response.json();
    console.log("Login response:", data); // <--- helpful to debug

    if (!response.ok) {
      setError(data.message || "Login failed.");
      return;
    }

    if (data.token) localStorage.setItem("token", data.token);
    if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

    // Debugging token
      console.log("Token in localStorage:", localStorage.getItem("token"));
      console.log("User in localStorage:", localStorage.getItem("user"));

    // Check if user has completed profile setup
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user.isProfileComplete) {
      navigate("/get-started");
    } else {
      navigate("/home");
    }
  } catch (err) {
    console.error("Login error:", err);
    setError("Login failed.");
  } finally {
    setLoading(false);
  }
};


  const handleGoSignup = () => {
    setFormAnimation("animate-swap-out-left");
    setImageAnimation("animate-swap-out-left");
    setTimeout(() => navigate("/"), 200);
  };

  const handleGoForgot = () => {
    setFormAnimation("animate-swap-out-left");
    setImageAnimation("animate-swap-out-left");
    setTimeout(() => navigate("/forgot-password"), 200);
  };

  return (
    <div className="fixed inset-0 flex w-full overflow-hidden">
      {/* Left side: form */}
      <div
        className={`w-full lg:w-1/2 bg-white p-8 flex items-center justify-center min-h-0 ${formAnimation}`}
      >
        <div className="w-full max-w-md max-h-full overflow-auto text-left">
          <div className="mb-8">
            <img src="/logo.png" alt="Calm Mind Logo" className="h-12" />
          </div>

          {/* ✅ Auto-fading success banner */}
          {resetSuccess && (
            <div
              className={`mb-6 flex items-start justify-between rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 text-sm transition-opacity duration-500 ease-out ${
                bannerVisible ? "opacity-100" : "opacity-0"
              }`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2">
                <span aria-hidden="true">✅</span>
                <span>Password updated successfully. Please sign in with your new password.</span>
              </div>
            </div>
          )}

          <h1 className="text-3xl font-bold mb-2 text-gray-800">Log in.</h1>
          <p className="text-gray-600 mb-8">
            Pick up where you left off — your journey continues.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm text-gray-600 pl-3"
              >
                Email
              </label>
              <input
                id="email"
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm text-gray-600 pl-3"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error and loading */}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {loading && <p className="text-gray-500 text-sm">Logging in...</p>}

            {/* Remember me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-yellow-900 border-gray-300 rounded"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-600"
              >
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full p-3 bg-black text-white rounded-md hover:bg-gray-800 transition"
            >
              Log In
            </button>
          </form>

          {/* Signup + Forgot */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don’t have an account?
              <button
                className="ml-1 text-yellow-500 hover:underline"
                onClick={handleGoSignup}
              >
                Sign up
              </button>
            </p>
            <button
              className="mt-2 text-yellow-500 hover:underline"
              onClick={handleGoForgot}
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>

      {/* Right side: image */}
      <div className={`hidden lg:block lg:w-1/2 min-h-0 ${imageAnimation}`}>
        <img
          src="/login.png"
          alt="login"
          className="block w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
