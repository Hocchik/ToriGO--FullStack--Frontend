import React, { useCallback, useEffect, useRef, useState } from "react";
import type { RideRequest } from "./Models";
import RequestList from "../components/RequestList";
import RideDetails from "../components/RideDetails";
import LoadingOverlay from "../components/LoadingOverlay";
import RideNotificationQueue from "../components/RideNotificationQueue";
import SlidingSidebar from "../components/SlidingSideBar";
import fondoMototaxi from "../../../assets/DriverPage.png";

const dummyRequests: RideRequest[] = [
  {
    id: "1",
    pickup: "Main Street",
    drop: "Park Avenue",
    price: 12.5,
    passenger: { id: "p1", name: "Carlos López", rating: 4.8 },
  },
  {
    id: "2",
    pickup: "Airport",
    drop: "Downtown",
    price: 20,
    passenger: { id: "p2", name: "María Torres", rating: 4.9 },
  },
];

export const DriverPage = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
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
  }, []);

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
      setActiveRide(ride);
      setPendingRequests([]);
      setExpiredRequests([]);
      setRequestPanelOpen(false);
    }, 1200);
  };

  const handleCancelRide = () => {
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
    return () => {
      window.removeEventListener("toriGO:tripFinished", onFinished as EventListener);
      window.removeEventListener("toriGO:openRequests", onOpenRequests as EventListener);
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
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="text-gray-400 text-sm">🗺 Mapa en desarrollo</div>

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