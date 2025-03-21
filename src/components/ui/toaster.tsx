import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster 
      closeButton
      richColors
      toastOptions={{
        classNames: {
          closeButton: "absolute right-2 top-2 p-1 rounded-full hover:bg-gray-100"
        }
      }}
    />
  );
}
