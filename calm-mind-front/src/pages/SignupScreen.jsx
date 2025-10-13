
import { useNavigate } from "react-router-dom";

export default function SignupScreen() {
  const navigate = useNavigate();

  const handleSignup = () => {
 
    navigate("/"); 
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Signup Screen</h1>
      <input placeholder="Email" />
      <input placeholder="Password" type="password" />
      <br />
      <button onClick={handleSignup}>Signup</button>
      <p>
        Already have an account?{" "}
        <button onClick={() => navigate("/")}>Login</button>
      </p>
    </div>
  );
}