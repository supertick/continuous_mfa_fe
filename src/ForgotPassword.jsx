import React, { useState } from "react";
import { Container, Box, Typography, TextField, Button, Paper, Alert } from "@mui/material";
import apiClient from "./utils/apiClient";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    try {
      await apiClient.post("/forgot-password", { email });
      setMessage("A password reset link has been sent to your email.");
      setError("");
    } catch (error) {
      setError("Failed to send reset email. Please try again.");
      console.error("Password reset failed:", error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={10} sx={{ p: 3, mt: 5, borderRadius: 2 }}>
        <Typography variant="h5" align="center">Forgot Password</Typography>
        <Box component="form" onSubmit={handlePasswordReset} sx={{ mt: 3 }}>
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
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Send Reset Link
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
