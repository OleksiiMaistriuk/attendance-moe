import axios from "axios";
import { discordService } from "./discordService";
// const BASE_URL = "http://localhost:8888/.netlify/functions";
const BASE_URL = "https://attendance-moe.netlify.app/.netlify/functions";
export const fetchEmployees = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/getEmployees`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_JWT_SECRET}`,
        },
      }
    );
// console.log("response", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    discordService("Error fetching employees");
    return [];
  }
};


