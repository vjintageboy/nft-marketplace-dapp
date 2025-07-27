import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { getApi } from '@/lib/stacks-api';
import { useNetwork } from '@/lib/use-network';
import { getMockNftHoldings } from '@/lib/mock-data';

// Custom hook to fetch NFT holdings for a given address
export const useNftHoldings = (address?: string): UseQueryResult<any> => {
  const network = useNetwork();

  return useQuery<any>({
    queryKey: ['nftHoldings', address],
    queryFn: async () => {
      if (!address) throw new Error('Address is required');
      
      // Use mock data if enabled
      if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        console.log('Using mock data for NFT holdings');
        return getMockNftHoldings(address);
      }
      
      if (!network) throw new Error('Network is required');
      const api = getApi(network).nonFungibleTokensApi;
      const response = await api.getNftHoldings(address);
      return response;
    },
    enabled: !!address,
    retry: false,
    // Refetch every 10 seconds and whenever the window regains focus
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
};
