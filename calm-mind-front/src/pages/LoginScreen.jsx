import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [formAnimation, setFormAnimation] = useState("animate-swap-in-left");
  const [imageAnimation, setImageAnimation] = useState("animate-swap-in-left"); 

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/home");
  };

  // Fix: call the handleGoLogin directly in onClick
  const handleGoSignup = () => {
    setFormAnimation("animate-swap-out-left");  
    setImageAnimation("animate-swap-out-left");  
    setTimeout(() => navigate("/"), 200);  
  };

  return (
    <div className="fixed inset-0 flex w-full overflow-hidden">
      
      <div className={`w-full lg:w-1/2 bg-white p-8 flex items-center justify-center min-h-0 ${formAnimation}`}>
        <div className="w-full max-w-md max-h-full overflow-auto text-left">
          <div className="mb-8">
            <img src="/logo.png" alt="Calm Mind Logo" className="h-12" />
          </div>

          <h1 className="text-3xl font-bold mb-2 text-gray-800">Log in.</h1>
          <p className="text-gray-600 mb-8">Pick up where you left off — your journey continues.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm text-gray-600 pl-3">Email</label>
              <input
                id="email"
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter your email"
                type="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm text-gray-600 pl-3">Password</label>
              <input
                id="password"
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter your password"
                type="password"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-yellow-900 border-gray-300 rounded"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-600">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-accent on-accent rounded-md hover:brightness-95 transition"
            >
              Log In
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?
              <button
                className="ml-1 text-yellow-500 hover:underline"
                onClick={handleGoSignup} // Fixed onClick to trigger animation
              >
                Sign up
              </button>
            </p>
            <button
              className="mt-2 text-yellow-500 hover:underline"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>

     
      <div className={`hidden lg:block lg:w-1/2 min-h-0 ${imageAnimation}`}>
        <img src="/login.png" alt="login" className="block w-full h-full object-cover" />
      </div>
    </div>
  );
}
