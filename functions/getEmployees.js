const { google } = require("googleapis");
require("dotenv").config();

// Set common CORS headers
const setCorsHeaders = (response) => {
  response.headers = {
    ...response.headers,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  return response;
};

// Initialize Google Sheets OAuth2 client
const getOAuth2Client = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return oauth2Client;
};

// Function to fetch and format employee data from Google Sheets
const fetchEmployeesFromSheet = async (sheets, spreadsheetId, range) => {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values || [];

  if (rows.length === 0) {
    return []; // Return an empty array if no data
  }

  const headers = rows[0]; // First row is the headers
  const employees = rows.slice(1).map((row) => {
    const employee = {};
    headers.forEach((header, index) => {
      employee[header] = row[index] || ""; // Assign each value to the corresponding header
    });
    return employee;
  });

  return employees;
};

// Main handler for the Netlify function
exports.handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return setCorsHeaders({
      statusCode: 200,
      body: "",
    });
  }

  // Ensure only GET requests are handled
  if (event.httpMethod === "GET") {
    const oauth2Client = getOAuth2Client();
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const spreadsheetId = "1vXAVThnFtEQ8TftWWEbfOn64_XV4y2faJ0cqCNLjJN0"; // Google Sheets ID
    const range = "pracownicy"; // Sheet name or range

    try {
      const employees = await fetchEmployeesFromSheet(sheets, spreadsheetId, range);
      
  
      const warehouseEmployees = employees.filter(employee => employee.department === "Warsztat elektryczny");

      // Return the filtered employee data
      return setCorsHeaders({
        statusCode: 200,
        body: JSON.stringify(warehouseEmployees),
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      return setCorsHeaders({
        statusCode: 500,
        body: JSON.stringify({ message: "Internal Server Error" }),
      });
    }
  }

  // If method not allowed
  return setCorsHeaders({
    statusCode: 405,
    body: JSON.stringify({ message: "Method Not Allowed" }),
  });
};
