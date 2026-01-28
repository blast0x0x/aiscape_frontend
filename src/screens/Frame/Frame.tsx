import React, { useState, useEffect, useMemo } from "react";
import PHWallet from "../../screens/wallet/wallet";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Header } from "../../components/Header";
import axios from "axios";

import {
  useWallet
} from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction
} from "@solana/web3.js";

import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction
} from "@solana/spl-token";


import { config } from "../../config"
import { toast, ToastContainer } from "react-toastify";

export const Frame = (): JSX.Element => {
  const endpoint = config.isMainnet ? config.mainNetRpcUrl : config.devNetRpcUrl;
  const connection = new Connection(endpoint, "confirmed");
  const { publicKey, signTransaction } = useWallet();

  const [transfers, setTransfers] = useState<Array<{ username: string; amount: string }>>([]);
  const [playerCount, setPlayerCount] = useState<number>(0);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        // const res = await fetch('http://localhost:3001/api/transfers'); // Adjust for your API base URL
        const res = await axios.post(`${config.BACKEND_URL}/gettransfers/gettransfers`, { walletAddress: publicKey?.toString() })
        console.log("data====", res.data)
        setTransfers(res.data);
      } catch (error) {
        console.error('Failed to fetch transfers:', error);
      }
    };

    fetchTransfers();
  }, [publicKey]);

  // Fetch player count (you can replace this with your actual API endpoint)
  useEffect(() => {
    const fetchPlayerCount = async () => {
      try {
        // Replace with your actual API endpoint for player count
        // const res = await axios.get(`${config.BACKEND_URL}/players/count`);
        // setPlayerCount(res.data.count);

        // For now, using a mock value - replace with actual API call
        setPlayerCount(0);
      } catch (error) {
        console.error('Failed to fetch player count:', error);
      }
    };

    fetchPlayerCount();
    // Optionally set up an interval to update player count periodically
    // const interval = setInterval(fetchPlayerCount, 30000); // Update every 30 seconds
    // return () => clearInterval(interval);
  }, []);

  const handleTokenTransfer = async () => {
    if (!connection || !publicKey || !signTransaction) {
      toast.error("Please connect your wallet first!")
      return;
    }

    if (!tokenAmount) {
      toast.error("Please input correct amount!")
      return;
    }

    const isValidNumberFormat = /^\d*\.?\d*$/.test(tokenAmount);

    if (!isValidNumberFormat) {
      toast.error("Please input a valid number");
      return;
    }

    try {
      const recipientPublicKey = new PublicKey(config.treasuryWallet);
      const TokenPublicKey = new PublicKey(config.tokenAddress)

      const senderTokenAddress = await getAssociatedTokenAddress(TokenPublicKey, publicKey);
      const recipientTokenAddress = await getAssociatedTokenAddress(TokenPublicKey, recipientPublicKey);

      let ix =
        createAssociatedTokenAccountInstruction(publicKey,
          recipientTokenAddress,
          recipientPublicKey,
          TokenPublicKey
        )

      const accountInfo = await connection.getAccountInfo(recipientTokenAddress);

      let transaction;
      if (accountInfo === null) {
        transaction = new Transaction().add(ix).add(
          createTransferInstruction(senderTokenAddress, recipientTokenAddress, publicKey, parseFloat(tokenAmount) * 1e6)
        );
      } else {
        transaction = new Transaction().add(
          createTransferInstruction(senderTokenAddress, recipientTokenAddress, publicKey, parseFloat(tokenAmount) * 1e6)
        );
      }

      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const signedTransaction = await signTransaction(transaction);


      let retryDelay = 500;
      const maxRetries = 5;

      for (let i = 0; i < maxRetries; i++) {
        try {
          const signature = await connection.sendRawTransaction(signedTransaction.serialize());
          console.log("Transaction signature:", signature);
          break;
        } catch (err: any) {
          if (err?.message?.includes("429")) {
            await new Promise((res) => setTimeout(res, retryDelay));
            retryDelay *= 2;
          } else {
            throw err;
          }
        }
      }

      toast.success("Token Transfer success!")

      const transferData = {
        userName: username,
        amount: tokenAmount,
        walletAddress: publicKey.toString(),
        claimed: false
      }
      const result = await axios.post(`${config.BACKEND_URL}/transfer/transfer`, transferData)

      if (result.data.status === "success") {
        console.log("transfer success")
        setTransfers([...transfers, { username, amount: tokenAmount }]);
      }

    } catch (error) {
      toast.error("Token Transfer failed!")
    }
  };

  const [username, setUsername] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>("");

  // Generate random bubbles once (stable across re-renders so typing doesn't change them)
  const bubbles = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        size: Math.random() * 45 + 20, // 20-65px
        left: Math.random() * 100, // 0-100%
        animationDuration: Math.random() * 15 + 7, // 7-22s
        animationDelay: Math.random() * 5, // 0-5s
        opacity: Math.random() * 0.5 + 0.1, // 0.1-0.6
      })),
    []
  );

  return (
    <>
      <Header playerCount={playerCount} />
      <div className="flex flex-row justify-center w-full min-h-screen"
        style={{
          background: 'radial-gradient(circle at top, #4a3624 0%, #17120c 60%)',
        }}
      >
        <div className="w-full min-h-screen relative overflow-hidden">
          {/* Light Bubble Effect */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {bubbles.map((bubble) => (
              <div
                key={bubble.id}
                className="absolute rounded-full"
                style={{
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  left: `${bubble.left}%`,
                  bottom: '-100px',
                  opacity: bubble.opacity,
                  background: `radial-gradient(circle, rgba(245, 180, 49, 0.9) 0%, rgba(241, 187, 78, 0.6) 20%, rgba(238, 190, 96, 0.2) 40%, rgba(240, 199, 117, 0) 60%)`,
                  animation: `floatUp ${bubble.animationDuration}s linear infinite`,
                  animationDelay: `${bubble.animationDelay}s`,
                  filter: 'blur(1px)',
                }}
              />
            ))}
          </div>

          <div className="relative min-h-screen px-4 pt-10 md:pt-18">
            {/* Background Image Layer - positioned to blend with background color */}
            <div
              className="absolute max-w-[1920px] mx-auto inset-0 pointer-events-none"
              style={{
                backgroundImage: 'url(/freepik--a-dark-and-mysterious-forest-in-aiscape-where-anci--908.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: 0.25,
                mixBlendMode: 'soft-light',
                zIndex: 1
              }}
            />

            {/* Content Layer */}
            <div className="relative z-10 overflow-hidden">
              {/* Logo - constrained to section */}
              <div className="absolute top-0 left-0 right-0 flex justify-center z-20 px-4" style={{ maxHeight: '180px' }}>
                <img
                  className="w-full max-w-[280px] md:max-w-[383px] h-auto max-h-[140px] md:max-h-[180px] object-contain transition-transform hover:scale-105"
                  alt="Wide VARIANT"
                  src="/wide-variant-1.png"
                />
              </div>

              <div className="pt-[200px] md:pt-[180px] px-4 md:px-0 max-w-[800px] mx-auto">
                <div className="[text-shadow:0px_0px_3.6px_#000000] [font-family:'Cinzel',Helvetica] font-bold text-[#f6dda2] text-xl md:text-xl mb-2">
                  Enter Username (please ensure this is correct)
                </div>
                <div
                  className="rounded-lg"
                  style={{
                    background: 'radial-gradient(circle at top, rgba(80, 58, 36, 0.96), rgba(34, 23, 14, 0.98))',
                  }}
                >
                  <Input
                    className="w-full h-[50px] md:h-[61px] bg-[#00000059] [font-family:'Cinzel',Helvetica] font-normal rounded-lg shadow-[0px_0px_33.8px_#7e5a35] text-[#f0c775] text-sm md:text-base mb-6 focus:shadow-[0px_0px_40px_#7e5a35] transition-shadow duration-300 border-[#f6dda28c]"
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="[text-shadow:0px_0px_3.6px_#000000] [font-family:'Cinzel',Helvetica] font-bold text-[#f6dda2] text-xl md:text-xl mb-2">
                  Enter desired amount of tokens
                </div>
                <div
                  className="rounded-lg"
                  style={{
                    background: 'radial-gradient(circle at top, rgba(80, 58, 36, 0.96), rgba(34, 23, 14, 0.98))',
                  }}
                >
                  <Input
                    className="w-full h-[50px] md:h-[61px] bg-[#00000059] [font-family:'Cinzel',Helvetica] font-normal rounded-lg shadow-[0px_0px_33.8px_#7e5a35] text-[#f0c775] text-sm md:text-base mb-6 focus:shadow-[0px_0px_40px_#7e5a35] transition-shadow duration-300 border-[#f6dda28c]"
                    type="number"
                    placeholder="Amount"
                    onChange={(e) => setTokenAmount(e.target.value)}
                  />
                </div>


                <div className="flex justify-center pt-2">

                  {/* Wallet Button */}
                  <div className="flex items-center justify-center mb-2 mr-2">
                    <PHWallet />
                  </div>

                  <Button
                    className="inline-block uppercase [font-family:'Cinzel',Helvetica]"
                    style={{
                      padding: '10px 26px',
                      textDecoration: 'none',
                      letterSpacing: '0.16em',
                      fontSize: '1rem',
                      height: "40px",
                      borderRadius: "32px",
                      borderColor: "#f0c775",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      background: 'linear-gradient(135deg, #c7963e, #8a6127)',
                      color: '#24160c',
                      fontWeight: 700,
                      boxShadow: '0 0 18px rgba(0, 0, 0, 0.85)',
                      transition: 'background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease'
                    }}
                    onClick={handleTokenTransfer}
                  >
                    <span className="text-center">
                      Confirm
                    </span>
                  </Button>
                </div>

                {/* Transfer History Table */}

                <div className="mt-8 overflow-x-auto">
                  <div className="h-[242px] overflow-y-auto rounded-lg"
                    style={{
                      background: 'radial-gradient(circle at top, rgba(80, 58, 36, 0.96), rgba(34, 23, 14, 0.98))',
                    }}
                  >
                    <table className="w-full h-full table-fixed bg-[#00000059] rounded-lg shadow-[0px_0px_33.8px_#7e5a35]">
                      <thead className="sticky top-0 bg-[#00000085]">
                        <tr className="border-b border-[#7e5a35]">
                          <th className="px-4 py-3 text-left text-[#f0c775] [font-family:'Cinzel',Helvetica] font-normal">No</th>
                          <th className="px-4 py-3 text-left text-[#f0c775] [font-family:'Cinzel',Helvetica] font-normal">Username</th>
                          <th className="px-4 py-3 text-left text-[#f0c775] [font-family:'Cinzel',Helvetica] font-normal">Token Amount</th>
                        </tr>
                      </thead>
                      <tbody className="sticky top-0 bg-[#00000059]">
                        {transfers.length > 0 ? (
                          // Render data rows
                          <>
                            {transfers.map((transfer: any, index) => (
                              <tr
                                key={index}
                                className="border-b border-[#7e5a35] last:border-b-0 h-[48px]"
                              >
                                <td className="px-4 py-3 text-white">{index + 1}</td>
                                <td className="px-4 py-3 text-white">{transfer.username}</td>
                                <td className="px-4 py-3 text-white">{transfer.amountOfTokens}</td>
                              </tr>
                            ))}
                            {/* Add empty rows to fill height if needed */}
                            {Array.from({ length: Math.max(0, 5 - transfers.length) }).map((_, i) => (
                              <tr key={`empty-${i}`} className="h-[48px]">
                                <td colSpan={3}></td>
                              </tr>
                            ))}
                          </>
                        ) : (
                          // No data fallback
                          <tr className="h-full">
                            <td
                              colSpan={3}
                              className="text-center text-white opacity-60 align-middle [font-family:'Cinzel',Helvetica] font-normal"
                              style={{ height: '100%' }}
                            >
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="mt-8 [text-shadow:0px_0px_3.6px_#000000] [font-family:'Cinzel',Helvetica] font-normal text-[#f6dda2] text-xs text-center">
                DISCLAIMER: All in-game token deposits are final, and no lost tokens
                due to blockchain or human error are the responsibility of AiScape.
                Using this tool is at your own risk.
              </div>

              <div className="relative w-full px-4 sm:pt-10 pt-8 pb-10">
                {/* Wrapper Column */}
                <div className="flex flex-col items-center space-y-4">
                  {/* Social Icons */}
                  <div className="flex space-x-4">
                    <img
                      className="w-[25px] md:w-[31px] h-[25px] md:h-[31px] object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                      alt="Telegram"
                      src="/telegram-1.png"
                    />
                    <img
                      className="w-[24px] md:w-[30px] h-[24px] md:h-[30px] object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                      alt="X logo"
                      src="/x-logo-1.png"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="text-center"
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 500,
          padding: '8px 20px',
          background: '#17120c',
          borderTop: '1px solid #7e5a35',
          color: '#f0c775',
          fontSize: '0.85rem'
        }}
      >
        <div className="mx-auto">
          <p className="[font-family:'Cinzel',Helvetica]">
            © 2025-2026 RSPS-Casino. All rights reserved | We are not affiliated with Jagex or RuneScape.
          </p>
        </div>
      </footer>

      <ToastContainer />
    </>
  );
};