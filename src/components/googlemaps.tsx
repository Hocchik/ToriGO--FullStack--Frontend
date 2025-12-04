import React from 'react';
import iconMoto from '../assets/iconmoto.png';
import { Loader } from '@googlemaps/js-api-loader';
import type { Libraries } from '@googlemaps/js-api-loader';
// Leaflet fallback for environments where Google Maps is blocked
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  // optional explicit route path (array of points along the street route)
  routePath?: Location[] | null;
  // progress along route [0..1]
  routeProgress?: number;
  // show an overlay progress bar
  showRouteProgress?: boolean;
  onMapClick?: (loc: Location) => void;
  // interpolation resolution in meters for densifying route for smooth animation
  expandResolutionMeters?: number;
}

// Helper to load Google Maps JS API using the official loader
function loadGoogleMaps(key?: string, libraries: Libraries = ['places'] as Libraries) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      if (typeof window === 'undefined') return reject(new Error('No window'));
      if ((window as any).google && (window as any).google.maps) return resolve();
      const apiKey = key || (import.meta.env as any).VITE_GMAPS_KEY || localStorage.getItem('gMapsKey');
      if (!apiKey) return reject(new Error('Google Maps API key not provided'));
      const loader = new Loader({ apiKey, libraries });
      await loader.load();
      return resolve();
    } catch (err) {
      return reject(err);
    }
  });
}

