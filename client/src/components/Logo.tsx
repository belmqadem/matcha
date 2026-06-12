// src/components/Logo.tsx
import { NavLink } from "react-router-dom";
import logo from "@/assets/logo.png";

interface MatchaLogoProps {
  to?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-8 h-8 sm:w-10 sm:h-10",
  md: "w-12 h-12 sm:w-16 sm:h-16",
  lg: "w-16 h-16 sm:w-20 sm:h-20",
};

export default function MatchaLogo({
  to = "/browse",
  size = "md",
  className = "",
}: MatchaLogoProps) {
  const img = (
    <img
      src={logo}
      alt="Matcha Logo"
      className={`object-contain ${SIZE_CLASSES[size]} ${className}`}
    />
  );

  if (!to) return img;

  return (
    <NavLink to={to} className="inline-flex items-center hover:opacity-80 transition-opacity">
      {img}
    </NavLink>
  );
}
