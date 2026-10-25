import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/frontend_assets/assets";

interface BrandLogoProps {
  showBadge?: boolean;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  showBadge = true,
  onClick,
  className = "",
  size = "md",
}) => {
  const imgHeight = 
    size === "sm" ? "h-7 sm:h-8" : 
    size === "lg" ? "h-9 sm:h-10" : 
    "h-8 sm:h-9";

  return (
    <Link 
      to="/" 
      onClick={onClick} 
      className={`inline-flex items-center gap-2.5 sm:gap-3 group focus:outline-none select-none ${className}`}
      aria-label="AkMart Nepal Hub Home"
    >
      {/* Authentic AkMart Brand Logo Graphic with high-contrast sharpness and ambient hover glow */}
      <div className="relative flex items-center">
        <img 
          src={assets.logo} 
          alt="AkMart" 
          className={`${imgHeight} w-auto object-contain brightness-105 contrast-105 [image-rendering:-webkit-optimize-contrast] transition-all duration-200 group-hover:scale-[1.03] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(249,115,22,0.35)]`} 
        />
      </div>

      {/* Verified Regional Marketplace Pill with Concentric Radar Pulse */}
      {showBadge && (
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9.5px] uppercase font-bold tracking-widest bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 text-orange-400 border border-orange-500/30 group-hover:border-orange-500/50 rounded-full shadow-sm transition-all">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
          Nepal Hub
        </span>
      )}
    </Link>
  );
};

export default BrandLogo;
