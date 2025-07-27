import { NextRequest, NextResponse } from 'next/server';

// NFT metadata template
const generateMetadata = (tokenId: string) => {
  const id = parseInt(tokenId);
  
  // Handle case where ID might be out of range
  const imageId = id % 13; // We have images 0-12
  
  return {
    name: `Funny Dog #${id}`,
    description: `A unique and funny dog NFT from the Funny Dog collection. Each dog has its own personality and charm!`,
    image: `http://localhost:3000/images/dogs/${imageId}.webp`,
    external_url: `http://localhost:3000/nft/${id}`,
    attributes: [
      {
        trait_type: "Collection",
        value: "Funny Dogs"
      },
      {
        trait_type: "Rarity", 
        value: getRarity(imageId)
      },
      {
        trait_type: "Dog Type",
        value: getDogType(imageId)
      },
      {
        trait_type: "Color",
        value: getDogColor(imageId)
      }
    ]
  };
};

// Helper functions for attributes
const getRarity = (id: number): string => {
  if (id < 3) return "Legendary";
  if (id < 6) return "Epic"; 
  if (id < 10) return "Rare";
  return "Common";
};

const getDogType = (id: number): string => {
  const types = [
    "Golden Retriever", "Bulldog", "Poodle", "German Shepherd",
    "Labrador", "Beagle", "Rottweiler", "Yorkshire Terrier",
    "Dachshund", "Siberian Husky", "Shiba Inu", "Border Collie", "Corgi"
  ];
  return types[id] || "Mixed Breed";
};

const getDogColor = (id: number): string => {
  const colors = [
    "Golden", "Brown", "White", "Black", "Chocolate",
    "Tan", "Gray", "Cream", "Red", "Blue", "Silver", "Brindle", "Tri-color"
  ];
  return colors[id] || "Multi-color";
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Validate token ID
    const tokenId = parseInt(id);
    if (isNaN(tokenId) || tokenId < 1) {
      return NextResponse.json(
        { error: "Invalid token ID" },
        { status: 400 }
      );
    }

    const metadata = generateMetadata(id);
    
    return NextResponse.json(metadata, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
