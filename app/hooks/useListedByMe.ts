"use client";

import { useEffect, useState } from "react";
import { useSuiClient } from "@mysten/dapp-kit";

const MARKETPLACE_ID = process.env.NEXT_PUBLIC_MARKETPLACE_ID!;

export interface ListedAsset {
  id: string;
  name: string;
  description: string;
  url: string;
  listingId: string;
  pricePerDay: string;
  isRented: boolean;
  rentedUntil: number; // timestamp in milliseconds
  renter: string;
}

export default function useListedByMe(address?: string) {
  const client = useSuiClient();
  const [data, setData] = useState<ListedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchListedAssets = async () => {
    if (!address) {
      setData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching listed assets for owner:", address);

      // Get all dynamic fields from marketplace (all listings)
      const dynamicFields = await client.getDynamicFields({
        parentId: MARKETPLACE_ID,
      });

      console.log("📦 Total listings:", dynamicFields.data.length);

      const myListings: ListedAsset[] = [];

      // Fetch each listing and check if current user is the owner
      for (const field of dynamicFields.data) {
        try {
          const listingObject = await client.getObject({
            id: field.objectId,
            options: { showContent: true },
          });

          if (
            listingObject.data?.content &&
            "fields" in listingObject.data.content
          ) {
            const listing = listingObject.data.content.fields as any;

            // Check if current user is the owner
            if (listing.owner === address) {
              console.log("✅ Found my listing:", listing);

              // Get the asset from the listing's dynamic field
              // Asset is stored with key "asset" as vector<u8>
              const assetFields = await client.getDynamicFieldObject({
                parentId: field.objectId,
                name: {
                  type: "vector<u8>",
                  value: [97, 115, 115, 101, 116], // "asset" in bytes
                },
              });

              if (
                assetFields.data?.content &&
                "fields" in assetFields.data.content
              ) {
                const asset = assetFields.data.content.fields as any;

                const currentTime = Date.now();
                const isRented = listing.rented_until > currentTime && listing.renter !== "0x0000000000000000000000000000000000000000000000000000000000000000";

                myListings.push({
                  id: listing.asset_id,
                  name: asset.name,
                  description: asset.description,
                  url: asset.url,
                  listingId: field.objectId,
                  pricePerDay: listing.price_per_day,
                  isRented,
                  rentedUntil: Number(listing.rented_until),
                  renter: listing.renter,
                });
              }
            }
          }
        } catch (err) {
          console.warn("Error fetching listing:", err);
        }
      }

      console.log("🎯 Total my listings:", myListings.length);
      setData(myListings);
    } catch (err) {
      console.error("❌ Error fetching listed assets:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListedAssets();
  }, [address, client]);

  return { data, isLoading, error, refetch: fetchListedAssets };
}
