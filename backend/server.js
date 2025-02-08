const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const moment = require("moment"); // Make sure moment is installed: npm install moment
const sendEmail = require("./utils/sendEmail"); // Path to your sendEmail utility
const QRCode = require("qrcode"); // Make sure qrcode is installed: npm install qrcode
const { v4: uuidv4 } = require("uuid"); // Make sure uuid is installed: npm install uuid

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());

// Global storage for shared sessions (in-memory, not suitable for production)
global.sharedSessions = {};

// ➤ Generate Temporary Live Location Link & QR Code & Send Email
app.post("/api/share-location", async (req, res) => {
  const { deviceId, latitude, longitude, email } = req.body;
  if (!deviceId || !latitude || !longitude || !email) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  const sessionId = uuidv4(); // Use uuid for session IDs
  const link = `http://localhost:5006/api/view-location/${sessionId}`; // Use sessionId in link

  global.sharedSessions[sessionId] = { // Store session data globally
    expiresAt: moment().add(30, "minutes").toISOString(),
    devices: {
      [deviceId]: { latitude, longitude } // Store device locations within the session
    }
  };

  try {
    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(link);

    // Send Email with QR Code
    const subject = "📍 Live Location Shared";
    const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">📍 Live Location Shared</h2>
        <p style="font-size: 16px; color: #555;">A device has shared its live location with you. Below are the details:</p>
        
        <div style="background-color: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;"><strong>🔗 Device ID:</strong> <span style="color: #007bff;">${deviceId}</span></p>
          <p style="font-size: 16px; color: #333;"><strong>🌍 Coordinates:</strong> <span style="color: #28a745;">${latitude}</span>, <span style="color: #dc3545;">${longitude}</span></p>
        </div>

        <p style="font-size: 16px; color: #555; text-align: center;">
          <strong>📌 View Live Location:</strong> 
          <a href="${link}" style="color: #007bff; text-decoration: none; font-weight: bold;">Click Here</a>
        </p>

        <p style="font-size: 14px; color: #999; text-align: center;">This link will expire in <strong>30 minutes</strong>.</p>
        
        <div style="text-align: center; margin-top: 15px;">
          <img src="${qrCodeDataUrl}" alt="Live Location QR Code" style="max-width: 200px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);"/>
          <p style="font-size: 14px; color: #555; margin-top: 5px;">Scan the QR code to access the location.</p>
        </div>
      </div>
    `;

    console.log("🟢 Sending email to:", email);
    await sendEmail(email, subject, null, message);
    console.log("✅ Email sent successfully!");

    res.json({ shareableLink: link, qrCode: qrCodeDataUrl, sessionId }); // Include sessionId in response
  } catch (error) {
    console.error("❌ Error sending email or generating QR Code:", error);
    res.status(500).json({ message: "Email or QR Code could not be generated" });
  }
});

// ➤ View Live Location
app.get("/api/view-location/:sessionId", (req, res) => { // Use sessionId in route
  const { sessionId } = req.params;
  const sessionData = global.sharedSessions[sessionId];

  if (!sessionData) {
    return res.status(404).json({ message: "Invalid or expired session" });
  }

  if (moment().isAfter(sessionData.expiresAt)) {
    delete global.sharedSessions[sessionId];
    return res.status(410).json({ message: "Session has expired" });
  }

  res.json(sessionData); // Return the entire session data
});

// ➤ Extend Expiration Time
app.post("/api/extend-location/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const sessionData = global.sharedSessions[sessionId];

  if (!sessionData) {
    return res.status(404).json({ message: "Invalid session ID" });
  }

  sessionData.expiresAt = moment().add(30, "minutes").toISOString();
  res.json({ message: "Expiration extended by 30 minutes" });
});

// WebSocket Real-time Updates
io.on("connection", (socket) => {
  console.log("🔌 A user connected");

  socket.on("updateLocation", ({ sessionId, deviceId, latitude, longitude }) => {
    const session = global.sharedSessions?.[sessionId];
    if (session && session.devices[deviceId]) {
      session.devices[deviceId] = { latitude, longitude };
      io.emit("sessionUpdated", { sessionId, deviceId, latitude, longitude }); // Emit to all clients in the session
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected");
  });
});

const PORT = process.env.PORT || 5006;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));