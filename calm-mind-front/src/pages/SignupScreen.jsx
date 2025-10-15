import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SignupScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  
  const [formAnimation, setFormAnimation] = useState("animate-swap-in-right");
  const [imageAnimation, setImageAnimation] = useState("animate-swap-in-right");

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: type === "checkbox" ? checked : value }));
  };

  const handleSignup = (e) => {
    e.preventDefault();
    navigate("/home");
  };

 
  const handleGoLogin = () => {
    setFormAnimation("animate-swap-out-right");  
    setImageAnimation("animate-swap-out-right"); 
    setTimeout(() => navigate("/login"), 300);  
  };

  return (
    <div className="fixed inset-0 flex w-full overflow-hidden">
     
      <div className={`hidden lg:block lg:w-1/2 min-h-0 ${imageAnimation}`}>
        <img src="/signup.png" alt="Sign up" className="block w-full h-full object-cover" />
      </div>

     
      <div className={`w-full lg:w-1/2 bg-white p-8 flex items-center justify-center min-h-0 ${formAnimation}`}>
        <div className="w-full max-w-md max-h-full overflow-auto text-left">
          <div className="mb-8">
            <img src="/logo.png" alt="Calm Mind Logo" className="h-12" />
          </div>

          <h1 className="text-3xl font-bold mb-2 text-gray-800">Create account.</h1>
          <p className="text-gray-600 mb-8">Join CalmMind and start your journey.</p>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm text-gray-600 pl-3">Full Name</label>
              <input
                id="name"
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter your full name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm text-gray-600 pl-3">Email</label>
              <input
                id="email"
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter your email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm text-gray-600 pl-3">Password</label>
              <input
                id="password"
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Create a password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-sm text-gray-600 pl-3">Confirm Password</label>
              <input
                id="confirmPassword"
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Re-enter your password"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center">
              <input
                id="agree"
                type="checkbox"
                className="h-4 w-4 text-yellow-900 border-gray-300 rounded"
                checked={form.agree}
                onChange={handleChange}
                required
              />
              <label htmlFor="agree" className="ml-2 block text-sm text-gray-600">
                I agree to the Terms & Privacy Policy
              </label>
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-accent on-accent rounded-md hover:brightness-95 transition"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Already have an account?
              <button
                className="ml-1 text-yellow-500 hover:underline"
                onClick={handleGoLogin} 
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
