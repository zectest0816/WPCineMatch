import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/signup.css";
import bgImage from "./assets/netflix-background-gs7hjuwvv2g0e9fj.jpg";
import { useAuth } from "./AuthContext";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting registration...");

    try {
      const response = await axios.post("http://localhost:3001/register", {
        name,
        email,
        password,
      });
      console.log("Registration successful:", response.data);

      // Navigate only after successful registration
      navigate("/login");
    } catch (error) {
      console.error("Signup failed:", error);

      if (error.response) {
        // Server responded with an error (4xx or 5xx)
        console.error("Server error:", error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response from server.");
      } else {
        // Other errors
        console.error("Error setting up request:", error.message);
      }
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="title-container">
        <h1>
          <span className="cine">Cine</span>
          <span className="match">Match</span>
        </h1>
        <p className="slogan">Your ultimate movie matchmaker</p>
      </div>

      <div className="signup-box signup-box-shift">
        <h2>Sign Up</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name">
              <strong>Name</strong>
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter Name"
              autoComplete="off"
              name="name"
              className="form-control rounded-0"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email">
              <strong>Email</strong>
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter Email"
              autoComplete="off"
              name="email"
              className="form-control rounded-0"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password">
              <strong>Password</strong>
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter Password"
              name="password"
              className="form-control rounded-0"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-success w-100 rounded-0">
            Register
          </button>
        </form>

        <p>Register now</p>
        <Link
          to="/login"
          className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default Signup;
