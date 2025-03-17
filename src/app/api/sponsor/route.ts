/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextResponse } from "next/server";
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { createHash } from "crypto";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBBMHa0v3Z0AQy9EZJp043n_8-XeAr582c",
  authDomain: "bcs-website-assets.firebaseapp.com",
  databaseURL: "https://bcs-website-assets-default-rtdb.firebaseio.com",
  projectId: "bcs-website-assets",
  storageBucket: "bcs-website-assets.appspot.com",
  messagingSenderId: "1065298706004",
  appId: "1:1065298706004:web:cf5e5d578ae2d9af42b7c1",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Solana Connection
const connection = new Connection("https://api.testnet.sonic.game", "confirmed");

// Relayer Wallet (Loads from ENV)
const RELAYER_PRIVATE_KEY = JSON.parse(process.env.RELAYER_PRIVATE_KEY || "[]");
const relayerWallet = Keypair.fromSecretKey(new Uint8Array(RELAYER_PRIVATE_KEY));

/** Define request types */
interface RequestBody {
  action: "get-ads" | "engage-ad" | "sponsor-gas" | "check-engagement" | "mark-used-engagement";
  userPubkey?: string;
  gasAmount?: number;
  adId?: string;
  serializedTx?: string;
}

/** Handle CORS Preflight Requests */
export async function OPTIONS(): Promise<Response> {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Allow all origins (Change in production)
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

/** Fetch Ads from Firestore */
async function getAds() {
  const adsRef = collection(db, "ads");
  const adsSnapshot = await getDocs(adsRef);
  return adsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/** Mark User as Engaged with Ad */
async function engageAd(userPubkey: string, adId: string) {
  const adDocRef = doc(db, "ads", adId);
  await updateDoc(adDocRef, { engagedUsers: arrayUnion(userPubkey) });
}

/** Check if User has Engaged with Any Ad */
async function checkEngagement(userPubkey: string) {
  const adsRef = collection(db, "ads");
  const adsSnapshot = await getDocs(adsRef);

  for (const doc of adsSnapshot.docs) {
    const adData = doc.data();
    if (adData.engagedUsers?.includes(userPubkey)) {
      return { success: true, hasEngaged: true };
    }
  }

  return { success: true, hasEngaged: false };
}

/** Sponsor Gas Fee */
// Backend: Sponsor Gas Fee
async function sponsorGas(userPubkey: string, serializedTx: string) {
  try {
    // 1. Deserialize the transaction
    const transaction = Transaction.from(Buffer.from(serializedTx, "base64"));

    // 2. Log the transaction before signing (for debugging)
    console.log("Transaction before relayer signs:", transaction);

    // 3. Add the relayer's signature
    transaction.partialSign(relayerWallet);

    // 4. Log the transaction after signing (for debugging)
    console.log("Transaction after relayer signs:", transaction);

    // 5. Serialize the partially signed transaction
    const partiallySignedTx = transaction.serialize({ requireAllSignatures: false }).toString("base64");

    return {
      success: true,
      serializedTx: partiallySignedTx,
    };
  } catch (error) {
    console.error("Error in sponsorGas:", error);
    return { success: false, error: "Failed to sponsor gas" };
  }
}

/** Mark User's Engagement as Used */
async function markUsedEngagement(userPubkey: string) {
  try {
    const adsRef = collection(db, "ads");
    const adsSnapshot = await getDocs(adsRef);

    for (const doc of adsSnapshot.docs) {
      const adData = doc.data();
      if (adData.engagedUsers?.includes(userPubkey)) {
        await updateDoc(doc.ref, { usedEngagement: arrayUnion(userPubkey) });
        return { success: true };
      }
    }

    return { success: false, error: "User has not engaged with any ads" };
  } catch (error) {
    console.error("Error in markUsedEngagement:", error);
    return { success: false, error: "Failed to mark engagement as used" };
  }
}

/** API Handler */
export async function POST(req: Request): Promise<Response> {
  try {
    const body: RequestBody = await req.json();
    const { action, userPubkey, gasAmount, adId, serializedTx } = body;

    if (!action) return NextResponse.json({ error: "Missing action type" }, { status: 400 });

    let response;
    if (action === "get-ads") {
      response = { success: true, ads: await getAds() };
    } else if (action === "engage-ad") {
      if (!userPubkey || !adId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      await engageAd(userPubkey, adId);
      response = { success: true, message: "Ad engagement recorded" };
    } else if (action === "check-engagement") {
      if (!userPubkey) return NextResponse.json({ error: "Missing userPubkey" }, { status: 400 });
      response = await checkEngagement(userPubkey);
    } else if (action === "sponsor-gas") {
      if (!userPubkey || !serializedTx) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }
      response = await sponsorGas(userPubkey, serializedTx);
    } else if (action === "mark-used-engagement") {
      if (!userPubkey) return NextResponse.json({ error: "Missing userPubkey" }, { status: 400 });
      response = await markUsedEngagement(userPubkey);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow all origins (change this in production)
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}