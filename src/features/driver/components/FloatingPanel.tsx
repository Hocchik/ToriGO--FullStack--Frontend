import type { ReactNode } from "react";

interface FloatingPanelProps {
  children: ReactNode;
  visible?: boolean;
  position?: "bottom" | "center";
}

export default function FloatingPanel({
  children,
  visible = true,
  position = "bottom",
}: FloatingPanelProps) {
  if (!visible) return null;

  return (
    <div
      className={`z-20 w-full sm:w-[92%] md:w-full lg:w-full max-w-md bg-white rounded-xl shadow-lg p-4 transition-all duration-300 ease-in-out overflow-y-auto max-h-[80vh]
        ${position === "center"
          ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          : "sm:absolute sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2 md:relative md:bottom-auto md:left-auto md:translate-x-0"
        }`}
    >
      {children}
    </div>
  );
}
