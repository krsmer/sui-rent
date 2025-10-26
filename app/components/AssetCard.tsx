"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Asset } from "../hooks/useMyAssets"; // Asset tipini hook'tan import et

interface AssetCardProps {
  asset: Asset & { rentedUntil?: number; owner?: string; isRented?: boolean; renter?: string }; // extended type
  isOwner: boolean; // Kartın sahibi tarafından mı görüntülendiğini belirtir
  pricePerDay?: bigint; // Günlük kiralama bedeli (MIST cinsinden, opsiyonel)
  onListForRent?: (assetId: string, assetType: string, price: string) => void; // Kiraya verme fonksiyonu
  onRent?: (assetId: string, days: number) => void; // Kiralama fonksiyonu
  onClaimBack?: (assetId: string, assetType: string) => void; // Geri çekme fonksiyonu
  onReturnAsset?: (assetId: string, assetType: string) => void; // İade fonksiyonu (kiracı için)
}

export default function AssetCard({ asset, isOwner, pricePerDay, onListForRent, onRent, onClaimBack, onReturnAsset }: AssetCardProps) {
  const [days, setDays] = useState(1);
  const [imageError, setImageError] = useState(false);

  // Fiyatı SUI cinsine çevir (1 SUI = 1,000,000,000 MIST)
  const priceInSUI = pricePerDay ? Number(pricePerDay) / 1_000_000_000 : 0;
  const totalPrice = priceInSUI * days;

  // Kalan süreyi hesapla (kiralanan asset için)
  const getRemainingTime = () => {
    if (!asset.rentedUntil) return null;
    
    const now = Date.now();
    const remaining = asset.rentedUntil - now;
    
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const handleListClick = () => {
    // Fiyat girişi için basit bir prompt kullanıyoruz.
    // İdealde bu daha gelişmiş bir modal penceresi olmalıdır.
    const rentPrice = prompt("Enter the daily rental price in SUI:");
    if (rentPrice && !isNaN(parseFloat(rentPrice)) && onListForRent) {
      onListForRent(asset.id, asset.type, rentPrice);
    } else if (rentPrice !== null) {
      alert("Please enter a valid number for the price.");
    }
  };

  const handleRentClick = () => {
    // TODO: Kiralama süresi girişi yap ve onRent'i çağır
    console.log(`Renting asset ${asset.id} for ${days} day(s).`);
    if (onRent) {
      onRent(asset.id, days);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
      <div className="relative w-full h-56 bg-gray-200">
        {!imageError && asset.url ? (
          <Image
            src={asset.url}
            alt={asset.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized={asset.url.includes('ipfs') || asset.url.includes('blob')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-xs text-gray-500">No Image</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold">{asset.name}</h3>
        <p className="text-sm text-gray-600 mt-1 truncate">{asset.description}</p>
        
        {/* Kiralanan asset için kalan süreyi göster */}
        {asset.rentedUntil && (
          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs font-semibold text-blue-700">
              ⏰ {getRemainingTime()}
            </p>
            {asset.owner && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                Owner: {asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}
              </p>
            )}
          </div>
        )}
        
        {/* Fiyat bilgisini göster (eğer kiracı görünümündeyse) */}
        {!isOwner && !asset.rentedUntil && pricePerDay && (
          <p className="text-md font-semibold mt-2 text-blue-600">
            {priceInSUI.toFixed(2)} SUI/day
          </p>
        )}

        <div className="mt-4">
          {isOwner ? (
            // Varlık sahibi için butonlar
            <div>
              <button 
                onClick={handleListClick}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
              >
                List for Rent
              </button>
            </div>
          ) : onClaimBack ? (
            // Listelenmiş asset için Claim Back butonu
            <div>
              {asset.isRented ? (
                <div className="text-center">
                  <div className="mb-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs font-semibold text-yellow-700">🔒 Currently Rented</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {asset.renter && `By: ${asset.renter.slice(0, 6)}...${asset.renter.slice(-4)}`}
                    </p>
                  </div>
                  <button 
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-2 rounded cursor-not-allowed"
                  >
                    Cannot Claim (Rented)
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => onClaimBack(asset.id, asset.type)}
                  className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition-colors"
                >
                  Claim Back
                </button>
              )}
            </div>
          ) : asset.rentedUntil && onReturnAsset ? (
            // Kiralanan asset için Return Asset butonu
            <div className="text-center">
              {/* Süre kontrolü */}
              {getRemainingTime() === 'Expired' ? (
                <button 
                  onClick={() => onReturnAsset(asset.id, asset.type)}
                  className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition-colors"
                >
                  Return Asset
                </button>
              ) : (
                <div className="text-sm text-gray-500">
                  <p className="mb-2">Currently using this asset</p>
                  <p className="text-xs text-gray-400">Can return after rental period ends</p>
                </div>
              )}
            </div>
          ) : asset.rentedUntil ? (
            // Kiralanan asset için bilgi (return fonksiyonu yok)
            <div className="text-center text-sm text-gray-500">
              <p>Currently using this asset</p>
            </div>
          ) : (
            // Kiracı için butonlar (marketplace'te)
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Days:</label>
                <input
                  type="number"
                  min="1"
                  value={days}
                  onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-2 py-1 border rounded"
                />
              </div>
              {pricePerDay && (
                <p className="text-sm text-gray-600">
                  Total: <span className="font-semibold">{totalPrice.toFixed(2)} SUI</span>
                </p>
              )}
              <button 
                onClick={handleRentClick}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors"
              >
                Rent Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
