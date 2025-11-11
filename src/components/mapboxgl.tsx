import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface TripMapProps {
  origin: Location;
  destination: Location;
  driverLocation: Location;
  showMarkers?: boolean; // when false, don't render markers or route (useful for background map)
  routeFrom?: Location | null;
  routeTo?: Location | null;
  followDriver?: boolean;
  showDriverMarker?: boolean;
  showOrigin?: boolean;
  showDestination?: boolean;
  showRoute?: boolean;
}

mapboxgl.accessToken = (import.meta.env.VITE_MAPBOX_TOKEN as string) || '';

  // token status: 'checking' | 'connected' | 'invalid' | 'no-token'
  // initialize based on whether we have a non-placeholder token
  // (we'll verify with a request below)
  // NOTE: we declare state inside the component below (after ref declarations)

export const TripMap = ({ origin, destination, driverLocation, showMarkers = true, routeFrom = null, routeTo = null, followDriver = false, showDriverMarker = false, showOrigin = true, showDestination = true, showRoute = false }: TripMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const originMarker = useRef<mapboxgl.Marker | null>(null);
  const destMarker = useRef<mapboxgl.Marker | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const userInteractingRef = useRef(false);
  const userInteractionTimerRef = useRef<number | null>(null);

  const token = mapboxgl.accessToken;
  const [tokenStatus, setTokenStatus] = useState<'checking' | 'connected' | 'invalid' | 'no-token'>(
    !token || token === 'tu_token_de_mapbox_aqui' ? 'no-token' : 'checking'
  );

  // If no valid Mapbox token is configured, render a lightweight SVG fallback so the UI
  // remains usable during local development without a token.
  if (!token || token === 'tu_token_de_mapbox_aqui') {
    // compute simple bounds and map coords into a responsive svg box
    // Respect show flags and prefer routeFrom/routeTo when available
    const lineFrom = (routeFrom as Location) || origin;
    const lineTo = (routeTo as Location) || destination;
    const pts = [
      ...(showDriverMarker ? [driverLocation] : []),
      ...(showOrigin ? [origin] : []),
      ...(showDestination ? [destination] : []),
    ];
    const lats = pts.map((p) => p.lat);
    const lngs = pts.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const pad = 0.0005;
    const viewW = 320;
    const viewH = 180;
    const project = (p: Location) => {
      const x = ((p.lng - (minLng - pad)) / ((maxLng + pad) - (minLng - pad))) * (viewW - 20) + 10;
      const y = ((maxLat + pad - p.lat) / ((maxLat + pad) - (minLat - pad))) * (viewH - 20) + 10;
      return { x, y };
    };
    const lf = project(lineFrom);
    const lt = project(lineTo);
    const o = project(origin);
    const d = project(destination);
    const drv = project(driverLocation);

    return (
      <div className="w-full h-full rounded-lg shadow-md bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-sm text-gray-600 mb-2">Mapbox token not configured — mostrando vista previa (fallback)</div>
        <div className="w-full h-full max-h-[420px]">
          <svg viewBox={`0 0 ${viewW} ${viewH}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full rounded border bg-white">
            {/* draw route line between routeFrom/routeTo if available and showRoute is true */}
            {showRoute && <line x1={lf.x} y1={lf.y} x2={lt.x} y2={lt.y} stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" />}
            {showOrigin && <circle cx={o.x} cy={o.y} r={6} fill="#06b6d4" />}
            {showDestination && <circle cx={d.x} cy={d.y} r={6} fill="#10b981" />}
            {showDriverMarker && <circle cx={drv.x} cy={drv.y} r={5} fill="#ef4444" />}
          </svg>
        </div>
        <div className="mt-3 text-xs text-gray-500 text-center">
          {showOrigin && <div>Origen: {origin.lat.toFixed(5)}, {origin.lng.toFixed(5)}</div>}
          {showDestination && <div>Destino: {destination.lat.toFixed(5)}, {destination.lng.toFixed(5)}</div>}
          {showDriverMarker && <div>Conductor: {driverLocation.lat.toFixed(5)}, {driverLocation.lng.toFixed(5)}</div>}
        </div>
      </div>
    );
  }

  // If we have a token, check it by requesting the style URL. Mapbox responds 200 for valid tokens.
  useEffect(() => {
    let mounted = true;
    if (!token) return;
    const styleUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token=${token}`;
    setTokenStatus('checking');
    fetch(styleUrl, { method: 'GET' })
      .then((res) => {
        if (!mounted) return;
        setTokenStatus(res.ok ? 'connected' : 'invalid');
      })
      .catch(() => {
        if (!mounted) return;
        setTokenStatus('invalid');
      });
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (tokenStatus !== 'connected') return;
    if (!containerRef.current) return;
    if (mapInstance.current) return; // init once

    mapInstance.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [origin.lng, origin.lat],
      zoom: 14,
    });

    mapInstance.current.addControl(new mapboxgl.NavigationControl());

    // track manual user interactions so we don't fight the user by auto-centering
    const startUserInteraction = () => {
      userInteractingRef.current = true;
      if (userInteractionTimerRef.current !== null) {
        try { window.clearTimeout(userInteractionTimerRef.current); } catch (e) {}
        userInteractionTimerRef.current = null;
      }
      // clear the flag after a short idle period
      userInteractionTimerRef.current = window.setTimeout(() => {
        userInteractingRef.current = false;
        userInteractionTimerRef.current = null;
      }, 5000) as unknown as number;
    };

    // attach interaction listeners
    try {
      mapInstance.current.on('mousedown', startUserInteraction);
      mapInstance.current.on('touchstart', startUserInteraction);
      mapInstance.current.on('wheel', startUserInteraction);
      mapInstance.current.on('dragstart', startUserInteraction);
      mapInstance.current.on('zoomstart', startUserInteraction);
    } catch (e) {}

    // Do not create origin/destination markers or route on map initialization.
    // Marker creation/removal is handled in the update effect below so markers
    // only appear when the corresponding visibility flags (`showOrigin` /
    // `showDestination`) are true. This prevents blue/green markers from
    // appearing prematurely before a ride is selected.

    // Driver marker should be created/updated independently of showMarkers so
    // the UI can display only the device location while hiding origin/destination.
    if (showDriverMarker) {
      driverMarker.current = new mapboxgl.Marker({ color: 'red' })
        .setLngLat([driverLocation.lng, driverLocation.lat])
        .addTo(mapInstance.current);
    }

    return () => {
      try {
        if (mapInstance.current) {
          mapInstance.current.off('mousedown', () => {});
          mapInstance.current.off('touchstart', () => {});
          mapInstance.current.off('wheel', () => {});
          mapInstance.current.off('dragstart', () => {});
          mapInstance.current.off('zoomstart', () => {});
        }
      } catch (e) {}
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [tokenStatus]);

  // Ensure the map bounds include origin and driver (and destination) so both markers are visible
  useEffect(() => {
    if (!mapInstance.current) return;
    if (!showMarkers) return;
    try {
      const pts = [origin, destination, driverLocation].filter(Boolean) as Location[];
      if (pts.length === 0) return;
      const lats = pts.map((p) => p.lat);
      const lngs = pts.map((p) => p.lng);
      const minLng = Math.min(...lngs);
      const minLat = Math.min(...lats);
      const maxLng = Math.max(...lngs);
      const maxLat = Math.max(...lats);
      const sw: [number, number] = [minLng, minLat];
      const ne: [number, number] = [maxLng, maxLat];
      (mapInstance.current as mapboxgl.Map).fitBounds([sw, ne], { padding: 80, maxZoom: 16, duration: 600 });
    } catch (e) {
      // ignore
    }
  }, [origin, destination, driverLocation, showMarkers, showOrigin, showDestination, showDriverMarker]);

  // When routeFrom/routeTo change, attempt to fetch a street-accurate route from Mapbox Directions API
  useEffect(() => {
    if (!mapInstance.current) return;
    if (!showRoute) return; // do not request or update route unless explicitly allowed
    const from = routeFrom || origin;
    const to = routeTo || destination;
    if (!from || !to) return;
    // Only call directions when we have a valid token and connected
    if (!token || tokenStatus !== 'connected') {
      // fallback: update the source with a straight line
      const src = mapInstance.current.getSource('route') as mapboxgl.GeoJSONSource | undefined;
      if (src) {
        const data = {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [[from.lng, from.lat], [to.lng, to.lat]] },
        } as GeoJSON.Feature<GeoJSON.Geometry>;
        try { src.setData(data); } catch (e) {}
      }
      return;
    }

  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  // request alternatives and pick the shortest route by distance to favor shortest street path
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?alternatives=true&geometries=geojson&overview=full&access_token=${token}`;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Directions API error');
        const json = await res.json();
        if (cancelled) return;
        // pick the shortest route by reported distance (meters) from the returned alternatives
        const routes = json?.routes || [];
        let geometry = null;
        if (routes.length === 1) {
          geometry = routes[0].geometry;
        } else if (routes.length > 1) {
          try {
            const best = routes.reduce((min: any, r: any) => (r.distance < min.distance ? r : min), routes[0]);
            geometry = best.geometry;
          } catch (e) {
            geometry = routes[0].geometry;
          }
        }
      const src = mapInstance.current!.getSource('route') as mapboxgl.GeoJSONSource | undefined;
        const data = geometry
          ? ({ type: 'Feature', properties: {}, geometry } as GeoJSON.Feature<GeoJSON.Geometry>)
          : ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[from.lng, from.lat], [to.lng, to.lat]] } } as GeoJSON.Feature<GeoJSON.Geometry>);
        if (src) {
          try { src.setData(data); } catch (e) {}
        } else {
          // add source/layer if not present
          try {
            mapInstance.current!.addSource('route', { type: 'geojson', data } as any);
            mapInstance.current!.addLayer({ id: 'route-line', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#1D4ED8', 'line-width': 4 } } as any);
          } catch (e) {}
        }
      } catch (e) {
        // fallback to straight line
        const src = mapInstance.current!.getSource('route') as mapboxgl.GeoJSONSource | undefined;
        if (src) {
          const data = {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: [[from.lng, from.lat], [to.lng, to.lat]] },
          } as GeoJSON.Feature<GeoJSON.Geometry>;
          try { src.setData(data); } catch (err) {}
        }
      }
    })();

    return () => { cancelled = true; };
  }, [routeFrom, routeTo, tokenStatus, token, origin, destination]);

  // update markers and route when props change
  useEffect(() => {
    if (!mapInstance.current) return;
    // If showMarkers is false, remove origin/destination markers and any route layer/source
  if (!showMarkers) {
      // remove origin/destination markers
      try {
        if (originMarker.current) { originMarker.current.remove(); originMarker.current = null; }
      } catch (e) {}
      try {
        if (destMarker.current) { destMarker.current.remove(); destMarker.current = null; }
      } catch (e) {}

      // remove known layers/sources that may have been added earlier
      try {
        if (mapInstance.current.getLayer && mapInstance.current.getLayer('route-line')) {
          try { mapInstance.current.removeLayer('route-line'); } catch (e) {}
        }
      } catch (e) {}
      try {
        if (mapInstance.current.getSource && mapInstance.current.getSource('route')) {
          try { mapInstance.current.removeSource('route'); } catch (e) {}
        }
      } catch (e) {}

      // remove driver-range (used by other maps/components) if present
      try {
        if (mapInstance.current.getLayer && mapInstance.current.getLayer('driver-range')) {
          try { mapInstance.current.removeLayer('driver-range'); } catch (e) {}
        }
      } catch (e) {}
      try {
        if (mapInstance.current.getSource && mapInstance.current.getSource('driver-range')) {
          try { mapInstance.current.removeSource('driver-range'); } catch (e) {}
        }
      } catch (e) {}

      // ensure only the driver marker remains (or none if showDriverMarker is false)
      try {
        if (originMarker.current) { originMarker.current.remove(); originMarker.current = null; }
      } catch (e) {}
      try {
        if (destMarker.current) { destMarker.current.remove(); destMarker.current = null; }
      } catch (e) {}

      // if driver marker should be visible but is missing, it will be created below.
      // if it should be hidden, remove it now.
      if (!showDriverMarker) {
        try { if (driverMarker.current) { driverMarker.current.remove(); driverMarker.current = null; } } catch (e) {}
      }

      // If both showMarkers and showDriverMarker are false, aggressively clear any
      // remaining marker DOM nodes and popups so the map appears empty.
      if (!showDriverMarker) {
        try {
          const container = mapInstance.current ? (mapInstance.current.getContainer() as HTMLElement) : containerRef.current;
          if (container) {
            // remove any marker DOM nodes
            container.querySelectorAll('.mapboxgl-marker').forEach((n) => n.remove());
            // remove any popups
            container.querySelectorAll('.mapboxgl-popup').forEach((n) => n.remove());
          }
        } catch (e) {}

        // also ensure known layers/sources are removed (already attempted above)
        try { if (mapInstance.current && mapInstance.current.getLayer && mapInstance.current.getLayer('route-line')) { mapInstance.current.removeLayer('route-line'); } } catch (e) {}
        try { if (mapInstance.current && mapInstance.current.getSource && mapInstance.current.getSource('route')) { mapInstance.current.removeSource('route'); } } catch (e) {}

        // nothing else to do — leave early so no markers/layers are recreated below
        return;
      }
    }
    // origin marker
    if (showOrigin) {
      if (!originMarker.current) {
        try {
          originMarker.current = new mapboxgl.Marker({ color: 'blue' }).setLngLat([origin.lng, origin.lat]).addTo(mapInstance.current as mapboxgl.Map);
        } catch (e) {}
      } else {
        originMarker.current.setLngLat([origin.lng, origin.lat]);
      }
    } else {
      if (originMarker.current) {
        try { originMarker.current.remove(); } catch (e) {}
        originMarker.current = null;
      }
    }

    // destination marker
    if (showDestination) {
      if (!destMarker.current) {
        try {
          destMarker.current = new mapboxgl.Marker({ color: 'green' }).setLngLat([destination.lng, destination.lat]).addTo(mapInstance.current as mapboxgl.Map);
        } catch (e) {}
      } else {
        destMarker.current.setLngLat([destination.lng, destination.lat]);
      }
    } else {
      if (destMarker.current) {
        try { destMarker.current.remove(); } catch (e) {}
        destMarker.current = null;
      }
    }

    // driver marker
    if (showDriverMarker) {
      if (!driverMarker.current) {
        try {
          driverMarker.current = new mapboxgl.Marker({ color: 'red' }).setLngLat([driverLocation.lng, driverLocation.lat]).addTo(mapInstance.current as mapboxgl.Map);
        } catch (e) {}
      } else {
        driverMarker.current.setLngLat([driverLocation.lng, driverLocation.lat]);
      }
    } else {
      if (driverMarker.current) {
        try { driverMarker.current.remove(); } catch (e) {}
        driverMarker.current = null;
      }
    }

    // update route source data if exists and showRoute is true: prefer routeFrom/routeTo when provided
  const map = mapInstance.current;
    if (showRoute) {
      const src = map.getSource('route') as mapboxgl.GeoJSONSource | undefined;
      if (src) {
        const from = routeFrom || origin;
        const to = routeTo || destination;
        const data = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [from.lng, from.lat],
              [to.lng, to.lat],
            ],
          },
        } as GeoJSON.Feature<GeoJSON.Geometry>;
        try { src.setData(data); } catch (e) {}
      }
    }
  }, [origin, destination, driverLocation, routeFrom, routeTo, showMarkers, showOrigin, showDestination, showDriverMarker, showRoute]);

  // Note: marker updates are handled in the general update effect above; keep this for backward compatibility

  // If followDriver is enabled, pan the map to the driver's location when it updates
  useEffect(() => {
    if (!mapInstance.current) return;
    if (!followDriver) return;
    if (!driverLocation) return;
    try {
      // only auto-center when the user is not interacting with the map
      if (!userInteractingRef.current) {
        mapInstance.current.easeTo({ center: [driverLocation.lng, driverLocation.lat], duration: 500 });
      }
    } catch (e) {}
  }, [driverLocation, followDriver]);

  return (
    <div className="w-full h-full rounded-lg shadow-md relative">
      {/* status badge */}
      {tokenStatus === 'checking' && (
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs bg-yellow-50 text-yellow-800 border border-yellow-200">Comprobando token...</div>
      )}
      {tokenStatus === 'connected' && (
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs bg-green-50 text-green-800 border border-green-200">Mapbox: conectado</div>
      )}
      {tokenStatus === 'invalid' && (
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs bg-red-50 text-red-800 border border-red-200">Token inválido</div>
      )}

      <div ref={containerRef} className="w-full h-full rounded-lg" />
    </div>
  );
};