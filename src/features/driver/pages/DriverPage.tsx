import React, { useCallback, useEffect, useRef, useState } from "react";
import type { RideRequest } from "./Models";
import { TripMap } from "../../../components/mapboxgl";
import { useDispatch } from 'react-redux';
import { addTrip } from '../driverSlice';
import RequestList from "../components/RequestList";
import RideDetails from "../components/RideDetails";
import LoadingOverlay from "../components/LoadingOverlay";
import RideNotificationQueue from "../components/RideNotificationQueue";
import SlidingSidebar from "../components/SlidingSideBar";
import fondoMototaxi from "../../../assets/DriverPage.png";

// Dummy ride requests including coordinates for simulation (lng, lat)
const dummyRequests: any[] = [
  {
    id: "1",
    pickup: "Calle Principal",
    drop: "Avenida Parque",
    price: 12.5,
    passenger: { id: "p1", name: "Carlos López", rating: 4.8 },
    pickupCoords: { lng: -77.0425, lat: -12.0460 },
    dropCoords: { lng: -77.0300, lat: -12.0500 },
  },
  {
    id: "2",
    pickup: "Aeropuerto",
    drop: "Centro",
    price: 20,
    passenger: { id: "p2", name: "María Torres", rating: 4.9 },
    pickupCoords: { lng: -77.1167, lat: -12.0219 },
    dropCoords: { lng: -77.0300, lat: -12.0460 },
  },
];

