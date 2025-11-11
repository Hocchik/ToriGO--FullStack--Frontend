import { ArrowLeft as ArrowLeftIcon } from "lucide-react";
// React import removed because it's unused in this file
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";

export const NewPassowordPage = () => {
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
          {/* Title */}
          <h1 className="font-normal text-black text-xl md:text-2xl leading-tight">
            Nueva contraseña
          </h1>

          {/* Description */}
          <p className="font-normal text-gray-700 text-sm md:text-base leading-relaxed">
            Crea una nueva contraseña que tenga como mínimo 8 caracteres y también incluye caracteres especiales.
          </p>

          {/* Form */}
          <div className="space-y-6">
            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-normal text-black text-base md:text-lg block text-left"
              >
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                className="w-full h-12 bg-gray-300 border-0 rounded-lg text-base px-4 focus:ring-2 focus:ring-main-buttons focus:outline-none"
              />
            </div>

            {/* Repeat Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="repeat-password"
                className="font-normal text-black text-base md:text-lg block text-left"
              >
                Repetir contraseña
              </Label>
              <Input
                id="repeat-password"
                type="password"
                className="w-full h-12 bg-gray-300 border-0 rounded-lg text-base px-4 focus:ring-2 focus:ring-main-buttons focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <Button className="bg-[#8B0000] hover:bg-[#7A0000] text-white rounded-full px-6 py-3 md:px-8 md:py-4 flex items-center gap-2 font-normal text-base md:text-lg mx-auto">
              Actualizar contraseña
            </Button>
          </div>
        </div>
      </main>

      {/* Back Arrow - Fixed Position */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-between items-center px-6">
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