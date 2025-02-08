import React, { useState } from "react";
import MapView from "./components/MapView";
import LocationInfo from "./components/LocationInfo";

const App = () => {
  const [deviceId, setDeviceId] = useState("device123");

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>🔍 Find My Device</h1>
      <input type="text" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} placeholder="Enter Device ID" />
      <MapView deviceId={deviceId} />
    </div>
  );
};

export default App;
