import React from 'react';
import iconMoto from '../../../assets/iconmoto.png';

interface DriverMapProps {
  driverLocation: [number, number]; // [lng, lat]
  requests: { id: string; location: [number, number] }[];
  rangeKm?: number;
}

const loadGoogleMaps = (key?: string) => new Promise<void>((resolve, reject) => {
  if (typeof window === 'undefined') return reject(new Error('No window'));
  if ((window as any).google && (window as any).google.maps) return resolve();
  const existing = document.getElementById('gmap-js');
  if (existing) {
    (existing as HTMLScriptElement).addEventListener('load', () => resolve());
    return;
  }
  const apiKey = key || (import.meta.env as any).VITE_GMAPS_KEY || localStorage.getItem('gMapsKey');
  if (!apiKey) return reject(new Error('No Google Maps key'));
  const s = document.createElement('script');
  s.id = 'gmap-js';
  s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
  s.async = true;
  s.defer = true;
  s.onload = () => resolve();
  s.onerror = () => reject(new Error('Failed to load gmaps'));
  document.head.appendChild(s);
});

const DriverMap: React.FC<DriverMapProps> = ({ driverLocation, requests, rangeKm = 3 }) => {
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<any>(null);
  const driverMarkerRef = React.useRef<any>(null);
  const requestsMarkersRef = React.useRef<Record<string, any>>({});
  const circleRef = React.useRef<any>(null);
  const firstFitRef = React.useRef<boolean>(false);
  const lastPanRef = React.useRef<number>(0);
  const prevDriverRef = React.useRef<{ lat: number; lng: number } | null>(null);
  const prevRequestIdsRef = React.useRef<string[]>([]);

  // helper to create AdvancedMarkerElement when available, otherwise google.maps.Marker
  const createMarker = (opts: { position: { lat: number; lng: number }, map: any, title?: string, iconUrl?: string, size?: { width: number; height: number } }) => {
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
        await loadGoogleMaps();
        if (cancelled || !mapContainerRef.current) return;
        if (!mapRef.current) {
          mapRef.current = new (window as any).google.maps.Map(mapContainerRef.current, {
            center: { lat: driverLocation[1], lng: driverLocation[0] },
            zoom: 14,
            mapTypeId: 'roadmap',
          });
        }
      } catch (err) {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Manage markers and avoid recreating them each update
  React.useEffect(() => {
    if (!mapRef.current || !(window as any).google) return;

    const g = (window as any).google;

    // If there are no requests, do NOT show any markers (initial empty state)
    const showMarkers = Array.isArray(requests) && requests.length > 0;

    // Clear request markers that no longer exist
    const currentIds = requests.map(r => r.id);
    Object.keys(requestsMarkersRef.current).forEach(id => {
      if (!currentIds.includes(id)) {
        try { requestsMarkersRef.current[id].setMap(null); } catch (e) {}
        delete requestsMarkersRef.current[id];
      }
    });

    // If we shouldn't show markers (no requests), remove all markers and driver marker
    if (!showMarkers) {
      if (driverMarkerRef.current) { try { driverMarkerRef.current.setMap(null); } catch (e) {} driverMarkerRef.current = null; }
      Object.keys(requestsMarkersRef.current).forEach(id => { try { requestsMarkersRef.current[id].setMap(null); } catch (e) {} });
      requestsMarkersRef.current = {};
      if (circleRef.current) { try { circleRef.current.setMap(null); } catch (e) {} circleRef.current = null; }
      firstFitRef.current = false;
      prevRequestIdsRef.current = [];
      prevDriverRef.current = { lat: driverLocation[1], lng: driverLocation[0] };
      return;
    }

    // Create or update driver marker with custom icon
    const drvPos = { lat: driverLocation[1], lng: driverLocation[0] };
    if (!driverMarkerRef.current) {
      try {
        driverMarkerRef.current = createMarker({ position: drvPos, map: mapRef.current, title: 'Conductor', iconUrl: iconMoto, size: { width: 48, height: 48 } });
      } catch (e) {
        try { driverMarkerRef.current = new g.maps.Marker({ position: drvPos, map: mapRef.current, title: 'Conductor' }); } catch (e) { driverMarkerRef.current = null; }
      }
    } else {
      try { if (driverMarkerRef.current.position) driverMarkerRef.current.position = drvPos; else driverMarkerRef.current.setPosition && driverMarkerRef.current.setPosition(drvPos); } catch (e) {}
    }

    // Circle around driver
    if (circleRef.current) { try { circleRef.current.setMap(null); } catch (e) {} circleRef.current = null; }
    try {
      circleRef.current = new g.maps.Circle({ center: drvPos, radius: rangeKm * 1000, map: mapRef.current, fillColor: '#3b82f6', fillOpacity: 0.12, strokeWeight: 0 });
    } catch (e) {}

    // Create/update request markers
    requests.forEach(req => {
      const pos = { lat: req.location[1], lng: req.location[0] };
      if (requestsMarkersRef.current[req.id]) {
        try { requestsMarkersRef.current[req.id].setPosition(pos); } catch (e) {}
      } else {
        try {
          const mk = createMarker({ position: pos, map: mapRef.current, title: `Solicitud #${req.id}` });
          const iw = new g.maps.InfoWindow({ content: `<div class='text-sm p-2'>Solicitud #${req.id}</div>` });
          try {
            if (mk.addListener) mk.addListener('click', () => iw.open(mapRef.current, mk));
            else if ((mk as any).content && (mk as any).content.addEventListener) (mk as any).content.addEventListener('click', () => iw.open(mapRef.current, mk));
          } catch (e) {}
          requestsMarkersRef.current[req.id] = mk;
        } catch (e) {}
      }
    });

    // Decide whether to fit bounds: only first time or when requests list changes
    const prevIds = prevRequestIdsRef.current.join(',');
    const curIds = currentIds.join(',');
    if (!firstFitRef.current || prevIds !== curIds) {
      try {
        const bounds = new g.maps.LatLngBounds();
        // include driver and all request markers
        if (driverMarkerRef.current) bounds.extend(driverMarkerRef.current.getPosition());
        Object.values(requestsMarkersRef.current).forEach((m: any) => bounds.extend(m.getPosition()));
        if (!bounds.isEmpty()) {
          mapRef.current.fitBounds(bounds, { padding: 80 });
          firstFitRef.current = true;
        }
      } catch (e) {}
    } else {
      // Throttle panning towards driver to avoid jitter
      try {
        const now = Date.now();
        const last = lastPanRef.current || 0;
        const prev = prevDriverRef.current;
        const distThresholdMeters = 30; // only pan if moved >30m
        let shouldPan = false;
        if (!prev) shouldPan = true;
        else {
          const R = 6371000;
          const toRad = (v: number) => v * Math.PI / 180;
          const dLat = toRad(drvPos.lat - prev.lat);
          const dLon = toRad(drvPos.lng - prev.lng);
          const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(toRad(prev.lat))*Math.cos(toRad(drvPos.lat))*Math.sin(dLon/2)*Math.sin(dLon/2);
          const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const meters = R * c;
          if (meters > distThresholdMeters && (now - last) > 2000) shouldPan = true;
        }
        if (shouldPan) {
          try { mapRef.current.panTo(drvPos); lastPanRef.current = now; } catch (e) {}
        }
      } catch (e) {}
    }

    prevRequestIdsRef.current = currentIds;
    prevDriverRef.current = { lat: driverLocation[1], lng: driverLocation[0] };
  }, [driverLocation, requests, rangeKm]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-xl shadow-lg" />;
};

export default DriverMap;


