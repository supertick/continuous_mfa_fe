import { TableCell, Tooltip } from "@mui/material";

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "error":
      return "red";
    case "started":
      return "green";
    default:
      return "black"; // Default text color
  }
};

const ReportTableStatusCell = ({ record }) => {
  const status = record.status.toLowerCase();

  // Hide "completed" status by rendering an empty cell
  if (status === "completed") {
    return <TableCell />;
  }

  const color = getStatusColor(status);

  return (
    <TableCell style={{ color }}>
      {status === "error" ? (
        <Tooltip title={record.exception || "No details available"}>
          <span>{record.status}</span>
        </Tooltip>
      ) : (
        record.status
      )}
    </TableCell>
  );
};

export default ReportTableStatusCell;
