// const BASE_URL = "http://localhost:8888/.netlify/functions";
const BASE_URL = "https://attendance-moe.netlify.app/.netlify/functions";
export const fetchDataFromServer = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/fetch-xlsx?sheetId=1B-6lG7BdNhDj5wrSNbd0nw9WyZW-NU79gNf0SNwuS-0`
    );
  

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("plotter_order_desk Error fetch-xlsx from server:", error);
    throw error;
  }
};

