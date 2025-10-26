"use client";

import React, { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Package, ListOrdered, ShoppingBag, Wallet } from 'lucide-react';
import AssetCard from '../components/AssetCard';
import useMyAssets from '../hooks/useMyAssets';
import useRentedAssets from '../hooks/useRentedAssets';
import useListedByMe from '../hooks/useListedByMe';
import { useMarketplace } from '../hooks/useMarketplace';
import { FadeIn } from '@/components/fade-in';
import { StaggerContainer } from '@/components/stagger-container';
import { Card } from '@/components/ui/card';

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

  const handleListForRent = (assetId: string, assetType: string, price: string) => {
    listAsset(assetId, assetType, price).then((tx) => {
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

  const handleClaimBack = (assetId: string, assetType: string) => {
    claimAsset(assetId, assetType).then((tx) => {
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

  const handleReturnAsset = (assetId: string, assetType: string) => {
    returnAsset(assetId, assetType).then((tx) => {
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
        <Card className="p-12">
          <div className="flex flex-col items-center gap-4">
            <Wallet className="h-20 w-20 text-primary" />
            <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
            <p className="text-muted-foreground text-center">
              Please connect your wallet to view and manage your assets
            </p>
          </div>
        </Card>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          <h1 className="text-2xl font-bold text-muted-foreground">Loading your assets...</h1>
          <p className="text-sm text-muted-foreground/70">{account.address.slice(0, 8)}...{account.address.slice(-6)}</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="p-8 border-destructive">
          <div className="flex flex-col items-center gap-4">
            <Package className="h-16 w-16 text-destructive" />
            <h1 className="text-2xl font-bold text-destructive">Error loading assets</h1>
            <p className="text-muted-foreground">{error.message}</p>
            <p className="text-xs text-muted-foreground/50 font-mono">{account.address}</p>
          </div>
        </Card>
      </main>
    )
  }

  const tabs = [
    { id: 'owned' as TabType, label: 'Owned Assets', icon: Package, count: ownedAssets?.length || 0 },
    { id: 'listed' as TabType, label: 'Listed Assets', icon: ListOrdered, count: listedAssets?.length || 0 },
    { id: 'rented' as TabType, label: 'Rented Assets', icon: ShoppingBag, count: rentedAssets?.length || 0 },
  ];

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'owned':
        return "You currently don't own any assets.";
      case 'listed':
        return "You haven't listed any assets yet.";
      case 'rented':
        return "You haven't rented any assets yet.";
      default:
        return "No assets found.";
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <FadeIn>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Package className="h-10 w-10 text-primary" />
          <h1 className="text-5xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            My Assets
          </h1>
        </div>
        <p className="text-center text-muted-foreground text-lg mb-12">
          Manage your NFT collection and rentals
        </p>
      </FadeIn>
      
      {/* Modern Tabs */}
      <FadeIn delay={0.1}>
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl border border-border bg-card p-1.5 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-6 py-3 rounded-lg font-medium transition-all duration-200
                    flex items-center gap-2
                    ${activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-semibold
                      ${activeTab === tab.id
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                      }
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </FadeIn>
      
      {/* Wallet Info Card */}
      <FadeIn delay={0.15}>
        <Card className="p-4 mb-8 bg-accent/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="font-medium">Wallet:</span>
              <code className="text-xs bg-background px-2 py-1 rounded border">
                {account.address.slice(0, 10)}...{account.address.slice(-8)}
              </code>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>
                <strong>{currentAssets?.length || 0}</strong> {activeTab === 'owned' ? 'owned' : activeTab === 'listed' ? 'listed' : 'rented'}
              </span>
            </div>
          </div>
        </Card>
      </FadeIn>
      
      {currentAssets && currentAssets.length > 0 ? (
        <StaggerContainer staggerDelay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentAssets.map((asset) => (
              <FadeIn key={asset.id} delay={0.05}>
                <AssetCard 
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
              </FadeIn>
            ))}
          </div>
        </StaggerContainer>
      ) : (
        <FadeIn delay={0.2}>
          <Card className="p-16">
            <div className="flex flex-col items-center gap-4">
              {activeTab === 'owned' && <Package className="h-20 w-20 text-muted-foreground/50" />}
              {activeTab === 'listed' && <ListOrdered className="h-20 w-20 text-muted-foreground/50" />}
              {activeTab === 'rented' && <ShoppingBag className="h-20 w-20 text-muted-foreground/50" />}
              <p className="text-center text-2xl font-semibold text-muted-foreground">
                {getEmptyMessage()}
              </p>
              <p className="text-center text-muted-foreground">
                {activeTab === 'owned' && "Create or purchase NFTs to get started!"}
                {activeTab === 'listed' && "List your owned assets to start earning!"}
                {activeTab === 'rented' && "Browse the marketplace to rent NFTs!"}
              </p>
            </div>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
