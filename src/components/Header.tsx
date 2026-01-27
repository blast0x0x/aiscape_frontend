import React, { useState } from "react";
import PHWallet from "../screens/wallet/wallet";
import { Card } from "./ui/card";

interface HeaderProps {
  playerCount?: number;
}

const navItems = [
  { label: "Home", id: "home" },
  { label: "Store", id: "store" },
  { label: "Chart", id: "chart" },
  { label: "Vote", id: "vote" },
];

export const Header: React.FC<HeaderProps> = ({ playerCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (path: string) => {
    setIsMenuOpen(false);
    // You can add routing logic here if using react-router-dom
    console.log("Navigate to:", path);
  };

  return (
    <header 
      className="sticky top-0 flex items-center justify-between px-5 md:px-[20px] py-1"
      style={{
        zIndex: 1000,
        background: 'radial-gradient(circle at top, #4a3624 0%, #17120c 60%)',
        borderBottom: '1px solid #7e5a35',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.8)'
      }}
    >
      <div className="max-w-[1920px] mx-auto w-full">
        <div className="flex items-center justify-between">
          {/* Header Left - Player Count */}
          {/* <div className="header-left flex items-center">
            <div className="player-count text-white [font-family:'Inter',Helvetica] text-sm md:text-base">
              Players online: <span id="player-count" className="text-[#8FF0F3] font-semibold">{playerCount}</span>
            </div>
          </div> */}

          {/* Right Side - Menu Toggle */}
          <div className="flex items-center">
            {/* Menu Toggle Button (Mobile) */}
            <button
              className="menu-toggle md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none"
              aria-label="Toggle navigation"
              onClick={toggleMenu}
            >
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              ></span>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav
            className={`menu absolute md:static ${
              isMenuOpen
                ? "fixed top-10 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-[#7e5a35]/30"
                : "hidden"
            } md:block md:bg-transparent md:border-0`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 py-4 md:py-0">
              {/* Navigation Items */}
              <div className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start">
                {navItems.map((item) => (
                  <Card
                    key={item.id}
                    className="w-[72px] md:w-[96px] h-[32px] md:h-[36px] rounded-[999px] flex items-center justify-center cursor-pointer transition-all duration-300 border"
                    style={{
                      borderColor: '#f0c775',
                      background: 'linear-gradient(135deg, #5b4027, #3b2919)',
                      color: '#ffffff'
                    }}
                    onClick={() => handleNavClick(`/${item.id}`)}
                  >
                    <div className="[font-family:'Cinzel',Helvetica] font-normal text-white text-sm md:text-base">
                      {item.label}
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Wallet Button */}
              <div className="flex items-center justify-center md:ml-4">
                <PHWallet />
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
