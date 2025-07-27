#!/bin/bash

echo "🏪 NFT Marketplace - Manual Listing Setup"
echo "========================================"
echo ""
echo "After devnet is deployed with the deployment plan, you'll have:"
echo "- ✅ 5 NFTs minted to different addresses"
echo "- ✅ Marketplace contract deployed"
echo "- ❌ But NO listings yet!"
echo ""
echo "To create listings manually:"
echo ""

cat << 'EOF'
1. 🌐 Open http://localhost:3000/my-nfts
2. 🔗 Connect your devnet wallet  
3. 🎨 You should see your NFTs
4. 💰 Click "List for Sale" on each NFT
5. 📝 Set price (e.g. 1 STX = 1000000 microSTX)
6. ⏰ Set expiry (e.g. block 999999)
7. ✅ Submit transaction

Example listing parameters:
- Price: 1000000 (= 1 STX)
- Expiry: 999999 (far future block)
- Taker: (leave empty for public sale)
EOF

echo ""
echo "🔧 Alternative: Use this script after devnet is ready:"
echo ""

cat << 'EOF'
# Check how many NFTs exist:
curl -s -H "Content-Type: application/json" \
  "https://api.platform.hiro.so/v1/ext/YOUR_API_KEY/stacks-blockchain-api/v2/contracts/call-read/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM/funny-dog/get-last-token-id" \
  -X POST -d '{"sender":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","arguments":[]}'

# Check marketplace listings:
curl -s -H "Content-Type: application/json" \
  "https://api.platform.hiro.so/v1/ext/YOUR_API_KEY/stacks-blockchain-api/v2/contracts/call-read/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM/nft-marketplace/get-listing-nonce" \
  -X POST -d '{"sender":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","arguments":[]}'
EOF

echo ""
echo "📝 After creating listings:"
echo "1. 🔄 Set NEXT_PUBLIC_USE_MOCK_DATA=false in .env"
echo "2. 🔃 Restart Next.js app"
echo "3. 🎉 Enjoy your real NFT marketplace!"
