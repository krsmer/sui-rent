"use client";

import React from 'react';
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import AssetCard from '../components/AssetCard';
import useListedAssets from '../hooks/useListedAssets';
import { useMarketplace } from '../hooks/useMarketplace';
import { Asset } from '../hooks/useMyAssets';

export default function MarketplacePage() {
  const { data: listedAssets, isLoading, error, refetch } = useListedAssets();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { rentAsset } = useMarketplace();

  const handleRent = (assetId: string, days: number) => {
    // assetId burada aslında listingId. Bunu düzeltelim.
    const listing = listedAssets?.find(la => la.assetId === assetId);
    if (!listing) {
      alert("Listing not found!");
      return;
    }

    const pricePerDayInSUI = Number(listing.pricePerDay) / 1_000_000_000;
    const totalPrice = (pricePerDayInSUI * days).toFixed(9); // Yüksek hassasiyet

    rentAsset(listing.listingId, days, totalPrice).then((tx) => {
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
        <h1 className="text-2xl font-bold">Loading marketplace...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold">Error loading marketplace: {error.message}</h1>
      </main>
    );
  }

  // ListedAsset tipini AssetCard'ın beklediği Asset tipine dönüştür
  const assetsToDisplay: Array<Asset & { pricePerDay: bigint, listingId: string }> = listedAssets?.map(la => ({
    id: la.assetId,
    name: la.name,
    description: la.description,
    url: la.url,
    owner: '',
    pricePerDay: la.pricePerDay,
    listingId: la.listingId,
  })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Marketplace</h1>
      
      {assetsToDisplay.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {assetsToDisplay.map((asset) => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              isOwner={false}
              pricePerDay={asset.pricePerDay}
              onRent={handleRent}
            />
          ))}
        </div>
      ) : (
        <p className='text-center'>No assets are currently listed for rent.</p>
      )}
    </div>
  );
}
