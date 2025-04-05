// ReportTable.jsx
import React, { useState, useEffect } from "react";
import { Table, TableHead, TableRow, TableCell, Dialog } from "@mui/material";
import apiClient from "./utils/apiClient";
import { useUser } from "./UserContext";
import ReportDeleteDialog from "./ReportDeleteDialog";
import ReportTableBody from "./ReportTableBody"; // New Component
import { useParams } from "react-router-dom";

export default function ReportTable({ userId: propUserId = null }) {
  const { userInfo } = useUser();
  const { userId: paramUserId, id: paramId } = useParams();
  // Use paramUserId if available, otherwise fallback to the old param "id" or the prop:
  const effectiveUserId = paramUserId || paramId || propUserId;

  const [reports, setReports] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  const fetchData = async () => {
    try {
      console.log("Fetching reports for userId", effectiveUserId);
      // FIXME - use GET report-list
      const reportsRes = await apiClient.get("/reports?user_id=" + effectiveUserId);
      setReports(
        reportsRes.sort((a, b) => b.start_datetime - a.start_datetime)
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (!userInfo) return;
    fetchData();
  }, [userInfo, effectiveUserId]);

  useEffect(() => {
    if (!effectiveUserId) return;
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [effectiveUserId]);
  
  const handleOpenDeleteDialog = (fileId) => {
    setDeleteFileId(fileId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteFile = async () => {
    try {
      await apiClient.delete(`/report/${deleteFileId}`);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Input Files</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <ReportTableBody
          userId={effectiveUserId}
          reports={reports}
          onOpenDeleteDialog={handleOpenDeleteDialog}
          setZoomedImage={setZoomedImage}
        />
      </Table>

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

      <ReportDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteFile}
      />
    </>
  );
}
