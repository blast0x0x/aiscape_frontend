import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import "./wallet.css";

const PHWallet: React.FC = () => {
  const wallet = useWallet();
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <WalletModalProvider>
      <WalletMultiButton
        className="wallet-connect-button"
        style={{
          height: "40px",
          borderRadius: "32px",
          borderColor: "#f0c775",
          borderWidth: "1px",
          borderStyle: "solid",
          background: "linear-gradient(135deg, #c7963e, #8a6127)",
          color: "#24160c",
          fontWeight: "700",
          fontSize: "1rem",
          textAlign: "center",
          transition: "all 0.3s ease",
          fontFamily: "'Cinzel', Helvetica, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!wallet?.connected && (isMobile ? "Connect" : "Connect Wallet")}
      </WalletMultiButton>
    </WalletModalProvider>
  );
};

export default PHWallet;
