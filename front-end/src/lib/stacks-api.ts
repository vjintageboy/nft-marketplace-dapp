import { DEVNET_STACKS_BLOCKCHAIN_API_URL } from '@/constants/devnet';
import { isDevnetEnvironment, isTestnetEnvironment } from './use-network';
import { Network } from '@/lib/network';

type HTTPHeaders = Record<string, string>;

export function getApiUrl(network: Network) {
  if (isDevnetEnvironment()) {
    return DEVNET_STACKS_BLOCKCHAIN_API_URL || 'http://localhost:3999';
  }
  if (isTestnetEnvironment(network)) {
    return 'https://api.testnet.hiro.so';
  }
  return 'https://api.mainnet.hiro.so';
}

export function getApiHeaders(): HTTPHeaders {
  const apiKey = process.env.NEXT_PUBLIC_PLATFORM_HIRO_API_KEY || '';
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  };
}

export async function fetchFromStacksApi(network: Network, endpoint: string) {
  const baseUrl = getApiUrl(network);
  const headers = getApiHeaders();
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
  // Legacy function for backward compatibility
export function getApi(network: Network) {
  return {
    smartContractsApi: {
      async callReadOnlyFunction(contractAddress: string, contractName: string, functionName: string, args: any[] = []) {
        const endpoint = `/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;
        return fetchFromStacksApi(network, endpoint);
      }
    },
    accountsApi: {
      async getAccountNonces(address: string) {
        return fetchFromStacksApi(network, `/extended/v1/address/${address}/nonces`);
      }
    },
    nonFungibleTokensApi: {
      async getNftHoldings(address: string) {
        return fetchFromStacksApi(network, `/extended/v1/address/${address}/nft-holdings`);
      }
    }
  };
}