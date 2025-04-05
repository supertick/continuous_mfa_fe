import React, { useState, useEffect } from "react";
import { TableRow, TableCell, CircularProgress, Dialog } from "@mui/material";
import apiClient from "./utils/apiClient"; // Adjust the path as needed

const ReportTableImages = ({ userId, reportId, report }) => {
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);

  let imageFiles = [];

  if (report.product === "MFALite" || report.product === "BMSMFALite") {
    imageFiles = [
      "Summary_outputs/AAMet_gf_output_1.png",
      "Summary_outputs/AAMet_gf_output_2.png",
      "Summary_outputs/AAMet_sf_output_1.png",
      "Summary_outputs/AAMet_sf_output_2.png",
      "Summary_outputs/ATP_summary_output.png",
      "Summary_outputs/data_quality.png",
      "Summary_outputs/Glyc_gf_output_1.png",
      "Summary_outputs/Glyc_gf_output_2.png",
      "Summary_outputs/Glyc_sf_output_1.png",
      "Summary_outputs/Glyc_sf_output_2.png",
      "Summary_outputs/Heatmap_summary_output.png",
      "Summary_outputs/metadata.png",
      "Summary_outputs/PPP_gf_output_1.png",
      "Summary_outputs/PPP_gf_output_2.png",
      "Summary_outputs/PPP_sf_output_1.png",
      "Summary_outputs/PPP_sf_output_2.png",
      "Summary_outputs/TCA_gf_output_1.png",
      "Summary_outputs/TCA_gf_output_2.png",
      "Summary_outputs/TCA_sf_output_1.png",
      "Summary_outputs/TCA_sf_output_2.png",
      "Summary_outputs/Uptake_gf_output_1.png",
      "Summary_outputs/Uptake_gf_output_2.png",
      "Summary_outputs/Uptake_sf_output_1.png",
      "Summary_outputs/Uptake_sf_output_2.png",
    ];
  } else if (report.product === "CloneSelectMFA") {
    imageFiles = [
      "All_Clone_total_Cloneselect_output.png",
      "Selected_Cloneselect_output.png",
    ];
  }

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const fetchedImages = await Promise.all(
          imageFiles.map(async (file) => {
            try {
              // const response = await apiClient.getRaw(`/report/${reportId}-${file}`);
              const response = await apiClient.getRaw(`/report-path/${userId}/work/${reportId}/${file}`);   
              const imageUrl = URL.createObjectURL(response); // Convert Blob to URL
              return { file, url: imageUrl };
            } catch (error) {
              console.error(
                `Error fetching ${file} for report ${reportId}:`,
                error
              );
              return null;
            }
          })
        );

        setImageUrls(fetchedImages.filter((img) => img && img.url)); // Remove nulls
      } catch (error) {
        console.error(`Error fetching images for report ${reportId}:`, error);
        setImageUrls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();

    // Cleanup to prevent memory leaks from Blob URLs
    return () => {
      imageUrls.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, [reportId]);

  return (
    <>
      <TableRow>
        <TableCell colSpan={6} align="center">
          {loading ? (
            <CircularProgress />
          ) : imageUrls.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              {imageUrls.map((img) => (
                <img
                  key={img.file}
                  src={img.url}
                  alt={img.file}
                  onClick={() => setZoomedImage(img.url)}
                  style={{
                    maxWidth: "150px",
                    maxHeight: "150px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          ) : (
            <span style={{ color: "red" }}>Images not available</span>
          )}
        </TableCell>
      </TableRow>

      {/* Full-Size Image Modal */}
      <Dialog
        open={!!zoomedImage}
        onClose={() => setZoomedImage(null)}
        maxWidth="lg"
      >
        {zoomedImage && (
          <img
            src={zoomedImage}
            alt="Zoomed"
            style={{ width: "100%", height: "auto" }}
          />
        )}
      </Dialog>
    </>
  );
};

export default ReportTableImages;
