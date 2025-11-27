import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { FC, ChangeEvent, KeyboardEvent } from 'react';
import { ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon, Mail } from "lucide-react";
import { authService } from '../../../services/AuthService';
import {useNavigate}  from 'react-router-dom';

// --- TYPE DEFINITIONS ---

interface VCodeInputProps {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  className: string;
  maxLength: number;
  type: string;
  inputMode: 'numeric' | 'text';
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

// --- CUSTOM INPUT COMPONENT ---

// Component created to handle a single digit input, correctly typed with React.forwardRef
const VCodeInput = React.forwardRef<HTMLInputElement, VCodeInputProps>(({ id, value, onChange, onKeyDown, className, maxLength, type, ...props }, ref) => (
  <input
    ref={ref}
    id={id}
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    className={`shadow-lg transition duration-200 ease-in-out ${className}`}
    maxLength={maxLength}
    type={type}
    {...props}
  />
));
VCodeInput.displayName = 'VCodeInput';

// --- MOCK BUTTON COMPONENT ---

// Mock Button component
const Button: FC<ButtonProps> = ({ children, onClick, className, variant = 'primary', disabled, ...props }) => {
  let baseClasses = "flex items-center justify-center font-semibold rounded-full transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
  
  if (variant === 'primary') {
    baseClasses += " bg-[#8B0000] hover:bg-[#7A0000] text-white shadow-md";
  } else if (variant === 'secondary') {
    baseClasses += " bg-[#d9d9d9] hover:bg-[#c9c9c9] text-black shadow-inner";
  } else if (variant === 'ghost') {
    baseClasses += " bg-transparent hover:bg-gray-200 text-black";
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// --- MAIN APPLICATION COMPONENT ---

const VCODE_LENGTH = 6;

const VerificationCodePage: FC = () => {
  // State: Holds the 6 characters of the code.
  const [vCode, setVCode] = useState<string[]>(Array(VCODE_LENGTH).fill(''));
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  
  // Refs: Array of refs, explicitly typed to hold HTMLInputElement references.
  const inputRefs = useRef<Array<React.RefObject<HTMLInputElement | null>>>([]);
  
  const UseNavigate = useNavigate();
  // Initialize refs if not already done
  if (inputRefs.current.length === 0) {
    inputRefs.current = Array.from({ length: VCODE_LENGTH }, () => React.createRef<HTMLInputElement>());
  }

  // Effect to automatically focus the first input on load
  useEffect(() => {
    inputRefs.current[0]?.current?.focus();
  }, []);

  // Handler for input changes (typing a character or pasting)
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>, index: number) => {
    const input = e.target.value;
    
    // ----------------------------------------------------------------------
    // PASTE LOGIC: Handles multi-character input (pasting the full code)
    // ----------------------------------------------------------------------
    if (input.length > 1) {
      // Get the characters from the input value, starting from the current box index
      const pastedChars = input.split('').slice(0, VCODE_LENGTH - index);
      
      setVCode(prevCode => {
        const newCode = [...prevCode];
        pastedChars.forEach((char, i) => {
          if (index + i < VCODE_LENGTH) {
            newCode[index + i] = char.slice(-1); // Ensure only single char is used
          }
        });
        return newCode;
      });
      
      // Auto-Focusing after paste
      const nextIndex = index + pastedChars.length;
      if (nextIndex < VCODE_LENGTH) {
        inputRefs.current[nextIndex]?.current?.focus();
      } else {
        // If the code is complete, blur all inputs
        inputRefs.current.forEach(ref => ref.current?.blur());
      }
      return; // Exit the function after handling paste
    }

    // ----------------------------------------------------------------------
    // SINGLE CHARACTER LOGIC: Handles single key entry/deletion
    // ----------------------------------------------------------------------
    const value = input.slice(-1); // Takes the last char or ''
    
    // 1. Update the state
    setVCode(prevCode => {
      const newCode = [...prevCode];
      newCode[index] = value;
      return newCode;
    });

    // 2. Handle Auto-Focusing
    if (value && index < VCODE_LENGTH - 1) {
      // If a value was entered and it's not the last input, focus the next one
      inputRefs.current[index + 1]?.current?.focus();
    } else if (value && index === VCODE_LENGTH - 1) {
      // If the last input is filled, blur all inputs (simulates form completion)
      inputRefs.current.forEach(ref => ref.current?.blur());
    }
  }, []);


  // Handler for key presses (specifically Backspace)
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && index > 0 && !vCode[index]) {
      // If Backspace is pressed, the current box is empty, and it's not the first box:
      // 1. Focus the previous input
      inputRefs.current[index - 1]?.current?.focus();
      
      // 2. Clear the value in the previous box (optional, but good UX)
      setVCode(prevCode => {
        const newCode = [...prevCode];
        newCode[index - 1] = '';
        return newCode;
      });
      e.preventDefault(); // Prevent default backspace behavior in the new input
    }
  }, [vCode]);


  // Handler for form submission
  const handleSubmit = async() => {
    const finalCode = vCode.join('');
    // Check if all fields are filled
    if (finalCode.length === VCODE_LENGTH) {
      console.log("Verification Code Submitted:", finalCode);

      const res = await authService.sendResetToken({email: localStorage.getItem("email") || '',token: finalCode});      
      if(res.message === "Token verificado con exito"){
        localStorage.setItem("token",finalCode);
        UseNavigate("/verification-success"); // Show success message
      }
      // Here you would typically send 'finalCode' to an API for verification.
      
    } else {
      console.error("Verification code is incomplete.");
      setVerificationStatus('error'); // Show an error
    }
  }
  
  // Determine if the Continue button should be enabled
  const isCodeComplete = vCode.every(char => char.length === 1);
  const codeIncompleteClass = isCodeComplete ? '' : 'opacity-60 cursor-not-allowed';

  return (
    <div className="relative w-full min-h-screen bg-gray-100 flex flex-col font-sans">
      
      {/* Header with Logo */}
      <header className="w-full bg-[#8B0000] flex-shrink-0 flex items-center justify-center p-4">
        {/* Placeholder for Logo */}
        <div className="flex flex-col items-center">
             <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center p-2 mt-4 shadow-xl">
                <Mail className="w-10 h-10 text-[#8B0000]" strokeWidth={1.5} />
            </div>
            <p className="text-white font-bold text-xl mt-1">ToriGo Auth</p>
        </div>
      </header>
      
      {/* Main content container */}
      <main className="flex-1 flex flex-col items-center px-4 pt-10 pb-40">
        <div className="w-full max-w-md text-center space-y-8 p-6 bg-white rounded-xl shadow-2xl">
          
          {/* Title */}
          <div className="space-y-4">
            <h1 className="font-semibold text-gray-800 text-2xl md:text-3xl">
              Ingresa el código
            </h1>
            <p className="text-gray-600 text-base md:text-lg font-light leading-snug">
              El código de verificación se envió a<br />
              <span className="font-medium text-[#8B0000]">{localStorage.getItem("email")}</span>
            </p>
            {/* Note */}
            <p className="text-gray-500 text-sm font-light pt-2">
              Nota: Revisa tu bandeja de entrada o spam
            </p>
          </div>
          
          {/* Code inputs */}
          <div className="flex gap-3 justify-center pt-4 pb-6">
            {vCode.map((char, index) => (
              <VCodeInput 
                key={index}
                id={`code-${index}`}
                // The ref must be current[index]
                ref={inputRefs.current[index]}
                value={char}
                // Wrap the handler to pass the correct type for the event
                onChange={(e) => handleInputChange(e as ChangeEvent<HTMLInputElement>, index)} 
                onKeyDown={(e) => handleKeyDown(e as KeyboardEvent<HTMLInputElement>, index)}
                
                // Tailwind classes for style
                className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-lg text-center text-xl font-medium text-gray-800 
                           border-2 border-transparent focus:border-[#8B0000] focus:ring-4 focus:ring-[#8B0000]/30 focus:outline-none caret-transparent"
                maxLength={1}
                type="text"
                inputMode="numeric" // Optimized for mobile numeric keyboards
              />
            ))}
          </div>

          {/* Status Message */}
          {verificationStatus === 'success' && (
            <p className="text-green-600 font-medium text-sm">✅ Código verificado correctamente.</p>
          )}
          {verificationStatus === 'error' && (
            <p className="text-red-600 font-medium text-sm">❌ El código ingresado es incorrecto o está incompleto.</p>
          )}
          
          {/* Resend button */}
          <Button
            variant="secondary"
            className="w-4/5 max-w-xs mx-auto py-3 text-sm md:text-base font-medium mt-4 hover:underline"
          >
            Reenviar código
          </Button>
          
        </div>
      </main>

      {/* Navigation buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white shadow-3xl flex justify-between items-center border-t border-gray-200">
        {/* Back button */}
        <Button
          variant="ghost"
          className="w-12 h-12 md:w-14 md:h-14 p-0 rounded-full"
        >
          <ArrowLeftIcon className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
        </Button>

        {/* Continue button */}
        <Button 
          onClick={handleSubmit} 
          disabled={!isCodeComplete}
          className={`px-8 py-3 md:px-10 md:py-4 flex items-center gap-2 font-semibold text-base md:text-lg ${codeIncompleteClass}`}
        >
          Continuar
          <ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
      </div>
    </div>
  );
};

export default VerificationCodePage;