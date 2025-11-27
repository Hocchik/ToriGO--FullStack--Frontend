import React, { useState, useMemo } from "react";
import { ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
// Import MemoryRouter to fix the "useNavigate() may be used only in the context of a <Router> component" error
import { useNavigate, MemoryRouter, Routes, Route } from "react-router-dom"; 
import { authService } from "../../../services/AuthService";

// --- Inline UI Components (Replacing imports for self-containment) ---

const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-sm font-medium mb-1 ${className}`} {...props}>
    {children}
  </label>
);

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "icon";
}

const Button = ({ className = "", variant = "default", size = "default", ...props }: ButtonProps) => {
  // Removed "disabled:opacity-50" so the button stays the same solid color even when disabled
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none";
  
  // Minimal variant styles for this example
  let variantStyles = "";
  if (variant === "ghost") {
    variantStyles = "hover:bg-accent hover:text-accent-foreground";
  } else if (variant === "outline") {
    variantStyles = "border border-input bg-background hover:bg-accent hover:text-accent-foreground";
  } else {
    // Default / Solid
    variantStyles = ""; 
  }

  const sizeStyles = size === "icon" ? "h-10 w-10" : "h-10 px-4 py-2";

  return (
    <button className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`} {...props} />
  );
};

// --- Constants & Types ---

const PRIMARY_COLOR_CLASS = "bg-[#8B0000] hover:bg-[#7A0000]"; // Deep Maroon
const FOCUS_RING_COLOR_CLASS = "focus:ring-[#8B0000]";
const INPUT_BG_COLOR_CLASS = "bg-gray-300";

interface PasswordRequirements {
  minLength: boolean;
}

// --- Main Page Component ---

