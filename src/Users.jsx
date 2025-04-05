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
import { useUser } from "./UserContext";
import { Link } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TopMenuBar from "./TopMenuBar";
import apiClient from "./utils/apiClient";
import Footer from "./Footer";

export default function Users() {
  const { users, setUsers, getUsers } = useUser();
  const [roles, setRoles] = useState([]);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const [newUser, setNewUser] = useState({
    email: "",
    fullname: "",
    roles: [],
    password: "",
    confirmPassword: "",
  });
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get("/users");
        if (response) {
          setUsers(response);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

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

  const handleAddUser = () => {
    setNewUser({ email: "", fullname: "", roles: [], password: "", confirmPassword: "" });
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setNewUser({ email: "", fullname: "", roles: [], password: "", confirmPassword: "" });
    setIsAddDialogOpen(false);
  };

  const handleSaveAdd = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (newUser.password.length < 9) {
      alert("Password must be at least 9 characters long");
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const userToSubmit = { ...newUser };
      const msgBuffer = new TextEncoder().encode(userToSubmit.password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      userToSubmit.password_hash = hashHex;
      delete userToSubmit.password;
      delete userToSubmit.confirmPassword;
      userToSubmit.id = userToSubmit.email;

      const response = await apiClient.post("/user", userToSubmit);
      setUsers((prevUsers) => [...prevUsers, response]);
      handleCloseAddDialog();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleNewUserFieldChange = (field, value) => {
    setNewUser((prevUser) => ({
      ...prevUser,
      [field]: value,
    }));
  };

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      password: "",
      confirmPassword: "",
    });
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditingUser(null);
    setIsEditDialogOpen(false);
  };

  const handleOpenDeleteDialog = (userId) => {
    setDeleteUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteUserId(null);
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteUser = async () => {
    try {
      await apiClient.delete(`/user/${deleteUserId}`);
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== deleteUserId)
      );
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updatedUser = { ...editingUser };

      if (updatedUser.password || updatedUser.confirmPassword) {
        if (updatedUser.password.length < 9) {
          alert("Password must be at least 9 characters long");
          return;
        }
        if (updatedUser.password !== updatedUser.confirmPassword) {
          alert("Passwords do not match");
          return;
        }

        const msgBuffer = new TextEncoder().encode(updatedUser.password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

        updatedUser.password_hash = hashHex;
      }

      delete updatedUser.password;
      delete updatedUser.confirmPassword;

      await apiClient.put(`/user/${updatedUser.id}`, updatedUser);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );
      handleCloseEditDialog();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleEditFieldChange = (field, value) => {
    setEditingUser((prevUser) => ({
      ...prevUser,
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
          <PersonIcon style={{ fontSize: 40, color: "#2F3F5C" }} />
          <h1 style={{ color: "#2F3F5C", margin: 0 }}>Users</h1>
        </div>

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
          >
            Add User
          </Button>
        </Box>

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Reports</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users && users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Link to={`/user/${user.id}`} style={{ textDecoration: "none", color: "#1976d2" }}>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/user/${user.id}`} style={{ textDecoration: "none", color: "#1976d2" }}>
                      {user.fullname}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/reports/${user.id}`}>reports</Link>
                  </TableCell>
                  <TableCell>{user.roles.join(", ")}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit User">
                      <IconButton color="primary" onClick={() => handleEditUser(user)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton onClick={() => handleOpenDeleteDialog(user.id)}>
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete User?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user with ID {deleteUserId}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="secondary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField label="Email" value={editingUser?.email || ""} fullWidth margin="normal" disabled />
          <TextField
            label="Full Name"
            value={editingUser?.fullname || ""}
            fullWidth
            margin="normal"
            onChange={(e) => handleEditFieldChange("fullname", e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            value={editingUser?.password || ""}
            fullWidth
            margin="normal"
            onChange={(e) => handleEditFieldChange("password", e.target.value)}
            error={editingUser?.password !== "" && editingUser?.password?.length < 9}
            helperText={
              editingUser?.password !== "" && editingUser?.password?.length < 9
                ? "Password must be at least 9 characters long"
                : "Leave blank to keep existing password"
            }
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={editingUser?.confirmPassword || ""}
            fullWidth
            margin="normal"
            onChange={(e) => handleEditFieldChange("confirmPassword", e.target.value)}
            error={
              editingUser?.password !== editingUser?.confirmPassword &&
              editingUser?.confirmPassword !== ""
            }
            helperText={
              editingUser?.password !== editingUser?.confirmPassword &&
              editingUser?.confirmPassword !== ""
                ? "Passwords do not match"
                : ""
            }
          />
          <Select
            label="Roles"
            multiple
            value={editingUser?.roles || []}
            onChange={(e) => handleEditFieldChange("roles", e.target.value)}
            fullWidth
            renderValue={(selected) => selected.join(", ")}
          >
            {roles &&
              roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  <Checkbox checked={editingUser?.roles?.includes(role.id)} />
                  <ListItemText primary={role.id} />
                </MenuItem>
              ))}
          </Select>
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

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onClose={handleCloseAddDialog}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            value={newUser.email}
            fullWidth
            margin="normal"
            onChange={(e) => handleNewUserFieldChange("email", e.target.value)}
            error={newUser.email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)}
            helperText={
              newUser.email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)
                ? "Please enter a valid email address"
                : ""
            }
          />
          <TextField
            label="Full Name"
            value={newUser.fullname}
            fullWidth
            margin="normal"
            onChange={(e) => handleNewUserFieldChange("fullname", e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            value={newUser.password}
            fullWidth
            margin="normal"
            onChange={(e) => handleNewUserFieldChange("password", e.target.value)}
            error={newUser.password !== "" && newUser.password.length < 9}
            helperText={
              newUser.password !== "" && newUser.password.length < 9
                ? "Password must be at least 9 characters long"
                : ""
            }
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={newUser.confirmPassword}
            fullWidth
            margin="normal"
            onChange={(e) => handleNewUserFieldChange("confirmPassword", e.target.value)}
            error={newUser.password !== newUser.confirmPassword && newUser.confirmPassword !== ""}
            helperText={
              newUser.password !== newUser.confirmPassword && newUser.confirmPassword !== ""
                ? "Passwords do not match"
                : ""
            }
          />
          <Select
            label="Roles"
            multiple
            value={newUser.roles}
            onChange={(e) => handleNewUserFieldChange("roles", e.target.value)}
            fullWidth
            renderValue={(selected) => selected.join(", ")}
          >
            {roles &&
              roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  <Checkbox checked={newUser.roles.includes(role.id)} />
                  <ListItemText primary={role.id} />
                </MenuItem>
              ))}
          </Select>
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
