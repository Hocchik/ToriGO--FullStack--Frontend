import type { ReactNode } from "react";

interface SlidingSidebarProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function SlidingSidebar({ open, onClose, children, title = "Panel" }: SlidingSidebarProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-30 transition-opacity duration-300 ${
          open ? "opacity-30" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[90%] sm:w-[360px] bg-white shadow-lg z-40 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b flex justify-end items-center">
    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">≡</button>
</div>
        <div className="overflow-y-auto h-[calc(100%-64px)] p-4">{children}</div>
      </div>
    </>
  );
}