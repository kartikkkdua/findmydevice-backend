import React from "react";

const LocationInfo = ({ location }) => {
  return location ? (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h3>📍 Device Location</h3>
      <p><strong>Latitude:</strong> {location.lat}</p>
      <p><strong>Longitude:</strong> {location.lng}</p>
    </div>
  ) : (
    <p>Fetching location...</p>
  );
};

export default LocationInfo;
