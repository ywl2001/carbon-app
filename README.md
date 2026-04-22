# 🌱 Carbon Identity (Dynamic Carbon SBT)

A behavior-driven on-chain identity system that transforms real-world actions into a dynamic, non-transferable blockchain identity.

---

## 🚀 Overview

Carbon Identity is a full-stack Web3 application that maps user behavior (e.g. daily steps) into an evolving on-chain identity.

Instead of representing ownership like traditional NFTs, this system represents:

> **Who you are, based on what you do**

The identity is continuously updated through a pipeline that synchronizes:

- User input (behavior)
- Computed score & level
- Metadata stored on IPFS
- On-chain identity state

---

## 🧠 Core Concept

User Behavior (Steps)
→ Score & Level Calculation
→ Metadata Generation
→ Upload to IPFS
→ Smart Contract Update
→ On-chain Identity

This creates a **closed-loop identity system** between real-world data and blockchain state.

---

## 🧩 Key Features

### 🔒 Soulbound Identity (SBT)

- Non-transferable ERC-721 token
- One identity per wallet
- Represents identity, not ownership

### 🔄 Dynamic Updates

- Score and level evolve over time
- Metadata is regenerated and re-uploaded to IPFS
- Token URI is updated on-chain

### 🌐 Full-Stack Integration

- Frontend (Next.js)
- Backend API (Next.js Route)
- Smart contract (Solidity)
- IPFS storage (Pinata)

### ⚡ Real-time Interaction

- Users input steps directly in UI
- System updates identity in one flow
- No manual scripts required

---

## 🏗️ Tech Stack


| Layer          | Technology             |
| -------------- | ---------------------- |
| Frontend       | Next.js + React        |
| Backend API    | Next.js Route Handlers |
| Smart Contract | Solidity (ERC-721 SBT) |
| Network        | Ethereum (Sepolia)     |
| Storage        | IPFS (Pinata)          |
| Web3           | ethers.js              |


---

## 📁 Project Structure

carbon-app/
app/
page.tsx
api/
update-carbon/route.ts

lib/
contract.ts

carbon-sbt-contract/
contracts/
CarbonSBT.sol

scripts/
deploy.cjs
mint.cjs
updateWithMetadata.cjs

---

## ⚙️ How It Works

### 1. Connect Wallet

User connects MetaMask to the app.

### 2. Load Identity

Frontend fetches:

- Token ID
- Score
- Level
- Token URI
- Metadata (from IPFS)

### 3. Update from Steps

User inputs daily steps:
e.g. 9200 steps

### 4. Backend Processing

API route performs:

Calculate score & level
Generate metadata JSON
Upload metadata to IPFS
Call smart contract (updateCarbonData)
5. On-chain Sync
Score & level updated
Token URI updated
Metadata reflects latest state

---

## 📊 Example Metadata

{
  "name": "Carbon Identity",
  "description": "Dynamic Carbon Identity",
  "attributes": [
    { "trait_type": "Carbon Score", "value": 9 },
    { "trait_type": "Level", "value": "Pro" },
    { "trait_type": "Steps", "value": 9200 }
  ]
}

---

## 🎯 Demo Flow

Open app (localhost:3000)
Click Connect Wallet
View current identity
Enter steps (e.g. 9200)
Click Update Carbon Identity
Confirm transaction (MetaMask)
Identity updates instantly:
Score changes
Level changes
Metadata updates

---

## 🔐 Security Design

Private keys stored in .env.local (server-side only)
Pinata API keys are never exposed to frontend
Smart contract restricted by onlyOwner

---

## 🧪 Current Status

✅ MVP Completed

The system successfully demonstrates:

Behavior → Identity mapping
Dynamic metadata generation
IPFS + blockchain synchronization
Full-stack Web3 integration

---

## 🌍 Use Cases

ESG identity layer
Sustainable lifestyle tracking
Reputation systems
Green membership programs
Future DeFi credit scoring

---

## 🔮 Future Roadmap

1. Real Data Integration

Apple Health / Google Fit
Automated step tracking
2. Dynamic Visual Identity
Level-based identity cards
SVG / on-chain generated visuals
3. Reward Mechanism
Discounts / perks based on level
Token incentives
4. ZK / Oracle Integration
Verifiable real-world data
Trustless data validation

---

## 💡 Key Insight

Identity is not what you own, but what you do.

This project explores a new paradigm where:

Behavior defines identity
Identity evolves over time
Blockchain becomes a trust layer for real-world actions

---

## 👤 Author

Nina
Blockchain / ESG / Identity Systems