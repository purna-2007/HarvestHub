
import React, { useState } from "react";

function Login({ role = "worker", onBack }) {
  const [isRegister, setIsRegister] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const isWorker = role.toLowerCase() === "worker";

  const title = isWorker ? "Worker" : "Farmer";
  const emoji = isWorker ? "👷" : "👨‍🌾";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      alert(
        `${title} registration form validated successfully! Backend integration will be added soon.`
      );
    } else {
      alert(
        `${title} login form validated successfully! Backend integration will be added soon.`
      );
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f0f7f2",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "450px",
      background: "#ffffff",
      padding: "35px",
      borderRadius: "20px",
      boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
      textAlign: "center",
    },
    emoji: {
      fontSize: "55px",
      marginBottom: "10px",
    },
    heading: {
      color: "#166534",
      fontSize: "30px",
      marginBottom: "10px",
    },
    subtitle: {
      color: "#666",
      marginBottom: "25px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      textAlign: "left",
    },
    label: {
      fontWeight: "600",
      color: "#333",
      marginBottom: "6px",
      display: "block",
    },
    input: {
      width: "100%",
      padding: "13px",
      border: "1px solid #ddd",
      borderRadius: "9px",
      fontSize: "15px",
      boxSizing: "border-box",
      outlineColor: "#166534",
    },
    submit: {
      background: "#166534",
      color: "white",
      border: "none",
      padding: "14px",
      borderRadius: "9px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "10px",
    },
    switch: {
      marginTop: "22px",
      color: "#555",
    },
    link: {
      color: "#166534",
      fontWeight: "bold",
      cursor: "pointer",
      border: "none",
      background: "none",
      fontSize: "15px",
    },
    back: {
      background: "none",
      border: "none",
      color: "#166534",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: "bold",
      marginTop: "20px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.emoji}>{emoji}</div>

        <h1 style={styles.heading}>
          {title} {isRegister ? "Registration" : "Login"}
        </h1>

        <p style={styles.subtitle}>
          Welcome to Harvest Hub
        </p>

        <form style={styles.form} onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div>
            <label style={styles.label}>Mobile Number</label>
            <input
              style={styles.input}
              type="tel"
              name="mobile"
              placeholder="Enter 10-digit mobile number"
              value={formData.mobile}
              onChange={handleChange}
              maxLength={10}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {isRegister && (
            <div>
              <label style={styles.label}>
                Confirm Password
              </label>
              <input
                style={styles.input}
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" style={styles.submit}>
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <div style={styles.switch}>
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}

          <br />

          <button
            style={styles.link}
            onClick={() => {
              setIsRegister(!isRegister);
              setFormData({
                name: "",
                mobile: "",
                password: "",
                confirmPassword: "",
              });
            }}
          >
            {isRegister ? "Back to Login" : "Create Account"}
          </button>
        </div>

        <button
          style={styles.back}
          onClick={onBack || (() => window.history.back())}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default Login;