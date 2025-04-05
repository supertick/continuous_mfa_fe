import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import TopMenuBar from "./TopMenuBar";
import apiClient from "./utils/apiClient";
import Footer from "./Footer";

const Usage = () => {
  const [usage, setUsage] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      const response = await apiClient.get("/run-stats/default");
      if (response) {
        setUsage(response);
      }
    };
    fetchRoles();
  }, []);

  // **Process Data for Rollup**
  const aggregatedData = {};
  const detailedData = {};
  if (usage) {
    Object.entries(usage.run_counts).forEach(([key, value]) => {
      const [user, product, status] = key.split("|");

      // Aggregate per user
      if (!aggregatedData[user]) {
        aggregatedData[user] = {
          started: 0,
          completed: 0,
          error: 0,
          clones_processed: 0,
        };
        detailedData[user] = {};
      }

      // Aggregate detailed breakdown per product
      if (!detailedData[user][product]) {
        detailedData[user][product] = {
          started: 0,
          completed: 0,
          error: 0,
          clones_processed: 0,
        };
      }

      if (status === "started") {
        aggregatedData[user].started += value;
        detailedData[user][product].started += value;
      } else if (status === "completed") {
        aggregatedData[user].completed += value;
        detailedData[user][product].completed += value;
      } else if (status === "error") {
        aggregatedData[user].error += value;
        detailedData[user][product].error += value;
      } else if (status === "clones_processed") {
        aggregatedData[user].clones_processed += value;
        detailedData[user][product].clones_processed += value;
      }
    });
  }
  return (
    <>
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
        <br />
        <br />
        <br />
        <br />
        <Card
          sx={{
            maxWidth: 800,
            mx: "auto",
            p: 2,
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="h6">Usage Summary</Typography>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>
                      <strong>User</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Started</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Completed</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Errors</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Clones Processed</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(aggregatedData).map(([user, totals]) => (
                    <React.Fragment key={user}>
                      {/* **Rollup Row** */}
                      <TableRow>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setExpandedUser(
                                expandedUser === user ? null : user
                              )
                            }
                          >
                            {expandedUser === user ? (
                              <KeyboardArrowUp />
                            ) : (
                              <KeyboardArrowDown />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell>{user}</TableCell>
                        <TableCell align="right">{totals.started}</TableCell>
                        <TableCell align="right">{totals.completed}</TableCell>
                        <TableCell align="right">{totals.error}</TableCell>
                        <TableCell align="right">
                          {totals.clones_processed}
                        </TableCell>
                      </TableRow>

                      {/* **Expandable Detailed Row** */}
                      <TableRow>
                        <TableCell colSpan={6} sx={{ padding: 0 }}>
                          <Collapse
                            in={expandedUser === user}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box
                              sx={{
                                margin: 2,
                                backgroundColor: "#f9f9f9",
                                padding: 2,
                              }}
                            >
                              <Typography variant="subtitle1">
                                Product Details for {user}
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>
                                      <strong>Product</strong>
                                    </TableCell>
                                    <TableCell align="right">
                                      <strong>Started</strong>
                                    </TableCell>
                                    <TableCell align="right">
                                      <strong>Completed</strong>
                                    </TableCell>
                                    <TableCell align="right">
                                      <strong>Errors</strong>
                                    </TableCell>
                                    <TableCell align="right">
                                      <strong>Clones Processed</strong>
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {Object.entries(detailedData[user]).map(
                                    ([product, counts]) => (
                                      <TableRow key={product}>
                                        <TableCell>{product}</TableCell>
                                        <TableCell align="right">
                                          {counts.started}
                                        </TableCell>
                                        <TableCell align="right">
                                          {counts.completed}
                                        </TableCell>
                                        <TableCell align="right">
                                          {counts.error}
                                        </TableCell>
                                        <TableCell align="right">
                                          {counts.clones_processed}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
        <Footer />
      </div>
    </>
  );
};

export default Usage;
