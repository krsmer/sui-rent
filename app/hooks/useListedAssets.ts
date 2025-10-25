"use client";

import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { SuiObjectData, SuiObjectResponse } from "@mysten/sui/client";

const MARKETPLACE_ID = process.env.NEXT_PUBLIC_MARKETPLACE_ID!;

// Pazar yerindeki bir varlığı temsil eden tip
export interface ListedAsset {
  listingId: string; // Listing objesinin ID'si
  assetId: string;   // Varlığın kendi ID'si
  name: string;
  description: string;
  url: string;
  pricePerDay: bigint; // Günlük kiralama bedeli (MIST cinsinden)
}

/**
 * Marketplace'te listelenen tüm varlıkları getiren bir hook.
 */
export default function useListedAssets() {
  const client = useSuiClient();

  return useQuery<ListedAsset[], Error>({
    queryKey: ["listed-assets", MARKETPLACE_ID],
    queryFn: async () => {
      // 1. Adım: Marketplace objesinin tüm dinamik alanlarını (Listing'leri) getir.
      const { data: dynamicFields } = await client.getDynamicFields({
        parentId: MARKETPLACE_ID,
      });

      if (!dynamicFields) return [];

      // 2. Adım: Her bir Listing objesinin detayını `multiGetObjects` ile topluca getir.
      const listingObjectIds = dynamicFields.map(df => df.objectId);
      const listingObjects = await client.multiGetObjects({
        ids: listingObjectIds,
        options: { showContent: true },
      });
      
      // 3. Adım: Listing'lerden asset ID'lerini çıkar ve bu asset'lerin detaylarını topluca getir.
      const assetIds = listingObjects
        .map((obj: SuiObjectResponse) => {
            const fields = (obj.data?.content?.dataType === 'moveObject' && obj.data.content.fields) ? obj.data.content.fields as any : null;
            return fields?.asset_id;
        })
        .filter((id): id is string => id != null);

      const assetObjects = await client.multiGetObjects({
        ids: assetIds,
        options: { showContent: true },
      });

      // 4. Adım: Verileri birleştirerek son `ListedAsset` listesini oluştur.
      const listedAssets = listingObjects.map((listingObj: SuiObjectResponse) => {
        const listingFields = (listingObj.data?.content?.dataType === 'moveObject' && listingObj.data.content.fields) ? listingObj.data.content.fields as any : null;
        if (!listingFields) return null;

        const assetObject = assetObjects.find((asset: SuiObjectResponse) => asset.data?.objectId === listingFields.asset_id);
        if (!assetObject) return null;

        const assetFields = (assetObject.data?.content?.dataType === 'moveObject' && assetObject.data.content.fields) ? assetObject.data.content.fields as any : {};

        return {
          listingId: listingObj.data!.objectId,
          assetId: listingFields.asset_id,
          name: assetFields.name || "Unnamed Asset",
          description: assetFields.description || "No description.",
          url: assetFields.url || "",
          pricePerDay: BigInt(listingFields.price_per_day),
        };
      }).filter((asset): asset is ListedAsset => asset !== null);

      return listedAssets;
    },
    refetchOnWindowFocus: false,
  });
}
