require("dotenv").config();
const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();

// Middleware
app.use(express.static("public")); // Serve static files
app.use(express.json()); // Parse JSON request bodies

// Define port
const port = process.env.PORT || 3000;

// Default route to serve the tickets page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "tickets.html"));
});

// Charter request endpoint
app.post("/api/charter-request", async (req, res) => {
  const { firstName, lastName, email, eventType, eventDate, hours, charterType, details } = req.body;

  if (!firstName || !lastName || !email || !eventType || !eventDate || !hours || !charterType || !details) {
    return res.status(400).json({ success: false, error: "All fields are required." });
  }

  try {
    // Send confirmation email to the customer
    await sendEmail({
      to: email,
      subject: "Charters on Vine - Charter Request Received",
      text: `Hello ${firstName},\n\nWe have received your charter request for ${eventType} on ${eventDate}.\nOur team will get back to you soon!\n\nThank you,\nCharters on Vine`,
    });

    // Notify the business
    await sendEmail({
      to: process.env.BUSINESS_EMAIL,
      subject: "New Charter Request",
      text: `New charter request from ${firstName} ${lastName} (${email}).\nEvent Type: ${eventType}\nEvent Date: ${eventDate}\nHours: ${hours}\nCharter Type: ${charterType}\n\nDetails:\n${details}`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error processing charter request:", error);
    res.status(500).json({ success: false, error: "Failed to process charter request." });
  }
});

// Utility function to send emails using Nodemailer
async function sendEmail({ to, subject, text }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error;
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
