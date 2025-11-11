import { ArrowLeft as ArrowLeftIcon, Check as CheckIcon } from "lucide-react";
// React import removed because it's unused in this file
import { Button } from "../components/Button";

export const VerificationSucces = () => {
  return (
    <div className="relative w-full min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Header with logo */}
      <header className="w-full h-[80px] md:h-[130px] bg-[#8B0000] flex items-center justify-center">
        <img
          src="/src/assets/Logo.png"
          alt="ToriGo"
          className="w-28 h-28 object-contain logo"
        />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-16">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Success Icon */}
          <div className="w-24 h-24 md:w-40 md:h-40 bg-black rounded-full flex items-center justify-center mx-auto mb-8 md:mb-12 shadow-lg">
            <CheckIcon className="w-12 h-12 md:w-20 md:h-20 text-white" />
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h1 className="font-normal text-black text-xl md:text-2xl leading-tight">
              ¡Verificación exitosa!
            </h1>
          </div>

          {/* Change Password Button */}
          <Button className="bg-[#8B0000] hover:bg-[#7A0000] text-white rounded-full px-6 py-3 md:px-8 md:py-4 flex items-center gap-2 font-normal text-base md:text-lg mx-auto">
            Cambiar contraseña
          </Button>
        </div>
      </main>

      {/* Back Arrow - Fixed Position */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-between items-center px-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 md:w-14 md:h-14 p-0 hover:bg-gray-200 rounded-full"
        >
          <ArrowLeftIcon className="w-8 h-8 md:w-10 md:h-10 text-black" />
        </Button>
      </div>
    </div>
  );
};