import * as XLSX from "xlsx";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown"; // Import react-markdown

const FileViewer = ({ fileContent, selectedFile, loading }) => {
  const [tableData, setTableData] = useState(null);

  // Get file extension
  const getFileExtension = (filename) => {
    return filename?.split(".").pop().toLowerCase();
  };

  const fileExtension = getFileExtension(selectedFile);

  // Process XLSX file
  const handleXlsxFile = () => {
    if (!fileContent || fileExtension !== "xlsx") {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0]; // Get first sheet
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Convert to array format

      setTableData(jsonData);
    };

    reader.readAsArrayBuffer(fileContent);
  };

  // Trigger XLSX processing when fileContent changes
  useEffect(() => {
    if (fileExtension === "xlsx") {
      handleXlsxFile();
    }
  }, [fileContent, fileExtension]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : fileContent ? (
        fileExtension === "md" ? (
          // Render markdown using react-markdown
          <ReactMarkdown>
            {typeof fileContent === "string"
              ? fileContent
              : JSON.stringify(fileContent, null, 2)}
          </ReactMarkdown>
        ) : ["txt", "json", "log", "csv"].includes(fileExtension) ? (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              border: "1px solid #ddd",
              padding: "10px",
            }}
          >
            {typeof fileContent === "string"
              ? fileContent
              : JSON.stringify(fileContent, null, 2)}
          </pre>
        ) : ["png", "gif", "jpeg", "jpg"].includes(fileExtension) ? (
          <img
            src={fileContent}
            alt={selectedFile}
            style={{
              maxWidth: "100%",
              maxHeight: "400px",
              border: "1px solid #ddd",
            }}
          />
        ) : fileExtension === "xlsx" ? (
          tableData ? (
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                border: "1px solid black",
              }}
            >
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        style={{ border: "1px solid black", padding: "5px" }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Processing spreadsheet...</p>
          )
        ) : (
          <p>No content available.</p>
        )
      ) : (
        <p>No content available.</p>
      )}
    </div>
  );
};

export default FileViewer;
