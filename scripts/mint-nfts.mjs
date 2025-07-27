#!/usr/bin/env node

import { callReadOnlyFunction, makeContractCall, broadcastTransaction, AnchorMode } from '@stacks/transactions';
import { StacksTestnet, StacksDevnet } from '@stacks/network';
import { createApiKeyAuth } from '@stacks/auth';

const API_KEY = '661b7bf685f9a9d87c9c9de0cd7888a0';
const DEVNET_URL = `https://api.platform.hiro.so/v1/ext/${API_KEY}/stacks-blockchain-api`;

// Devnet addresses from deployment plan
const addresses = [
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG', 
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
  'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND',
  'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB'
];

// Private keys for devnet addresses (these are public test keys)
const privateKeys = {
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM': '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601',
  'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG': '530d9f61984c888536871c6573073bdfc0058896dc1adfe9a6a10dfacadc209901',
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC': 'd655b2523bcd65e34889725c73064feb17ceb796831c0e111ba1a552b0f31b3901',
  'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND': 'f9d7206a47f14d2870c163ebab4bf3e70d18f5d14ce1031f3902fbbc894fe4c701',
  'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB': '3eccc5dac8056590432db6a35d52b9896876a3d5cbdea53b72400bc9c2099fe801'
};

async function mintNFTs() {
  const network = new StacksDevnet();
  network.coreApiUrl = DEVNET_URL;
  
  console.log('🎨 Starting NFT minting process...');
  
  // Check current last token ID
  try {
    const lastTokenResult = await callReadOnlyFunction({
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'funny-dog',
      functionName: 'get-last-token-id',
      functionArgs: [],
      network,
      senderAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    });
    
    console.log('📊 Current last token ID:', lastTokenResult);
  } catch (error) {
    console.error('❌ Error checking last token ID:', error);
    return;
  }

  // Mint NFTs for each address
  for (let i = 0; i < addresses.length; i++) {
    const recipient = addresses[i];
    const senderKey = privateKeys['ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'];
    
    try {
      console.log(`\n🎯 Minting NFT #${i + 2} for ${recipient.slice(0, 8)}...`);
      
      const txOptions = {
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        contractName: 'funny-dog',
        functionName: 'mint',
        functionArgs: [principalCV(recipient)],
        senderKey,
        network,
        anchorMode: AnchorMode.Any,
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction(transaction, network);
      
      console.log(`✅ Mint transaction broadcasted: ${result.txid}`);
      
      // Wait a bit between transactions
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Error minting for ${recipient}:`, error);
    }
  }
  
  console.log('\n🎉 Minting process completed!');
}

// Import required functions
import { principalCV } from '@stacks/transactions';

// Run the script
mintNFTs().catch(console.error);
