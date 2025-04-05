import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Collapse,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Radio,
  Tooltip,
} from "@mui/material";
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
} from "@mui/icons-material";
import {
  Sync as SyncIcon,
  LibraryBooks as LibraryBooksIcon,
} from "@mui/icons-material";

import ReportProcessDialog from "./ReportProcessDialog";
import { Add as AddIcon } from "@mui/icons-material";

import { useUser } from "./UserContext";
import ReportDeleteDialog from "./ReportDeleteDialog";
import ReportUploadDialog from "./ReportUploadDialog";
import apiClient from "./utils/apiClient";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { formatDate } from "./DateUtils";

export default function ReportInputTable({ userId = null }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState(null);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { userInfo } = useUser();
  const [isInputTableVisible, setIsInputTableVisible] = useState(false);
  const [inputFiles, setInputFiles] = useState([]);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchData = async () => {
    try {
      // FIXME - use GET input-list 
      const [inputsRes] = await Promise.all([apiClient.get("/inputs?user_id=" + userId)]);

      setInputFiles(inputsRes.sort((a, b) => b.upload_date - a.upload_date));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (!userId) {
      return;
    }
    fetchData();
  }, [userId]);

  const handleOpenDeleteDialog = (fileId) => {
    setDeleteFileId(fileId);
    setIsDeleteDialogOpen(true);
  };

  const handleProcessInputFile = (selectedProduct, selectBioInterpreter) => {
    apiClient
      .post("/run", {
        id: apiClient.generateTimestampId(),
        product: selectedProduct,
        bio_interpreter: selectBioInterpreter,
        title: "input-1.xlsx",
        user_id: userId,
        input_files: [selectedFile],
        output_dir: "output_dir",
      })
      .then((response) => {
        console.log("Processing started:", response);
        fetchData();
      })
      .catch((error) => {
        console.error("Error processing input file:", error);
      });
  };

  const handleDeleteFile = async () => {
    try {
      console.info(`deleting ${deleteFileId}`);
      await apiClient.delete(`/input/${deleteFileId}`);
      setInputFiles((prev) => prev.filter((file) => file.id !== deleteFileId));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleFileUpload = (file) => {
    const epoch_time = new Date().getTime();
    const metadata = {
      id: `${userId}-${epoch_time}`,
      filename: file.name,
      user_id: userId,
      upload_date: epoch_time,
    };

    const reader = new FileReader();
    reader.onload = () => {
      const base64File = reader.result.split(",")[1]; // Extract the Base64 string
      const payload = {
        ...metadata,
        data: base64File, // Add the encoded file
      };

      // Example of sending the payload
      apiClient
        .post("/upload-file-content", payload)
        .then((response) => {
          console.log("file uploaded successfully:", response);
          fetchData();
          return response;
        })
        .catch((error) => {
          console.error("Error posting metadata:", error);
        });
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };

    reader.readAsDataURL(file); // Read the file as Base64
  };

  return (
    <>
      <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setUploadDialogOpen(true);
            setIsInputTableVisible(true);
          }}
        >
          Add Input
        </Button>

        <IconButton
          onClick={() => setIsInputTableVisible(!isInputTableVisible)}
        >
          {isInputTableVisible ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SyncIcon />}
          disabled={!selectedFile}
          onClick={() => setIsProcessDialogOpen(true)}
        >
          Process Input File
        </Button>
      </span>
      <Collapse in={isInputTableVisible}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Filename</TableCell>
              <TableCell>Uploaded</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inputFiles.map((record) => (
              <TableRow
                key={record.id}
                hover
                onClick={() => setSelectedFile(record.id)}
              >
                <TableCell>
                  <Radio checked={record.id === selectedFile} />
                </TableCell>
                <TableCell>{record.files}</TableCell>
                <TableCell>{formatDate(record.upload_date)}</TableCell>
                <TableCell>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDeleteDialog(record.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Collapse>
      <ReportUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleFileUpload}
      />

      <ReportDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteFile}
      />
      <ReportProcessDialog
        isOpen={isProcessDialogOpen}
        onClose={() => setIsProcessDialogOpen(false)}
        onProcess={handleProcessInputFile}
      />
    </>
  );
}
