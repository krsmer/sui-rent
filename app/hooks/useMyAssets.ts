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

      const { data } = await client.getOwnedObjects({
        owner: ownerAddress,
        filter: {
          StructType: ASSET_TYPE,
        },
        options: {
          showContent: true,
          showDisplay: true,
        },
      });

      // TODO: Kiosk içindeki varlıkları da getirecek mantığı ekle
      // Şu an sadece doğrudan sahip olunan varlıkları getiriyor.

      if (!data) {
        return [];
      }

      const assets = data.map((response: SuiObjectResponse) => {
        const obj = response.data!;
        const fields = (obj.content?.dataType === 'moveObject' && obj.content.fields) ? obj.content.fields as any : {};
        return {
          id: obj.objectId,
          name: fields.name || "Unnamed Asset",
          description: fields.description || "No description.",
          url: fields.url || "",
          owner: ownerAddress,
        };
      });

      return assets;
    },
    enabled: !!ownerAddress, // Sadece ownerAddress varsa sorguyu çalıştır
    refetchOnWindowFocus: false,
  });
}
