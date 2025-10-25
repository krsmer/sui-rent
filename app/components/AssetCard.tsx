"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Asset } from "../hooks/useMyAssets"; // Asset tipini hook'tan import et

interface AssetCardProps {
  asset: Asset;
  isOwner: boolean; // Kartın sahibi tarafından mı görüntülendiğini belirtir
  onListForRent?: (assetId: string, price: string) => void; // Kiraya verme fonksiyonu
  onRent?: (assetId: string, days: number) => void; // Kiralama fonksiyonu
}

export default function AssetCard({ asset, isOwner, onListForRent, onRent }: AssetCardProps) {
  const [days, setDays] = useState(1);

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
        
        {/* TODO: Varlığın kiralama durumuna göre fiyat veya durum göster */}
        {/* <p className="text-md font-semibold mt-2">Price: 10 SUI/day</p> */}

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
              {/* TODO: Kiradan çekme butonu eklenecek */}
            </div>
          ) : (
            // Kiracı için butonlar
            <div>
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
