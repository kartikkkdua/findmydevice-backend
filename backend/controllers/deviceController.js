const Device = require("../models/Device");

// Update device location
const updateDeviceLocation = async (req, res) => {
  try {
    const { deviceId, latitude, longitude } = req.body;
    
    if (!deviceId || !latitude || !longitude) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const device = await Device.findOneAndUpdate(
      { deviceId },
      { latitude, longitude, updatedAt: Date.now() },
      { new: true, upsert: true }
    );

    res.status(200).json(device);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get device location
const getDeviceLocation = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.status(200).json(device);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { updateDeviceLocation, getDeviceLocation };
