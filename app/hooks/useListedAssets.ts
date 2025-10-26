"use client";

import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { SuiObjectData, SuiObjectResponse } from "@mysten/sui/client";

const MARKETPLACE_ID = process.env.NEXT_PUBLIC_MARKETPLACE_ID!;

// Pazar yerindeki bir varlığı temsil eden tip
export interface ListedAsset {
  listingId: string;
  assetId: string;
  name: string;
  description: string;
  url: string;
  pricePerDay: bigint;
  owner: string;
}

/**
 * Marketplace'te listelenen tüm varlıkları getiren bir hook.
 */
export default function useListedAssets() {
  const client = useSuiClient();

  return useQuery<ListedAsset[], Error>({
    queryKey: ["listed-assets", MARKETPLACE_ID],
    queryFn: async () => {
      console.log("🔍 Fetching listings from Marketplace...");
      console.log("Marketplace ID:", MARKETPLACE_ID);

      // Marketplace objesinin tüm dinamik field'larını getir
      const { data: dynamicFields } = await client.getDynamicFields({
        parentId: MARKETPLACE_ID,
      });

      console.log("📦 Dynamic fields:", dynamicFields);

      if (!dynamicFields || dynamicFields.length === 0) {
        console.log("⚠️ No listings found");
        return [];
      }

      // Her bir dynamic field aslında bir Listing objesi
      const listingObjectIds = dynamicFields.map(df => df.objectId);
      
      const listingObjects = await client.multiGetObjects({
        ids: listingObjectIds,
        options: { showContent: true },
      });

      console.log("� Listing objects:", listingObjects);

      // Asset ID'lerini topla (asset'ler listing içinde dynamic field olarak)
      const assetPromises = listingObjects.map(async (listingObj: SuiObjectResponse) => {
        const listingFields = (listingObj.data?.content?.dataType === 'moveObject' && listingObj.data.content.fields) ? listingObj.data.content.fields as any : null;
        if (!listingFields) return null;

        // Asset listing içinde "asset" key'i ile dynamic field olarak
        const assetDynamicField = await client.getDynamicFieldObject({
          parentId: listingObj.data!.objectId,
          name: {
            type: "vector<u8>",
            value: [97, 115, 115, 101, 116] // "asset" in bytes
          }
        });

        const assetData = assetDynamicField.data;
        const assetFields = (assetData?.content?.dataType === 'moveObject' && assetData.content.fields) ? assetData.content.fields as any : {};
        
        // Display metadata için ayrı bir getObject çağrısı yap
        const assetObjectId = assetData?.objectId;
        let assetDisplay: Record<string, any> | null = null;
        
        if (assetObjectId) {
          try {
            const assetFullObject = await client.getObject({
              id: assetObjectId,
              options: {
                showDisplay: true
              }
            });
            assetDisplay = assetFullObject.data?.display?.data || null;
          } catch (e) {
            console.error("Failed to fetch display data:", e);
          }
        }

        // Display metadata varsa onu kullan, yoksa fields'den al
        const name = assetDisplay?.name || assetFields.name || "Unnamed Asset";
        const description = assetDisplay?.description || assetFields.description || "No description.";
        const url = assetDisplay?.image_url || assetDisplay?.url || assetFields.url || assetFields.image_url || "";

        return {
          listingId: listingObj.data!.objectId,
          assetId: listingFields.asset_id,
          name,
          description,
          url,
          pricePerDay: BigInt(listingFields.price_per_day),
          owner: listingFields.owner,
        };
      });

      const listedAssets = (await Promise.all(assetPromises)).filter((asset): asset is ListedAsset => asset !== null);

      console.log("✅ Final listed assets:", listedAssets);
      return listedAssets;
    },
    refetchOnWindowFocus: false,
  });
}
