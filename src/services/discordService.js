import axios from "axios";

export async function discordService(message) {
  const body = {
    content: `attendance-mag ${message}`,
    tts: false,
    color: "white",
  };

  try {
    const response = await fetch(
      "https://discord.com/api/webhooks/1197166983842631711/XLCDrIKER4PYqUSapaVjCnE6YRiYfepwZFDBpTYyZgoSpj006b3oowaDRvDlH1UsvHag",
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
    return true;
  }
};
