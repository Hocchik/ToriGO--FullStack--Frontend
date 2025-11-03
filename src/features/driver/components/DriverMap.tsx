import { useEffect, useRef } from "react";
import mapboxgl, { Map as MapBoxMap } from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface DriverMapProps {
  driverLocation: [number, number]; // [lng, lat]
  requests: { id: string; location: [number, number] }[]; // solicitudes cercanas
  rangeKm?: number; // rango en kilómetros
}

const DriverMap = ({ driverLocation, requests, rangeKm = 3 }: DriverMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapBoxMap | null>(null);

  // Guardar markers para limpiarlos después
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Inicializar mapa
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: driverLocation,
        zoom: 14,
      });

      // Controles
      mapRef.current.addControl(new mapboxgl.NavigationControl());
    }
  }, [driverLocation]);

  // Crear círculo dinámico
  const createGeoJSONCircle = (
    center: [number, number],
    radiusInKm: number
  ): GeoJSON.Feature<GeoJSON.Polygon> => {
    const points = 64;
    const coords = {
      latitude: center[1],
      longitude: center[0],
    };
    const km = radiusInKm;

    const ret: [number, number][] = [];
    for (let i = 0; i < points; i++) {
      const angle = (i * 360) / points;
      const dx = km * Math.cos((angle * Math.PI) / 180);
      const dy = km * Math.sin((angle * Math.PI) / 180);
      const lng = coords.longitude + dx / 111;
      const lat = coords.latitude + dy / 111;
      ret.push([lng, lat]);
    }
    ret.push(ret[0]);

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [ret],
      },
      properties: {},
    };
  };

  // Actualizar rango y markers
  useEffect(() => {
    if (!mapRef.current) return;

    // 🔹 Limpiar capa previa de rango
    if (mapRef.current.getLayer("driver-range")) {
      mapRef.current.removeLayer("driver-range");
    }
    if (mapRef.current.getSource("driver-range")) {
      mapRef.current.removeSource("driver-range");
    }

    // 🔹 Crear nuevo círculo dinámico
    const circle = createGeoJSONCircle(driverLocation, rangeKm);


    
    mapRef.current.addSource("driver-range", {
      type: "geojson",
      data: circle,
    });

    mapRef.current.addLayer({
      id: "driver-range",
      type: "fill",
      source: "driver-range",
      paint: {
        "fill-color": "#3b82f6",
        "fill-opacity": 0.2,
      },
    });

    // 🔹 Limpiar markers anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // 🔹 Agregar marcador del conductor
    const driverMarker = new mapboxgl.Marker({ color: "red" })
      .setLngLat(driverLocation)
      .addTo(mapRef.current);
    markersRef.current.push(driverMarker);

    // 🔹 Agregar markers de solicitudes
    requests.forEach((req) => {
      const reqMarker = new mapboxgl.Marker({ color: "green" })
        .setLngLat(req.location)
        .setPopup(new mapboxgl.Popup().setText(`Solicitud #${req.id}`))
        .addTo(mapRef.current!);

      markersRef.current.push(reqMarker);
    });
  }, [driverLocation, requests, rangeKm]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[70vh] rounded-xl shadow-lg"
    />
  );
};

export default DriverMap;
