import { TripMapConnected } from './googlemaps';

interface Loc { lat: number; lng: number }

interface DriverMapProps {
  origin: Loc;
  destination: Loc;
  driverLocation: Loc;
  showRoute?: boolean;
  showMarkers?: boolean;
  className?: string;
}

export default function DriverMap({ origin, destination, driverLocation, showRoute, showMarkers = true, className }: DriverMapProps) {
  const shouldShowRoute = typeof showRoute === 'boolean' ? showRoute : false;
  return (
    <div className={className || 'w-full h-full'}>
      <TripMapConnected
        origin={origin}
        destination={destination}
        driverLocation={driverLocation}
        showMarkers={showMarkers}
        showDriverMarker={showMarkers}
        showOrigin={showMarkers}
        showDestination={showMarkers}
        showRoute={shouldShowRoute}
        followDriver={true}
        routeFrom={driverLocation}
        routeTo={shouldShowRoute ? destination : undefined}
      />
    </div>
  );
}
