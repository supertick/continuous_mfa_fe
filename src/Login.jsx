import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Paper,
  Alert,
} from "@mui/material";
import { jwtDecode } from "jwt-decode"; 
import { useUser } from "./UserContext";
import apiClient from "./utils/apiClient";
import ForgotPasswordDialog from "./ForgotPasswordDialog";
import SignUpDialog from "./SignUpDialog";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);

  const { setUserInfo } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await apiClient.postForm("/login", {
        email: email,
        username: email,
        password: password,
      });

      if (response && response.access_token) {
        // Decode the JWT to extract user info
        const decodedToken = jwtDecode(response.access_token);
        const user = decodedToken.user;

        // Update context & localStorage
        user["token"] = response.access_token;
        setUserInfo(user);
        apiClient.setToken(response.access_token);

        // Clear error, redirect user
        setErrorMessage("");
        console.log("User logged in successfully:", user);
        navigate(`/reports/${user.id}`);
      }
    } catch (error) {
      setErrorMessage("Invalid email or password. Please try again.");
      console.error("Login failed:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#b3e5fc",
        backgroundImage: "url(/freeze_data.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        paddingTop: "50px",
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          style={{
            margin: "20px auto",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          }}
          elevation={10}
        >
          {/* Dialog Header */}
          <Box
            style={{
              backgroundColor: "rgb(47, 63, 92)",
              color: "white",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <img
              src="/Metalytics-Logo_light.webp"
              alt="Metalytics Logo"
              style={{ height: "40px" }}
            />
            <Typography component="h1" variant="h6">
              Continuous MFA Login
            </Typography>
          </Box>

          {/* Form */}
          <Box
            style={{
              padding: "20px",
              backgroundColor: "rgb(252, 254, 255)",
            }}
          >
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
            <Box component="form" onSubmit={handleLogin} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: "rgb(47, 63, 92)" }}
              >
                Login
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link
                    type="button" 
                    component="button"
                    variant="body2"
                    onClick={() => setOpenForgotPassword(true)}
                  >
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    type="button" 
                    component="button"
                    variant="body2"
                    onClick={() => setOpenSignUp(true)}
                  >
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Render dialogs */}
      <ForgotPasswordDialog
        open={openForgotPassword}
        onClose={() => setOpenForgotPassword(false)}
      />
      <SignUpDialog open={openSignUp} onClose={() => setOpenSignUp(false)} />
    </div>
  );
};

export default Login;
