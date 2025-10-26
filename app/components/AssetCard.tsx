'use client';

import { useState } from 'react';
import { BackgroundGradient } from '@/components/ui/background-gradient';

// Generic asset interface that covers all use cases
interface GenericAsset {
  id?: string; // for user assets
  assetId?: string; // for listed assets
  listingId?: string; // for listed assets  
  name: string;
  description: string;
  url: string;
  pricePerDay?: bigint | string;
  owner?: string;
  renter?: string;
  rentedUntil?: number | string;
  isRented?: boolean;
  type: string;
}

interface AssetCardProps {
  asset: GenericAsset;
  onList?: (assetId: string, assetType: string, price: string) => Promise<void>;
  onRent?: (listingId: string, assetType: string, days: number, totalPrice: string) => Promise<void>;
  onClaimBack?: (assetId: string, assetType: string) => Promise<void>;
  onReturnAsset?: (assetId: string, assetType: string) => Promise<void>;
  isOwner?: boolean;
  currentAddress?: string;
}

export default function AssetCard({ 
  asset, 
  onList, 
  onRent, 
  onClaimBack,
  onReturnAsset,
  isOwner = false,
  currentAddress
}: AssetCardProps) {
  const [days, setDays] = useState(1);
  const [showListModal, setShowListModal] = useState(false);
  const [priceInput, setPriceInput] = useState('');

  // Unified ID getter - works for both user assets and listed assets
  const getAssetId = () => asset.id || asset.assetId || '';

  const pricePerDay = asset.pricePerDay ? Number(asset.pricePerDay) : null;
  const priceInSUI = pricePerDay ? pricePerDay / 1_000_000_000 : 0;
  const totalPrice = priceInSUI * days;

  const handleListClick = () => {
    setShowListModal(true);
  };

  const handleListSubmit = async () => {
    if (onList && priceInput) {
      // Send price in SUI, useMarketplace will convert to MIST
      await onList(getAssetId(), asset.type, priceInput);
      setShowListModal(false);
      setPriceInput('');
    }
  };

  const handleRentClick = async () => {
    if (onRent && pricePerDay) {
      // For marketplace rentals, we need to send listingId (not assetId)
      // marketplace.move expects listing_id to find the listing in dynamic fields
      const idToSend = asset.listingId || getAssetId();
      console.log("🎯 AssetCard handleRentClick:");
      console.log("  - asset.listingId:", asset.listingId);
      console.log("  - idToSend:", idToSend);
      console.log("  - asset.type:", asset.type);
      await onRent(idToSend, asset.type, days, totalPrice.toString());
    }
  };

  const getRemainingTime = (): string => {
    if (!asset.rentedUntil) return '';
    
    const now = Date.now();
    const rentedUntil = Number(asset.rentedUntil);
    const remaining = rentedUntil - now;
    
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  return (
    <>
      <BackgroundGradient className="rounded-[22px] w-full h-full p-4 sm:p-6 bg-white dark:bg-zinc-900 flex flex-col">
        <div className="flex flex-col h-full gap-3">
          <div className="relative w-full h-48 bg-neutral-100 dark:bg-zinc-800 rounded-xl overflow-hidden shrink-0">
            {asset.url ? (
              <img src={asset.url} alt={asset.name} className="w-full h-full object-contain" />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-400 dark:text-zinc-600">No Image</div>
            )}
          </div>

          <div className="mt-4 grow">
            <h3 className="text-base sm:text-xl font-bold text-black mb-2 dark:text-neutral-200">{asset.name}</h3>
            {asset.description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 min-h-10">{asset.description}</p>
            )}
          </div>

          {asset.rentedUntil && (
            <div className="px-3 py-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg border border-blue-500/20 shrink-0">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">⏰ {getRemainingTime()}</p>
              {asset.owner && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Owner: {asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}</p>
              )}
            </div>
          )}

          {!isOwner && !asset.rentedUntil && pricePerDay && (
            <div className="flex items-center justify-between shrink-0">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Price per day</span>
              <span className="text-lg font-bold text-black dark:text-white">{priceInSUI.toFixed(2)} SUI</span>
            </div>
          )}

          <div className="shrink-0">
            {isOwner ? (
              <button onClick={handleListClick} className="rounded-full w-full py-2.5 text-white font-semibold bg-black dark:bg-zinc-800 hover:opacity-90 transition-opacity">
                List for Rent
              </button>
            ) : onClaimBack ? (
              <div>
                {asset.isRented ? (
                  <div>
                    <div className="mb-3 px-3 py-2 bg-amber-500/10 dark:bg-amber-500/20 rounded-lg border border-amber-500/20">
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">🔒 Currently Rented</p>
                      {asset.renter && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">By: {asset.renter.slice(0, 6)}...{asset.renter.slice(-4)}</p>
                      )}
                    </div>
                    <button disabled className="rounded-full w-full py-2.5 text-neutral-400 font-semibold bg-neutral-200 dark:bg-zinc-700 cursor-not-allowed">
                      Cannot Claim (Rented)
                    </button>
                  </div>
                ) : (
                  <button onClick={() => onClaimBack(getAssetId(), asset.type)} className="rounded-full w-full py-2.5 text-white font-semibold bg-purple-600 hover:bg-purple-700 transition-colors">
                    Claim Back
                  </button>
                )}
              </div>
            ) : asset.rentedUntil && onReturnAsset ? (
              <div>
                {getRemainingTime() === 'Expired' ? (
                  <button onClick={() => onReturnAsset(getAssetId(), asset.type)} className="rounded-full w-full py-2.5 text-white font-semibold bg-orange-600 hover:bg-orange-700 transition-colors">
                    Return Asset
                  </button>
                ) : (
                  <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                    <p className="font-medium">Currently using this asset</p>
                    <p className="text-xs mt-1 text-neutral-500">Can return after rental period ends</p>
                  </div>
                )}
              </div>
            ) : asset.rentedUntil ? (
              <div className="text-center text-sm text-neutral-600 dark:text-neutral-400 font-medium">Currently using this asset</div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 shrink-0">Days:</label>
                  <input type="number" min="1" value={days} onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))} className="flex-1 px-2 py-1 text-sm border border-neutral-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white" />
                </div>
                {pricePerDay && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-600 dark:text-neutral-400">Total:</span>
                    <span className="font-bold text-black dark:text-white">{totalPrice.toFixed(2)} SUI</span>
                  </div>
                )}
                <button onClick={handleRentClick} className="rounded-full w-full py-2 text-sm text-white font-semibold bg-emerald-600 hover:bg-emerald-700 transition-colors">
                  Rent Now
                </button>
              </div>
            )}
          </div>
        </div>
      </BackgroundGradient>

      {showListModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 dark:border-zinc-800">
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-bold mb-6 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                List Asset for Rent
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-neutral-700 dark:text-neutral-300">
                    Price per day (SUI)
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={priceInput} 
                    onChange={(e) => setPriceInput(e.target.value)} 
                    className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-lg font-medium" 
                    placeholder="0.1"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleListSubmit} 
                    className="flex-1 bg-linear-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => { setShowListModal(false); setPriceInput(''); }} 
                    className="flex-1 bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white py-3 rounded-xl hover:bg-neutral-300 dark:hover:bg-zinc-700 transition-all font-semibold border-2 border-neutral-300 dark:border-zinc-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
