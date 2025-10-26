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
  type: string; // Varlığın tam Move tipi (generic fonksiyonlar için gerekli)
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

      // NFT'leri filtrele - display object özelliği olanlar veya bizim Asset türündekiler
      const filteredData = allObjects?.filter((obj) => {
        const objectType = obj.data?.type;
        const hasDisplay = obj.data?.display;
        const hasContent = obj.data?.content;
        
        // Bizim asset tipimizse kesinlikle göster
        if (objectType === ASSET_TYPE) {
          console.log("✅ Our asset type:", objectType);
          return true;
        }
        
        // Display özelliği varsa (genelde NFT'lerdir)
        if (hasDisplay && hasDisplay.data) {
          console.log("✅ Has display:", objectType);
          return true;
        }
        
        // Content'te name, description, url gibi NFT alanları varsa
        if (hasContent && 'fields' in hasContent) {
          const fields = hasContent.fields as any;
          if (fields.name || fields.url || fields.image_url) {
            console.log("✅ Looks like NFT:", objectType);
            return true;
          }
        }
        
        return false;
      });

      console.log("🎯 Filtered assets (all NFTs):", filteredData);

      if (!filteredData || filteredData.length === 0) {
        console.log("⚠️ No assets found");
        return [];
      }

      console.log(`✅ Found ${filteredData.length} objects`);

      const assets = filteredData.map((response: SuiObjectResponse) => {
        const obj = response.data!;
        const fields = (obj.content?.dataType === 'moveObject' && obj.content.fields) ? obj.content.fields as any : {};
        const display = obj.display?.data;
        const objectType = obj.type || "unknown";
        
        console.log("🎨 Object:", obj.objectId, "Type:", objectType, "Fields:", fields, "Display:", display);
        
        // Display data varsa öncelikle onu kullan (standart NFT formatı)
        if (display) {
          return {
            id: obj.objectId,
            name: display.name || fields.name || "Unnamed Asset",
            description: display.description || fields.description || "No description.",
            url: display.image_url || display.url || fields.url || fields.image_url || "",
            type: objectType,
            owner: ownerAddress,
          };
        }
        
        // Display yoksa fields'den al
        return {
          id: obj.objectId,
          name: fields.name || "Unnamed Asset",
          description: fields.description || "No description.",
          url: fields.url || fields.image_url || "",
          type: objectType,
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
