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
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::marketplace::list_asset`,
      arguments: [
        tx.object(MARKETPLACE_ID),
        tx.object(assetId),
        tx.pure.u64(priceInMIST.toString()),
      ],
    });

    return tx;
  };

  // TODO: Diğer marketplace fonksiyonları buraya eklenecek (rent_asset, claim_asset vb.)

  return {
    listAsset,
  };
}
