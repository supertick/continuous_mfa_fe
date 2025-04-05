import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "./UserContext";
import { Card, CardContent, Avatar, Typography, TextField, Button, Box, Alert } from "@mui/material";
import TopMenuBar from "./TopMenuBar";
import Footer from "./Footer";
import apiClient from "./utils/apiClient";

const Profile = () => {
  const { id } = useParams(); // Get user ID from URL
  const { userInfo, getUserById } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    fullname: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  // Determine which user to display
  const displayUser = id ? getUserById(id) : userInfo;

  if (!displayUser) {
    return <Typography>Loading...</Typography>;
  }

  const formatEpochTimestamp = (epoch) => {
    if (!epoch) return "N/A";
    const date = new Date(epoch);
    return date.toLocaleString();
  };

  const handleToggleEdit = () => {
    if (!isEditing) {
      // Initialize form with current values when starting to edit
      setPasswordForm({
        fullname: displayUser.fullname || "",
        password: "",
        confirmPassword: "",
      });
    }
    setIsEditing(!isEditing);
    setMessage({ text: "", type: "" }); // Clear any previous messages
  };

  const handleInputChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate fullname
    if (!passwordForm.fullname.trim()) {
      setMessage({ text: "Full name cannot be empty", type: "error" });
      return;
    }
    
    // Check if password fields are filled
    const isChangingPassword = passwordForm.password.length > 0 || passwordForm.confirmPassword.length > 0;
    
    // Validate password only if attempting to change it
    if (isChangingPassword) {
      // Validate password length
      if (passwordForm.password.length < 9) {
        setMessage({ text: "Password must be at least 9 characters long", type: "error" });
        return;
      }
      
      // Validate passwords match
      if (passwordForm.password !== passwordForm.confirmPassword) {
        setMessage({ text: "Passwords do not match", type: "error" });
        return;
      }
    }
    
    try {
      // Create submission object
      const userToSubmit = {
        id: displayUser.id,
        email: displayUser.email,
        fullname: passwordForm.fullname,
      };
      
      // Add password hash if changing password
      if (isChangingPassword) {
        // Generate SHA-256 hash of the password
        const msgBuffer = new TextEncoder().encode(passwordForm.password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Add password hash
        userToSubmit.password_hash = hashHex;
      }
      
      // Submit to API
      await apiClient.put(`/user/${displayUser.id}`, userToSubmit);
      
      setMessage({ text: "Profile updated successfully", type: "success" });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ text: "Failed to update profile", type: "error" });
    }
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "#b3e5fc",
          backgroundImage: "url(/freeze_data.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TopMenuBar />
        <br />
        <Card
          sx={{
            width: "fit-content",
            maxWidth: "90vw",
            mx: "auto",
            p: 2,
            boxShadow: 3,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ width: 96, height: 96 }} src={displayUser.avatar} alt={displayUser.name} />
            
            {message.text && (
              <Alert severity={message.type} sx={{ width: '100%' }}>
                {message.text}
              </Alert>
            )}
            
            {isEditing ? (
              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
                <TextField
                  label="Email"
                  value={displayUser.email}
                  fullWidth
                  margin="normal"
                  disabled
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="Full Name"
                  value={passwordForm.fullname}
                  onChange={(e) => handleInputChange("fullname", e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="New Password"
                  type="password"
                  value={passwordForm.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  fullWidth
                  margin="normal"
                  error={passwordForm.password !== "" && passwordForm.password.length < 9}
                  helperText={
                    passwordForm.password !== "" && passwordForm.password.length < 9
                      ? "Password must be at least 9 characters long"
                      : ""
                  }
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  fullWidth
                  margin="normal"
                  error={
                    passwordForm.confirmPassword !== "" && 
                    passwordForm.password !== passwordForm.confirmPassword
                  }
                  helperText={
                    passwordForm.confirmPassword !== "" && 
                    passwordForm.password !== passwordForm.confirmPassword
                      ? "Passwords do not match"
                      : ""
                  }
                  sx={{ mb: 3 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button variant="outlined" onClick={handleToggleEdit}>
                    Cancel
                  </Button>
                  <Button variant="contained" type="submit" color="primary">
                    Save Changes
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="h5" fontWeight="bold">{displayUser.fullname}</Typography>
                <Typography color="textSecondary">
                  Email{" "}
                  <a href={`mailto:${displayUser.email}`} style={{ textDecoration: "none", color: "inherit" }}>
                    {displayUser.email}
                  </a>
                  <br />
                  Logins {displayUser.login_count}
                  <br />
                  Last Login {formatEpochTimestamp(displayUser.last_login)}
                  <br />
                  Last Unsuccessful {formatEpochTimestamp(displayUser.last_unsuccessful_login)}
                  <br />
                </Typography>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleToggleEdit}
                  sx={{ mt: 2 }}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        <Footer />
      </div>
    </>
  );
};

export default Profile;
