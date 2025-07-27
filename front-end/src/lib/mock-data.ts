import { Listing } from './marketplace/operations';

// Mock listings for testing when devnet is not available
export const mockListings: Listing[] = [
  {
    id: 0,
    maker: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    taker: null,
    tokenId: 1,
    nftAssetContract: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.funny-dog',
    expiry: 999999999,
    price: 1000000, // 1 STX in microSTX
    paymentAssetContract: null,
  },
  {
    id: 1,
    maker: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    taker: null,
    tokenId: 2,
    nftAssetContract: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.funny-dog',
    expiry: 999999999,
    price: 2500000, // 2.5 STX in microSTX
    paymentAssetContract: null,
  },
  {
    id: 2,
    maker: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
    taker: null,
    tokenId: 3,
    nftAssetContract: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.funny-dog',
    expiry: 999999999,
    price: 750000, // 0.75 STX in microSTX
    paymentAssetContract: null,
  },
  {
    id: 3,
    maker: 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND',
    taker: null,
    tokenId: 4,
    nftAssetContract: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.funny-dog',
    expiry: 999999999,
    price: 5000000, // 5 STX in microSTX
    paymentAssetContract: null,
  },
  {
    id: 4,
    maker: 'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB',
    taker: null,
    tokenId: 5,
    nftAssetContract: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.funny-dog',
    expiry: 999999999,
    price: 1750000, // 1.75 STX in microSTX
    paymentAssetContract: null,
  },
];

// Helper function to get mock NFT holdings
export const getMockNftHoldings = (address: string) => {
  const allNfts = [
    {
      token_id: 1,
      asset_identifier: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.funny-dog::funny-dog',
      value: { hex: '0x01', repr: 'u1' },
    },
    {
      token_id: 2,
      asset_identifier: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.funny-dog::funny-dog',
      value: { hex: '0x02', repr: 'u2' },
    },
    {
      token_id: 3,
      asset_identifier: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.funny-dog::funny-dog',
      value: { hex: '0x03', repr: 'u3' },
    },
    {
      token_id: 4,
      asset_identifier: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.funny-dog::funny-dog',
      value: { hex: '0x04', repr: 'u4' },
    },
    {
      token_id: 5,
      asset_identifier: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.funny-dog::funny-dog',
      value: { hex: '0x05', repr: 'u5' },
    },
    {
      token_id: 6,
      asset_identifier: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.funny-dog::funny-dog',
      value: { hex: '0x06', repr: 'u6' },
    },
  ];

  // Return different NFTs for different addresses
  switch (address) {
    case 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM':
      return { results: [allNfts[5]] }; // NFT #6
    case 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG':
      return { results: [allNfts[0]] }; // NFT #1
    case 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC':
      return { results: [allNfts[1]] }; // NFT #2
    default:
      return { results: [] };
  }
};
