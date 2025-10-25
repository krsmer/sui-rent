"use client";

import React from 'react';
import AssetCard from '../components/AssetCard';
import useListedAssets from '../hooks/useListedAssets';
import { Asset } from '../hooks/useMyAssets';

export default function MarketplacePage() {
  const { data: listedAssets, isLoading, error } = useListedAssets();

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
  const assetsToDisplay: Asset[] = listedAssets?.map(la => ({
    id: la.assetId,
    name: la.name,
    description: la.description,
    url: la.url,
    owner: '', // Pazar yerinde sahibi göstermek şimdilik gerekli değil
    // TODO: Fiyat bilgisini AssetCard'a ekleyip burada gösterebiliriz
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
              isOwner={false} // Kiracı olarak görüntülüyor
              // TODO: onRent prop'unu burada bağlayacağız
            />
          ))}
        </div>
      ) : (
        <p className='text-center'>No assets are currently listed for rent.</p>
      )}
    </div>
  );
}