// Default resolution (meters) used to densify a route for smooth animation
const DEFAULT_EXPAND_RESOLUTION_METERS = 8;

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
  routePath = null,
  routeProgress = 0,
  showRouteProgress = false,
  expandResolutionMeters,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<any>(null);
  const markersRef = React.useRef<any>({ origin: null, dest: null, driver: null });
  const directionsRendererRef = React.useRef<any>(null);
  const routeDonePolyRef = React.useRef<any>(null);
  const routeRemainPolyRef = React.useRef<any>(null);
  const expandedPathRef = React.useRef<Location[] | null>(null);
  const animReqRef = React.useRef<number | null>(null);
  const prevProgressRef = React.useRef<number>(0);
  const firstFitRef = React.useRef<boolean>(false);
  const prevRouteKeyRef = React.useRef<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const lastPanRef = React.useRef<Location | null>(null);
  const lastPanTsRef = React.useRef<number>(0);

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
          // defensive check: sometimes the loader finishes but `google.maps.Map` is not available
          const g = (window as any).google;
          if (!g || !g.maps || typeof g.maps.Map !== 'function') {
            console.warn('Google Maps API loaded but `google.maps.Map` constructor is missing — falling back to Leaflet', { google: g });
            // initialize Leaflet as a graceful fallback
            try {
              // clear container
              if (containerRef.current) containerRef.current.innerHTML = '';
              const center: L.LatLngExpression = [driverLocation?.lat ?? origin?.lat ?? 0, driverLocation?.lng ?? origin?.lng ?? 0];
              const lf = L.map(containerRef.current as HTMLElement, { center: center, zoom: 14 });
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
              }).addTo(lf);
              // store leaflet instance on mapRef for later cleanup
              mapRef.current = lf;
              setLoading(false);
            } catch (err) {
              console.error('Leaflet fallback failed', err);
              setError('No se pudo inicializar Google Maps ni el fallback de Leaflet. Revisa la consola.');
              setLoading(false);
            }
            // stop further Google Maps specific initialization
            return;
          }

          const MapCtor = g.maps.Map;
          mapRef.current = new MapCtor(containerRef.current, {
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
              // prefer AdvancedMarkerElement via createMarker; createMarker falls back internally if needed
              try {
                markersRef.current.driver = createMarker({ position: drvPos, map: mapRef.current, title: 'Conductor', iconUrl: iconMoto, size: { width: 48, height: 48 } });
                if (markersRef.current.driver) markersRef.current.driver._lastPos = drvPos;
                else markersRef.current.driver = null;
              } catch (e) {
                markersRef.current.driver = null;
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
        // Custom route progress drawing when an explicit routePath is provided
        try {
          const g = (window as any).google;
          if (mapRef.current && routePath && Array.isArray(routePath) && routePath.length > 1) {
            const toLatLng = (p: Location) => ({ lat: p.lat, lng: p.lng });
            const totalPath = (routePath as Location[]).map((p: Location) => toLatLng(p));

            // expand path to denser set of points for smooth drawing
            const expandPath = (pts: Location[]) => {
              const out: Location[] = [];
              const toRad = (v: number) => (v * Math.PI) / 180;
              const R = 6371000;
              const haversine = (a: Location, b: Location) => {
                const dLat = toRad(b.lat - a.lat);
                const dLon = toRad(b.lng - a.lng);
                const lat1 = toRad(a.lat);
                const lat2 = toRad(b.lat);
                const sinDlat = Math.sin(dLat / 2);
                const sinDlon = Math.sin(dLon / 2);
                const aa = sinDlat * sinDlat + sinDlon * sinDlon * Math.cos(lat1) * Math.cos(lat2);
                const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
                return R * c;
              };
              for (let i = 0; i < pts.length - 1; i++) {
                const a = pts[i];
                const b = pts[i + 1];
                const dist = haversine(a, b);
                const resolution = (typeof expandResolutionMeters === 'number' ? expandResolutionMeters : DEFAULT_EXPAND_RESOLUTION_METERS);
                const step = Math.max(2, Math.round(dist / Math.max(1, resolution))); // resolution meters
                for (let s = 0; s < step; s++) {
                  const t = s / step;
                  out.push({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t });
                }
              }
              // push last point
              out.push(pts[pts.length - 1]);
              return out;
            };

            // recompute expanded path if input changed
            if (!expandedPathRef.current || expandedPathRef.current.length === 0 || expandedPathRef.current[0].lat !== totalPath[0].lat || expandedPathRef.current[expandedPathRef.current.length - 1].lat !== totalPath[totalPath.length - 1].lat) {
              expandedPathRef.current = expandPath(totalPath);
            }

            const expanded = expandedPathRef.current || totalPath;
            const prog = typeof routeProgress === 'number' ? Math.max(0, Math.min(1, routeProgress)) : 0;

            // animate local transition for smoothness
            const from = prevProgressRef.current || 0;
            const to = prog;
            const duration = 400; // ms for local smoothing
            const startTs = performance.now();
            if (animReqRef.current) try { cancelAnimationFrame(animReqRef.current); } catch (e) {}
            const stepAnim = (now: number) => {
              const t = Math.min(1, (now - startTs) / duration);
              const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
              const cur = from + (to - from) * ease;
              const idx = Math.max(0, Math.min(expanded.length - 1, Math.floor(cur * (expanded.length - 1))));
              const donePath = expanded.slice(0, idx + 1);
              const remainPath = expanded.slice(Math.max(0, idx), expanded.length);

              try {
                if (!routeDonePolyRef.current) routeDonePolyRef.current = new g.maps.Polyline({ map: mapRef.current, path: donePath, strokeColor: '#10B981', strokeOpacity: 0.95, strokeWeight: 6 });
                else routeDonePolyRef.current.setPath(donePath);
              } catch (e) {}
              try {
                if (!routeRemainPolyRef.current) routeRemainPolyRef.current = new g.maps.Polyline({ map: mapRef.current, path: remainPath, strokeColor: '#EF4444', strokeOpacity: 0.9, strokeWeight: 6 });
                else routeRemainPolyRef.current.setPath(remainPath);
              } catch (e) {}

              if (t < 1) animReqRef.current = requestAnimationFrame(stepAnim);
              else {
                prevProgressRef.current = to;
                animReqRef.current = null;
              }
            };
            animReqRef.current = requestAnimationFrame(stepAnim);
          } else {
            // clear custom polylines
            try { if (routeDonePolyRef.current) { routeDonePolyRef.current.setMap(null); routeDonePolyRef.current = null; } } catch (e) {}
            try { if (routeRemainPolyRef.current) { routeRemainPolyRef.current.setMap(null); routeRemainPolyRef.current = null; } } catch (e) {}
            expandedPathRef.current = null;
            prevProgressRef.current = 0;
            if (animReqRef.current) try { cancelAnimationFrame(animReqRef.current); } catch (e) {};
            animReqRef.current = null;
          }
        } catch (e) {}
        try {
          if (showMarkers && driverLocation && showDriverMarker) {
            const drvPos = { lat: driverLocation.lat, lng: driverLocation.lng };
            if (!markersRef.current.driver) {
              try {
                markersRef.current.driver = createMarker({ position: drvPos, map: mapRef.current, title: 'Conductor', iconUrl: iconMoto, size: { width: 48, height: 48 } });
                if (markersRef.current.driver) markersRef.current.driver._lastPos = drvPos;
                else markersRef.current.driver = null;
              } catch (e) {
                markersRef.current.driver = null;
              }
            } else {
              try {
                if (markersRef.current.driver.setPosition) markersRef.current.driver.setPosition(drvPos);
                else markersRef.current.driver.position = drvPos;
                markersRef.current.driver._lastPos = drvPos;
              } catch (e) {}
            }
          } else {
            if (markersRef.current.driver) { try { markersRef.current.driver.setMap(null); } catch (e) {} markersRef.current.driver = null; }
          }
        } catch (e) {}
        
      } catch (e) {
        try { setError((e as Error)?.message || 'Google Maps failed to load'); } catch {}
        setLoading(false);
      }

        // follow driver: pan smoothly to driver's position but avoid continuous jumps
        try {
          if (followDriver && mapRef.current && driverLocation) {
            const to = { lat: driverLocation.lat, lng: driverLocation.lng };
            const now = Date.now();
            const shouldPan = (() => {
              if (!lastPanRef.current) return true;
              const d = (() => {
                const toRad = (v: number) => (v * Math.PI) / 180;
                const R = 6371000;
                const dLat = toRad(to.lat - (lastPanRef.current as Location).lat);
                const dLon = toRad(to.lng - (lastPanRef.current as Location).lng);
                const lat1 = toRad((lastPanRef.current as Location).lat);
                const lat2 = toRad(to.lat);
                const sinDlat = Math.sin(dLat / 2);
                const sinDlon = Math.sin(dLon / 2);
                const aa = sinDlat * sinDlat + sinDlon * sinDlon * Math.cos(lat1) * Math.cos(lat2);
                const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
                return R * c;
              })();
              // pan if moved > 20m or last pan > 1500ms
              return d > 20 || now - lastPanTsRef.current > 1500;
            })();

            if (shouldPan) {
              try {
                mapRef.current.panTo({ lat: to.lat, lng: to.lng });
                lastPanRef.current = to;
                lastPanTsRef.current = now;
              } catch (e) {
                try { mapRef.current.setCenter({ lat: to.lat, lng: to.lng }); } catch (e) {}
              }
            }
          }
        } catch (e) {}
    })();

    return () => {
      cancelled = true;
      try {
        if (markersRef.current.origin) { markersRef.current.origin.setMap(null); markersRef.current.origin = null; }
        if (markersRef.current.dest) { markersRef.current.dest.setMap(null); markersRef.current.dest = null; }
        if (markersRef.current.driver) { markersRef.current.driver.setMap(null); markersRef.current.driver = null; }
        if (directionsRendererRef.current) { directionsRendererRef.current.setMap(null); directionsRendererRef.current = null; }
        if (routeDonePolyRef.current) { try { routeDonePolyRef.current.setMap(null); } catch (e) {} routeDonePolyRef.current = null; }
        if (routeRemainPolyRef.current) { try { routeRemainPolyRef.current.setMap(null); } catch (e) {} routeRemainPolyRef.current = null; }
        if (animReqRef.current) { try { cancelAnimationFrame(animReqRef.current); } catch (e) {} animReqRef.current = null; }
        expandedPathRef.current = null;
        if (mapRef.current) {
          (window as any).google.maps.event.clearInstanceListeners(mapRef.current);
          mapRef.current = null;
        }
      } catch (e) {}
    };
  }, [origin, destination, driverLocation, onMapClick, showMarkers, showOrigin, showDestination, showDriverMarker, showRoute, routeFrom, routeTo, followDriver, routePath, routeProgress, showRouteProgress]);

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