export const NewPasswordPage = () => {
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({
    password: "",
    repeatPassword: "",
  });

  // State for UI toggles and feedback
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isTypingPassword, setIsTypingPassword] = useState(false); 

  // --- Validation Logic ---

  const passwordRequirements: PasswordRequirements = useMemo(() => {
    const pass = formData.password;
    return {
      minLength: pass.length >= 6,
    };
  }, [formData.password]);

  // Only check if minLength is met
  const isPasswordComplex = passwordRequirements.minLength;

  const passwordsMatch = useMemo(
    () => formData.password === formData.repeatPassword && formData.repeatPassword.length > 0,
    [formData.password, formData.repeatPassword]
  );
  
  const isFormValid = isPasswordComplex && passwordsMatch;

  // --- Event Handlers ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    
    if (error) setError(""); 
    
    if (id === 'password') {
        setIsTypingPassword(true);
        if (value.length === 0) {
            setIsTypingPassword(false);
        }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError("");

    if (!isFormValid) {
        setError("Por favor, revisa que la contraseña cumpla todos los requisitos y que coincida.");
        return;
    }

    // Success Action
    authService.changePassword({ emailorphone: localStorage.getItem('email') || '', password: formData.password });
    setSuccess(true);
    setTimeout(() => {
      navigate("/auth");
    }, 2000);
    console.log("Password updated:", formData.password);
  };

  // --- UI Component Helpers ---

  const RequirementItem = ({ text, isMet }: { text: string; isMet: boolean }) => (
    <div className={`flex items-center text-xs md:text-sm transition-colors ${isMet ? 'text-green-700' : 'text-gray-600'}`}>
      {isMet ? <CheckCircle size={14} className="mr-1.5 flex-shrink-0" /> : <XCircle size={14} className="mr-1.5 flex-shrink-0" />}
      {text}
    </div>
  );

  return (
    <div className="relative w-full min-h-screen bg-gray-100 flex flex-col items-center">
      
      {/* Header with Logo */}
      <header className="w-full h-[80px] md:h-[130px] bg-[#8B0000] flex items-center justify-center shadow-md">
        {/* Placeholder for Logo if asset is missing */}
        <div className="w-28 h-28 flex items-center justify-center text-white font-bold text-xl">
           {/* Replace src below with actual logo path */}
           <img 
             src="./src/assets/Logo.png" 
             alt="ToriGo" 
             className="w-full h-full object-contain"
             onError={(e) => {
               // Fallback if image fails in preview
               e.currentTarget.style.display = 'none';
               e.currentTarget.parentElement!.innerText = "LOGO";
             }}
           />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-16 w-full">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-xl text-center space-y-8">
          
          {/* Header Texts */}
          <div className="space-y-2">
            <h1 className="font-normal text-black text-xl md:text-2xl leading-tight">
              Nueva contraseña
            </h1>
            <p className="font-normal text-gray-700 text-sm md:text-base leading-relaxed px-4">
              Crea una nueva contraseña que cumpla con los requisitos de seguridad.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black text-base md:text-lg">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full h-12 ${INPUT_BG_COLOR_CLASS} border-0 rounded-lg text-base px-4 pr-12 ${FOCUS_RING_COLOR_CLASS} focus:ring-2 focus:outline-none transition-all`}
                  placeholder="********"
                  aria-invalid={!isPasswordComplex && formData.password.length > 0}
                  aria-describedby="password-requirements"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black p-1"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Requirements Feedback - ONLY SHOWING MIN LENGTH */}
              {(isTypingPassword || formData.password.length > 0) && (
                <div id="password-requirements" className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <RequirementItem text="Mínimo 6 caracteres" isMet={passwordRequirements.minLength} />
                </div>
              )}
            </div>

            {/* Repeat Password Field */}
            <div className="space-y-2">
              <Label htmlFor="repeatPassword" className="text-black text-base md:text-lg">
                Repetir contraseña
              </Label>
              <div className="relative">
                <Input
                  id="repeatPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.repeatPassword}
                  onChange={handleChange}
                  className={`w-full h-12 ${INPUT_BG_COLOR_CLASS} border-0 rounded-lg text-base px-4 ${FOCUS_RING_COLOR_CLASS} focus:ring-2 focus:outline-none transition-all`}
                  placeholder="********"
                  aria-invalid={!passwordsMatch && formData.repeatPassword.length > 0}
                />
                {/* Match Status Icon */}
                {formData.repeatPassword.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Password Match Error */}
              {formData.repeatPassword.length > 0 && !passwordsMatch && (
                <p className="text-red-600 text-xs mt-1 text-center">Las contraseñas no coinciden.</p>
              )}
            </div>

            {/* Global Error / Success Messages */}
            {error && <p className="text-red-600 text-sm text-center bg-red-100 p-2 rounded">{error}</p>}
            {success && <p className="text-green-600 text-sm text-center bg-green-100 p-2 rounded">Contraseña actualizada con éxito.</p>}

            {/* Submit Button */}
            <Button 
              type="submit"
              disabled={!isFormValid}
              // Removed "disabled:opacity-50" so the button stays the same solid color even when disabled
              className={`w-full ${PRIMARY_COLOR_CLASS} text-white rounded-full px-6 py-3 md:px-8 md:py-4 flex items-center justify-center gap-2 font-normal text-base md:text-lg mx-auto transition-colors shadow-lg disabled:cursor-not-allowed`}
            >
              Actualizar contraseña
            </Button>
          </form>
        </div>
      </main>

      {/* Back Arrow - Solid white */}
      <Button
        size="icon"
        onClick={() => navigate(-1)} 
        className="absolute top-4 left-4 md:top-6 md:left-6 z-20 w-10 h-10 p-0 bg-white hover:bg-gray-100 shadow-lg rounded-full flex items-center justify-center transition-all"
        aria-label="Volver"
      >
        <ArrowLeft className="w-6 h-6 text-black" />
      </Button>
    </div>
  );
};

// --- App Wrapper for Router Context ---

const App = () => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="*" element={<NewPasswordPage />} />
      </Routes>
    </MemoryRouter>
  );
};

export default App;