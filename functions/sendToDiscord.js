const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.login(process.env.DISCORD_API_TOKEN);

const setCorsHeaders = (response) => {
  response.headers = {
    ...response.headers,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  return response;
};

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return setCorsHeaders({
      statusCode: 200,
      body: "This was a preflight call!",
    });
  }

  if (event.httpMethod !== "GET") {
    return setCorsHeaders({
      statusCode: 405,
      body: "This function only accepts GET requests.",
    });
  }

  const params = event.queryStringParameters;
  const userId = params.userId;
  const messageText = params.message || "Hello from Node App!";

  try {
    const user = await client.users.fetch(userId);
    await user.send(messageText);

    return setCorsHeaders({
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Message sent!" }),
    });
  } catch (error) {
    console.error("Error sending message: ", error);
    return setCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Failed to send message.",
      }),
    });
  }
};
