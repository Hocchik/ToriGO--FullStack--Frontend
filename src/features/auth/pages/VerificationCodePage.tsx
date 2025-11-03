import { ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from "lucide-react";
import React from "react";
import { Button } from "../components/Button";
import { InputForVCode } from "../components/InputForVCode";

export const VerificationCodePage = () => {
  const codeInputs = Array.from({ length: 6 }, (_, index) => ({
    id: `code-${index}`,
    key: `code-input-${index}`,
  }));

  return (
    <div className="relative w-full min-h-screen bg-gray-100 flex flex-col">
      {/* Header with logo */}
      <header className="w-full h-[80px] md:h-[130px] bg-[#8B0000] flex-shrink-0">
        <div className="min-h-screen flex">
          <img
            src="/src/assets/Logo.png"
            alt="ToriGo"
            className="w-28 h-28 object-contain mx-auto mb-6 logo"
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-16">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="font-normal text-black text-xl md:text-2xl leading-tight">
              Ingresa el código que se<br />
              te envió a<br />
              <span className="font-medium">tucorreo@email.com</span>
            </h1>
          </div>

          {/* Note */}
          <p className="text-black text-sm md:text-base font-normal">
            Nota: Revisa tu bandeja de entrada o spam
          </p>

          {/* Code inputs */}
          <div className="flex gap-3 justify-center">
            {codeInputs.map((input) => (
              <InputForVCode
                key={input.key}
                id={input.id}
                className="w-12 h-12 md:w-16 md:h-16 bg-[#d9d9d9] rounded-lg text-center text-lg font-medium border-0 focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                maxLength={1}
                type="text"
              />
            ))}
          </div>

          {/* Resend button */}
          <Button
            variant="secondary"
            className="bg-[#d9d9d9] hover:bg-[#c9c9c9] text-black rounded-full px-8 py-3 font-normal text-base md:text-lg border-0"
          >
            Reenviar código
          </Button>
        </div>
      </main>

      {/* Navigation buttons */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-between items-center px-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 md:w-14 md:h-14 p-0 hover:bg-gray-200 rounded-full"
        >
          <ArrowLeftIcon className="w-8 h-8 md:w-10 md:h-10 text-black" />
        </Button>

        {/* Continue button */}
        <Button className="bg-[#8B0000] hover:bg-[#7A0000] text-white rounded-full px-6 py-3 md:px-8 md:py-4 flex items-center gap-2 font-normal text-base md:text-lg">
          Continuar
          <ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
      </div>
    </div>
  );
};