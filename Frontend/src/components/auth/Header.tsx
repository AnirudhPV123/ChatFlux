import { Lock } from "lucide-react";
import React from "react";

interface HeaderProps {
  children: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  return (
    <h2 className="mx-auto mb-8 flex items-center gap-2 text-2xl font-bold text-white">
      {children} <Lock />
    </h2>
  );
};

export default Header;
