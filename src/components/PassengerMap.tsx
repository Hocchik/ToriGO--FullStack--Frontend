import { TripMap } from './mapboxgl';

interface Loc { lat: number; lng: number }

interface PassengerMapProps {
  origin?: Loc;
  destination?: Loc;
  onMapClick?: (loc: Loc) => void;
  showRoute?: boolean; // override to force route
  className?: string;
}

const defaultOrigin = { lat: -12.0460, lng: -77.0425 };
const defaultDestination = { lat: -12.0500, lng: -77.0300 };

export default function PassengerMap({ origin, destination, onMapClick, showRoute, className }: PassengerMapProps) {
  const from = origin || defaultOrigin;
  const to = destination || defaultDestination;
  // show route by default when both points provided unless explicitly disabled
  const shouldShowRoute = typeof showRoute === 'boolean' ? showRoute : Boolean(origin && destination);

  return (
    <div className={className || 'w-full h-full'}>
      <TripMap
        origin={from}
        destination={to}
        driverLocation={from}
        showMarkers={true}
        showDriverMarker={false}
        showOrigin={true}
        showDestination={true}
        showRoute={shouldShowRoute}
        followDriver={false}
        routeFrom={from}
        routeTo={to}
        onMapClick={onMapClick}
      />
    </div>
  );
}
