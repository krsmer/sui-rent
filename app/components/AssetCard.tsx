"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Asset } from "../hooks/useMyAssets"; // Asset tipini hook'tan import et

interface AssetCardProps {
  asset: Asset & { rentedUntil?: number; owner?: string; isRented?: boolean; renter?: string }; // extended type
  isOwner: boolean; // Kartın sahibi tarafından mı görüntülendiğini belirtir
  pricePerDay?: bigint; // Günlük kiralama bedeli (MIST cinsinden, opsiyonel)
  onListForRent?: (assetId: string, price: string) => void; // Kiraya verme fonksiyonu
  onRent?: (assetId: string, days: number) => void; // Kiralama fonksiyonu
  onClaimBack?: (assetId: string) => void; // Geri çekme fonksiyonu
}

export default function AssetCard({ asset, isOwner, pricePerDay, onListForRent, onRent, onClaimBack }: AssetCardProps) {
  const [days, setDays] = useState(1);

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
      onListForRent(asset.id, rentPrice);
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
      <div className="relative w-full h-56">
        <Image
          src={asset.url || '/placeholder.svg'} // Placeholder görseli
          alt={asset.name}
          layout="fill"
          objectFit="cover"
          className="bg-gray-200"
        />
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
                  onClick={() => onClaimBack(asset.id)}
                  className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition-colors"
                >
                  Claim Back
                </button>
              )}
            </div>
          ) : asset.rentedUntil ? (
            // Kiralanan asset için bilgi (aksiyona gerek yok henüz)
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
