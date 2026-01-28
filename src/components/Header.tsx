import React, { useMemo, useState } from "react";
import { Card } from "./ui/card";

interface HeaderProps {
  playerCount?: number;
}

const navItems = [
  { label: "Home", id: "home" },
  { label: "Store", id: "store" },
  { label: "Deposit", id: "deposit" },
];

export const Header: React.FC<HeaderProps> = ({ playerCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredNavId, setHoveredNavId] = useState<string | null>(null);
  const initialActiveId = useMemo(() => {
    // Best-effort active tab based on URL path (works without react-router)
    if (typeof window === "undefined") return "deposit";
    const path = window.location.pathname.replace(/^\/+/, "").split("/")[0];
    const id = path || "deposit";
    return navItems.some((n) => n.id === id) ? id : "deposit";
  }, []);
  const [activeNavId, setActiveNavId] = useState<string>(initialActiveId);

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
          <div
              className="player-count [font-family:'Inter',Helvetica]"
              style={{
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#f0c775",
                padding: "4px 10px",
                borderRadius: "999px",
                border: "1px solid rgba(240, 199, 117, 0.6)",
                background: "rgba(0, 0, 0, 0.45)",
                whiteSpace: "nowrap",
              }}
            >
              Players online:{" "}
              <span id="player-count" style={{ color: "#f0c775", fontWeight: 700 }}>
                {playerCount}
              </span>
            </div>

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
              <div className="flex flex-wrap items-center gap-2 md:gap-4 justify-center md:justify-start">
                {navItems.map((item) => (
                  (() => {
                    const isActive = activeNavId === item.id;
                    const isHovered = hoveredNavId === item.id;
                    const isHighlighted = isActive || isHovered;
                    return (
                  <Card
                    key={item.id}
                    className="rounded-[999px] inline-flex items-center justify-center cursor-pointer select-none border"
                    style={{
                      textDecoration: "none",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontSize: "0.9rem",
                      lineHeight: 1,
                      padding: "10px 14px",
                      borderRadius: "999px",
                      border: isHighlighted ? "1px solid #f0c775" : "1px solid transparent",
                      background: isHighlighted
                        ? "linear-gradient(135deg, #5b4027, #3b2919)"
                        : "transparent",
                      color: isHighlighted ? "#ffffff" : "#dcdfe5",
                      transition:
                        "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.1s ease"
                    }}
                    onMouseEnter={() => setHoveredNavId(item.id)}
                    onMouseLeave={() => setHoveredNavId(null)}
                    onClick={() => {
                      setActiveNavId(item.id);
                      handleNavClick(`/${item.id}`);
                    }}
                  >
                    <div className="[font-family:'Cinzel',Helvetica] font-normal leading-none">
                      {item.label}
                    </div>
                  </Card>
                    );
                  })()
                ))}

                {/* Play now (after Deposit) */}
                <Card
                  className="rounded-[999px] inline-flex items-center justify-center cursor-pointer select-none border"
                  style={{
                    textDecoration: "none",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontSize: "0.9rem",
                    lineHeight: 1,
                    padding: "10px 14px",
                    borderRadius: "999px",
                    border: "1px solid #f0c775",
                    background: "linear-gradient(135deg, #c7963e, #8a6127)",
                    color: "#24160c",
                    fontWeight: 700,
                    transition:
                      "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.1s ease",
                  }}
                  onClick={() => handleNavClick("/play-now")}
                >
                  <div className="[font-family:'Cinzel',Helvetica] font-bold text-black leading-none">
                    Play now
                  </div>
                </Card>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
