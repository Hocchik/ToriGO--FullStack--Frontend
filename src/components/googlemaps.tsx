import React from 'react';
import iconMoto from '../assets/iconmoto.png';

interface Location {
  lat: number;
  lng: number;
}

interface TripMapProps {
  origin: Location;
  destination: Location;
  driverLocation: Location;
  showMarkers?: boolean;
  routeFrom?: Location | null;
  routeTo?: Location | null;
  followDriver?: boolean;
  showDriverMarker?: boolean;
  showOrigin?: boolean;
  showDestination?: boolean;
  showRoute?: boolean;
  onMapClick?: (loc: Location) => void;
}

// Helper to load Google Maps JS API dynamically
function loadGoogleMaps(key?: string) {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'));
    if ((window as any).google && (window as any).google.maps) return resolve();
    const existing = document.getElementById('gmap-js');
    if (existing) {
      (existing as HTMLScriptElement).addEventListener('load', () => resolve());
      return;
    }
    const apiKey = key || (import.meta.env as any).VITE_GMAPS_KEY || localStorage.getItem('gMapsKey');
    if (!apiKey) return reject(new Error('Google Maps API key not provided'));
    const s = document.createElement('script');
    s.id = 'gmap-js';
    // load Places library too for Autocomplete and PlacesService
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(s);
  });
}

// Minimal placeholder TripMap — neutral box
export const TripMap: React.FC<TripMapProps> = () => {
  return <div className="w-full h-full bg-gray-50 rounded" />;
};

