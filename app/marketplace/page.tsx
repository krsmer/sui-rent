"use client";

import React from 'react';
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Store, Search, Package } from 'lucide-react';
import AssetCard from '../components/AssetCard';
import useListedAssets from '../hooks/useListedAssets';
import { useMarketplace } from '../hooks/useMarketplace';
import { Asset } from '../hooks/useMyAssets';
import { FadeIn } from '@/components/fade-in';
import { StaggerContainer } from '@/components/stagger-container';
import { Card } from '@/components/ui/card';

export default function MarketplacePage() {
  const { data: listedAssets, isLoading, error, refetch } = useListedAssets();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { rentAsset } = useMarketplace();

  const handleRent = async (assetId: string, assetType: string, days: number, totalPrice: string) => {
    // assetId buraya geldiğinde aslında asset'in gerçek ID'si
    const listing = listedAssets?.find(la => la.assetId === assetId);
    if (!listing) {
      alert("Listing not found!");
      return;
    }

    // rentAsset'e listing.listingId göndermemiz lazım çünkü Move contract'ta bu ID ile listing bulunuyor
    rentAsset(listing.listingId, assetType, days, totalPrice).then((tx) => {
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("Asset rented successfully:", result);
            alert(`Asset rented for ${days} day(s)!`);
            refetch();
          },
          onError: (error) => {
            console.error("Error renting asset:", error);
            alert("Error renting asset.");
          },
        }
      );
    });
  };

  if (isLoading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          <h1 className="text-2xl font-bold text-muted-foreground">Loading marketplace...</h1>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="p-8 border-destructive">
          <div className="flex flex-col items-center gap-4">
            <Package className="h-16 w-16 text-destructive" />
            <h1 className="text-2xl font-bold text-destructive">Error loading marketplace</h1>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </Card>
      </main>
    );
  }

  // ListedAsset tipini AssetCard'ın beklediği Asset tipine dönüştür
  const assetsToDisplay: Array<Asset & { pricePerDay: bigint, listingId: string }> = listedAssets?.map(la => ({
    id: la.assetId,
    name: la.name,
    description: la.description,
    url: la.url,
    owner: la.owner,
    type: la.type, // Asset tipi eklendi
    pricePerDay: la.pricePerDay,
    listingId: la.listingId,
  })) || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <FadeIn>
        <div className="flex items-center justify-center gap-3 mb-4">
          
          <h1 className="text-5xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Marketplace
          </h1>
        </div>
        <p className="text-center text-muted-foreground text-lg mb-12">
          Browse and rent NFTs from other users
        </p>
      </FadeIn>
      
      {assetsToDisplay.length > 0 ? (
        <StaggerContainer staggerDelay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
            {assetsToDisplay.map((asset) => (
              <FadeIn key={asset.id} delay={0.05} className="h-full">
                <AssetCard 
                  asset={asset} 
                  isOwner={false}
                  onRent={handleRent}
                />
              </FadeIn>
            ))}
          </div>
        </StaggerContainer>
      ) : (
        <FadeIn delay={0.2}>
          <Card className="p-16">
            <div className="flex flex-col items-center gap-4">
              <Search className="h-20 w-20 text-muted-foreground/50" />
              <p className="text-center text-2xl font-semibold text-muted-foreground">
                No assets are currently listed for rent
              </p>
              <p className="text-center text-muted-foreground">
                Check back later or list your own NFTs!
              </p>
            </div>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
