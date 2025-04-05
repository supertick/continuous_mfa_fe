import React, { useState, useEffect } from "react";
import apiClient from "./utils/apiClient";

const getImageUrl = async (userId, reportId, file) => {
  try {
    const response = await apiClient.getRaw(`/report-path/${userId}/work/${reportId}/${file}`);
    return URL.createObjectURL(response); // Convert Blob to URL
  } catch (error) {
    console.error(`Error fetching ${file} for report ${reportId}:`, error);
    return null; // Return null if there’s an error
  }
};

const ReportImage = ({ userId,reportId, file }) => {
    const [imageUrl, setImageUrl] = useState(null);
  
    useEffect(() => {
      const fetchImage = async () => {
        const url = await getImageUrl(userId,reportId, file);
        setImageUrl(url);
      };
      fetchImage();
    }, [userId,reportId, file]);
  
    if (!imageUrl) return <p>Loading image...</p>;
  
    return <img src={imageUrl} alt={file} style={{ maxWidth: "100%" }} />;
  };
  
  export default ReportImage;