'use client';

import { openContractCall } from '@/lib/contract-utils';
import {
  CardFooter,
  Heading,
  Stack,
  CardBody,
  Card,
  useToast,
  Button,
  Text,
  Image,
  Box,
  Flex,
  Link,
  Badge,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { cancelListing, purchaseListingStx } from '@/lib/marketplace/operations';
import { useContext, useState, useEffect } from 'react';
import { HiroWalletContext } from '../HiroWalletProvider';
import { shouldUseDirectCall } from '@/lib/contract-utils';
import { executeContractCall } from '@/lib/contract-utils';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
// import { useGetTxId } from '@/hooks/useNftHoldings';
import { formatContractName } from '@/utils/formatting';
import { getPlaceholderImage } from '@/utils/nft-utils';
import { useNetwork } from '@/lib/use-network';
import { useCurrentAddress } from '@/hooks/useCurrentAddress';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { getExplorerLink } from '@/utils/explorer-links';
import { NftImage } from './NftImage';

interface ListingCardProps {
  listing: {
    id: number;
    maker: string;
    taker: string | null;
    tokenId: number;
    nftAssetContract: string;
    expiry: number;
    price: number;
    paymentAssetContract: string | null;
  };
  onRefresh: () => void;
}

export const ListingCard = ({ listing, onRefresh }: ListingCardProps) => {
  const { testnetAddress, mainnetAddress } = useContext(HiroWalletContext);
  const { currentWallet } = useDevnetWallet();
  const toast = useToast();
  const [purchaseTxId, setPurchaseTxId] = useState<string | null>(null);
  const network = useNetwork();
  const currentAddress = useCurrentAddress();
  // const { data: txData } = useGetTxId(purchaseTxId || '');
  const txData = null; // Temporary mock

  useEffect(() => {
    // @ts-ignore
    if (txData && txData.tx_status === 'success') {
      toast({
        title: 'Purchase Confirmed',
        description: 'Your purchase has been confirmed on the blockchain',
        status: 'success',
      });
      onRefresh();
      setPurchaseTxId(null);
      // @ts-ignore
    } else if (txData && txData.tx_status === 'abort_by_response') {
      toast({
        title: 'Purchase Failed',
        description: 'The transaction was aborted',
        status: 'error',
      });
      setPurchaseTxId(null);
    }
  }, [txData, toast, onRefresh]);

  const handlePurchase = async () => {
    if (!network || !currentAddress) return;
    try {
      const txOptions = await purchaseListingStx(network, currentAddress, listing);

      if (shouldUseDirectCall()) {
        const { txid } = await executeContractCall(txOptions, currentWallet);
        setPurchaseTxId(txid);
        toast({
          title: 'Purchase Submitted',
          description: `Transaction broadcast with ID: ${txid}`,
          status: 'info',
        });
        return;
      }

      await openContractCall({
        ...txOptions,
        onFinish: () => {
          toast({
            title: 'Success',
            description: 'Purchase submitted!',
            status: 'success',
          });
          onRefresh();
        },
        onCancel: () => {
          toast({
            title: 'Cancelled',
            description: 'Transaction was cancelled',
            status: 'info',
          });
        },
      });
    } catch (e) {
      console.error(e);
      toast({
        title: 'Error',
        description: 'Failed to purchase NFT',
        status: 'error',
      });
    }
  };

  const handleCancel = async () => {
    if (listing.maker !== currentAddress) return;
    if (!network) return;

    try {
      const txOptions = await cancelListing(network, listing);

      await openContractCall({
        ...txOptions,
        onFinish: (data) => {
          toast({
            title: 'Success',
            description: 'Listing cancelled successfully',
            status: 'success',
          });
          onRefresh();
        },
        onCancel: () => {
          toast({
            title: 'Cancelled',
            description: 'Transaction was cancelled',
            status: 'info',
          });
        },
      });
    } catch (e) {
      console.error(e);
      toast({
        title: 'Error',
        description: 'Failed to cancel listing',
        status: 'error',
      });
    }
  };

  if (!network) return null;

  const isOwner = currentAddress === listing.maker;
  const priceInStx = listing.price / 1000000;

  return (
    <Card
      maxW="sm"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
      overflow="hidden"
      boxShadow="md"
      bg="white"
      borderRadius="xl"
    >
      <CardBody p={0}>
        <Box position="relative">
          <NftImage 
            tokenId={listing.tokenId} 
            contractId={listing.nftAssetContract}
            size="100%"
          />
          {isOwner && (
            <Badge
              position="absolute"
              top={2}
              right={2}
              colorScheme="green"
              fontSize="xs"
              borderRadius="md"
            >
              Your NFT
            </Badge>
          )}
        </Box>
        
        <VStack spacing={3} p={4} align="stretch">
          <VStack spacing={1} align="start">
            <Heading size="md" color="gray.800">
              {formatContractName(listing.nftAssetContract)} #{listing.tokenId}
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Collection: {formatContractName(listing.nftAssetContract)}
            </Text>
          </VStack>

          <HStack justify="space-between" align="center">
            <VStack spacing={0} align="start">
              <Text fontSize="xs" color="gray.400">Price</Text>
              <Text color="orange.500" fontWeight="bold" fontSize="lg">
                {priceInStx} STX
              </Text>
            </VStack>
            <VStack spacing={0} align="end">
              <Text fontSize="xs" color="gray.400">Seller</Text>
              <Text fontSize="sm" color="gray.600">
                {listing.maker.slice(0, 6)}...{listing.maker.slice(-4)}
              </Text>
            </VStack>
          </HStack>

          {listing.taker && (
            <HStack>
              <Badge colorScheme="blue" fontSize="xs">
                Reserved for: {listing.taker.slice(0, 6)}...
              </Badge>
            </HStack>
          )}
        </VStack>
      </CardBody>
      
      <CardFooter pt={0} px={4} pb={4}>
        <VStack spacing={3} width="100%">
          {isOwner ? (
            <Button 
              colorScheme="red" 
              variant="outline"
              onClick={handleCancel}
              width="100%"
              size="sm"
            >
              Cancel Listing
            </Button>
          ) : (
            <Button
              colorScheme="orange"
              onClick={handlePurchase}
              isLoading={!!purchaseTxId && !txData}
              loadingText="Purchasing..."
              width="100%"
              size="lg"
              fontSize="md"
              fontWeight="bold"
            >
              Buy for {priceInStx} STX
            </Button>
          )}
          
          {purchaseTxId && (
            <Link
              href={getExplorerLink(purchaseTxId, network)}
              isExternal
              color="blue.500"
              fontSize="sm"
              _hover={{ textDecoration: 'underline' }}
            >
              View transaction <ExternalLinkIcon mx="2px" />
            </Link>
          )}
        </VStack>
      </CardFooter>
    </Card>
  );
};
