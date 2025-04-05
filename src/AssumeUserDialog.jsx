import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, Alert } from "@mui/material";
import apiClient from "./utils/apiClient";

const AssumeUserDialog = () => {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setUserId("");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/assume-role", { userId });
      console.log("Success:", response.data);
      handleClose(); // Close dialog on success
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
        Assume User
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Assume User</DialogTitle>

        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth
            label="Enter User ID"
            variant="outlined"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g. gperry"
            required
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading || !userId}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Processing..." : "Assume Role"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AssumeUserDialog;
