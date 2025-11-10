import { useState } from "react";

// --- Subcomponente: VerificationModal (Se recomienda mover a /modals) ---
interface VerificationModalProps {
    show: boolean; 
    onClose: () => void; 
    onConfirm: (code: string) => void;
    passengerName: string;
}

const VerificationModal = ({ show, onClose, onConfirm, passengerName }: VerificationModalProps) => {
    const [verifyCode, setVerifyCode] = useState<string>("AAAA"); // Código de prueba
    const [verifyError, setVerifyError] = useState<string | null>(null);

    const handleConfirm = () => {
        // Validación simulada: Solo "AAAA" es válido
        if (verifyCode.trim().toUpperCase() !== "AAAA") {
            setVerifyError("Código inválido. Por favor, solicite el código al pasajero.");
            return;
        }
        setVerifyError(null);
        onConfirm(verifyCode);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
            <div className="relative z-10 w-[92%] max-w-md bg-white rounded-lg shadow-2xl p-5">
                <h3 className="text-lg font-bold mb-3">Verificar e Iniciar Viaje</h3>
                <p className="text-sm text-gray-600 mb-3">
                    Pídele a **{passengerName}** su código de verificación de 4 dígitos para comenzar.
                </p>
                
                <input
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2 text-center tracking-widest text-xl font-mono focus:ring-blue-500 focus:border-blue-500"
                    maxLength={4}
                    placeholder="ABCD"
                />
                
                {verifyError && <div className="text-xs text-red-500 mb-3 font-medium">{verifyError}</div>}
                
                <div className="flex gap-3 justify-end mt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg font-medium hover:bg-gray-200">Cancelar</button>
                    <button 
                        onClick={handleConfirm} 
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                        Confirmar y Empezar
                    </button>
                </div>
            </div>
        </div>
    );
};
// -----------------------------------------------------------------------------

interface WaitingPanelProps {
    passengerName: string;
    onStartTrip: () => void;
}

export default function WaitingPanel({ passengerName, onStartTrip }: WaitingPanelProps) {
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    const handleConfirmVerification = (code: string) => {
        // Aquí podrías enviar el código al backend si fuera necesario
        setShowVerifyModal(false);
        onStartTrip(); // Transición a EN_CURSO
    };

    return (
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-300 shadow-md space-y-3">
            <p className="text-sm text-amber-800 font-bold flex items-center">
                <span className="text-lg mr-2">⏱️</span>
                **Esperando al pasajero.** El cliente debe subir e indicarte su código.
            </p>

            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
                <div>
                    <p className="text-xs text-gray-500">Tiempo de espera (máximo)</p>
                    {/* Aquí iría un contador de tiempo real */}
                    <div className="text-xl font-extrabold text-amber-600">4:32 min</div>
                </div>
                <div className="text-center">
                     <p className="text-xs text-gray-500 mb-1">Código de pasajero</p>
                    <div className="text-lg font-mono tracking-widest bg-gray-100 px-3 py-1 rounded-md text-gray-600">****</div>
                </div>
            </div>

            <button
                onClick={() => setShowVerifyModal(true)}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl text-base font-bold shadow-lg hover:bg-blue-700 transition-colors"
            >
                Confirmar código / Iniciar viaje
            </button>

            <VerificationModal
                show={showVerifyModal}
                onClose={() => setShowVerifyModal(false)}
                onConfirm={handleConfirmVerification}
                passengerName={passengerName}
            />
        </div>
    );
}