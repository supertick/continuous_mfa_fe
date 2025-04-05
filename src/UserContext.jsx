import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "./utils/apiClient";

// Create the context
export const UserContext = createContext();

// Provider to wrap around your app
export const UserProvider = ({ children }) => {
  // Load user from localStorage if available
  const [userInfo, setUserInfo] = useState(() => {
    const storedUser = localStorage.getItem("userInfo");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // State to store all users (for admins only)
  const [users, setUsers] = useState([]);

  const [version, setVersion] = useState(null);

  // Fetch users for admins
  useEffect(() => {
    const fetchUsers = async () => {
        const response = await apiClient.get("/users");
        if (response) { 
          setUsers(response.data || []);
        }
    };

    if (userInfo) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      apiClient.setToken(userInfo.token);
    } else {
      localStorage.removeItem("userInfo");
      apiClient.setToken(null);
    }

    // Fetch users only if the logged-in user is an admin
    if (userInfo && userInfo.roles && userInfo.roles.includes("Admin")) {
      fetchUsers();
    } else {
      setUsers([]); // Clear users if not an admin
    }
  }, [userInfo]);

  useEffect(() => {
    async function fetchVersion() {
      const response = await apiClient.get("/version");
      if (response) {
        setVersion(response);
      }
    }
    fetchVersion();
  }, []); 

  // ✅ `getUserById` now ONLY returns a user from state; no fetching.
  const getUserById = (id) => {
    return users.find((user) => user.id === id) || null;
  };

  // ✅ `getUsers` simply returns the existing users state.
  const getUsers = () => {
    return users;
  };

  const getVersion = () => {
    return version;
  };

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, users, setUsers, getUserById, getUsers, version, getVersion }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for accessing the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
