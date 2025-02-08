const express = require("express");
const { updateDeviceLocation, getDeviceLocation } = require("../controllers/deviceController");

const router = express.Router();

// Update device location
router.post("/update", updateDeviceLocation);

// Get device location
router.get("/:deviceId", getDeviceLocation);

module.exports = router;
