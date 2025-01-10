import React, { useState, useContext } from "react";
import axios from "axios";
import "./style.css"; // Import the CSS file
import logo from "../assets/logo.png"; // Adjust the path based on where your logo is stored
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState({ email: "", phoneNumber: "", sgnUp: "" });
  const navigate = useNavigate();


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

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { // Allows only numbers
      setPhoneNumber(value);
      setErrors((prev) => ({ ...prev, phoneNumber: "" }));
    } else {
      setErrors((prev) => ({ ...prev, phoneNumber: "Phone number must contain only numbers" }));
    }
  };


  const handleSubmit = (message) => {
    setErrors((prev) => ({ ...prev, signUp: message }));
  }

  const handleSignup = async () => {
    if (errors.email || errors.phoneNumber) {
      console.error("Fix validation errors before submitting");
      return;
    }
    setErrors((prev) => ({ ...prev, signUp:"" }));
    try {
      const payload = { username, email, password, phoneNumber };
      console.log(payload);
      const res = await axios.post("https://abank.vercel.app/api/signup", payload);
      console.log("Signed up:", res.data);
      if(res.data.message = 'Successful')
        navigate('/login');
    } catch (err) {
      console.log("Error", err.response.data.message)
      handleSubmit(err?.response?.data?.message)
    }
  };

  return (
    <div className="box-container">
      <div className="box">
        <div className="header-content">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <h2>Signup</h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        {errors.phoneNumber && <p className="error">{errors.phoneNumber}</p>}
        <input
          type="text"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="Phone Number"
        />
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
        {errors.signUp && <p className="error">{errors.signUp}</p>}
        <button onClick={handleSignup}>Signup</button>
        <div className="switch-link">
          <span>Already have an account?</span>
          <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
