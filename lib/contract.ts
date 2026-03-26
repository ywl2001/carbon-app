export const CONTRACT_ADDRESS = "0xa6F0068DD8EF1D30713328e5D78C740ED3D586d4";

export const CONTRACT_ABI = [
  "function hasMinted(address) view returns (bool)",
  "function getLevel(address user) view returns (uint256)",
  "function getTokenIdByOwner(address user) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];