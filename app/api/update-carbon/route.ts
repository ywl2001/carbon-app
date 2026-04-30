import { NextRequest, NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { generateExplanation } from "@/lib/explanation";

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
    const { userAddress, steps, tokenURI } = body as {
      userAddress?: string;
      steps?: number;
      tokenURI?: string;
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

    const explanation = generateExplanation(steps);
    const score = explanation.score;
    const levelData = calculateLevel(score);

    const today = getTaipeiDate();
    const yesterdayDate = getTaipeiDate(-1);

    let previousMetadata: any = null;

    if (tokenURI) {
      previousMetadata = await fetchMetadata(tokenURI);
    }

    const prevStreak = Number(getAttr(previousMetadata, "Streak") || 0);
    const lastDate = getAttr(previousMetadata, "Last Updated Date");

    let streak = 0;

    if (steps >= 8000) {
      if (lastDate === today) {
        streak = prevStreak > 0 ? prevStreak : 1;
      } else if (lastDate === yesterdayDate) {
        streak = prevStreak + 1;
      } else {
        streak = 1;
      }
    } else {
      streak = 0;
    }

    const svg = generateSVG(score, levelData.label, steps);

    const imageBase64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

    const metadata = {
      name: "Carbon Identity",
      description: explanation.message, // ⭐用 explanation

      image: imageBase64,

      attributes: [
        {
          trait_type: "Carbon Score",
          value: explanation.score,
        },
        {
          trait_type: "Level",
          value: levelData.label,
        },
        {
          trait_type: "Steps",
          value: steps,
        },
        {
          trait_type: "CO2 Reduction",
          value: explanation.co2Reduction,
        },
        {
          trait_type: "Methodology",
          value: "v1-steps-proxy",
        },
        {
          trait_type: "Streak",
          value: streak,
        },
        {
          trait_type: "Last Updated Date",
          value: today,
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
      explanation,
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

function generateSVG(score: number, levelLabel: string, steps: number) {
  return `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <style>
          .title { font: bold 24px sans-serif; fill: #111; }
          .label { font: 16px sans-serif; fill: #555; }
          .value { font: bold 22px sans-serif; fill: #0a7; }
        </style>
  
        <rect width="100%" height="100%" fill="#f8fafc"/>
        
        <text x="50%" y="60" text-anchor="middle" class="title">
          Carbon Identity
        </text>
  
        <text x="50%" y="120" text-anchor="middle" font-size="48">
          ${levelLabel === "Seed" ? "🌱" : levelLabel === "Green" ? "🌿" : "🌳"}
        </text>
  
        <text x="50%" y="200" text-anchor="middle" class="label">
          Score
        </text>
        <text x="50%" y="230" text-anchor="middle" class="value">
          ${score}
        </text>
  
        <text x="50%" y="270" text-anchor="middle" class="label">
          Steps
        </text>
        <text x="50%" y="300" text-anchor="middle" class="value">
          ${steps}
        </text>
      </svg>
    `;
}

async function fetchMetadata(uri: string) {
  try {
    const url = uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function getAttr(metadata: any, key: string) {
  return metadata?.attributes?.find((a: any) => a.trait_type === key)?.value;
}

function getTaipeiDate(offsetDays = 0) {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  const date = new Date(Date.UTC(year, month - 1, day + offsetDays));
  return date.toISOString().slice(0, 10);
}