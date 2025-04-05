import React, { useState, useEffect } from "react";
import ReportInputTable from "./ReportInputTable";
import ReportTable from "./ReportTable";
import TopMenuBar from "./TopMenuBar";
import Footer from "./Footer";
import { Paper } from "@mui/material";
import { useUser } from "./UserContext";
import { useParams } from "react-router-dom";



const Reports = () => {

  const { userInfo } = useUser();
  const { id } = useParams();
  const [userId, setUserId] = useState(id || userInfo?.id);

  console.log("Report reportUserId", userId);

  useEffect(() => {
    if (id) {setUserId(id);
    console.log("Reports userId", id);
    }
  }, [id]);

  return (
    <div
      style={{
        backgroundColor: "#b3e5fc",
        backgroundImage: "url(/freeze_data.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh", // Ensures full height
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // Centers horizontally
      }}
    >
      <br />
      <br />
      <br />
      <br />
      <br />
      <TopMenuBar />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          paddingTop: "20px",
          flexGrow: 1,
        }}
      >
        <Paper
          style={{
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "20px",
            borderRadius: "10px",
            width: "90%",
            maxWidth: "1200px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          <ReportInputTable userId={userId} />
          <ReportTable userId={userId} />
        </Paper>
      </div>
      <Footer />
      <br />
      <br />
      <br />
      <br />
      <br />
    </div>
  );
}

export default Reports; 