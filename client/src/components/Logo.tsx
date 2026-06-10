import { NavLink } from "react-router-dom";
import logo from "@/assets/logo.png";

interface MatchaLogoProps {
  to?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-8 h-8",
  md: "w-12 h-12 md:w-16 md:h-16", // Responsive scaling
  lg: "w-20 h-20",
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
