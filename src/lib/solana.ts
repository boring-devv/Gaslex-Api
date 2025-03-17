/* eslint-disable @typescript-eslint/no-unused-vars */

import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
const RELAYER_KEYPAIR = Keypair.fromSecretKey(bs58.decode(process.env.RELAYER_PRIVATE_KEY!));
const SOLANA_RPC = "https://api.testnet.sonic.game";

export const connection = new Connection(SOLANA_RPC, "confirmed");

/**
 * Sponsors gas for a user
 * @param userAddress - The Solana wallet address of the user
 * @param gasAmount - The amount of SOL to send
 */
export const sponsorGas = async (userAddress: string, gasAmount: number) => {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: RELAYER_KEYPAIR.publicKey,
      toPubkey: new PublicKey(userAddress),
      lamports: gasAmount,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [RELAYER_KEYPAIR]);
  return signature;
};
