export const CONTRACT_ADDRESS = "0xc4b771441f21b4e81454eD079edfD3b0503FFa2E";

export const CONTRACT_ABI = [
  "function hasMinted(address) view returns (bool)",
  "function getScore(address user) view returns (uint256)",
  "function getLevel(address user) view returns (uint256)",
  "function getTokenIdByOwner(address user) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function updateCarbonData(address user, uint256 newScore, uint256 newLevel, string newMetadataURI)",
];