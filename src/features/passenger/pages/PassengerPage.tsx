// features/passenger/PassengerPage.tsx
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { requestRide, confirmRide, finishLoading, cancelRide, createTrip } from "../passengerSlice";
import PassengerRequestPanel from "../components/PassengerRequestPanel";
import PassengerMap from '../../../components/PassengerMap';
import RideStatusPanel from "../components/RideStatusPanel";
import LoadingOverlay from "../components/LoadingOverlay";
import type { RideRequest } from "../../../types/trip";
import { useState, useEffect } from "react";
import ConfirmTripModal from "../components/ConfirmTripModal";
import TripService from '../../../services/TripService';

export const PassengerPage = () => {
  const dispatch = useAppDispatch();
  const { ride, loading, accepted } = useAppSelector((state) => state.passenger);

  // local modal/confirm flow
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [serverTripId, setServerTripId] = useState<string | null>(null);

  const handleRequestRide = async (rideData: RideRequest) => {
    const external_id = `ext_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const payload = {
      external_id,
      pickup: rideData.pickup,
      destination: rideData.destination,
      type: rideData.type,
      payment: rideData.payment,
      pickupCoords: rideData.pickupCoords,
      destinationCoords: rideData.destinationCoords,
      price: rideData.price,
    };
    // store for confirmation
    setPendingPayload({ ...payload, external_id });
    setConfirmOpen(true);
  };

  // when user confirms in modal, actually send the trip
  const confirmAndSend = async () => {
    if (!pendingPayload) return;
    setConfirmOpen(false);

    // optimistic UI
    dispatch(requestRide({ pickup: pendingPayload.pickup, destination: pendingPayload.destination, type: pendingPayload.type, payment: pendingPayload.payment, pickupCoords: pendingPayload.pickupCoords, destinationCoords: pendingPayload.destinationCoords, price: pendingPayload.price, external_id: pendingPayload.external_id } as RideRequest));

    // build final body matching passenger slice expectations
    const body = {
      external_id: pendingPayload.external_id,
      origin_address: pendingPayload.pickup,
      origin_lat: pendingPayload.pickupCoords?.lat,
      origin_lng: pendingPayload.pickupCoords?.lng,
      destination_address: pendingPayload.destination,
      destination_lat: pendingPayload.destinationCoords?.lat,
      destination_lng: pendingPayload.destinationCoords?.lng,
      payment_method: pendingPayload.payment,
      price_snapshot: pendingPayload.price ? { estimated_fare: pendingPayload.price, currency: 'PEN' } : undefined,
    };

    try {
      const action = await dispatch(createTrip(body as any));
      // check for server response id
      const tripId = (action as any)?.payload?.server?.id || (action as any)?.payload?.server?.trip_id || null;
      if (tripId) setServerTripId(tripId);

      // show loading state
      // start polling to update trip status if we have id
      if (tripId) {
        dispatch(finishLoading());
        // keep ride in state; polling will update backend state elsewhere
      } else {
        // fallback: still show pending
        dispatch(finishLoading());
      }
    } catch (e) {
      console.error('Failed to create trip', e);
      dispatch(cancelRide());
      alert('No se pudo crear el viaje. Intenta de nuevo.');
    } finally {
      setPendingPayload(null);
    }
  };

    // Map selection state
    const [pickupCoords, setPickupCoords] = useState<{lat:number; lng:number}>({ lat: -12.0460, lng: -77.0425 });
    const [destCoords, setDestCoords] = useState<{lat:number; lng:number}>({ lat: -12.0500, lng: -77.0300 });
    const [selecting, setSelecting] = useState<'pickup'|'destination'|null>(null);

    const handleMapClick = (loc: {lat:number; lng:number}) => {
      if (selecting === 'pickup') {
        setPickupCoords(loc);
        setSelecting(null);
      } else if (selecting === 'destination') {
        setDestCoords(loc);
        setSelecting(null);
      }
    };

  const handleCancelRide = () => {
    // if a server trip exists, attempt to cancel on server
    if (serverTripId) {
      (async () => {
        try {
          await TripService.markCanceled(serverTripId);
        } catch (e) { console.warn('Failed to cancel on server', e); }
        dispatch(cancelRide());
        setServerTripId(null);
      })();
    } else {
      dispatch(cancelRide());
    }
  };

  // Polling: if we have a serverTripId and the ride is pending, poll for updates
  useEffect(() => {
    if (!serverTripId) return;
    let cancelled = false;
    const iv = setInterval(async () => {
      try {
        const res = await TripService.getTrip(serverTripId);
        if (cancelled) return;
        const data = res?.data;
        if (data) {
          // If status changed to accepted or other, dispatch confirmRide
          if (data.status && data.status !== 'pending') {
            dispatch(confirmRide());
          }
        }
      } catch (e) {
        // ignore polling errors
      }
    }, 5000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [serverTripId, dispatch]);

  // Optional WebSocket: prefer realtime updates when VITE_WS_URL provided
  useEffect(() => {
    const wsUrl = (import.meta.env as any).VITE_WS_URL || localStorage.getItem('wsUrl');
    if (!wsUrl || !serverTripId) return;
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
    } catch (e) { return; }
    const onMsg = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data);
        // expected message shape: { type: 'trip:update', tripId: '...', status: 'accepted'|'canceled'|... , payload: {...} }
        if (!msg || !msg.tripId) return;
        if (msg.tripId !== serverTripId) return;
        const status = msg.status;
        if (!status) return;
        if (status === 'accepted') {
          dispatch(confirmRide());
        } else if (status === 'canceled') {
          dispatch(cancelRide());
        } else if (status === 'started') {
          dispatch(confirmRide());
        }
      } catch (e) {}
    };
    ws.addEventListener('message', onMsg);
    ws.addEventListener('open', () => {
      try { ws?.send(JSON.stringify({ action: 'subscribe', tripId: serverTripId })); } catch (e) {}
    });
    ws.addEventListener('error', () => { /* ignore */ });
    return () => {
      try { if (ws) { ws.removeEventListener('message', onMsg); ws.close(); } } catch (e) {}
    };
  }, [serverTripId, dispatch]);

  return (
    <div className="relative w-full h-screen flex overflow-hidden">
      <ConfirmTripModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAndSend}
        origin={pendingPayload?.pickup || ''}
        destination={pendingPayload?.destination || ''}
        price={pendingPayload?.price}
      />
      {loading && <LoadingOverlay message="Buscando mototaxi..." />}
      {ride ? (
        <>
          <RideStatusPanel ride={ride} accepted={accepted} onCancel={handleCancelRide} />
          <div className="flex-1 h-full">
            <PassengerMap
              origin={pickupCoords}
              destination={destCoords}
              onMapClick={handleMapClick}
              showRoute={false}
            />
          </div>
        </>
      ) : (
        <>
          <div className="w-[360px] flex-none">
            <PassengerRequestPanel onSubmit={handleRequestRide} onPickOnMap={(t) => setSelecting(t)} onCoordsChange={(type, coords) => {
              if (type === 'pickup') setPickupCoords(coords);
              else setDestCoords(coords);
            }} selecting={selecting} pickupCoords={pickupCoords} destinationCoords={destCoords} />
          </div>
          <div className="flex-1 h-full">
            <PassengerMap
              origin={pickupCoords}
              destination={destCoords}
              onMapClick={handleMapClick}
            />
          </div>
        </>
      )}
    </div>
  );
};