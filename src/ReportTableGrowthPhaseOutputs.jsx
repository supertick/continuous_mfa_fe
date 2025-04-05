import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Typography, CircularProgress } from "@mui/material";
import apiClient from "./utils/apiClient"; // Adjust this import to your API client

const ReportTableGrowthPhaseOutputs = ({  userId, reportId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabFiles = ["Summary_outputs/Glyc_gf_output_1.png", "Summary_outputs/Glyc_gf_output_2.png", "Summary_outputs/TCA_gf_output_1.png", "Summary_outputs/TCA_gf_output_2.png", "Summary_outputs/PPP_gf_output_1.png", "Summary_outputs/PPP_gf_output_2.png"];

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
        <Tab label="Glyc" />
        <Tab label="Glyc Flux Rate" />
        <Tab label="TCA" />
        <Tab label="TCA Flux Rate" />
        <Tab label="PPP" />
        <Tab label="PPP Flux Rate" />
      </Tabs>

      <Box sx={{ padding: 2 }}>
        <Typography>Normalized growth phase flux for each condition ({["Glyc", "Glyc Flux Rate", "TCA", "TCA Flux Rate", "PPP", "PPP Flux Rate"][activeTab]}).</Typography>

        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Growth Phase Output"
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

export default ReportTableGrowthPhaseOutputs;
