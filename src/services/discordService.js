import axios from "axios";

export async function discordService(message) {
  const body = {
    content: `attendance-moe ${message}`,
    tts: false,
    color: "white",
  };

  try {
    const response = await fetch(
      process.env.REACT_APP_DISCORD_WEBHOOK_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error(error);
  }
}

export const sendMessage = async (userId, message) => {
  try {
    const response = await axios.get(
      "https://attendance-moe.netlify.app/.netlify/functions/sendToDiscord",
      {
        params: { userId, message },
      }
    );
    console.log("Message sent successfully:", response.data);

    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};
