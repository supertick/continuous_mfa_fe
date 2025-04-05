// ProtectedRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "./UserContext";

const ProtectedRoute = ({ children }) => {
  const { userInfo } = useUser();
  const location = useLocation();

  // If user is NOT logged in, redirect to "/"
  if (!userInfo) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // If user IS logged in, render the protected page
  return children;
};

export default ProtectedRoute;
