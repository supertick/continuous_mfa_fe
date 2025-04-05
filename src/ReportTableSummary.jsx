import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Typography, CircularProgress } from "@mui/material";
import apiClient from "./utils/apiClient"; // Adjust this import to your API client

const ReportTableSummary = ({ userId,reportId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabFiles = ["Summary_outputs/Heatmap_summary_output.png", "Summary_outputs/ATP_summary_output.png"];

  useEffect(() => {
    const fetchImage = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.getRaw(`/report-path/${userId}/work/${reportId}/${tabFiles[activeTab]}`);

        const imageUrl = URL.createObjectURL(response);
        setImageSrc(imageUrl);
      } catch (err) {
        setError("Failed to load image");
        setImageSrc(null);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [activeTab, reportId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          "& .MuiTabs-indicator": { backgroundColor: "#1976d2" },
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: "bold",
            backgroundColor: "#e0e0e0",
            transition: "background-color 0.3s ease",
            "&:hover": { backgroundColor: "#d6d6d6" },
          },
          "& .Mui-selected": { backgroundColor: "#ffffff", borderBottom: "2px solid #1976d2" },
        }}
      >
        <Tab label="Heatmap" />
        <Tab label="ATP" />
      </Tabs>

      <Box sx={{ padding: 2 }}>

        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Summary Output"
            style={{
              maxWidth: "100%",
              height: "auto",
              display: "block",
              margin: "auto",
            }}
          />
        )}
      </Box>
    </>
  );
};

export default ReportTableSummary;
