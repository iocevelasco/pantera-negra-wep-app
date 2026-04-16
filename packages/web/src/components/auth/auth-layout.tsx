import { ReactNode } from 'react';
import { Footer } from '../footer';

interface AuthLayoutProps {
  children: ReactNode;
  overlayOpacity?: string;
  overlayZIndex?: string;
  containerClassName?: string;
}

export function AuthLayout({ 
  children, 
  overlayOpacity = 'bg-background/60',
  overlayZIndex = 'z-10',
  containerClassName = 'container relative z-20 mx-auto px-4'
}: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen relative flex flex-col"
      style={{
        backgroundImage: "url(/214.svg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayOpacity} ${overlayZIndex}`} />

      {/* Content - Centered and takes available space */}
      <div className={`${containerClassName} flex-1 flex items-center justify-center`}>
        {children}
      </div>
      
      {/* Footer - At the bottom */}
      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}

