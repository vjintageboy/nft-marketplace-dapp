import { useState, useEffect } from 'react';
import { Box, Image, Text, VStack, Skeleton, HStack, Badge } from '@chakra-ui/react';

interface NftImageProps {
  tokenId: number;
  contractId: string;
  size?: string;
}

interface NftMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export const NftImage = ({ tokenId, contractId, size = "200px" }: NftImageProps) => {
  const [metadata, setMetadata] = useState<NftMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For funny-dog contract, we know the metadata structure
        if (contractId.includes('funny-dog')) {
          const response = await fetch(`/api/dogs/${tokenId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch metadata');
          }
          const data = await response.json();
          setMetadata(data);
        } else {
          // For other contracts, use placeholder
          setMetadata({
            name: `NFT #${tokenId}`,
            description: 'NFT from collection',
            image: `/images/dogs/${tokenId % 13}.webp`, // Use cycling images
            attributes: []
          });
        }
      } catch (err) {
        console.error('Error fetching NFT metadata:', err);
        setError('Failed to load NFT data');
        // Fallback metadata
        setMetadata({
          name: `NFT #${tokenId}`,
          description: 'NFT from collection',
          image: `/images/dogs/${tokenId % 13}.webp`,
          attributes: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [tokenId, contractId]);

  if (loading) {
    return (
      <VStack spacing={2}>
        <Skeleton>
          <Box width={size} height={size} />
        </Skeleton>
        <Skeleton height="20px" width="120px" />
      </VStack>
    );
  }

  if (error && !metadata) {
    return (
      <VStack spacing={2}>
        <Box 
          width={size} 
          height={size} 
          bg="gray.200" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          borderRadius="md"
        >
          <Text fontSize="sm" color="gray.500">Failed to load</Text>
        </Box>
        <Text fontSize="sm" fontWeight="bold">NFT #{tokenId}</Text>
      </VStack>
    );
  }

  return (
    <Box width="100%">
      <Box aspectRatio={1} overflow="hidden" borderRadius="lg">
        <Image
          src={metadata?.image}
          alt={metadata?.name || `NFT #${tokenId}`}
          width="100%"
          height="100%"
          objectFit="cover"
          fallbackSrc={`/images/dogs/${tokenId % 13}.webp`}
        />
      </Box>
      <VStack spacing={2} p={3} align="start">
        <Text fontSize="md" fontWeight="bold" color="gray.800">
          {metadata?.name || `NFT #${tokenId}`}
        </Text>
        {metadata?.attributes && metadata.attributes.length > 0 && (
          <HStack spacing={2} flexWrap="wrap">
            {metadata.attributes.slice(0, 2).map((attr, index) => (
              <Badge key={index} fontSize="xs" colorScheme="blue" variant="subtle">
                {attr.value}
              </Badge>
            ))}
          </HStack>
        )}
      </VStack>
    </Box>
  );
};
