interface Props {
  message?: string;
}

export default function LoadingOverlay({ message = "Cargando..." }: Props) {
  return (
   <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
  <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
    
    {/* Símbolo: Tres Puntos Rebotando en ROJO */}
    <div className="flex justify-center space-x-2 my-3">
        {/* Cambiamos bg-green-600 a bg-red-600 */}
        <div className="h-4 w-4 bg-red-600 rounded-full animate-pulse delay-75"></div>
        <div className="h-4 w-4 bg-red-600 rounded-full animate-pulse delay-150"></div>
        <div className="h-4 w-4 bg-red-600 rounded-full animate-pulse delay-300"></div>
    </div>
    {/* ------------------------------------- */}
    
    <p className="text-gray-700 font-medium">{message}</p>
  </div>
</div>
  );
}
