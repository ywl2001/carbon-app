import { NextRequest, NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as string;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL as string;
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const CONTRACT_ABI = [
  "function hasMinted(address) view returns (bool)",
  "function mint(address to, string metadataURI, uint256 initialScore, uint256 initialLevel)",
];

function buildInitialSvg(score: number, levelLabel: string) {
  const emoji =
    levelLabel === "Seed" ? "🌱" : levelLabel === "Green" ? "🌿" : "🌳";

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

      <text x="50%" y="130" text-anchor="middle" font-size="56">
        ${emoji}
      </text>

      <text x="50%" y="220" text-anchor="middle" class="label">
        Score
      </text>
      <text x="50%" y="250" text-anchor="middle" class="value">
        ${score}
      </text>

      <text x="50%" y="300" text-anchor="middle" class="label">
        Status
      </text>
      <text x="50%" y="330" text-anchor="middle" class="value">
        ${levelLabel}
      </text>
    </svg>
  `;
}

async function uploadToIPFS(metadata: unknown) {
  const PINATA_API_KEY = process.env.PINATA_API_KEY as string;
  const PINATA_API_SECRET = process.env.PINATA_API_SECRET as string;

  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    throw new Error("Missing Pinata environment variables.");
  }

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
    if (!CONTRACT_ADDRESS || !SEPOLIA_RPC_URL || !PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Missing required environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { userAddress } = body as { userAddress?: string };

    if (!userAddress || typeof userAddress !== "string") {
      return NextResponse.json(
        { error: "Invalid userAddress." },
        { status: 400 }
      );
    }

    const provider = new JsonRpcProvider(SEPOLIA_RPC_URL);
    const signer = new Wallet(PRIVATE_KEY, provider);
    const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const alreadyMinted = await contract.hasMinted(userAddress);

    if (alreadyMinted) {
      return NextResponse.json(
        { error: "This address already has a Carbon Identity." },
        { status: 400 }
      );
    }

    const initialScore = 0;
    const initialLevel = 1;
    const levelLabel = "Seed";

    const explanation = {
      score: initialScore,
      co2Reduction: 0,
      message: "Carbon Identity created. Start updating your daily activity to grow your identity.",
      methodology: "v1-steps-proxy",
    };

    const svg = buildInitialSvg(initialScore, levelLabel);
    const imageBase64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

    const metadata = {
      name: "Carbon Identity",
      description: explanation.message,
      image: imageBase64,
      attributes: [
        {
          trait_type: "Carbon Score",
          value: initialScore,
        },
        {
          trait_type: "Level",
          value: levelLabel,
        },
        {
          trait_type: "Steps",
          value: 0,
        },
        {
          trait_type: "CO2 Reduction",
          value: 0,
        },
        {
          trait_type: "Methodology",
          value: "v1-steps-proxy",
        },
      ],
    };

    const metadataURI = await uploadToIPFS(metadata);

    const tx = await contract.mint(
      userAddress,
      metadataURI,
      initialScore,
      initialLevel
    );

    await tx.wait();

    return NextResponse.json({
      success: true,
      userAddress,
      metadataURI,
      initialScore,
      initialLevel,
      levelLabel,
      txHash: tx.hash,
      explanation,
    });
  } catch (error) {
    console.error("API create-identity error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create identity.",
      },
      { status: 500 }
    );
  }
}