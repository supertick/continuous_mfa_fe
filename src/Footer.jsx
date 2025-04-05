import React, { useEffect, useState } from "react";
import apiClient from "./utils/apiClient";
import { useUser } from "./UserContext";


const Footer = () => {
  const [version, setVersion] = useState(null);
  const { userInfo } = useUser();

  useEffect(() => {
    if (!userInfo) {
      return;
    }
    const fetchVersion = async () => {
      try {
        const response = await apiClient.get("/version");
        if (response) {
          setVersion(response);
        }
      } catch (error) {
        console.error("Failed to fetch version:", error);
      }
    };

    fetchVersion();
  }, [userInfo]);

  return (
    <footer
      style={{
        backgroundColor: "#2f3f5c",
        color: "#fff",
        textAlign: "center",
        padding: "10px 0",
        position: "fixed",
        bottom: 0,
        width: "100%",
        fontSize: "12px",
      }}
    >
      <p>
        &copy; MetalyticsBio 2025 | Version {version?.version || "0.0.0"}
      </p>
    </footer>
  );
};

export default Footer;
