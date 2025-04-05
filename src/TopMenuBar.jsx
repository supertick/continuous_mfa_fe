import React from "react";
import { styled } from "@mui/system";
import { Link, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import { useUser } from "./UserContext";
import apiClient from "./utils/apiClient";

const TopMenuBarContainer = styled("div")({
  width: "100%",
  height: "50px",
  backgroundColor: "#2f3f5c",
  display: "flex",
  alignItems: "center",
  padding: "0 15px", // Reduce excess padding to prevent elements from going too far right
  color: "#fff",
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 1000,
});

const Logo = styled("img")({
  height: "40px",
});

const NavMenu = styled("nav")({
  display: "flex",
  alignItems: "center",
  gap: "20px",
  marginLeft: "20px", // Ensures menu is right after the logo
});

const MenuLink = styled(Link)({
  color: "#fff",
  textDecoration: "none",
  "&:hover": { textDecoration: "underline" },
});

const UserInfo = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginLeft: "auto", // Pushes UserInfo to the far right
  paddingRight: "15px", // Prevents elements from touching the edge
});

const UserInitial = styled(Link)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: "#fff",
  color: "#2f3f5c",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
});

export default function TopMenuBar() {
  const { userInfo, setUserInfo } = useUser();
  const navigate = useNavigate();
  const isAdmin = userInfo?.roles?.includes("Admin");

  const handleLogout = () => {
    setUserInfo(null);
    localStorage.removeItem("userInfo");
    apiClient.setToken(null);
    navigate("/");
  };

  return (
    <TopMenuBarContainer>
      <Link to="/">
        <Logo src="/Metalytics-Logo_light.webp" alt="logo" />
      </Link>

      <NavMenu>
        {isAdmin && (
          <>
            <MenuLink to="/users">Users</MenuLink>
            <MenuLink to="/roles">Roles</MenuLink>
            <MenuLink to="/usage">Usage</MenuLink>
            <MenuLink to="/server-status">Server Status</MenuLink>
            </>
        )}
        <MenuLink to={`/reports/${userInfo?.id}`}>My Reports</MenuLink>
      </NavMenu>

      <UserInfo>
        {userInfo?.email && (
          <UserInitial to="/profile">
            {userInfo.email.charAt(0).toUpperCase()}
          </UserInitial>
        )}
        <IconButton onClick={handleLogout} color="inherit">
          <LogoutIcon />
        </IconButton>
      </UserInfo>
    </TopMenuBarContainer>
  );
}
