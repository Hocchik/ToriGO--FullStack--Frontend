import { ArrowLeft as ArrowLeftIcon } from "lucide-react";
// React import removed because it's unused in this file
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { useNavigate } from "react-router-dom";


export const RecoverPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen bg-white flex flex-col">
      <header className="w-full h-[80px] md:h-[130px] bg-[#780001] flex-shrink-0">

        <div className="min-h-screen flex">
          <img
            src="/src/assets/Logo.png"
            alt="ToriGo"
            className="w-28 h-28 object-contain mx-auto mb-6 logo"
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-16">
        <div className="w-full max-w-[534px] space-y-6 md:space-y-8">

          <h1 className="[font-family:'Roboto',Helvetica] font-medium text-black text-2xl md:text-[40px] tracking-[0] leading-tight text-center">
            Recupera tu contraseña
          </h1>

          <p className="[font-family:'Roboto',Helvetica] font-normal text-black text-base md:text-2xl tracking-[0] leading-relaxed text-center px-2">
            Para recuperar tu contraseña, digita la dirección de correo
            electrónico que asociaste a tu cuenta. Te enviaremos un código de
            verificación a ese correo.
          </p>

          <div className="space-y-3 md:space-y-4">
            <Label
              htmlFor="email"
              className="[font-family:'Roboto',Helvetica] font-normal text-black text-xl md:text-[32px] tracking-[0] leading-[normal] block"
            >
              Correo electrónico
            </Label>

            <Input
              id="email"
              type="email"
              className="w-full h-12 md:h-[52px] bg-[#d9d9d9] rounded-[20px] border-0 text-base md:text-lg px-4"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="flex justify-center md:justify-start pt-4">
            <Button className="w-full max-w-[338px] h-14 md:h-[74px] bg-[#780001] hover:bg-[#780001]/90 rounded-[50px] transition-colors duration-200">
              <span className="[font-family:'Roboto',Helvetica] font-normal text-white text-lg md:text-[32px] tracking-[0] leading-[normal]">
                Enviar código
              </span>
            </Button>
          </div>
        </div>
      </main>

      <button className="absolute bottom-4 left-4 md:bottom-[66px] md:left-[85px] w-12 h-12 md:w-[59px] md:h-[59px] flex items-center justify-center bg-white/80 md:bg-transparent rounded-full md:rounded-none shadow-lg md:shadow-none hover:bg-white/90 md:hover:bg-transparent transition-colors duration-200">
        <ArrowLeftIcon onClick={
          () => navigate(-1)
        } className="w-6 h-6 md:w-[59px] md:h-[59px] text-black" />
      </button>
    </div>
  );
};
