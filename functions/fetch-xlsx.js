const { google } = require("googleapis");

const setCorsHeaders = (response) => {
  response.headers = {
    ...response.headers,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  return response;
};

exports.handler = async (event) => {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
  const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );

  oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
  });

  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  try {
    const spreadsheetId = event.queryStringParameters.sheetId;

    if (!spreadsheetId) {
      throw new Error("Missing sheetId (spreadsheetId) parameter");
    }

    const range = "A:I"; // Adjust as per your sheet's structure

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      throw new Error("No data found in the spreadsheet");
    }

    
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split(".");
      return new Date(`${year}-${month}-${day}`);
    };

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

   
    const extractTime = (dateTimeStr) => {
      return dateTimeStr.split(" ")[1]; 
    };
    
    const filteredData = rows.slice(1).map((row) => {
      const startTime = row[2]; 
      const endTime = row[4];
      const startBrake = row[6]; 
      const endBrake = row[8];
    
      if (startTime) {
        const startDate = startTime.split(" ")[0];
        const parsedStartDate = parseDate(startDate);
    
        if (
          parsedStartDate.toDateString() === today.toDateString() || 
          (!endTime && parsedStartDate.toDateString() === yesterday.toDateString()) ||
          (endTime && parseDate(endTime.split(" ")[0]).toDateString() === today.toDateString())
        ) {
          return {
            name: row[0],
            id: row[1],
            startTime: startTime ? extractTime(startTime) : null,
            endTime: endTime ? extractTime(endTime) : null,
            startBreak: startBrake ? extractTime(startBrake) : null,
            endBreak: endBrake ? extractTime(endBrake) : null,
          };
        }
      }
      return null; 
    }).filter(row => row !== null);
    
    let functionResponse = {
      statusCode: 200,
      body: JSON.stringify(filteredData),
    };

    return setCorsHeaders(functionResponse);
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    let functionResponse = {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error fetching data from Google Sheets",
        details: error.message,
      }),
    };
    return setCorsHeaders(functionResponse);
  }
};
