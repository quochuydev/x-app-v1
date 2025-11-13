const express = require("express");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// GitHub webhook endpoint
app.post("/events", (req, res) => {
  // console.log("Received webhook event:");
  // console.log("Headers:", req.headers);
  console.log("Event type:", req.headers["x-github-event"]);
  console.log("Delivery ID:", req.headers["x-github-delivery"]);
  // console.log("Payload:", JSON.stringify(req.body, null, 2));
  console.log("Action:", req.body.action);

  // Respond to acknowledge receipt
  res.status(200).json({ message: "Webhook received" });
});

// Health check endpoint
app.get("/", (req, res) => {
  res.send("GitHub Webhook Server is running");
});

// Health check endpoint
app.get("/events", (req, res) => {
  res.send("GitHub Webhook Server is running");
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
