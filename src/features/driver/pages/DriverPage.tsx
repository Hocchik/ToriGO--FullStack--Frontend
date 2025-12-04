import React, { useCallback, useEffect, useRef, useState } from "react";
import DriverMap from "../../../components/DriverMap";
import type { RideRequest } from './Models';
import { useDispatch } from 'react-redux';
import TripService from '../../../services/TripService';
import { addTrip, acceptTrip } from '../driverSlice';
import RequestList from "../components/RequestList";
import RideDetails from "../components/RideDetails";
import LoadingOverlay from "../components/LoadingOverlay";
import RideNotificationQueue from "../components/RideNotificationQueue";
import SlidingSidebar from "../components/SlidingSideBar";
import fondoMototaxi from "../../../assets/DriverPage.png";
import { useAvailability } from '../hooks/useAvailability';
import { usePolling } from '../hooks/usePolling';


// use shared RideRequest model from `Models.ts`

export const DriverPage = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const movementRef = useRef<number | null>(null);
  const geoWatchRef = useRef<number | null>(null);
  const traceFlushRef = useRef<number | null>(null);
  const traceBufferRef = useRef<Array<{ lat: number; lng: number; ts: string }>>([]);
  const pendingLocRef = useRef<{ lat: number; lng: number } | null>(null);
  const pendingTimerRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const driverLocationRef = useRef<{ lat: number; lng: number } | null>(driverLocation);
  const driverTraceRef = useRef<Array<{ lat: number; lng: number; ts: string }>>([]);
  const dispatch = useDispatch();
  
  // Use custom hooks for availability and polling
  const { availability, setAvailability } = useAvailability();
  const { pendingRequests } = usePolling(true);
  const [routePhase, setRoutePhase] = useState<'idle' | 'toPickup' | 'toDrop'>('idle');
  const [hasArrived, setHasArrived] = useState(false);
  const [requestPanelOpen, setRequestPanelOpen] = useState(false);
  // simulation helpers: explicit route polyline and progress [0..1]
  const [routePath, setRoutePath] = useState<Array<{ lat: number; lng: number }> | null>(null);
  const [routeProgress, setRouteProgress] = useState<number>(0);
  // simulation speed multiplier (1 = normal, >1 faster, <1 slower)
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const movementStartRef = useRef<{ start: { lat: number; lng: number }; totalDist: number } | null>(null);

  // Mobile bottom-sheet state (px)
  const [bottomH, setBottomH] = useState<number>(() =>
    typeof window !== "undefined" ? Math.round(window.innerHeight * 0.45) : 0
  );
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHRef = useRef(0);

  // Viewport detection (mobile < md)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : true
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeRide]);

  // bounds for bottom sheet (px)
  const minH = typeof window !== "undefined" ? Math.round(window.innerHeight * 0.18) : 120; // detalles pequeños
  const midH = typeof window !== "undefined" ? Math.round(window.innerHeight * 0.45) : 300; // default
  const maxH = typeof window !== "undefined" ? Math.round(window.innerHeight * 0.80) : 700; // detalles grandes

  useEffect(() => {
    if (!activeRide) {
      setBottomH(midH);
      return;
    }
    if (!isMobile) {
      setBottomH(0);
    } else {
      setBottomH((h) => Math.min(Math.max(h || midH, minH), maxH));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, activeRide]);

  // drag handlers (touch + mouse)
  useEffect(() => {
    const onMove = (e: TouchEvent | MouseEvent) => {
      if (!draggingRef.current) return;
      const clientY =
        e instanceof TouchEvent ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const delta = startYRef.current - clientY;
      const newH = Math.min(Math.max(startHRef.current + delta, minH), maxH);
      setBottomH(newH);
    };

    const onEnd = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const distToMin = Math.abs(bottomH - minH);
      const distToMid = Math.abs(bottomH - midH);
      const distToMax = Math.abs(bottomH - maxH);
      const nearest =
        distToMin <= distToMid && distToMin <= distToMax
          ? minH
          : distToMid <= distToMax
          ? midH
          : maxH;
      setBottomH(nearest);
      window.removeEventListener("mousemove", onMove as any);
      window.removeEventListener("mouseup", onEnd as any);
      window.removeEventListener("touchmove", onMove as any);
      window.removeEventListener("touchend", onEnd as any);
    };

    return () => {
      window.removeEventListener("mousemove", onMove as any);
      window.removeEventListener("mouseup", onEnd as any);
      window.removeEventListener("touchmove", onMove as any);
      window.removeEventListener("touchend", onEnd as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottomH, minH, midH, maxH]);

  const startDrag = (clientY: number) => {
    draggingRef.current = true;
    startYRef.current = clientY;
    startHRef.current = bottomH || midH;

    const onMove = (e: TouchEvent | MouseEvent) => {
      if (!draggingRef.current) return;
      const clientYY =
        e instanceof TouchEvent ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const delta = startYRef.current - clientYY;
      const newH = Math.min(Math.max(startHRef.current + delta, minH), maxH);
      setBottomH(newH);
    };

    const onEnd = () => {
      draggingRef.current = false;
      const distToMin = Math.abs(bottomH - minH);
      const distToMid = Math.abs(bottomH - midH);
      const distToMax = Math.abs(bottomH - maxH);
      const nearest =
        distToMin <= distToMid && distToMin <= distToMax
          ? minH
          : distToMid <= distToMax
          ? midH
          : maxH;
      setBottomH(nearest);
      window.removeEventListener("mousemove", onMove as any);
      window.removeEventListener("mouseup", onEnd as any);
      window.removeEventListener("touchmove", onMove as any);
      window.removeEventListener("touchend", onEnd as any);
    };

    window.addEventListener("mousemove", onMove as any);
    window.addEventListener("mouseup", onEnd as any);
    window.addEventListener("touchmove", onMove as any, { passive: false } as any);
    window.addEventListener("touchend", onEnd as any);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startDrag(e.touches[0].clientY);
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    startDrag(e.clientY);
  };

  const handleGoOnline = () => {
    console.error('[DEBUG] 🔴 handleGoOnline clicked');
    setLoading(true);
    (async () => {
      try {
        console.error('[DEBUG] 📡 About to set availability to available...');
        await setAvailability('available');
        setIsOnline(true);
        console.error('[DEBUG] ✅ Successfully set online');
      } catch (e) {
        console.error('[DEBUG] ❌ Failed to set availability:', e);
      } finally {
        setLoading(false);
      }
    })();
  };

  // Force-load trip by external id (developer/testing helper)
  const [forceId, setForceId] = useState('');
  const handleForceLoad = async () => {
    if (!forceId) return;
    setLoading(true);
    try {
      const res = await TripService.getTrip(forceId, { includeTrace: true });
      const trip = res?.data;
      if (!trip) {
        alert('Trip not found');
        return;
      }

      // Try to derive a shape compatible with existing RideRequest model
      const ride: any = {
        id: trip.id || trip.external_id || trip.externalId || forceId,
        pickup: trip.origin?.address || trip.origin_address || (trip.origin && trip.origin.coords ? trip.origin.coords : undefined) || 'Origen',
        drop: trip.destination?.address || trip.destination_address || 'Destino',
        price: trip.price || trip.fare || 0,
        passenger: trip.passenger || { id: trip.passenger_id || trip.passengerId } ,
        pickupCoords: (trip.origin && trip.origin.coords) ? trip.origin.coords : (trip.origin_lat ? { lat: trip.origin_lat, lng: trip.origin_lng } : undefined),
        dropCoords: (trip.destination && trip.destination.coords) ? trip.destination.coords : (trip.destination_lat ? { lat: trip.destination_lat, lng: trip.destination_lng } : undefined),
        raw: trip,
      };

      // If trace points exist, use them as explicit route path and set driver location
      const traces = trip.traces || trip.driverTrace || trip.driver_trace || trip.trace || trip.points;
      if (Array.isArray(traces) && traces.length > 0) {
        // convert to {lat,lng} if necessary
        const path = traces.map((p: any) => {
          if (p.lat !== undefined && p.lng !== undefined) return { lat: Number(p.lat), lng: Number(p.lng) };
          if (p.latitude !== undefined && p.longitude !== undefined) return { lat: Number(p.latitude), lng: Number(p.longitude) };
          if (Array.isArray(p) && p.length >= 2) return { lat: Number(p[0]), lng: Number(p[1]) };
          return null;
        }).filter(Boolean) as Array<{ lat: number; lng: number }>;
        if (path.length) {
          setRoutePath(path);
          setRouteProgress(0);
          // set driverLocation to first trace point so map centers
          setDriverLocation(path[0]);
        }
      }

      // If trip is still a pending request, show it in the pending queue; otherwise open ride details
      if (trip.status && (trip.status === 'REQUESTED' || trip.status === 'PENDING')) {
        // Redux will manage pending requests state now
        setRequestPanelOpen(true);
      } else {
        setActiveRide(ride as RideRequest);
      }
    } catch (e) {
      console.warn('Failed to load trip', e);
      alert('Error cargando viaje desde servidor');
    } finally {
      setLoading(false);
    }
  };

  // Geolocation behavior:
  // - When online and NOT moving (routePhase === 'idle') poll getCurrentPosition every 20s and update a static marker.
  // - When moving (routePhase !== 'idle') use watchPosition with the stability filter (existing behavior).
  useEffect(() => {
    // cleanup helper
    const stopWatch = () => {
      if (geoWatchRef.current !== null && 'geolocation' in navigator) {
        try { navigator.geolocation.clearWatch(geoWatchRef.current); } catch (e) {}
        geoWatchRef.current = null;
      }
      if (pendingTimerRef.current !== null) {
        try { window.clearTimeout(pendingTimerRef.current); } catch (e) {}
        pendingTimerRef.current = null;
        pendingLocRef.current = null;
      }
    };

    const stopPoll = () => {
      if (pollIntervalRef.current !== null) {
        try { window.clearInterval(pollIntervalRef.current); } catch (e) {}
        pollIntervalRef.current = null;
      }
    };

    if (!isOnline) {
      stopWatch();
      stopPoll();
      return;
    }

    if (!('geolocation' in navigator)) {
      console.warn('Geolocation not available in this browser');
      return;
    }

  // Keep driverLocationRef updated from state
  driverLocationRef.current = driverLocation;

  // POLLING mode: when idle, update location every 20s (static until next tick)
    if (routePhase === 'idle') {
      // stop any active watch
      stopWatch();
      // do an immediate one-shot read
      try {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setDriverLocation(coords);
                try { const p = { lat: coords.lat, lng: coords.lng, ts: new Date().toISOString() }; driverTraceRef.current.push(p); traceBufferRef.current.push(p); } catch (e) {}
          },
          (err) => console.warn('Geolocation getCurrentPosition error', err),
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
        );
      } catch (e) {
        console.warn('getCurrentPosition failed', e);
      }

      // schedule polling every 20s
      stopPoll();
      pollIntervalRef.current = window.setInterval(() => {
        try {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setDriverLocation(coords);
              try { const p = { lat: coords.lat, lng: coords.lng, ts: new Date().toISOString() }; driverTraceRef.current.push(p); traceBufferRef.current.push(p); } catch (e) {}
            },
            (err) => console.warn('Geolocation getCurrentPosition error', err),
            { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
          );
        } catch (e) {
          console.warn('getCurrentPosition failed', e);
        }
      }, 20000) as unknown as number;

      return () => {
        stopPoll();
      };
    }

  // WATCH mode: moving -> use watchPosition with stability filter
    // Stability filter parameters
    const SMALL_MOVE_M = 20; // meters
    const STABLE_WINDOW_MS = 10000; // 10s

    stopPoll();
    // start watch
    try {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const raw = { lat: pos.coords.latitude, lng: pos.coords.longitude };

          const current = driverLocationRef.current;
          if (!current) {
            setDriverLocation(raw);
            try { const p = { lat: raw.lat, lng: raw.lng, ts: new Date().toISOString() }; driverTraceRef.current.push(p); traceBufferRef.current.push(p); } catch (e) {}
            return;
          }

          const dist = haversineMeters(current, raw);
          if (dist <= SMALL_MOVE_M) {
            setDriverLocation(raw);
            try { const p = { lat: raw.lat, lng: raw.lng, ts: new Date().toISOString() }; driverTraceRef.current.push(p); traceBufferRef.current.push(p); } catch (e) {}
            if (pendingTimerRef.current !== null) {
              try { window.clearTimeout(pendingTimerRef.current); } catch (e) {}
              pendingTimerRef.current = null;
              pendingLocRef.current = null;
            }
            return;
          }

          // large jump: buffer and apply after window
          pendingLocRef.current = raw;
          if (pendingTimerRef.current === null) {
            pendingTimerRef.current = window.setTimeout(() => {
              const toApply = pendingLocRef.current;
              if (toApply) {
                setDriverLocation(toApply);
                try { const p = { lat: toApply.lat, lng: toApply.lng, ts: new Date().toISOString() }; driverTraceRef.current.push(p); traceBufferRef.current.push(p); } catch (e) {}
              }
              pendingLocRef.current = null;
              if (pendingTimerRef.current !== null) {
                try { window.clearTimeout(pendingTimerRef.current); } catch (e) {}
              }
              pendingTimerRef.current = null;
            }, STABLE_WINDOW_MS) as unknown as number;
          }
  },
        (err) => {
          console.warn('Geolocation watch error', err);
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
      geoWatchRef.current = id as unknown as number;
    } catch (e) {
      console.warn('Failed to start geolocation watch', e);
    }

    return () => {
      stopWatch();
      stopPoll();
    };
    // run when online state or moving phase changes (driverLocationRef used inside callback)
  }, [isOnline, routePhase]);

  // keep ref in sync with state without causing effect restarts
  useEffect(() => {
    driverLocationRef.current = driverLocation;
  }, [driverLocation]);

  const handleStopSearch = () => {
    (async () => {
      try {
        await setAvailability('offline');
      } catch (e) {
        console.warn('Failed to set offline availability', e);
      }
      setIsOnline(false);
      setRequestPanelOpen(false);
    })();
  };

  const handleAcceptRide = (ride: RideRequest) => {
    setLoading(true);
    (async () => {
      try {
        // Ask backend to accept the trip (idempotent) and capture server response
        const resultAction: any = await dispatch(acceptTrip({ id: (ride as any).id }) as any);
        const payload = resultAction?.payload;
        const serverId = payload?.id || payload?.tripId || (ride as any).id;
        setLoading(false);
        // ensure activeRide has the authoritative trip id from server when available
        const active: RideRequest = { ...(ride as any), id: serverId } as RideRequest;
        setActiveRide(active);
        // start trace sender will be started by effect when routePhase changes
        setRequestPanelOpen(false);
        // init driver location near the city center only if we don't have a real device location
        const start = { lat: (ride as any).pickupCoords.lat + 0.0015, lng: (ride as any).pickupCoords.lng - 0.002 };
        if (!driverLocation) setDriverLocation(start);
        // start moving towards pickup
        setRoutePhase('toPickup');
        startMovingTowards((ride as any).pickupCoords);
      } catch (e) {
        console.warn('Failed to accept trip on server, falling back to local accept', e);
        setLoading(false);
        // fallback to local accept behavior
        setActiveRide(ride as RideRequest);
        setRequestPanelOpen(false);
        const start = { lat: (ride as any).pickupCoords.lat + 0.0015, lng: (ride as any).pickupCoords.lng - 0.002 };
        if (!driverLocation) setDriverLocation(start);
        setRoutePhase('toPickup');
        startMovingTowards((ride as any).pickupCoords);
      }
    })();
  };

  // Trace buffer flush helpers
  const flushTraces = async (tripId?: string) => {
    const buf = traceBufferRef.current.slice();
    if (!buf || buf.length === 0) return;
    traceBufferRef.current = [];
    if (!tripId && activeRide) tripId = (activeRide as any).id;
    if (!tripId) return;
    try {
      await TripService.appendTrace(tripId as string, buf.map((p) => ({ lat: p.lat, lng: p.lng, ts: p.ts })));
    } catch (e) {
      console.warn('Failed to append trace to server, will buffer locally', e);
      // re-queue traces for next attempt
      traceBufferRef.current = buf.concat(traceBufferRef.current);
    }
  };

  const startTraceSender = (tripId?: string) => {
    if (traceFlushRef.current !== null) return; // already running
    // flush interval every 5s
    traceFlushRef.current = window.setInterval(() => {
      flushTraces(tripId as string);
    }, 5000) as unknown as number;
  };

  const stopTraceSender = async () => {
    if (traceFlushRef.current !== null) {
      try { window.clearInterval(traceFlushRef.current); } catch (e) {}
      traceFlushRef.current = null;
    }
    // flush any remaining traces one last time
    await flushTraces((activeRide as any)?.id);
  };

  // Start/stop trace sender when an activeRide exists and movement starts/stops
  useEffect(() => {
    if (activeRide && routePhase !== 'idle') {
      startTraceSender((activeRide as any).id);
    } else {
      stopTraceSender();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRide, routePhase]);

  const haversineMeters = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // meters
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

  const handleCancelRide = () => {
    // when driver cancels an active ride, save a canceled trip payload
    if (activeRide) {
      const payload = buildCancelPayload(activeRide as any, driverLocation);
      // attach recorded trace (do not mutate original payload constant)
      const payloadWithTrace = { ...payload, driverTrace: driverTraceRef.current.slice() };
      saveTripLocally(payloadWithTrace);
      // also persist in redux
      try {
        dispatch(
          addTrip({
            id: payloadWithTrace.tripId,
            driverId: payloadWithTrace.driverId,
            passengerId: payloadWithTrace.passengerId,
            origin: { lat: payloadWithTrace.origin.coords.lat, lng: payloadWithTrace.origin.coords.lng, address: payloadWithTrace.origin.address },
            destination: { lat: payloadWithTrace.destination.coords.lat, lng: payloadWithTrace.destination.coords.lng, address: payloadWithTrace.destination.address },
            status: payloadWithTrace.status,
            price: payloadWithTrace.price,
            canceledAt: payloadWithTrace.canceledAt,
            cancelReason: payloadWithTrace.cancelReason,
            raw: payloadWithTrace.raw,
            driverTrace: payloadWithTrace.driverTrace,
          })
        );
      } catch (e) {}
    }
    stopMovement();
    setActiveRide(null);
  };

  const handlePanic = () => {
    try {
      // Emit a panic event — UI / backend can listen to this in a real setup
      window.dispatchEvent(new CustomEvent('toriGO:panic', { detail: { tripId: activeRide?.id } }));
    } catch (e) {}
    try { alert('¡Botón de pánico activado! Se ha notificado el sistema.'); } catch (e) {}
  };

  const handleConfirmArrival = () => {
    // silent confirm arrival
  };

  const handleConfirmPayment = () => {
    // finalizar viaje -> cerrar detalles y abrir panel de solicitudes
    setActiveRide(null);
    setRequestPanelOpen(true);
  };

  // Helpers: movement and payloads
  const stopMovement = () => {
    if (movementRef.current) {
      try { window.clearTimeout(movementRef.current); } catch (e) { try { window.clearInterval(movementRef.current); } catch (e) {} }
      movementRef.current = null;
    }
    setRoutePhase('idle');
  };

  const startMovingTowards = (target: { lat: number; lng: number }) => {
    stopMovement();

    // Try to use Google DirectionsService to obtain a realistic street route and animate along it.
    const tryRouteAndAnimate = async () => {
      try {
        if (!(window as any).google || !(window as any).google.maps || !(window as any).google.maps.DirectionsService) throw new Error('No Google Directions');
        const directionsService = new (window as any).google.maps.DirectionsService();
        const originPos = driverLocation || { lat: target.lat, lng: target.lng };
        directionsService.route({ origin: { lat: originPos.lat, lng: originPos.lng }, destination: { lat: target.lat, lng: target.lng }, travelMode: (window as any).google.maps.TravelMode.DRIVING }, (result: any, status: any) => {
          if (status !== 'OK' || !result) {
            // fallback to simple movement
            fallbackLinearMovement();
            return;
          }
          try {
            const route = result.routes[0];
            // build an array of LatLng points from the overview_path (follows streets)
            const path: Array<{ lat: number; lng: number }> = (route.overview_path || []).map((p: any) => ({ lat: p.lat(), lng: p.lng() }));
            if (!path.length) { fallbackLinearMovement(); return; }

            // set explicit route path for map rendering
            setRoutePath(path);
            setRouteProgress(0);

            // animate along the path using recursive setTimeout so simSpeed changes take effect immediately
            let idx = 0;
            const step = () => {
              const next = path[idx];
              if (!next) {
                try { window.clearTimeout(movementRef.current as number); } catch (e) {}
                movementRef.current = null;
                setRouteProgress(1);
                // arrival behavior
                if (routePhase === 'toPickup') {
                  try { window.dispatchEvent(new CustomEvent('toriGO:arrived')); } catch {}
                } else if (routePhase === 'toDrop') {
                  // finalize trip
                  if (activeRide) {
                    const payload = buildFinishPayload(activeRide as any, target, driverLocation);
                    const payloadWithTrace = { ...payload, driverTrace: driverTraceRef.current.slice() };
                    saveTripLocally(payloadWithTrace);
                    try {
                      dispatch(
                        addTrip({
                          id: payloadWithTrace.tripId,
                          driverId: payloadWithTrace.driverId,
                          passengerId: payloadWithTrace.passengerId,
                          origin: { lat: payloadWithTrace.origin.coords.lat, lng: payloadWithTrace.origin.coords.lng, address: payloadWithTrace.origin.address },
                          destination: { lat: payloadWithTrace.destination.coords.lat, lng: payloadWithTrace.destination.coords.lng, address: payloadWithTrace.destination.address },
                          status: payloadWithTrace.status,
                          price: payloadWithTrace.price,
                          startedAt: payloadWithTrace.startedAt,
                          finishedAt: payloadWithTrace.finishedAt,
                          raw: payloadWithTrace.raw,
                          driverTrace: payloadWithTrace.driverTrace,
                        })
                      );
                    } catch (e) {}
                    driverTraceRef.current = [];
                    window.dispatchEvent(new CustomEvent('toriGO:tripFinished'));
                  }
                }
                // clear route after a short delay
                setTimeout(() => setRoutePath(null), 1200);
                stopMovement();
                return;
              }

              setDriverLocation(() => {
                const newPos = next;
                try { const p = { lat: newPos.lat, lng: newPos.lng, ts: new Date().toISOString() }; driverTraceRef.current.push(p); traceBufferRef.current.push(p); } catch (e) {}
                // update progress
                const progress = Math.min(1, idx / Math.max(1, path.length - 1));
                setRouteProgress(progress);
                return newPos;
              });

              idx += 1;
              const delay = Math.max(60, Math.round(700 / Math.max(0.1, simSpeed)));
              movementRef.current = window.setTimeout(step, delay) as unknown as number;
            };
            // start
            step();
          } catch (e) {
            fallbackLinearMovement();
          }
        });
      } catch (e) {
        // directions not available or failed -> fallback
        fallbackLinearMovement();
      }
    };

    const fallbackLinearMovement = () => {
      // prepare a simple 2-point route for progress calculation
      const start = driverLocation || { lat: target.lat, lng: target.lng };
      movementStartRef.current = { start, totalDist: haversineMeters(start, target) };
      setRoutePath([start, target]);
      setRouteProgress(0);

      // recursive movement step so simSpeed changes take effect immediately
      const stepFallback = () => {
        setDriverLocation((prev) => {
          if (!prev) {
            // schedule next just in case
            const delay0 = Math.max(60, Math.round(600 / Math.max(0.1, simSpeed)));
            movementRef.current = window.setTimeout(stepFallback, delay0) as unknown as number;
            return target;
          }
          const baseStep = 0.00045 * Math.max(0.4, simSpeed);
          const dlat = target.lat - prev.lat;
          const dlng = target.lng - prev.lng;
          const dist = Math.sqrt(dlat * dlat + dlng * dlng);
          if (dist < 0.0005) {
            // arrived
            if (routePhase === 'toPickup') {
              try { window.dispatchEvent(new CustomEvent('toriGO:arrived')); } catch {}
              stopMovement();
              setRouteProgress(1);
              setTimeout(() => setRoutePath(null), 800);
              return target;
            }
            if (routePhase === 'toDrop') {
              stopMovement();
              if (activeRide) {
                const payload = buildFinishPayload(activeRide as any, target, driverLocation);
                const payloadWithTrace = { ...payload, driverTrace: driverTraceRef.current.slice() };
                saveTripLocally(payloadWithTrace);
                try {
                  dispatch(
                    addTrip({
                      id: payloadWithTrace.tripId,
                      driverId: payloadWithTrace.driverId,
                      passengerId: payloadWithTrace.passengerId,
                      origin: { lat: payloadWithTrace.origin.coords.lat, lng: payloadWithTrace.origin.coords.lng, address: payloadWithTrace.origin.address },
                      destination: { lat: payloadWithTrace.destination.coords.lat, lng: payloadWithTrace.destination.coords.lng, address: payloadWithTrace.destination.address },
                      status: payloadWithTrace.status,
                      price: payloadWithTrace.price,
                      startedAt: payloadWithTrace.startedAt,
                      finishedAt: payloadWithTrace.finishedAt,
                      raw: payloadWithTrace.raw,
                      driverTrace: payloadWithTrace.driverTrace,
                    })
                  );
                } catch (e) {}
                driverTraceRef.current = [];
                window.dispatchEvent(new CustomEvent('toriGO:tripFinished'));
              }
              setRouteProgress(1);
              setTimeout(() => setRoutePath(null), 800);
              return target;
            }
          }
          const nx = prev.lat + (dlat / dist) * baseStep;
          const ny = prev.lng + (dlng / dist) * baseStep;
          const newPos = { lat: nx, lng: ny };
          try { const p = { lat: newPos.lat, lng: newPos.lng, ts: new Date().toISOString() }; driverTraceRef.current.push(p); traceBufferRef.current.push(p); } catch (e) {}
          // update progress using haversine relative to start
          try {
            const ms = movementStartRef.current;
            if (ms) {
              const done = haversineMeters(ms.start, newPos);
              const prog = Math.min(1, ms.totalDist > 0 ? done / ms.totalDist : 1);
              setRouteProgress(prog);
            }
          } catch (e) {}
          // schedule next step reading current simSpeed
          const delay = Math.max(60, Math.round(600 / Math.max(0.1, simSpeed)));
          movementRef.current = window.setTimeout(stepFallback, delay) as unknown as number;
          return newPos;
        });
      };

      // start fallback movement
      stepFallback();
    };

    // start route animation
    tryRouteAndAnimate();
  };

  // Build JSON payloads for finished and cancelled trips
  const buildFinishPayload = (
    ride: any,
    locationAtFinish: { lat: number; lng: number } | null,
    lastDriverLocation: { lat: number; lng: number } | null
  ) => {
    const now = new Date().toISOString();
    const payload = {
      tripId: `trip_${ride.id}_${Date.now()}`,
      driverId: 'driver_test_1',
      passengerId: ride.passenger?.id,
      origin: {
        address: ride.pickup,
        coords: ride.pickupCoords,
      },
      destination: {
        address: ride.drop,
        coords: ride.dropCoords,
      },
      price: ride.price,
      startedAt: now, // for simulation use now
      finishedAt: now,
      status: 'FINISHED',
      driverTraceEnd: locationAtFinish || lastDriverLocation,
      raw: ride,
    } as const;
    return payload;
  };

  const buildCancelPayload = (ride: any, lastDriverLocation: { lat: number; lng: number } | null) => {
    const now = new Date().toISOString();
    const payload = {
      tripId: `trip_${ride.id}_${Date.now()}`,
      driverId: 'driver_test_1',
      passengerId: ride.passenger?.id,
      origin: { address: ride.pickup, coords: ride.pickupCoords },
      destination: { address: ride.drop, coords: ride.dropCoords },
      price: ride.price,
      canceledAt: now,
      status: 'CANCELED',
      cancelReason: 'driver_cancelled',
      driverLastLocation: lastDriverLocation,
      raw: ride,
    } as const;
    return payload;
  };

  const saveTripLocally = async (payload: any) => {
    // Preferential path: use TripService (Axios) with JWT; fallback to localStorage
    console.log('Attempting to send trip payload via TripService:', payload);
    const fallbackToLocal = async () => {
      try {
        const key = 'toriGO_trips_v1';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(payload);
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (e) {
        console.error('Failed to persist trip locally', e);
      }
      // best-effort redux dispatch
      try {
        dispatch(
          addTrip({
            id: payload.tripId,
            driverId: payload.driverId,
            passengerId: payload.passengerId,
            origin: { lat: payload.origin.coords.lat, lng: payload.origin.coords.lng, address: payload.origin.address },
            destination: { lat: payload.destination.coords.lat, lng: payload.destination.coords.lng, address: payload.destination.address },
            status: payload.status,
            price: payload.price,
            startedAt: payload.startedAt,
            finishedAt: payload.finishedAt,
            canceledAt: payload.canceledAt,
            cancelReason: payload.cancelReason,
            raw: payload.raw,
            driverTrace: payload.driverTrace,
          })
        );
      } catch (e) {
        console.error('Failed to dispatch trip to redux', e);
      }
    };

    try {
      const res = await TripService.upsertTrip(payload);
      if (!res || !res.data) {
        console.warn('TripService returned empty response, fallback to local storage');
        await fallbackToLocal();
        return;
      }
      // success -> add to redux using server-provided id when available
      const serverId = res.data.id || payload.tripId;
      try {
        dispatch(
          addTrip({
            id: serverId,
            driverId: payload.driverId,
            passengerId: payload.passengerId,
            origin: { lat: payload.origin.coords.lat, lng: payload.origin.coords.lng, address: payload.origin.address },
            destination: { lat: payload.destination.coords.lat, lng: payload.destination.coords.lng, address: payload.destination.address },
            status: payload.status,
            price: payload.price,
            startedAt: payload.startedAt,
            finishedAt: payload.finishedAt,
            canceledAt: payload.canceledAt,
            cancelReason: payload.cancelReason,
            raw: payload.raw,
            driverTrace: payload.driverTrace,
          })
        );
      } catch (e) {
        console.error('Failed to dispatch server-saved trip to redux', e);
      }
    } catch (e) {
      console.warn('Error sending trip to API via TripService, falling back to local storage', e);
      await fallbackToLocal();
    }
  };

  const handleExpire = useCallback(
    (id: string) => {
      // Note: Redux will automatically update pending requests on next poll
      console.log('[DEBUG] 🗑️  Request expired:', id);
    },
    [pendingRequests]
  );

  // Event listeners for window events (trip lifecycle)
  useEffect(() => {
    const onFinished = () => {
      // stop any movement and clear active ride when trip finishes
      try { stopMovement(); } catch (e) {}
      setActiveRide(null);
      setRequestPanelOpen(true);
    };
    const onOpenRequests = () => setRequestPanelOpen(true);
    window.addEventListener("toriGO:tripFinished", onFinished as EventListener);
    window.addEventListener("toriGO:openRequests", onOpenRequests as EventListener);

    const onTripStarted = () => {
      // when RideDetails triggers start, begin moving from pickup -> destination
      if (!activeRide) return;
      setRoutePhase('toDrop');
      startMovingTowards((activeRide as any).dropCoords);
    };

    const onArrivedEvent = () => {
        // when arrived to pickup, set state to waiting and stop movement; UI will allow confirmation
        try { stopMovement(); } catch (e) {}
        setHasArrived(true);
        setRoutePhase('idle');
        console.log('Simulated: driver arrived to pickup (paused)');
    };

    const onCanceled = () => {
      // stop movement and clear active ride on cancel
      try { stopMovement(); } catch (e) {}
      setActiveRide(null);
      setRequestPanelOpen(true);
      console.log('Trip canceled - stopping movement');
    };

    window.addEventListener('toriGO:tripStarted', onTripStarted as EventListener);
    window.addEventListener('toriGO:arrived', onArrivedEvent as EventListener);
    window.addEventListener('toriGO:tripCanceled', onCanceled as EventListener);
    
    return () => {
      window.removeEventListener("toriGO:tripFinished", onFinished as EventListener);
      window.removeEventListener("toriGO:openRequests", onOpenRequests as EventListener);
      window.removeEventListener('toriGO:tripStarted', onTripStarted as EventListener);
      window.removeEventListener('toriGO:arrived', onArrivedEvent as EventListener);
      window.removeEventListener('toriGO:tripCanceled', onCanceled as EventListener);
    };
  }, [activeRide]);

  // Helper: build Google Maps directions URL
  const buildGoogleMapsDirections = (origin: { lat: number; lng: number } | null | undefined, destination: { lat: number; lng: number } | null | undefined) => {
    if (!origin || !destination) return '#';
    const o = `${origin.lat},${origin.lng}`;
    const d = `${destination.lat},${destination.lng}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}&travelmode=driving`;
  };

  // Confirm that driver has arrived (simulate verification code) and then start trip to destination
  const confirmArrivalAndStart = async () => {
    if (!activeRide) return;
    const tripId = (activeRide as any).id;
    try {
      // mark arrived on server (best-effort)
      try { await TripService.markArrived(tripId, { lat: driverLocation?.lat, lng: driverLocation?.lng }); } catch (e) { console.warn('markArrived failed', e); }
      // simulated verification: prompt for code but accept any
      window.prompt('Ingrese código de verificación (simulado):', '0000');
      // in real flow validate `code`; here proceed anyway
      try { await TripService.markStarted(tripId); } catch (e) { console.warn('markStarted failed', e); }
      // clear arrived flag and set phase to toDrop
      setHasArrived(false);
      setRoutePhase('toDrop');
      // ensure we have coords for destination
      const dest = (activeRide as any).dropCoords || (activeRide as any).destination || (activeRide as any).destination?.coords;
      if (dest) startMovingTowards(dest);
      // notify other listeners
      try { window.dispatchEvent(new CustomEvent('toriGO:tripStarted')); } catch (e) {}
    } catch (e) {
      console.error('Failed to confirm arrival/start trip', e);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-red-100 to-white" />

      <div className="relative z-10 flex flex-col md:flex-row h-full max-h-screen overflow-y-auto">
        {loading && <LoadingOverlay message="Cargando..." />}

        <SlidingSidebar open={requestPanelOpen} onClose={() => setRequestPanelOpen(false)} title="Solicitudes">
          {(() => { if (pendingRequests.length > 0) console.log('[DEBUG] 🎯 RequestList renderizado con', pendingRequests.length, 'viajes'); return null; })()}
          <RequestList requests={pendingRequests} onAccept={handleAcceptRide} onStopSearch={handleStopSearch} />
        </SlidingSidebar>

        {activeRide && (
          <aside className="hidden md:flex md:flex-col md:w-[360px] bg-white border-l z-20">
            <div className="p-4 border-b flex justify-end items-center">
              <button onClick={() => setActiveRide(null)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold" aria-label="Cerrar detalles">
                ≡
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <RideDetails ride={activeRide} onCancel={handleCancelRide} onArrived={handleConfirmArrival} onPaid={handleConfirmPayment} />
            </div>
          </aside>
        )}

        <div
          className={`flex-1 relative flex flex-col items-center justify-center transition-all duration-300 ${activeRide && !isMobile ? "md:!mr-[360px]" : ""}`}
          style={{
            paddingBottom: activeRide && isMobile ? bottomH : undefined,
            transition: "padding-bottom 200ms ease",
          }}
        >
          <div className="relative w-full h-full flex items-stretch">
                  {/* Availability badge / toggle */}
                  <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full text-sm font-medium border bg-white/90">
                      {availability === 'available' ? 'Disponible' : availability === 'busy' ? 'Ocupado' : 'Desconectado'}
                    </div>
                    {availability !== 'available' ? (
                      <button onClick={handleGoOnline} className="px-3 py-1 rounded-md bg-green-600 text-white text-sm">Conectar</button>
                    ) : (
                      <button onClick={handleStopSearch} className="px-3 py-1 rounded-md bg-gray-800 text-white text-sm">Desconectar</button>
                    )}
                    {/* Force-load trip by external id for testing */}
                    <div className="flex items-center gap-2 ml-2">
                      <input value={forceId} onChange={(e) => setForceId(e.target.value)} placeholder="external_id" className="text-xs px-2 py-1 rounded border" />
                      <button onClick={handleForceLoad} className="px-2 py-1 rounded bg-blue-600 text-white text-xs">Cargar</button>
                    </div>
                    {/* Directions / arrival helpers */}
                    {activeRide && driverLocation && routePhase === 'toPickup' && (() => {
                      const pickup = (activeRide as any).pickupCoords || (activeRide as any).origin || (activeRide as any).origin?.coords;
                      const mapsUrl = buildGoogleMapsDirections(driverLocation, pickup);
                      return (
                        <a className="ml-2 px-2 py-1 rounded bg-yellow-500 text-white text-xs" href={mapsUrl} target="_blank" rel="noreferrer">Abrir en Google Maps (a pasajero)</a>
                      );
                    })()}
                    {hasArrived && activeRide && driverLocation && (() => {
                      const dest = (activeRide as any).dropCoords || (activeRide as any).destination || (activeRide as any).destination?.coords;
                      const mapsUrl2 = buildGoogleMapsDirections(driverLocation, dest);
                      return (
                        <div className="ml-2 flex items-center gap-2">
                          <button onClick={confirmArrivalAndStart} className="px-2 py-1 rounded bg-green-600 text-white text-xs">Confirmar recogida e iniciar</button>
                          <a className="px-2 py-1 rounded bg-yellow-500 text-white text-xs" href={mapsUrl2} target="_blank" rel="noreferrer">Ir en Google Maps (a destino)</a>
                        </div>
                      );
                    })()}
                  </div>
                  {/* Panic / quick cancel controls */}
                  {activeRide && routePhase === 'toDrop' && (
                    <div className="absolute top-20 right-4 z-50 flex flex-col gap-3">
                      <button onClick={handlePanic} className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition" title="Botón de pánico">
                        ⛑
                      </button>
                      <button onClick={handleCancelRide} className="bg-white text-red-600 p-2 rounded-md shadow hover:bg-gray-50 transition" title="Cancelar viaje">
                        Cancelar
                      </button>
                    </div>
                  )}
                  {activeRide && driverLocation ? (
                    <div className="flex-1 h-full">
                                <DriverMap
                                  origin={(activeRide as any).pickupCoords}
                                  destination={(activeRide as any).dropCoords}
                                  driverLocation={driverLocation}
                                  showRoute={routePhase !== 'idle'}
                                  showMarkers={true}
                                  // provide explicit route path and progress for polyline rendering
                                  routePath={routePath || undefined}
                                  routeProgress={routeProgress}
                                  showRouteProgress={true}
                                />
                    </div>
                  ) : (
                    // Show a default DriverMap centered on Lima Metropolitana so the map always
                    // occupies the content area instead of the placeholder text.
                    <div className="flex-1 h-full">
                        <DriverMap
                          origin={{ lat: -12.0460, lng: -77.0425 }}
                          destination={{ lat: -12.0500, lng: -77.0300 }}
                          driverLocation={driverLocation || { lat: -12.0460, lng: -77.0425 }}
                          showRoute={false}
                          showMarkers={false}
                        />
                    </div>
                  )}

                  {/* Distance badge while en route */}
                  {activeRide && driverLocation && routePhase !== 'idle' && (() => {
                    const target = routePhase === 'toPickup' ? (activeRide as any).pickupCoords : (activeRide as any).dropCoords;
                    const meters = haversineMeters(driverLocation, target);
                    const label = meters >= 1000 ? `${(meters/1000).toFixed(1)} km` : `${Math.round(meters)} m`;
                    return (
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border">
                        {routePhase === 'toPickup' ? 'Distancia a pasajero: ' : 'Distancia a destino: '}<span className="text-red-600 ml-1">{label}</span>
                      </div>
                    );
                  })()}

                  {/* Progress bar for route */}
                  {activeRide && routePhase !== 'idle' && (
                    <div className="absolute top-16 left-0 right-0 z-50 flex items-center justify-center pointer-events-none">
                      <div className="w-11/12 max-w-2xl bg-white/70 p-1 rounded-full shadow-md pointer-events-auto">
                        <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 bg-green-500" style={{ width: `${Math.round((routeProgress || 0) * 100)}%` }} />
                        </div>
                        <div className="text-xs text-gray-700 text-center mt-1">Progreso ruta: {Math.round((routeProgress || 0) * 100)}%</div>
                      </div>
                    </div>
                  )}

                  {/* Simulation speed control */}
                  {activeRide && (
                    <div className="absolute top-4 left-20 z-50 flex items-center gap-2 bg-white/90 p-2 rounded-md shadow">
                      <label className="text-xs text-gray-600 mr-2">Velocidad:</label>
                      <input type="range" min="0.5" max="3" step="0.1" value={simSpeed} onChange={(e) => setSimSpeed(Number(e.target.value))} />
                      <div className="text-xs text-gray-700 ml-2">x{simSpeed.toFixed(1)}</div>
                    </div>
                  )}

            {isOnline && !activeRide && !requestPanelOpen && (
              <button onClick={() => setRequestPanelOpen(true)} className="absolute top-4 left-4 z-50 bg-white text-gray-700 p-2 rounded-md shadow-md hover:bg-gray-100 transition">
                <span className="text-2xl font-bold">≡</span>
              </button>
            )}

            {activeRide && isMobile && (
              <button
                onClick={() => {
                  setBottomH((h) => (h < maxH ? maxH : midH));
                }}
                className="absolute top-4 left-4 z-50 md:hidden bg-white text-gray-700 p-2 rounded-md shadow-md hover:bg-gray-100 transition"
                aria-hidden
              >
                <span className="text-2xl font-bold">≡</span>
              </button>
            )}
          </div>
        </div>

        {isOnline && !activeRide && (
          <RideNotificationQueue requests={pendingRequests} onAccept={handleAcceptRide} onExpire={handleExpire} />
        )}

        {!isOnline && !activeRide && !loading && (
          <div className="flex-1 relative flex items-center justify-center p-6 bg-gray-50 overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${fondoMototaxi}")` }}>
              <div className="absolute inset-0 bg-black opacity-30" />
            </div>

            <div className="relative z-10 bg-white/50 backdrop-blur-sm rounded-3xl shadow-xl shadow-gray-200/50 p-8 w-full max-w-sm text-center space-y-5">
              <h2 className="text-2xl font-bold text-gray-900 tracking-wide">¿Listo para empezar?</h2>
              <p className="text-sm text-gray-700 max-w-xs mx-auto">Pulsa el botón para conectarte y recibir solicitudes de mototaxi cercanas.</p>
              <button onClick={handleGoOnline} className="w-full bg-red-600 text-white py-4 rounded-full font-extrabold text-lg uppercase tracking-wider shadow-lg hover:bg-red-700 transition-all duration-300">
                ¡Buscar Viajes!
              </button>
            </div>
          </div>
        )}
      </div>

      {activeRide && isMobile && (
        <div className="fixed left-0 right-0 bottom-0 z-50 md:hidden" aria-hidden={false}>
          <div
            className="mx-auto w-full bg-white rounded-t-2xl shadow-xl overflow-hidden transition-all duration-200"
            style={{
              height: bottomH,
              maxHeight: maxH,
              touchAction: "none",
            }}
          >
            {/* Drag handle */}
            <div className="w-full flex items-center justify-center p-2 cursor-grab" onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            <div className="overflow-y-auto" style={{ height: bottomH - 48 }}>
              <div className="p-4">
                <RideDetails ride={activeRide} onCancel={handleCancelRide} onArrived={handleConfirmArrival} onPaid={handleConfirmPayment} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverPage;