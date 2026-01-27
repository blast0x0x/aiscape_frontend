import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Frame } from "./screens/Frame";
import {
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Buffer } from 'buffer';

import { config } from "./config"
if (!window.Buffer) {
  window.Buffer = Buffer;
}
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

const endpoint = config.isMainnet ? config.mainNetRpcUrl : config.devNetRpcUrl;

createRoot(document.getElementById("app") as HTMLElement).render(
  <ConnectionProvider endpoint={endpoint}>
    <WalletProvider wallets={[]} autoConnect>
      <StrictMode>
        <Frame />
      </StrictMode>
    </WalletProvider>
  </ConnectionProvider >
);
