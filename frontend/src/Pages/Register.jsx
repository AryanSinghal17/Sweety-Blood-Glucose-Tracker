
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password: pass,
        }),
      });

      console.log("Registration successful:", data);

      alert("Registration successful!");

      navigate("/login");

    } catch (error) {
      console.error("Registration error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="about-reg">
      <div className="Reg-header">
        <h1>Sweety</h1>
        <p>Track Your daily glucose diary</p>
      </div>

      <div className="main-reg">
        <form onSubmit={handleSubmit}>
          <h3 className="reg-h1">Create your account</h3>

          <label>Name</label>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            minLength={8}
            required
          />

          <button type="submit" className="reg-btn">
            Register
          </button>

          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
