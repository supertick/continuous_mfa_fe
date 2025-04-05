import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress
} from '@mui/material';
import apiClient from './utils/apiClient';
import TopMenuBar from './TopMenuBar';
import Footer from './Footer';
import { useUser } from './UserContext';

// Helper function to format timestamp to readable date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// Helper function to calculate uptime duration
const calculateUptime = (uptime) => {
  if (!uptime) return 'N/A';

  const now = Date.now();
  const uptimeMs = now - uptime;

  const seconds = Math.floor(uptimeMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
};

const formatUptime = (uptime) => {
  if (!uptime) return 'N/A';

  const now = Date.now();
  const uptimeMs = now - uptime;

  const seconds = Math.floor(uptimeMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
};

const ServerStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const { getVersion } = useUser();

  const fetchServerStatus = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/server-status/default');
      setStatus(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching server status:', err);
      setError('Failed to fetch server status data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchServerStatus();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchServerStatus();
    }, 30000);

    setRefreshInterval(interval);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const renderConfigSection = () => {
    if (!status || !status.config) return null;

    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Server Configuration</Typography>
          <Box>
            {Object.entries(status.config).map(([key, value]) => (
              <Box key={key} sx={{ mb: 1 }}>
                <Typography variant="subtitle2" component="span" sx={{ fontWeight: 'bold' }}>
                  {key}:
                </Typography>{' '}
                <Typography component="span">
                  {typeof value === 'object'
                    ? JSON.stringify(value, null, 2)
                    : String(value)}
                </Typography>
              </Box>
            ))}
          </Box>
      </Paper>
    );
  };

  return (
    <>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        <TopMenuBar />
        <>
          <br />
          <br />
          <br />
          <br />
          <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Server Status
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading && !status ? (
              <>
                <br />
                <br />
                <br />
                <br />
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              </>
            ) : (
              <>
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Server Information</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="subtitle2">Server ID</Typography>
                        <Typography variant="body1">{status?.id ?? 'N/A'}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="subtitle2">Uptime</Typography>
                        <Typography variant="body1">
                          {status?.uptime ? formatUptime(status.uptime) : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="subtitle2">Queued Runs</Typography>
                        <Chip
                          label={status?.queued_msgs ?? 'N/A'}
                          color={status?.queued_msgs > 0 ? 'warning' : 'success'}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>System Resources</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="subtitle2">CPU Usage</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={status?.cpu_usage ?? 0}
                          color={status?.cpu_usage > 80 ? 'error' : status?.cpu_usage > 60 ? 'warning' : 'success'}
                          sx={{ mt: 1, mb: 1, height: 10, borderRadius: 5 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {status?.cpu_usage !== undefined ? `${Math.round(status.cpu_usage)}%` : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="subtitle2">Memory</Typography>
                        {status?.memory_used !== undefined && status?.memory_available !== undefined ? (
                          <>
                            <LinearProgress
                              variant="determinate"
                              value={(status.memory_used / (status.memory_used + status.memory_available)) * 100}
                              color={(status.memory_used / (status.memory_used + status.memory_available)) > 0.8 ? 'error' :
                                (status.memory_used / (status.memory_used + status.memory_available)) > 0.6 ? 'warning' : 'success'}
                              sx={{ mt: 1, mb: 1, height: 10, borderRadius: 5 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {`${Math.round(status.memory_used)}GB used of ${Math.round(status.memory_used + status.memory_available)}GB total`}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2">N/A</Typography>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="subtitle2">Disk Space</Typography>
                        {status?.disk_space_used !== undefined && status?.disk_space_available !== undefined ? (
                          <>
                            <LinearProgress
                              variant="determinate"
                              value={(status.disk_space_used / (status.disk_space_used + status.disk_space_available)) * 100}
                              color={(status.disk_space_used / (status.disk_space_used + status.disk_space_available)) > 0.8 ? 'error' :
                                (status.disk_space_used / (status.disk_space_used + status.disk_space_available)) > 0.6 ? 'warning' : 'success'}
                              sx={{ mt: 1, mb: 1, height: 10, borderRadius: 5 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {`${Math.round(status.disk_space_used)}GB used of ${Math.round(status.disk_space_used + status.disk_space_available)}GB total`}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2">N/A</Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    System Overview
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box>
                        <Typography variant="subtitle2">Started At</Typography>
                        <Typography>{status?.uptime ? formatDate(status.uptime) : 'N/A'}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box>
                        <Typography variant="subtitle2">Version</Typography>
                        <Typography>{getVersion()?.version}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box>
                        <Typography variant="subtitle2">Commit</Typography>
                        <Typography>
                          {getVersion()?.commit ? (
                            <a
                              href={`https://github.com/Metalyticsbio/continuous_mfa/commit/${getVersion().commit}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {getVersion().commit.slice(0, 7)}
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box>
                        <Typography variant="subtitle2">Comment</Typography>
                        <Typography>{getVersion()?.commit_message}</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                </Paper>
                <br />

                {renderConfigSection()}

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {new Date().toLocaleString()}
                  </Typography>
                </Box>
              </>
            )}
          </Container>
        </>
        <Footer />
      </Box>
    </>
  );
};

export default ServerStatus;
