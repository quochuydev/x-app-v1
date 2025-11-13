const SmeeClient = require("smee-client");
require("dotenv").config();

// Start Smee client after server is running
const smee = new SmeeClient({
  source: process.env.SMEE_URL,
  target: "http://localhost:3000/events",
  logger: console,
});

smee.start();
console.log("Smee client started, forwarding events to /events");
