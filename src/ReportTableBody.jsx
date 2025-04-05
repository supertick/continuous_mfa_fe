// ReportTableBody.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  IconButton,
  Collapse,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Analytics as AnalyticsIcon,
  GetApp as DownloadIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
} from "@mui/icons-material";
import { formatDate } from "./DateUtils";
import ReportTableGrowthPhaseOutputs from "./ReportTableGrowthPhaseOutputs";
import ReportTableBioInterpreter from "./ReportTableBioInterpreter";
import ReportTableStationaryPhaseOutputs from "./ReportTableStationaryPhaseOutputs";
import ReportTableSummary from "./ReportTableSummary";
import ReportTableImages from "./ReportTableImages";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import apiClient from "./utils/apiClient";
import ReportTableStatusCell from "./ReportTableStatusCell";
import { useUser } from "./UserContext";
import ReportImage from "./ReportImage";
import FileViewer from "./FileViewer";
import { useParams, useNavigate } from "react-router-dom";

export default function ReportTableBody({
  userId,
  reports,
  onOpenDeleteDialog,
  setZoomedImage,
}) {
  const [expandedRows, setExpandedRows] = useState({});
  const [activeTab, setActiveTab] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userInfo } = useUser();
  const isAdmin = userInfo?.roles?.includes("Admin");
  const { reportId } = useParams();
  const navigate = useNavigate();

  // Auto-expand the matching report row based on the URL reportId.
  useEffect(() => {
    if (reportId && reports.length > 0) {
      const matchingReport = reports.find(
        (record) => String(record.id) === String(reportId)
      );
      if (matchingReport) {
        setExpandedRows({ [matchingReport.id]: true });
      }
    }
  }, [reportId, reports]);

  // Toggle the row expansion and update the URL accordingly.
  const toggleRow = (id) => {
    setSelectedFile(null);
    setExpandedRows((prev) => {
      if (prev[id]) {
        // If the row is already expanded, collapse it and update the URL to remove the reportId.
        navigate(`/reports/${userId}`);
        return {};
      }
      // Expand the new row and update the URL with the new reportId.
      navigate(`/reports/${userId}/${id}`);
      return { [id]: true };
    });
  };

  const handleTabChange = (id, newValue) => {
    setActiveTab((prev) => ({ ...prev, [id]: newValue }));
  };

  const handleFileClick = async (id, file) => {
    setSelectedFile(file);
    setFileContent(null);
    setLoading(true);
    try {
      if (file.endsWith(".zip")) {
        setFileContent("No content available.");
        return;
      }
      const response = await apiClient.getRaw(
        `/report-path/${userId}/work/${id}/${file}`
      );
      const fileExtension = file.split(".").pop().toLowerCase();
      if (fileExtension === "json") {
        setFileContent(JSON.stringify(response, null, 2));
      } else {
        setFileContent(response);
      }
    } catch (error) {
      console.error("Error fetching file:", error);
      setFileContent("Error loading file.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadContents = () => {
    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownload = async (id) => {
    try {
      const response = await apiClient.getRaw(
        `/report/${id}-output.zip?user_id=${userId}`,
        {
          responseType: "blob",
        }
      );
      const blob = response;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${id}-output.zip`;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <TableBody>
      {reports.map((record) => {
        let tabComponents = [];
        if (record.product === "MFALite" || record.product === "BMSMFALite") {
          tabComponents = [
            <ReportTableGrowthPhaseOutputs userId={userId} reportId={record.id} />,
            <ReportTableStationaryPhaseOutputs userId={userId} reportId={record.id} />,
            <ReportTableSummary userId={userId} reportId={record.id} />,
            <ReportTableBioInterpreter userId={userId} reportId={record.id} />,
          ];
        } else if (record.product === "CloneSelect") {
          tabComponents = [];
        }

        return (
          <React.Fragment key={record.id}>
            {/* Main Row */}
            <TableRow>
              <TableCell>
                {record.status !== "error" && record.status !== "completed" ? (
                  <img
                    src="/processing.gif"
                    alt="Processing"
                    width={30}
                    height={30}
                  />
                ) : record.status === "error" ? (
                  <AnalyticsIcon style={{ fontSize: 30, color: "red" }} />
                ) : (
                  <AnalyticsIcon style={{ fontSize: 30, color: "#2F3F5C" }} />
                )}
                <IconButton onClick={() => toggleRow(record.id)}>
                  {expandedRows[record.id] ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </IconButton>
              </TableCell>
              <TableCell>{record.product}</TableCell>
              <ReportTableStatusCell record={record} />
              <TableCell>{record.input_files}</TableCell>
              <TableCell>
                {formatDate(record.start_datetime)}
                {record.end_datetime && (
                  <>
                    {" • "}
                    {(() => {
                      const start = new Date(record.start_datetime);
                      const end = new Date(record.end_datetime);
                      const durationMs = end - start;
                      const minutes = Math.floor(durationMs / 60);
                      const seconds = Math.floor((durationMs % 60));
                      return `${minutes}m ${seconds}s`;
                    })()}
                  </>
                )}
              </TableCell>
              <TableCell>
                <Tooltip title="Download All">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(record.id);
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete All">
                  <IconButton onClick={() => onOpenDeleteDialog(record.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>

            {/* Expandable Row */}
            <TableRow>
              <TableCell colSpan={6} sx={{ padding: 0 }}>
                <Collapse in={expandedRows[record.id]} timeout="auto" unmountOnExit>
                  <Box sx={{ backgroundColor: "#f9f9f9", padding: 2 }}>
                    <strong>Report ID:</strong> {record.id} |{" "}
                    <strong>Status:</strong> {record.status} |{" "}
                    <strong>Product:</strong> {record.product} |{" "}
                    <strong>By User:</strong> {record.user_id}
                    {record.product !== "CloneSelectMFA" && (
                      <>
                        <Tabs
                          value={activeTab[record.id] || 0}
                          onChange={(event, newValue) => handleTabChange(record.id, newValue)}
                          variant="scrollable"
                          scrollButtons="auto"
                        >
                          <Tab label="Growth Phase Outputs" />
                          <Tab label="Stationary Phase Outputs" />
                          <Tab label="Summary Outputs" />
                          <Tab label="BioInterpreter" />
                        </Tabs>
                        <Box sx={{ padding: 2 }}>
                          {tabComponents[activeTab[record.id] || 0]}
                        </Box>
                      </>
                    )}
                    {record.product === "CloneSelectMFA" && (
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <h3>Output</h3>
                              <ReportImage
                                userId={userId}
                                reportId={record.id}
                                file="Selected_Cloneselect_output.png"
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <h3>All Clone Total</h3>
                              <ReportImage
                                userId={userId}
                                reportId={record.id}
                                file="All_Clone_total_Cloneselect_output.png"
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    )}
                    <ReportTableImages userId={userId} reportId={record.id} report={record} />
                    {isAdmin && (
                      <>
                        <strong>Files:</strong>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "10px",
                            marginTop: "5px",
                          }}
                        >
                          {record.output_files.sort().map((file, index) => (
                            <button
                              key={index}
                              onClick={() => handleFileClick(record.id, file)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "blue",
                                textDecoration: "underline",
                                cursor: "pointer",
                                fontSize: "inherit",
                                padding: "5px",
                              }}
                            >
                              {file}
                            </button>
                          ))}
                        </div>
                        {/* Display the selected file */}
                        {selectedFile && (
                          <div style={{ marginTop: "20px" }}>
                            <h4
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              Displaying: {selectedFile}
                              <div style={{ display: "flex", gap: "5px" }}>
                                <Tooltip title="Download">
                                  <IconButton size="small" onClick={handleDownloadContents}>
                                    <FileDownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </div>
                            </h4>
                            <FileViewer
                              fileContent={fileContent}
                              selectedFile={selectedFile}
                              loading={loading}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </Box>
                </Collapse>
              </TableCell>
            </TableRow>
          </React.Fragment>
        );
      })}
    </TableBody>
  );
}
