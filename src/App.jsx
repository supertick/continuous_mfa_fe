// App.js
import React from "react";
import {
  HashRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import { createTheme, ThemeProvider } from "@mui/material";

import Role from "./Role";
import MFALite from "./MFALite";
import SimpleFileUpload from "./SimpleFileUpload";
import Reports from "./Reports";
import NotFoundPage from "./NotFoundPage";
import Login from "./Login";
import ServerStatus from "./ServerStatus";
import Users from "./Users";
import { UserProvider } from "./UserContext";
import { MFALiteProvider } from "./MFALiteContext";
import { AppProvider } from "./AppContext";
import Profile from "./Profile";

import ProtectedRoute from "./ProtectedRoute"; // NEW import
import "./custom-styles.css";
import ForgotPassword from "./ForgotPassword";
import SignUp from "./SignUp";
import Usage from "./Usage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2F3F5C",
      contrastText: "#ffffff",
    },
  },
});

function App({ signOut }) {
  return (
    <UserProvider>
      <AppProvider>
        <ThemeProvider theme={theme}>
          <MFALiteProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/signup" element={<SignUp />} />

                {/* Protected Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/usage"
                  element={
                    <ProtectedRoute>
                      <Usage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/roles"
                  element={
                    <ProtectedRoute>
                      <Role />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mfalite"
                  element={
                    <ProtectedRoute>
                      <MFALite signOut={signOut} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/file"
                  element={
                    <ProtectedRoute>
                      <SimpleFileUpload signOut={signOut} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/:id"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports/:userId/:reportId"
                  element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports/:id"
                  element={
                    <ProtectedRoute>
                      <Reports/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/server-status"
                  element={
                    <ProtectedRoute>
                      <ServerStatus />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Router>
          </MFALiteProvider>
        </ThemeProvider>
      </AppProvider>
    </UserProvider>
  );
}

export default App;