export const DriverPage = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const movementRef = useRef<number | null>(null);
  const geoWatchRef = useRef<number | null>(null);
  const pendingLocRef = useRef<{ lat: number; lng: number } | null>(null);
  const pendingTimerRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const driverLocationRef = useRef<{ lat: number; lng: number } | null>(driverLocation);
  const driverTraceRef = useRef<Array<{ lat: number; lng: number; ts: string }>>([]);
  const dispatch = useDispatch();
  const [routePhase, setRoutePhase] = useState<'idle' | 'toPickup' | 'toDrop'>('idle');
  const [pendingRequests, setPendingRequests] = useState<RideRequest[]>([]);
  const [expiredRequests, setExpiredRequests] = useState<RideRequest[]>([]);
  const [requestPanelOpen, setRequestPanelOpen] = useState(false);

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
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsOnline(true);
      setPendingRequests(dummyRequests);
    }, 1500);
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
            try { driverTraceRef.current.push({ lat: coords.lat, lng: coords.lng, ts: new Date().toISOString() }); } catch (e) {}
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
              try { driverTraceRef.current.push({ lat: coords.lat, lng: coords.lng, ts: new Date().toISOString() }); } catch (e) {}
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
            try { driverTraceRef.current.push({ lat: raw.lat, lng: raw.lng, ts: new Date().toISOString() }); } catch (e) {}
            return;
          }

          const dist = haversineMeters(current, raw);
          if (dist <= SMALL_MOVE_M) {
            setDriverLocation(raw);
            try { driverTraceRef.current.push({ lat: raw.lat, lng: raw.lng, ts: new Date().toISOString() }); } catch (e) {}
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
                try { driverTraceRef.current.push({ lat: toApply.lat, lng: toApply.lng, ts: new Date().toISOString() }); } catch (e) {}
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
    setIsOnline(false);
    setPendingRequests([]);
    setExpiredRequests([]);
    setRequestPanelOpen(false);
  };

  const handleAcceptRide = (ride: RideRequest) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setActiveRide(ride as any);
      setPendingRequests([]);
      setExpiredRequests([]);
      setRequestPanelOpen(false);
  // init driver location near the city center only if we don't have a real device location
  const start = { lat: (ride as any).pickupCoords.lat + 0.0015, lng: (ride as any).pickupCoords.lng - 0.002 };
  if (!driverLocation) setDriverLocation(start);
      // start moving towards pickup
      setRoutePhase('toPickup');
      startMovingTowards((ride as any).pickupCoords);
    }, 1200);
  };

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
      window.clearInterval(movementRef.current);
      movementRef.current = null;
    }
    setRoutePhase('idle');
  };

  const startMovingTowards = (target: { lat: number; lng: number }) => {
    stopMovement();
    movementRef.current = window.setInterval(() => {
      setDriverLocation((prev) => {
        if (!prev) return target;
        // variable step to simulate different speeds (randomized slightly)
        const baseStep = 0.0006;
        const variability = 0.6 + Math.random() * 0.8; // 0.6 - 1.4
        const step = baseStep * variability;
        const dlat = target.lat - prev.lat;
        const dlng = target.lng - prev.lng;
        const dist = Math.sqrt(dlat * dlat + dlng * dlng);
        if (dist < 0.0005) {
          // reached
          // advance phase
          if (routePhase === 'toPickup') {
            // notify RideDetails that arrived
            try { window.dispatchEvent(new CustomEvent('toriGO:arrived')); } catch {}
            stopMovement();
            return target;
          }
          if (routePhase === 'toDrop') {
            // reached destination -> finish trip
            stopMovement();
            // finalize trip payload
            if (activeRide) {
              const payload = buildFinishPayload(activeRide as any, target, driverLocation);
              // attach the recorded driver trace without mutating original payload
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
              // clear trace after saving
              driverTraceRef.current = [];
              window.dispatchEvent(new CustomEvent('toriGO:tripFinished'));
            }
            return target;
          }
        }
        const nx = prev.lat + (dlat / dist) * step;
        const ny = prev.lng + (dlng / dist) * step;
        const newPos = { lat: nx, lng: ny };
        // record trace point
        try {
          driverTraceRef.current.push({ lat: newPos.lat, lng: newPos.lng, ts: new Date().toISOString() });
        } catch (e) {}
        return newPos;
      });
    }, 800);
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

  const saveTripLocally = (payload: any) => {
    // Try sending to backend first; if it fails, persist locally as fallback
    console.log('Attempting to send trip payload to API:', payload);
    const apiBase = (import.meta.env.VITE_API_URL as string) || '';
    const url = apiBase ? `${apiBase.replace(/\/$/, '')}/trips` : '';

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

    if (!url) {
      // no API configured -> fallback immediately
      void fallbackToLocal();
      return;
    }

    // send to API
    (async () => {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          console.warn('Trip API responded with non-OK, falling back to local storage', res.status);
          await fallbackToLocal();
          return;
        }
        const data = await res.json().catch(() => null);
        console.log('Trip saved to API (simulated):', data ?? 'no-json');
        // Optionally persist to redux with server response id
        try {
          const serverId = (data && data.id) || payload.tripId;
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
        console.warn('Error sending trip to API, falling back to local storage', e);
        await fallbackToLocal();
      }
    })();
  };

  const handleExpire = useCallback(
    (id: string) => {
      const expired = pendingRequests.find((r) => r.id === id);
      if (expired) setExpiredRequests((prev) => [...prev, expired]);
      setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    },
    [pendingRequests]
  );

  // Listen for events from RideDetails (trip finished -> open requests)
  useEffect(() => {
    const onFinished = () => {
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
      // when arrived to pickup, set state to waiting; waiting panel will call startTrip
      // we'll just log for now
      console.log('Simulated: driver arrived to pickup');
    };

    window.addEventListener('toriGO:tripStarted', onTripStarted as EventListener);
    window.addEventListener('toriGO:arrived', onArrivedEvent as EventListener);
    return () => {
      window.removeEventListener("toriGO:tripFinished", onFinished as EventListener);
      window.removeEventListener("toriGO:openRequests", onOpenRequests as EventListener);
      window.removeEventListener('toriGO:tripStarted', onTripStarted as EventListener);
      window.removeEventListener('toriGO:arrived', onArrivedEvent as EventListener);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-red-100 to-white" />

      <div className="relative z-10 flex flex-col md:flex-row h-full max-h-screen overflow-y-auto">
        {loading && <LoadingOverlay message="Cargando..." />}

        <SlidingSidebar open={requestPanelOpen} onClose={() => setRequestPanelOpen(false)} title="Solicitudes">
          <RequestList requests={expiredRequests} onAccept={handleAcceptRide} onStopSearch={handleStopSearch} />
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
                  {activeRide && driverLocation ? (
                    <div className="flex-1 h-full">
                      <TripMap
                        origin={(activeRide as any).pickupCoords}
                        destination={(activeRide as any).dropCoords}
                        driverLocation={driverLocation}
                        // while en route (toPickup or toDrop) use the current driverLocation as routeFrom
                        routeFrom={routePhase !== 'idle' ? driverLocation : undefined}
                        // routeTo will be pickup while going to pickup, and destination when going to drop
                        routeTo={routePhase === 'toPickup' ? (activeRide as any).pickupCoords : routePhase === 'toDrop' ? (activeRide as any).dropCoords : undefined}
                        followDriver={true}
                        showMarkers={true}
                        showDriverMarker={true}
                        // show origin/destination as soon as a ride is selected (activeRide)
                        // so the driver can preview pickup and drop locations. The
                        // actual street route is drawn while moving.
                        showOrigin={!!activeRide}
                        showDestination={!!activeRide}
                        // draw a realistic street route (Mapbox Directions) while moving
                        showRoute={routePhase !== 'idle'}
                      />
                    </div>
                  ) : (
                    // Show a default TripMap centered on Lima Metropolitana so the map always
                    // occupies the content area instead of the placeholder text.
                    <div className="flex-1 h-full">
                        <TripMap
                          origin={{ lat: -12.0460, lng: -77.0425 }}
                          destination={{ lat: -12.0500, lng: -77.0300 }}
                          driverLocation={driverLocation || { lat: -12.0460, lng: -77.0425 }}
                          showMarkers={false}
                          // when the request panel is open (searching) hide the driver marker so the map is empty
                          showDriverMarker={!requestPanelOpen && !!driverLocation}
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