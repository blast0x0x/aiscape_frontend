import {
    Connection,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction
} from "@solana/web3.js";
import {
    createMint,
    getAssociatedTokenAddress,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    createTransferInstruction
} from "@solana/spl-token";

import {    
    useWallet
} from "@solana/wallet-adapter-react";

import bs58 from "bs58";
import { config } from "../config"

import { toast } from "react-toastify";

const endpoint = config.isMainnet ? config.mainNetRpcUrl : config.devNetRpcUrl;
const tokenAddress = "9Ks3V9nTnkKqUUWKDBhrurz46ZsckVNzUt3VeNY8yss4"
const treasuryWallet = "3rnoQMHS5M6fGRi4tgGWYFbjJUA2ABK557StoywE7Y3c"


// (async () => {
export const token_transfer = async (tokenAmount: any, connection: any, publicKey:any, signTransaction:any) => {
    console.log("Token transfer function called");
    

    try {
        // const senderPublicKey = new PublicKey(walletAddress);
        const recipientPublicKey = new PublicKey(treasuryWallet);
        const TokenPublicKey = new PublicKey(tokenAddress)
        const senderTokenAddress = await getAssociatedTokenAddress(TokenPublicKey, publicKey);
        const recipientTokenAddress = await getAssociatedTokenAddress(TokenPublicKey, recipientPublicKey);

        const transaction = new Transaction().add(
            createTransferInstruction(senderTokenAddress, recipientTokenAddress, publicKey, parseFloat(tokenAmount) * 1e6) // USDC has 6 decimals
        );

        transaction.feePayer = publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        // const signedTransaction = await solana.signTransaction(transaction);
        const signedTransaction = await signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        // const result = await axios.post(`${BACKEND_URL}/staking/addStaking`, stakingData)

        toast.success("Token Transfer success!")
        
    } catch (error) {        
        toast.error("Token Transfer failed!")        
        console.error("Transaction failed", error);
    }    
};