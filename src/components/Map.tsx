import React from "react";

interface MapProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
}

// Placeholder Map: no external map libraries used, renders neutral box
const Map: React.FC<MapProps> = () => {
  return <div className="w-full h-full bg-gray-50 rounded" />;
};

export default Map;
