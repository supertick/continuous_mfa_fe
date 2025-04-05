import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  IconButton,
  Tooltip,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TopMenuBar from "./TopMenuBar";
import apiClient from "./utils/apiClient";
import Footer from "./Footer";
import AppsIcon from "@mui/icons-material/Apps";

export default function Role() {
  const [roles, setRoles] = useState([]);
  const [deleteRoleId, setDeleteRoleId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // Add dialog state
  const [newRole, setNewRole] = useState({
    email: "",
    fullname: "",
    roles: [],
  }); // State for new role
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiClient.get("/roles");
        if (response) {
          setRoles(response);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  const handleAddRole = () => {
    setNewRole({ email: "", fullname: "", roles: [] }); // Reset new role form
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setNewRole({ email: "", fullname: "", roles: [] }); // Clear form
    setIsAddDialogOpen(false);
  };

  const handleSaveAdd = async () => {
    try {
      const response = await apiClient.post("/role", newRole);
      setRoles((prevRoles) => [...prevRoles, response]);
      handleCloseAddDialog();
    } catch (error) {
      console.error("Error adding role:", error);
    }
  };

  const handleNewRoleFieldChange = (field, value) => {
    setNewRole((prevRole) => ({
      ...prevRole,
      [field]: value,
    }));
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditingRole(null);
    setIsEditDialogOpen(false);
  };

  const handleOpenDeleteDialog = (roleId) => {
    setDeleteRoleId(roleId);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteRoleId(null);
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteRole = async () => {
    try {
      await apiClient.delete(`/role/${deleteRoleId}`);
      setRoles((prevRoles) =>
        prevRoles.filter((role) => role.id !== deleteRoleId)
      );
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await apiClient.put(`/role/${editingRole.id}`, editingRole);
      setRoles((prevRoles) =>
        prevRoles.map((role) =>
          role.id === editingRole.id ? editingRole : role
        )
      );
      handleCloseEditDialog();
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleEditFieldChange = (field, value) => {
    setEditingRole((prevRole) => ({
      ...prevRole,
      [field]: value,
    }));
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#b3e5fc",
        backgroundImage: "url(/freeze_data.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        paddingTop: "50px",
      }}
    >
      <TopMenuBar />
      <div
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <AppsIcon style={{ fontSize: 40, color: "#2F3F5C" }} />
          <h1 style={{ color: "#2F3F5C", margin: 0 }}>Roles</h1>
        </div>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddRole}
          >
            Add Role
          </Button>
        </Box>

        {/* MUI Paper Table */}
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.id}</TableCell>
                  <TableCell>{role.title}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit Role">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditRole(role)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Role">
                      <IconButton
                        onClick={() => handleOpenDeleteDialog(role.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-role-dialog-title"
        aria-describedby="delete-role-dialog-description"
      >
        <DialogTitle id="delete-role-dialog-title">
          {"Delete Role?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-role-dialog-description">
            Are you sure you want to delete role with ID {deleteRoleId}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteRole} color="secondary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        aria-labelledby="edit-role-dialog-title"
        aria-describedby="edit-role-dialog-description"
      >
        <DialogTitle id="edit-role-dialog-title">Edit Role</DialogTitle>
        <DialogContent>
          <TextField
            label="Id"
            value={editingRole?.id || ""}
            fullWidth
            margin="normal"
            disabled
          />
          <TextField
            label="Title"
            value={editingRole?.title || ""}
            fullWidth
            margin="normal"
            onChange={(e) => handleEditFieldChange("title", e.target.value)}
          />
          <TextField
            label="Description"
            value={editingRole?.description || ""}
            fullWidth
            margin="normal"
            onChange={(e) => handleEditFieldChange("description", e.target.value)}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} color="secondary" autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Add Role Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={handleCloseAddDialog}
        aria-labelledby="add-role-dialog-title"
        aria-describedby="add-role-dialog-description"
      >
        <DialogTitle id="add-role-dialog-title">Add New Role</DialogTitle>
        <DialogContent>
          <TextField
            label="Id"
            value={newRole.id}
            fullWidth
            margin="normal"
            onChange={(e) =>
              handleNewRoleFieldChange("id", e.target.value)
            }
          />
          <TextField
            label="Title"
            value={newRole.title}
            fullWidth
            margin="normal"
            onChange={(e) =>
              handleNewRoleFieldChange("title", e.target.value)
            }
          />
          <TextField
            label="Description"
            value={newRole.description}
            fullWidth
            margin="normal"
            onChange={(e) =>
              handleNewRoleFieldChange("description", e.target.value)
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveAdd} color="secondary" autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </div>
  );
}
