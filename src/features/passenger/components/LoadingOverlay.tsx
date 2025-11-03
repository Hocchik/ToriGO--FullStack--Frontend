// features/passenger/components/LoadingOverlay.tsx
export default function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white px-6 py-4 rounded shadow-lg text-center">
        <p className="text-lg font-semibold">{message}</p>
      </div>
    </div>
  );
}