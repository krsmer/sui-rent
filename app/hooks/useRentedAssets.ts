"use client";

import { useEffect, useState } from "react";
import { useSuiClient } from "@mysten/dapp-kit";

const MARKETPLACE_ID = process.env.NEXT_PUBLIC_MARKETPLACE_ID!;
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!;

export interface RentedAsset {
  id: string;
  name: string;
  description: string;
  url: string;
  listingId: string;
  rentedUntil: number; // timestamp in milliseconds
  pricePerDay: string;
  owner: string;
}

export default function useRentedAssets(address?: string) {
  const client = useSuiClient();
  const [data, setData] = useState<RentedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRentedAssets = async () => {
    if (!address) {
      setData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching rented assets for:", address);

      // Get all dynamic fields from marketplace (all listings)
      const dynamicFields = await client.getDynamicFields({
        parentId: MARKETPLACE_ID,
      });

      console.log("📦 Total listings:", dynamicFields.data.length);

      const rentedAssets: RentedAsset[] = [];

      // Fetch each listing and check if current user is the renter
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

            // Check if current user is the renter
            if (listing.renter === address) {
              console.log("✅ Found rented asset:", listing);

              // Get the asset from the listing's dynamic field
              const assetFields = await client.getDynamicFieldObject({
                parentId: field.objectId,
                name: {
                  type: "address",
                  value: listing.asset_id,
                },
              });

              if (
                assetFields.data?.content &&
                "fields" in assetFields.data.content
              ) {
                const asset = assetFields.data.content.fields as any;

                rentedAssets.push({
                  id: listing.asset_id,
                  name: asset.name,
                  description: asset.description,
                  url: asset.url,
                  listingId: field.objectId,
                  rentedUntil: Number(listing.rented_until),
                  pricePerDay: listing.price_per_day,
                  owner: listing.owner,
                });
              }
            }
          }
        } catch (err) {
          console.warn("Error fetching listing:", err);
        }
      }

      console.log("🎯 Total rented assets:", rentedAssets.length);
      setData(rentedAssets);
    } catch (err) {
      console.error("❌ Error fetching rented assets:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRentedAssets();
  }, [address, client]);

  return { data, isLoading, error, refetch: fetchRentedAssets };
}
