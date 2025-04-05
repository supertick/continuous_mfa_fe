import React, { useState, useEffect } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import ReactMarkdown from "react-markdown";
import apiClient from "./utils/apiClient"; // Ensure correct import

const ReportTableBioInterpreter = ({ reportId }) => {
  const [bioInterpreterMd, setBioInterpreterMd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.getRaw(`/report/${reportId}-BioInterpreter.md`);
        setBioInterpreterMd(response);
      } catch (err) {
        setError("Failed to load BioInterpreter report.");
        setBioInterpreterMd(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [reportId]);

  return (

      <Box sx={{ mt: 2, p: 2, border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : bioInterpreterMd ? (
          <ReactMarkdown>{bioInterpreterMd}</ReactMarkdown>
        ) : (
          <Typography>No content available.</Typography>
        )}
      </Box>

  );
};

export default ReportTableBioInterpreter;
