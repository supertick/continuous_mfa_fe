import React, { useState } from "react";
import { Container, Box, Typography, TextField, Button, Paper, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiClient from "./utils/apiClient";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{12,}$/;
    return passwordRegex.test(password);
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 12 characters long and contain at least one special character");
      return;
    }

    try {
      await apiClient.post("/signup", { email, password });
      setMessage("Account created successfully! Redirecting to login...");
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setError("Signup failed. Please try again.");
      console.error("Signup failed:", error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={10} sx={{ p: 3, mt: 5, borderRadius: 2 }}>
        <Typography variant="h5" align="center">Sign Up</Typography>
        <Box component="form" onSubmit={handleSignup} sx={{ mt: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}
          <TextField
            fullWidth
            required
            label="Email Address"
            margin="normal"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            required
            label="Password"
            type="password"
            margin="normal"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            fullWidth
            required
            label="Confirm Password"
            type="password"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Sign Up
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Signup;