
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password: pass,
        }),
      });

      // Save JWT token
      sessionStorage.setItem("token", data.token);

      // Save user information
      sessionStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful!");

      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="about-login">
      <div className="header">
        <h1>Sweety</h1>
        <p>Track Your daily glucose diary</p>
      </div>

      <div className="main-login">
        <form onSubmit={handleSubmit}>
          <h3 className="login-h1">Welcome back</h3>

          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">
            Login
          </button>

          <p>
            New to Sweety? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
