import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const MapView = ({ deviceId }) => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/devices/${deviceId}`);
        setLocation(data.location);
      } catch (error) {
        console.error("Error fetching location", error);
      }
    };

    fetchLocation();

    socket.on("locationUpdated", (data) => {
      if (data.deviceId === deviceId) {
        setLocation(data.location);
      }
    });

    return () => socket.off("locationUpdated");
  }, [deviceId]);

  return location ? (
    <MapContainer center={location} zoom={15} style={{ height: "500px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={location}>
        <Popup>Device ID: {deviceId}</Popup>
      </Marker>
    </MapContainer>
  ) : (
    <p>Loading location...</p>
  );
};

export default MapView;
