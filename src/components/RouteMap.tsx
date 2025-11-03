import { useEffect, useRef } from "react";
import mapboxgl, { Map as MapBoxMap } from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface RouteMapProps {
  origin: [number, number];
  destination: [number, number];
}

const RouteMap = ({ origin, destination }: RouteMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapBoxMap | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: origin,
        zoom: 12,
      });

      const fetchRoute = async () => {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.join(",")};${destination.join(",")}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
        const response = await fetch(url);
        const data = await response.json();

        const route = data.routes[0].geometry;

        if (mapRef.current) {
          mapRef.current.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: route,
              properties: {}
            },
          });

          mapRef.current.addLayer({
            id: "route",
            type: "line",
            source: "route",
            paint: {
              "line-color": "#3b82f6",
              "line-width": 4,
            },
          });
        }
      };

      fetchRoute();
    }
  }, [origin, destination]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default RouteMap;
