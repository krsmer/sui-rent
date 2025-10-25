"use client";

import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
import { Transaction } from '@mysten/sui/transactions';
import { useSuiClient } from "@mysten/dapp-kit";

// TODO: Bu sabitleri projenizin gerçek değerleriyle değiştirin
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!; 
const MARKETPLACE_ID = process.env.NEXT_PUBLIC_MARKETPLACE_ID!; // Marketplace objenizin ID'si

export function useMarketplace() {
  const client = useSuiClient();

  /**
   * Bir varlığı pazar yerinde kiralamak için listeler.
   * @param assetId Listelenecek varlığın object ID'si.
   * @param price Günlük kiralama bedeli (MIST cinsinden, 1 SUI = 1,000,000,000 MIST).
   * @returns Transaction nesnesi.
   */
  const listAsset = async (assetId: string, price: string) => {
    const priceInMIST = BigInt(parseFloat(price) * 1_000_000_000);
    
    // Owned object için version ve digest bilgisini al
    const assetObject = await client.getObject({
      id: assetId,
      options: { showOwner: true }
    });
    
    if (!assetObject.data) {
      throw new Error("Asset not found");
    }

    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::marketplace::list_for_rent`,
      arguments: [
        tx.object(MARKETPLACE_ID), // Shared object
        tx.objectRef({
          objectId: assetId,
          version: assetObject.data.version,
          digest: assetObject.data.digest,
        }), // Owned object with full reference
        tx.pure.u64(priceInMIST),
      ],
    });

    return tx;
  };

  /**
   * Bir varlığı belirli bir süre için kiralar.
   * @param assetId Kiralanacak asset'in ID'si.
   * @param days Kiralama süresi (gün cinsinden).
   * @param totalPrice Toplam kiralama bedeli (SUI cinsinden).
   * @returns Transaction nesnesi.
   */
  const rentAsset = async (assetId: string, days: number, totalPrice: string) => {
    const totalPriceInMIST = BigInt(parseFloat(totalPrice) * 1_000_000_000);
    const tx = new Transaction();

    // Ödeme için coin oluştur
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(totalPriceInMIST)]);

    tx.moveCall({
      target: `${PACKAGE_ID}::marketplace::rent_asset`,
      arguments: [
        tx.object(MARKETPLACE_ID),      // marketplace: &mut Marketplace
        tx.pure.id(assetId),             // asset_id: ID
        coin,                            // payment: coin::Coin<SUI>
        tx.pure.u64(days),               // rental_days: u64
        tx.object(SUI_CLOCK_OBJECT_ID),  // clock: &Clock
      ],
    });

    return tx;
  };

  /**
   * Listelenen bir varlığı geri çeker.
   * Sadece owner çağırabilir ve kiralama süresi dolmuş olmalı.
   * @param assetId Geri çekilecek asset'in ID'si.
   * @returns Transaction nesnesi.
   */
  const claimAsset = async (assetId: string) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::marketplace::claim_asset`,
      arguments: [
        tx.object(MARKETPLACE_ID),       // marketplace: &mut Marketplace
        tx.pure.id(assetId),              // asset_id: ID
        tx.object(SUI_CLOCK_OBJECT_ID),  // clock: &Clock
      ],
    });

    return tx;
  };

  return {
    listAsset,
    rentAsset,
    claimAsset,
  };
}
