import { useEffect, useRef } from "react";
import mapboxgl, { Map as MapBoxMap, Marker } from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface MapProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
}

const Map = ({ center = [-77.0428, -12.0464], zoom = 12 }: MapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapBoxMap | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center,
        zoom,
      });

      // Control de zoom
      mapRef.current.addControl(new mapboxgl.NavigationControl());

      // Ejemplo: marcador en el centro
      new Marker({ color: "red" }).setLngLat(center).addTo(mapRef.current);
    }

    return () => {
      mapRef.current?.remove();
    };
  }, [center, zoom]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default Map;