// Connected TripMap using Google Maps JS API
export const TripMapConnected: React.FC<TripMapProps> = ({
  origin,
  destination,
  driverLocation,
  onMapClick,
  showMarkers = true,
  showDriverMarker = true,
  showOrigin = true,
  showDestination = true,
  showRoute = false,
  routeFrom,
  routeTo,
  followDriver = false,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<any>(null);
  const markersRef = React.useRef<any>({ origin: null, dest: null, driver: null });
  const directionsRendererRef = React.useRef<any>(null);
  const firstFitRef = React.useRef<boolean>(false);
  const prevRouteKeyRef = React.useRef<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Smooth animation helpers
  const latLngLerp = (a: Location, b: Location, t: number) => ({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t });

  const animateMarkerTo = (marker: any, from: Location, to: Location, duration = 800) => {
    try {
      if (!marker) return;
      // cancel previous animation
      if (marker._animRequest) {
        try { cancelAnimationFrame(marker._animRequest); } catch (e) {}
        marker._animRequest = null;
      }
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        const eased = t < 0.5 ? 2*t*t : -1 + (4-2*t)*t; // simple easeInOut
        const pos = latLngLerp(from, to, eased);
        try {
          if (marker.setPosition) {
            marker.setPosition(pos as any);
          } else if ('position' in marker) {
            // AdvancedMarkerElement supports setting .position
            try { marker.position = pos; } catch (e) { /* fallback */ }
          } else if ((marker as any).content && (marker as any).content.style) {
            // nothing we can do
          }
        } catch (e) {}
        if (t < 1) marker._animRequest = requestAnimationFrame(step);
        else marker._animRequest = null;
      };
      marker._animRequest = requestAnimationFrame(step);
    } catch (e) {}
  };

  // Helper to create a marker using AdvancedMarkerElement when available, otherwise google.maps.Marker
  const createMarker = (opts: { position: Location; map: any; title?: string; iconUrl?: string; size?: { width: number; height: number } }) => {
    try {
      const g = (window as any).google;
      const advClass = g?.maps?.marker?.AdvancedMarkerElement;
      if (advClass) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'inline-block';
        wrapper.style.transform = 'translate(-50%, -50%)';
        if (opts.iconUrl) {
          const img = document.createElement('img');
          img.src = opts.iconUrl;
          img.style.width = `${opts.size?.width ?? 36}px`;
          img.style.height = `${opts.size?.height ?? 36}px`;
          img.style.display = 'block';
          wrapper.appendChild(img);
        }
        const adv = new advClass({ position: opts.position, map: opts.map, title: opts.title, content: wrapper });
        return adv;
      }
    } catch (e) {}

    // fallback
    try {
      const g = (window as any).google;
      const icon = opts.iconUrl ? { url: opts.iconUrl, scaledSize: new g.maps.Size(opts.size?.width ?? 36, opts.size?.height ?? 36), anchor: new g.maps.Point((opts.size?.width ?? 36) / 2, (opts.size?.height ?? 36) / 2) } : undefined;
      return new (window as any).google.maps.Marker({ position: opts.position, map: opts.map, title: opts.title, icon });
    } catch (e) {
      return null;
    }
  };

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const key = (import.meta.env as any).VITE_GMAPS_KEY || localStorage.getItem('gMapsKey');
        await loadGoogleMaps(key as string);
        if (cancelled) return;
        if (!containerRef.current) return;
        setLoading(false);

        if (!mapRef.current) {
          mapRef.current = new (window as any).google.maps.Map(containerRef.current, {
            center: { lat: driverLocation?.lat ?? origin?.lat ?? 0, lng: driverLocation?.lng ?? origin?.lng ?? 0 },
            zoom: 14,
            mapTypeId: 'roadmap',
          });
          // click handler
          mapRef.current.addListener('click', (e: any) => {
            if (onMapClick) onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
          });
        }

        // origin marker
        try {
          if (showMarkers && origin && showOrigin) {
            if (!markersRef.current.origin) markersRef.current.origin = createMarker({ position: { lat: origin.lat, lng: origin.lng }, map: mapRef.current, title: 'Origen' });
            else try { if (markersRef.current.origin.position) markersRef.current.origin.position = { lat: origin.lat, lng: origin.lng }; else markersRef.current.origin.setPosition({ lat: origin.lat, lng: origin.lng }); } catch (e) {}
          } else {
            if (markersRef.current.origin) { try { markersRef.current.origin.setMap(null); } catch (e) {} markersRef.current.origin = null; }
          }
        } catch (e) {}

        // destination marker
        try {
          if (showMarkers && destination && showDestination) {
            if (!markersRef.current.dest) markersRef.current.dest = createMarker({ position: { lat: destination.lat, lng: destination.lng }, map: mapRef.current, title: 'Destino' });
            else try { if (markersRef.current.dest.position) markersRef.current.dest.position = { lat: destination.lat, lng: destination.lng }; else markersRef.current.dest.setPosition({ lat: destination.lat, lng: destination.lng }); } catch (e) {}
          } else {
            if (markersRef.current.dest) { try { markersRef.current.dest.setMap(null); } catch (e) {} markersRef.current.dest = null; }
          }
        } catch (e) {}

        // driver marker (use icon) with smooth animation
        try {
          if (showMarkers && driverLocation && showDriverMarker) {
            const drvPos = { lat: driverLocation.lat, lng: driverLocation.lng };
            if (!markersRef.current.driver) {
              try {
                markersRef.current.driver = createMarker({ position: drvPos, map: mapRef.current, title: 'Conductor', iconUrl: iconMoto, size: { width: 48, height: 48 } });
                // store last pos for animation start
                markersRef.current.driver._lastPos = drvPos;
              } catch (e) {
                try { markersRef.current.driver = new (window as any).google.maps.Marker({ position: drvPos, map: mapRef.current, title: 'Conductor' }); markersRef.current.driver._lastPos = drvPos; } catch (e) { markersRef.current.driver = null; }
              }
            } else {
              try {
                const prev = markersRef.current.driver._lastPos || { lat: drvPos.lat, lng: drvPos.lng };
                // animate marker from prev -> drvPos
                animateMarkerTo(markersRef.current.driver, prev, drvPos, 800);
                markersRef.current.driver._lastPos = drvPos;
              } catch (e) {}
            }
          } else {
            if (markersRef.current.driver) { try { markersRef.current.driver.setMap(null); } catch (e) {} markersRef.current.driver = null; }
          }
        } catch (e) {}

        // fit bounds & pan logic: avoid refitting every update to prevent jumps
        const pts = [markersRef.current.origin?.getPosition?.(), markersRef.current.dest?.getPosition?.(), markersRef.current.driver?.getPosition?.()].filter(Boolean) as any[];
        if (pts.length > 0) {
          try {
            const bounds = new (window as any).google.maps.LatLngBounds();
            pts.forEach((p) => bounds.extend(p));
            // Only fit bounds on first render or when origin/dest changed
            if (!firstFitRef.current) {
              mapRef.current.fitBounds(bounds, { padding: 80 });
              firstFitRef.current = true;
            }
          } catch (e) {}
        }

        // route: draw route from 'from' -> 'to' using DirectionsService
        if (showRoute) {
          try {
            const from = routeFrom || driverLocation || origin;
            const to = routeTo || destination;
            if (from && to) {
              const routeKey = `${from.lat},${from.lng}_${to.lat},${to.lng}`;
              const directionsService = new (window as any).google.maps.DirectionsService();
              if (!directionsRendererRef.current) {
                directionsRendererRef.current = new (window as any).google.maps.DirectionsRenderer({ suppressMarkers: true });
                // style the route polyline
                try {
                  directionsRendererRef.current.setOptions({ polylineOptions: { strokeColor: '#ef4444', strokeOpacity: 0.95, strokeWeight: 6 } });
                } catch (e) {}
              }
              directionsRendererRef.current.setMap(mapRef.current);
              directionsService.route({ origin: { lat: from.lat, lng: from.lng }, destination: { lat: to.lat, lng: to.lng }, travelMode: (window as any).google.maps.TravelMode.DRIVING }, (result: any, status: any) => {
                if (status === 'OK' && result) {
                  directionsRendererRef.current.setDirections(result);
                  try {
                    // fit bounds only the first time the route appears or when the route endpoints changed
                    if (!firstFitRef.current || prevRouteKeyRef.current !== routeKey) {
                      const route = result.routes[0];
                      const bounds = new (window as any).google.maps.LatLngBounds();
                      route.overview_path.forEach((p: any) => bounds.extend(p));
                      mapRef.current.fitBounds(bounds, { padding: 80 });
                      firstFitRef.current = true;
                    }
                    prevRouteKeyRef.current = routeKey;
                  } catch (e) {}
                }
              });
            }
          } catch (e) {}
        }
        try {
          if (showMarkers && driverLocation && showDriverMarker) {
            const drvPos = { lat: driverLocation.lat, lng: driverLocation.lng };
            if (!markersRef.current.driver) {
              try {
                markersRef.current.driver = new (window as any).google.maps.Marker({ position: drvPos, map: mapRef.current, title: 'Conductor', icon: { url: iconMoto, scaledSize: new (window as any).google.maps.Size(48, 48), anchor: new (window as any).google.maps.Point(24, 24) } });
              } catch (e) {
                markersRef.current.driver = new (window as any).google.maps.Marker({ position: drvPos, map: mapRef.current, title: 'Conductor' });
              }
            } else {
              markersRef.current.driver.setPosition(drvPos);
            }
          } else {
            if (markersRef.current.driver) { try { markersRef.current.driver.setMap(null); } catch (e) {} markersRef.current.driver = null; }
          }
        } catch (e) {}
        
      } catch (e) {
        try { setError((e as Error)?.message || 'Google Maps failed to load'); } catch {}
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      try {
        if (markersRef.current.origin) { markersRef.current.origin.setMap(null); markersRef.current.origin = null; }
        if (markersRef.current.dest) { markersRef.current.dest.setMap(null); markersRef.current.dest = null; }
        if (markersRef.current.driver) { markersRef.current.driver.setMap(null); markersRef.current.driver = null; }
        if (directionsRendererRef.current) { directionsRendererRef.current.setMap(null); directionsRendererRef.current = null; }
        if (mapRef.current) {
          (window as any).google.maps.event.clearInstanceListeners(mapRef.current);
          mapRef.current = null;
        }
      } catch (e) {}
    };
  }, [origin, destination, driverLocation, onMapClick, showMarkers, showOrigin, showDestination, showDriverMarker, showRoute, routeFrom, routeTo, followDriver]);

  return (
    <div className="w-full h-full rounded relative">
      <div ref={containerRef} className="w-full h-full rounded" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">
          <div className="text-center">
            <div className="loader mb-2">Loading map...</div>
            <div className="text-sm text-gray-600">Cargando mapa...</div>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-30 p-4">
          <div className="bg-white p-4 rounded shadow text-center">
            <p className="text-sm text-red-600">Error cargando el mapa: {error}</p>
            <p className="text-xs text-gray-600 mt-2">Verifica que `VITE_GMAPS_KEY` esté definido o agrega la clave en localStorage (key: `gMapsKey`).</p>
          </div>
        </div>
      )}
    </div>
  );
};

export { TripMapConnected as defaultConnected };
