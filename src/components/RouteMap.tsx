import React from 'react';

interface RouteMapProps {
  origin: [number, number];
  destination: [number, number];
}

// Placeholder RouteMap: no map rendering, just neutral box
const RouteMap: React.FC<RouteMapProps> = () => {
  return <div className="w-full h-full bg-gray-50 rounded" />;
};

export default RouteMap;
