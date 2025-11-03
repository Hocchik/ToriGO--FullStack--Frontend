import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface TripMapProps {
  origin: Location;
  destination: Location;
  driverLocation: Location;
}


mapboxgl.accessToken = 'TU_MAPBOX_TOKEN';

export const TripMap = ({ origin, destination, driverLocation }: TripMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapRef.current!,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: origin,
      zoom: 14,
    });

    new mapboxgl.Marker({ color: 'blue' }).setLngLat(origin).addTo(map);
    new mapboxgl.Marker({ color: 'green' }).setLngLat(destination).addTo(map);
    new mapboxgl.Marker({ color: 'red' }).setLngLat(driverLocation).addTo(map);

    return () => map.remove();
  }, [origin, destination, driverLocation]);

  return <div ref={mapRef} className="w-full h-[500px] rounded-lg shadow-md" />;
};