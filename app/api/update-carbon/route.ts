import { NextRequest, NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as string;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL as string;
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const PINATA_API_KEY = process.env.PINATA_API_KEY as string;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET as string;

const CONTRACT_ABI = [
  "function updateCarbonData(address user, uint256 newScore, uint256 newLevel, string newMetadataURI)",
];

function calculateScore(steps: number) {
  return Math.min(Math.floor(steps / 1000), 10);
}

function calculateLevel(score: number) {
  if (score <= 3) return { level: 1, label: "Seed" };
  if (score <= 7) return { level: 2, label: "Green" };
  return { level: 3, label: "Pro" };
}

async function uploadToIPFS(metadata: unknown) {
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET,
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Pinata upload failed: ${errorText}`);
  }

  const data = await res.json();
  return `ipfs://${data.IpfsHash}`;
}

export async function POST(req: NextRequest) {
  try {
    if (
      !CONTRACT_ADDRESS ||
      !SEPOLIA_RPC_URL ||
      !PRIVATE_KEY ||
      !PINATA_API_KEY ||
      !PINATA_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Missing required environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { userAddress, steps } = body as {
      userAddress?: string;
      steps?: number;
    };

    if (!userAddress || typeof userAddress !== "string") {
      return NextResponse.json(
        { error: "Invalid userAddress." },
        { status: 400 }
      );
    }

    if (typeof steps !== "number" || !Number.isFinite(steps) || steps <= 0) {
      return NextResponse.json(
        { error: "Invalid steps. Must be a positive number." },
        { status: 400 }
      );
    }

    const score = calculateScore(steps);
    const levelData = calculateLevel(score);

    const metadata = {
      name: "Carbon Identity",
      description: "Dynamic Carbon Identity",
      image: "https://via.placeholder.com/300",
      attributes: [
        {
          trait_type: "Carbon Score",
          value: score,
        },
        {
          trait_type: "Level",
          value: levelData.label,
        },
        {
          trait_type: "Steps",
          value: steps,
        },
      ],
    };

    const metadataURI = await uploadToIPFS(metadata);

    const provider = new JsonRpcProvider(SEPOLIA_RPC_URL);
    const signer = new Wallet(PRIVATE_KEY, provider);
    const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const tx = await contract.updateCarbonData(
      userAddress,
      score,
      levelData.level,
      metadataURI
    );

    await tx.wait();

    return NextResponse.json({
      success: true,
      userAddress,
      steps,
      score,
      level: levelData.level,
      levelLabel: levelData.label,
      metadataURI,
      txHash: tx.hash,
    });
  } catch (error) {
    console.error("API update-carbon error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update Carbon SBT.",
      },
      { status: 500 }
    );
  }
}