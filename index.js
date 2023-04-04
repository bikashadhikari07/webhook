const express = require("express");
const app = express();
const axios = require("axios");

// Set up Messenger webhook URL and OpenAI API endpoint
const messenger_url =
  "https://graph.facebook.com/v11.0/me/messages?access_token=<EAAJ8iWFRHmgBAHbxpFhFdv5dGVTZAZAqIro2RL37dff3PSpnpdvhpTmRAHgn06invp68OlLLsS5zhy9bg4izoBiv2r3yQmw8tmQXvOrLfswehWUGj9jQS1obE7oHyyIxt1L9LiQoaOJ3nZAeNJYd9iBspwwND9XmrL1UKIjcFBAyhnidOYg>";
const openai_url = "https://api.openai.com/v1/images/generations";

// Set up function to process incoming messages
async function processMessage(recipientId, messageText) {
  // Set up OpenAI API request headers and parameters
  const headers = {
    "Content-Type": "application/json",
    Authorization:
      "Bearer <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>",

    // Replace with your OpenAI API key
  };
  const data = {
    model: "image-alpha-001", // Choose a model for image generation
    prompt: messageText, // Use message text as prompt for image generation
    num_images: 1, // Generate one image
    size: "256x256", // Set image size
    response_format: "url", // Get image URL as response format
  };

  try {
    // Send request to OpenAI API and get response
    const response = await axios.post(openai_url, JSON.stringify(data), {
      headers: headers,
    });
    const responseData = response.data;

    // Extract image URL from response
    const imageUrl = responseData.data[0].url;

    // Send image URL back to Messenger
    const payload = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: "image",
          payload: {
            url: imageUrl,
          },
        },
      },
    };
    await axios.post(messenger_url, payload);
  } catch (error) {
    console.error(error);
  }
}

// Handle GET requests to your webhook URL
app.get("/your-webhook-url", (req, res) => {
  const challenge = req.query["hub.challenge"];
  res.status(200).send(challenge);
});

// Handle POST requests from Facebook's webhook
app.post("https://bikashmbot.web.app/", (req, res) => {
  // Extract recipient ID and message text from incoming Messenger message
  const messagingEvents = req.body.entry[0].messaging;
  messagingEvents.forEach(async function (event) {
    if (event.message && event.message.text) {
      const recipientId = event.recipient.id;
      const messageText = event.message.text;

      // Process message using OpenAI API and send image back to Messenger
      await processMessage(recipientId, messageText);
    }
  });
  res.sendStatus(200);
});

// Start the server
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Express server listening on port ${server.address().port}`);
});
