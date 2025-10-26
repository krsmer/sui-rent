"use client";

import React, { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import AssetCard from '../components/AssetCard';
import useMyAssets from '../hooks/useMyAssets';
import useRentedAssets from '../hooks/useRentedAssets';
import useListedByMe from '../hooks/useListedByMe';
import { useMarketplace } from '../hooks/useMarketplace';

type TabType = 'owned' | 'rented' | 'listed';

export default function MyAssetsPage() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { listAsset, claimAsset, returnAsset } = useMarketplace();
  const [activeTab, setActiveTab] = useState<TabType>('owned');
  
  console.log("🔐 Current account:", account);
  console.log("📍 Account address:", account?.address);
  
  const { data: ownedAssets, isLoading: isLoadingOwned, error: errorOwned, refetch: refetchOwned } = useMyAssets(account?.address);
  const { data: rentedAssets, isLoading: isLoadingRented, error: errorRented, refetch: refetchRented } = useRentedAssets(account?.address);
  const { data: listedAssets, isLoading: isLoadingListed, error: errorListed, refetch: refetchListed } = useListedByMe(account?.address);

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
            refetchOwned();
            refetchListed();
          },
          onError: (error) => {
            console.error("Error listing asset:", error);
            alert("Error listing asset.");
          },
        }
      );
    });
  };

  const handleClaimBack = (assetId: string) => {
    claimAsset(assetId).then((tx) => {
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("Asset claimed successfully:", result);
            alert("Asset claimed back!");
            // Varlıkları yeniden yükle
            refetchOwned();
            refetchListed();
          },
          onError: (error) => {
            console.error("Error claiming asset:", error);
            alert("Error claiming asset. Make sure rental period has ended.");
          },
        }
      );
    });
  };

  const handleReturnAsset = (assetId: string) => {
    returnAsset(assetId).then((tx) => {
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("Asset returned successfully:", result);
            alert("Asset returned to marketplace!");
            // Varlıkları yeniden yükle
            refetchRented();
            refetchListed();
          },
          onError: (error) => {
            console.error("Error returning asset:", error);
            alert("Error returning asset. Make sure rental period has ended.");
          },
        }
      );
    });
  };

  const isLoading = activeTab === 'owned' ? isLoadingOwned : activeTab === 'rented' ? isLoadingRented : isLoadingListed;
  const error = activeTab === 'owned' ? errorOwned : activeTab === 'rented' ? errorRented : errorListed;
  const currentAssets = activeTab === 'owned' ? ownedAssets : activeTab === 'rented' ? rentedAssets : listedAssets;

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
      
      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setActiveTab('owned')}
            className={`px-6 py-2 rounded-md cursor-pointer font-medium transition-colors ${
              activeTab === 'owned'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
             Owned Assets
          </button>
          <button
            onClick={() => setActiveTab('listed')}
            className={`px-6 py-2 rounded-md cursor-pointer font-medium transition-colors ${
              activeTab === 'listed'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
             Listed Assets
          </button>
          <button
            onClick={() => setActiveTab('rented')}
            className={`px-6 py-2 rounded-md cursor-pointer font-medium transition-colors ${
              activeTab === 'rented'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
             Rented Assets
          </button>
        </div>
      </div>
      
      <div className="bg-gray-100 cursor-pointer p-4 rounded mb-4 text-sm">
        <p><strong>Wallet:</strong> {account.address}</p>
        <p><strong>Assets found:</strong> {currentAssets?.length || 0}</p>
        <p><strong>Tab:</strong> {activeTab === 'owned' ? 'Owned' : activeTab === 'listed' ? 'Listed' : 'Rented'}</p>
      </div>
      
      {currentAssets && currentAssets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentAssets.map((asset) => (
              <AssetCard 
                key={asset.id} 
                asset={{
                  ...asset,
                  rentedUntil: activeTab === 'rented' ? (asset as any).rentedUntil : (activeTab === 'listed' ? (asset as any).rentedUntil : undefined),
                  owner: activeTab === 'rented' ? (asset as any).owner : undefined,
                } as any} 
                isOwner={activeTab === 'owned'} 
                onListForRent={activeTab === 'owned' ? handleListForRent : undefined}
                onClaimBack={activeTab === 'listed' ? handleClaimBack : undefined}
                onReturnAsset={activeTab === 'rented' ? handleReturnAsset : undefined}
              />
            ))}
          </div>
        ) : (
          <p className='text-center'>
            {activeTab === 'owned' 
              ? "You currently don't own any assets." 
              : activeTab === 'listed'
              ? "You haven't listed any assets yet."
              : "You haven't rented any assets yet."}
          </p>
        )}
    </div>
  );
}
