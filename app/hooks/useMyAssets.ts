"use client";

import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { SuiObjectData, SuiObjectResponse } from "@mysten/sui/client";

// TODO: Bu sabitleri projenizin gerçek değerleriyle değiştirin
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!; // Move paketinizin ID'si
const ASSET_TYPE = `${PACKAGE_ID}::asset::Asset`;

// Varlık verilerini ve Kiosk bilgilerini birleştiren tip
export interface Asset {
  id: string;
  name: string;
  description: string;
  url: string;
  owner: string;
  kioskId?: string; // Varlık bir Kiosk içindeyse
}

/**
 * Belirli bir adrese ait olan Asset türündeki tüm nesneleri getiren bir hook.
 * @param ownerAddress Sahibinin cüzdan adresi
 */
export default function useMyAssets(ownerAddress?: string) {
  const client = useSuiClient();

  return useQuery<Asset[], Error>({
    queryKey: ["my-assets", ownerAddress],
    queryFn: async () => {
      if (!ownerAddress) {
        throw new Error("Owner address is required");
      }

      console.log("🔍 Fetching assets...");
      console.log("Owner:", ownerAddress);
      console.log("Asset Type:", ASSET_TYPE);

      // Filtresiz tüm objeleri çek
      const { data: allObjects } = await client.getOwnedObjects({
        owner: ownerAddress,
        options: {
          showContent: true,
          showDisplay: true,
          showType: true,
        },
      });

      console.log("📦 All objects:", allObjects);

      // Manuel filtreleme yap
      const filteredData = allObjects?.filter((obj) => {
        const objectType = obj.data?.type;
        console.log("Checking type:", objectType, "against:", ASSET_TYPE);
        return objectType?.includes("::asset::Asset");
      });

      console.log("🎯 Filtered assets:", filteredData);

      if (!filteredData || filteredData.length === 0) {
        console.log("⚠️ No assets found");
        return [];
      }

      console.log(`✅ Found ${filteredData.length} objects`);

      const assets = filteredData.map((response: SuiObjectResponse) => {
        const obj = response.data!;
        const fields = (obj.content?.dataType === 'moveObject' && obj.content.fields) ? obj.content.fields as any : {};
        console.log("🎨 Object:", obj.objectId, "Fields:", fields);
        return {
          id: obj.objectId,
          name: fields.name || "Unnamed Asset",
          description: fields.description || "No description.",
          url: fields.url || "",
          owner: ownerAddress,
        };
      });

      console.log("✨ Final assets:", assets);
      return assets;
    },
    enabled: !!ownerAddress, // Sadece ownerAddress varsa sorguyu çalıştır
    refetchOnWindowFocus: false,
  });
}
