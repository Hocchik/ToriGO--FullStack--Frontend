import { useState } from "react";

interface RatingModalProps {
  passengerName?: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

const RatingModal = ({ passengerName, onClose, onSubmit }: RatingModalProps) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const handleSubmit = () => {
    onSubmit(rating, comment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative z-10 w-[92%] max-w-md bg-white rounded-lg shadow-2xl p-6">
        <h3 className="text-xl font-bold mb-4 text-center">¿Cómo fue el viaje con {passengerName ?? "el pasajero"}?</h3>

        <div className="flex justify-center items-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = hoverRating ? n <= hoverRating : n <= rating;
            return (
              <button
                key={n}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(n)}
                className="text-4xl transition-colors"
                aria-label={`Puntuar ${n} estrellas`}
                type="button"
              >
                <span className={filled ? "text-amber-400" : "text-gray-300"}>★</span>
              </button>
            );
          })}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escribe un comentario opcional para el pasajero..."
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-sm focus:ring-2 focus:ring-green-500"
          rows={3}
        />

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg font-medium hover:bg-gray-200">Omitir</button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
          >
            Enviar valoración
          </button>
        </div>
      </div>
    </div>
  );
};

interface FinishedPanelProps {
  passengerName?: string;
  fare?: number;
  onClose?: () => void;
  onSubmitRating?: (rating: number, comment: string) => void;
}

export default function FinishedPanel({ passengerName, fare, onClose, onSubmitRating }: FinishedPanelProps) {
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);

  const fareValue = typeof fare === "number" ? fare : 0;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.dispatchEvent(new CustomEvent("toriGO:openRequests"));
    }
  };

  const handleSubmitRating = (rating: number, comment: string) => {
    if (onSubmitRating) {
      try {
        onSubmitRating(rating, comment);
      } catch {}
    }
    handleClose();
  };

  return (
    <div className="bg-gray-100 p-4 rounded-xl border border-gray-300 shadow-md space-y-3">
      <p className="text-sm text-gray-800 font-bold flex items-center">
        <span className="text-lg mr-2">💰</span>
        <span className="font-semibold">Pago recibido.</span> ¡Gracias por el viaje!
      </p>

      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Tarifa final cobrada</p>
          <div className="text-3xl font-extrabold text-green-600">${fareValue.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <button onClick={() => setShowRatingModal(true)} className="text-sm bg-green-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-600">
            Valorar Pasajero
          </button>
        </div>
      </div>

      <button
        onClick={handleClose}
        className="w-full bg-white border border-gray-400 text-gray-700 px-4 py-3 rounded-xl text-base font-bold shadow-sm hover:bg-gray-200 transition-colors"
      >
        Cerrar y ver siguientes solicitudes
      </button>

      {showRatingModal && (
        <RatingModal
          passengerName={passengerName}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleSubmitRating}
        />
      )}
    </div>
  );
}