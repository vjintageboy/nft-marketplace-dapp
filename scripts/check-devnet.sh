#!/bin/bash

API_KEY="661b7bf685f9a9d87c9c9de0cd7888a0"
BASE_URL="https://api.platform.hiro.so/v1/ext/$API_KEY/stacks-blockchain-api"

# Devnet addresses to mint NFTs for
addresses=(
  "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
  "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC" 
  "ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND"
  "ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB"
)

echo "🎨 Starting NFT minting via API calls..."

# Check current state first
echo "📊 Checking current last token ID..."
curl -s -H "Content-Type: application/json" \
  "$BASE_URL/v2/contracts/call-read/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM/funny-dog/get-last-token-id" \
  -X POST -d '{"sender":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","arguments":[]}' | jq

echo ""
echo "📋 Checking current listing nonce..."
curl -s -H "Content-Type: application/json" \
  "$BASE_URL/v2/contracts/call-read/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM/nft-marketplace/get-listing-nonce" \
  -X POST -d '{"sender":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","arguments":[]}' | jq

echo ""
echo "⚠️  Note: To mint NFTs, you need to:"
echo "1. Use Hiro Platform Dashboard to restart devnet with deployment plan"
echo "2. Or use Clarinet to deploy locally" 
echo "3. Or use a proper transaction signing script"

echo ""
echo "🔧 For now, let's check if the contracts are properly deployed..."

# Check if marketplace contract is whitelisted for funny-dog
echo "🔍 Checking if funny-dog is whitelisted in marketplace..."
curl -s -H "Content-Type: application/json" \
  "$BASE_URL/v2/contracts/call-read/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM/nft-marketplace/is-whitelisted" \
  -X POST -d '{
    "sender":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "arguments":["0x0516e1b7a794e36508bb3f8b43d2b6dc9e0a3c96cd3d68e5"]
  }' | jq

echo ""
echo "✅ Contract status check completed!"
echo "💡 To mint NFTs properly, restart devnet in Hiro Platform with the deployment plan"
