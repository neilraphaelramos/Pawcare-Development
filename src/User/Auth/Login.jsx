import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import "./Auth.css";
import { UserContext } from "../../hook/authContext";

export default function Login() {
  const { setUser } = useContext(UserContext);
  const [form, setForm] = useState({
    email: "", // use email if your backend login expects email
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/login", form);

      if (res.data.message === "Login successful") {
        const role = res.data.user.role;

        setUser(res.data.user);

        alert(`Login successful! Role: ${role}`);
        console.log(res.data)

        if (role === "Admin") {
          navigate("/admin");
        } else if (role === "Veterinarian") {
          navigate("/veterinarian");
        } else {
          navigate("/users");
        }
      } else {
        alert("Login failed.");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Login failed.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-image-section">
        <img src="images/bg4.png" alt="Dog" />
      </div>

      <div className="login-form-section">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >


          <h1>Login</h1>
          <p className="subtext">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <div className="forgot-password">
              <a href="#">Forgot password?</a>
            </div>
            <button type="submit">Log In</button>
          </form>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-login">
            <button className="google">
              <img
                src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
                alt="Google icon"
                className="icon"
              />
              Google
            </button>
          </div>

          <p className="signup-text">
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div >
  );

}