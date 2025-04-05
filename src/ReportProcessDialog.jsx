import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Checkbox
} from "@mui/material";

import DescriptionIcon from "@mui/icons-material/Description";
import { useUser } from './UserContext';
import apiClient from "./utils/apiClient";

export default function ReportProcessDialog({ isOpen, onClose, onProcess }) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useBioInterpreter, setUseBioInterpreter] = useState(false);
  const [showBioInterpreterCheckbox, setShowBioInterpreterCheckbox] = useState(false);
  const { userInfo } = useUser();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      apiClient
        .get("/roles")
        .then((response) => {
          if (!userInfo || !userInfo.roles) {
            console.warn("No roles found for the user");
            setProducts([]);
            setShowBioInterpreterCheckbox(false);
            setLoading(false);
            return;
          }

          const productRoles = response.filter(role => role.type === 'product');
          const isAdmin = userInfo.roles.includes("Admin");

          let userProductRoles;
          if (isAdmin) {
            userProductRoles = productRoles;
          } else {
            userProductRoles = productRoles.filter(role =>
              userInfo.roles.includes(role.id)
            );
          }

          const hasBioInterpreter = userProductRoles.some(role => role.title === 'BioInterpreter');
          setShowBioInterpreterCheckbox(hasBioInterpreter);

          setProducts(userProductRoles.filter(role => role.title !== 'BioInterpreter'));
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
          setLoading(false);
        });
    }
  }, [isOpen, userInfo]);

  const handleProcess = () => {
    if (selectedProduct) {
      onProcess(selectedProduct, useBioInterpreter);
      onClose();
    }
  };

  const getColorFromHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 60%, 50%)`;
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Select Product</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <FormControl fullWidth>
              <InputLabel>Product</InputLabel>
              <Select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                renderValue={(selected) => {
                  const selectedProductObj = products.find(p => p.id === selected);
                  const color = selectedProductObj ? getColorFromHash(selectedProductObj.id) : "#ccc";
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <DescriptionIcon style={{ color, fontSize: 24 }} />
                      {selectedProductObj?.title}
                    </div>
                  );
                }}
              >
                {products.map((product) => {
                  const color = getColorFromHash(product.id);
                  return (
                    <MenuItem key={product.id} value={product.id}>
                      <ListItemIcon>
                        <DescriptionIcon style={{ color, fontSize: 24 }} />
                      </ListItemIcon>
                      <ListItemText primary={product.title} />
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {showBioInterpreterCheckbox && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={useBioInterpreter}
                    onChange={(e) => setUseBioInterpreter(e.target.checked)}
                  />
                }
                label="Use BioInterpreter"
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleProcess}
          color="primary"
          variant="contained"
          disabled={!selectedProduct}
        >
          Process
        </Button>
      </DialogActions>
    </Dialog>
  );
}
