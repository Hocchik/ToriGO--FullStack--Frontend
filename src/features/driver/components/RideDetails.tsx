import type { RideRequest } from "../pages/Models";

interface Props {
  ride: RideRequest;
  onCancel: () => void;
  onArrived: () => void;
  onPaid: () => void;
}

export default function RideDetails({ ride, onCancel, onArrived, onPaid }: Props) {
  return (
   <div className="flex flex-col bg-gray-50 text-gray-800">
  
  {/* Encabezado Ultra Compacto */}
  <div className="p-3 border-b border-gray-100 bg-white"> {/* p-3 vs p-4 */}
    <h1 className="text-xl font-bold tracking-wide text-gray-900">
  Detalles del Viaje
</h1>
  </div>

  {/* Contenido (Ajuste automático de altura, más compacto) */}
  <div className="p-3 space-y-3"> {/* p-3 vs p-4, space-y-3 vs space-y-4 */}
    
    {/* NUEVO APARTADO: ESTADO DEL VIAJE (Más compacto) */}
    <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm flex justify-between items-center"> {/* p-2 vs p-3 */}
      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Estado</p> {/* text-xs vs text-sm */}
      
      {/* Indicador del Estado (Badge Dinámico más pequeño) */}
      {/* <span 
        className={`
          text-xs font-bold px-2 py-0.5 rounded-full 
          ${ride.status === 'CONFIRMADO' ? 'bg-blue-100 text-blue-700' : ''}
          ${ride.status === 'EN_CAMINO' ? 'bg-yellow-100 text-yellow-700' : ''}
          ${ride.status === 'EN_RECORRIDO' ? 'bg-green-100 text-green-700' : ''}
          ${ride.status === 'FINALIZADO' ? 'bg-gray-200 text-gray-600' : ''}
          ${ride.status === 'CANCELADO' ? 'bg-red-100 text-red-700' : ''}
        `}
      >
        {ride.status.replace('_', ' ')}
      </span> */}
    </div>

    {/* 1. Pasajero (Más compacto) */}
    <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm"> {/* p-2 vs p-3 */}
      <p className="text-xs uppercase tracking-wider text-gray-400 mb-0">Pasajero</p> {/* mb-0 vs mb-0.5 */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-900 flex items-center"> {/* text-sm vs text-base */}
           {ride.passenger.name}
        </h2>
        <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full">
          ⭐ {ride.passenger.rating.toFixed(1)}
        </span>
      </div>
    </div>

    {/* 2. Ruta (Más compacto) */}
    <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm"> {/* p-2 vs p-3 */}
      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Ruta</p> {/* mb-1 vs mb-2 */}
      
      {/* Origen */}
      <div className="flex items-start mb-1.5"> {/* mb-1.5 vs mb-2 */}
        <span className="text-sm mr-2 mt-0.5 text-green-500">🟢</span> {/* text-sm vs text-base */}
        <div>
          <p className="text-xs font-light text-gray-500">Origen</p>
          <p className="text-sm font-medium text-gray-900">{ride.pickup}</p>
        </div>
      </div>
      
      {/* Separador de ruta más corto */}
      <div className="border-l-2 border-dashed border-gray-200 h-3 ml-3.5"></div> {/* h-3 vs h-4, ml-3.5 */}

      {/* Destino */}
      <div className="flex items-start">
        <span className="text-sm mr-2 mt-0.5 text-red-500">🏁</span> {/* text-sm vs text-base */}
        <div>
          <p className="text-xs font-light text-gray-500">Destino</p>
          <p className="text-sm font-medium text-gray-900">{ride.drop}</p>
        </div>
      </div>
    </div>

    {/* 3. Tarifa (Más compacta) */}
    <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm flex justify-between items-center"> {/* p-2 vs p-3 */}
      <p className="text-xs uppercase tracking-wider text-gray-500">Tarifa Estimada</p> {/* text-xs vs text-sm */}
      <p className="text-lg font-extrabold text-gray-900 tracking-tight">S/. {ride.price.toFixed(2)}</p> {/* text-lg vs text-xl */}
    </div>

  </div>

  {/* Botones de Acción (Más compactos) */}
  <div className="p-3 border-t border-gray-200 bg-white space-y-1.5"> {/* p-3 vs p-4, space-y-1.5 vs space-y-2 */}
    
    {/* Botones de Acción: py-2 vs py-2.5, text-xs vs text-sm */}
    <button
      onClick={onArrived}
      className="w-full text-xs bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-md shadow-green-500/30"
    >
      Confirmar llegada
    </button>

    <button
      onClick={onPaid}
      className="w-full text-xs bg-amber-500 text-white py-2 rounded-lg font-bold hover:bg-amber-600 transition shadow-md shadow-amber-500/30"
    >
      Confirmar pago
    </button>

    <button
      onClick={onCancel}
      className="w-full text-xs bg-white border border-red-300 text-red-600 py-2 rounded-lg font-bold hover:bg-red-50 transition"
    >
      Cancelar viaje
    </button>
  </div>
</div>
  );
}