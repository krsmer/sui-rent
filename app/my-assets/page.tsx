"use client";

import React from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import AssetCard from '../components/AssetCard';
import useMyAssets from '../hooks/useMyAssets';
import { useMarketplace } from '../hooks/useMarketplace';

export default function MyAssetsPage() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { listAsset } = useMarketplace();
  
  console.log("🔐 Current account:", account);
  console.log("📍 Account address:", account?.address);
  
  const { data: assets, isLoading, error, refetch } = useMyAssets(account?.address);

  const handleListForRent = (assetId: string, price: string) => {
    listAsset(assetId, price).then((tx) => {
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("Asset listed successfully:", result);
            alert("Asset listed for rent!");
            // Varlıkları yeniden yükle
            refetch();
          },
          onError: (error) => {
            console.error("Error listing asset:", error);
            alert("Error listing asset.");
          },
        }
      );
    });
  };

  // Hook çağrılarından sonra koşullu render işlemleri yapılır.
  if (!account) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
        <p className="text-gray-500 mt-2">Please connect your wallet to view your assets.</p>
      </main>
    );
  }

  if (isLoading) {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold">Loading your assets...</h1>
            <p className="text-gray-500 mt-2">Address: {account.address}</p>
        </main>
    )
  }

  if (error) {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold text-red-600">Error loading assets</h1>
            <p className="text-gray-500 mt-2">{error.message}</p>
            <p className="text-sm text-gray-400 mt-2">Address: {account.address}</p>
        </main>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">My Assets</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4 text-sm">
        <p><strong>Wallet:</strong> {account.address}</p>
        <p><strong>Assets found:</strong> {assets?.length || 0}</p>
      </div>
      
      {assets && assets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <AssetCard 
                key={asset.id} 
                asset={asset} 
                isOwner={true} 
                onListForRent={handleListForRent}
              />
            ))}
          </div>
        ) : (
          <p className='text-center'>You currently don't own any assets.</p>
        )}
    </div>
  );
}
