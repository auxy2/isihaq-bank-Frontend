import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import "./style.css"; // Import the CSS file
import logo from '../assets/logo.png'; // Adjust the path based on where your logo is stored
import { UserContext } from '../Component';



const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [errors, setErrors] = useState({ email: "", phoneNumber: "", login: "" });
  
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const handleEmailChange = (e) => {
      const value = e.target.value;
      setEmail(value);
      if (!validateEmail(value)) {
        setErrors((prev) => ({ ...prev, email: "Invalid email address" }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    };

    const handleSubmit = (message) => {
      setErrors((prev) => ({ ...prev, login: message }));
    }
  console.log("This is our login page");

  const handleLogin = async () => {
    try {
      setErrors((prev) => ({ ...prev, login: "" }));
      const res = await axios.post("https://abank.vercel.app/api/login", { email, password });
      console.log("Logged in:", res.data);
      setUser(res.data.userData);
      navigate('/dashboard');
      // Store JWT token in localStorage or state
    } catch (err) {
      console.log("Login error:", err.response.data.message);
      handleSubmit(err?.response?.data?.message);
    }
  };

  return (
    <div className="box-container">
      <div className="overlay"></div>
      <div className="box">
        <div className="header-content">
          <img src={logo} alt="Logo" />         
          <h2>Welcome Back</h2>
          <h4>Log in to continue using your account</h4>
        </div>
        {errors.email && <p className="error">{errors.email}</p>}
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {errors.login && <p className="error">{errors.login}</p>}
        <button onClick={handleLogin}>Login</button>
        <div className="switch-link">
          <span>Don't have an account?</span>
          <a href="/signup">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
