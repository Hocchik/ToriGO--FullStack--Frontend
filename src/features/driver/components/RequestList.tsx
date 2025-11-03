import type { RideRequest } from "../pages/Models";

interface Props {
  requests: RideRequest[];
  onAccept: (ride: RideRequest) => void;
  onStopSearch: () => void;
}

export default function RequestList({ requests, onAccept, onStopSearch }: Props) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 text-lg md:text-xl font-bold text-red-700 flex justify-between items-center">
    
          {/* Contenedor del Título */}
          <span className="flex items-center text-2xl md:text-2xl font-extrabold text-red-700">    
              {/* Texto de Solicitudes más grande */}
              Solicitudes
          </span>
          
          {/* Botón de Parar Búsqueda (Moderno) */}
          <button
              onClick={onStopSearch}
              className="
                  text-xs md:text-sm 
                  bg-red-600 text-white 
                  px-4 py-2 
                  rounded-full
                  shadow-lg shadow-red-500/50 
                  hover:bg-red-700 
                  hover:shadow-xl 
                  focus:outline-none focus:ring-4 focus:ring-red-300/50 
                  transition ease-in-out duration-300
              "
          >
              Parar búsqueda
          </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50">
  {requests.length === 0 ? (
    <p className="text-gray-500 text-sm p-4 bg-white rounded-lg shadow">
      ✨ No hay solicitudes de viaje activas en este momento.
    </p>
  ) : (
    requests.map((req) => (
      <div
        key={req.id}
        className="
          p-0 bg-white border border-red-100 rounded-xl shadow-lg 
          hover:shadow-xl transition-all duration-300 
          overflow-hidden 
        "
      >
        {/* 1. SECCIÓN VISUAL (MAPA DE RUTA) */}
        <div className="h-28 bg-gray-200 flex items-center justify-center text-sm text-gray-500 relative">
          <span className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            
          </span>
          <span className="z-10 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
            Vista previa de la ruta
          </span>
        </div>

        {/* 2. SECCIÓN DE INFORMACIÓN Y ACCIÓN */}
        <div className="p-4 space-y-3">
          {/* Fila 1: Pasajero y Rating (Mayor Jerarquía) */}
          <div className="flex justify-between items-start pb-2 border-b border-gray-100">
            <h3 className="text-xl font-extrabold text-gray-900 leading-tight">
              {req.passenger.name}
            </h3>
            <span className="text-lg font-bold text-red-600 flex items-center bg-red-50 px-3 py-1 rounded-full border border-red-200 shadow-sm">
              <span className="text-sm mr-1">⭐</span> {req.passenger.rating.toFixed(1)}
            </span>
          </div>

          {/* Fila 2: Detalles del Viaje (Origen/Destino/Tarifa - Clave) */}
          {/* CAMBIADO: Se usa text-sm para la sección en general */}
          <div className="space-y-2 text-sm text-gray-700">
            {/* Origen */}
            <p className="flex justify-between items-center">
              {/* CAMBIADO: text-sm en la etiqueta */}
              <span className="font-bold text-gray-800 text-sm">📍 Origen:</span> 
              {/* CAMBIADO: text-sm en el valor */}
              <span className="font-medium text-gray-600 ml-2 truncate text-sm">{req.pickup}</span> 
            </p>

            {/* Destino */}
            <p className="flex justify-between items-center">
              {/* CAMBIADO: text-sm en la etiqueta */}
              <span className="font-bold text-gray-800 text-sm">🏁 Destino:</span>
              {/* CAMBIADO: text-sm en el valor */}
              <span className="font-medium text-gray-600 ml-2 truncate text-sm">{req.drop}</span>
            </p>

            {/* Tarifa (Color de Énfasis) */}
            <p className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
              {/* CAMBIADO: text-base en la etiqueta (para que no sea tan pequeña) */}
              <span className="font-extrabold text-red-700 text-base flex items-center">
                💲 Tarifa Estimada:
              </span>
              {/* CAMBIADO: text-lg en el valor (sigue siendo grande para destacar, pero menos) */}
              <span className="font-extrabold text-lg text-red-700">
                S/. {req.price.toFixed(2)}
              </span>
            </p>
          </div>

          {/* Botón de Aceptar (Claro y visible) */}
          <button
            onClick={() => onAccept(req)}
            className="
              mt-4 w-full bg-green-600 text-white text-base py-3 rounded-xl 
              font-bold uppercase tracking-wider 
              shadow-lg hover:bg-green-700 hover:shadow-xl transition-all
            "
          >
            Aceptar viaje
          </button>
        </div>
      </div>
    ))
  )}
</div>
    </div>
  );
}