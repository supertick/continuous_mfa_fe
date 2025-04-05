import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from "@mui/material";
import apiClient from "./utils/apiClient";

const ForgotPasswordDialog = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    try {
      await apiClient.postForm("/forgot-password", { email });
      setMessage("Password reset instructions have been sent to your email.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Failed to send password reset email. Please try again.");
      setMessage("");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Forgot Password</DialogTitle>
      <form onSubmit={handleForgotPassword}>
        <DialogContent>
          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Send Reset Link
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
