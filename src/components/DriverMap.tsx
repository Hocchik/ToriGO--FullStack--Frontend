import { TripMap } from './mapboxgl';

interface Loc { lat: number; lng: number }

interface DriverMapProps {
  origin: Loc;
  destination: Loc;
  driverLocation: Loc;
  showRoute?: boolean;
  className?: string;
}

export default function DriverMap({ origin, destination, driverLocation, showRoute, className }: DriverMapProps) {
  const shouldShowRoute = typeof showRoute === 'boolean' ? showRoute : false;
  return (
    <div className={className || 'w-full h-full'}>
      <TripMap
        origin={origin}
        destination={destination}
        driverLocation={driverLocation}
        showMarkers={true}
        showDriverMarker={true}
        showOrigin={true}
        showDestination={true}
        showRoute={shouldShowRoute}
        followDriver={true}
        routeFrom={driverLocation}
        routeTo={shouldShowRoute ? destination : undefined}
      />
    </div>
  );
}
