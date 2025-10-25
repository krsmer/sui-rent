module marketplace::marketplace {
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, ID, UID};
    use sui::event;

    use marketplace::asset::Asset;

    /// The main shared object for the marketplace
    struct Marketplace has key {
        id: UID,
        balance: Balance<SUI>,
    }

    /// A listing object that holds an asset for rent
    struct Listing has key, store {
        id: UID,
        asset_id: ID,
        owner: address,
        price_per_day: u64
    }

    // Events
    struct AssetListed has copy, drop {
        asset_id: ID,
        owner: address,
        price_per_day: u64,
    }

    /// Executed once during module publish
    fun init(ctx: &mut TxContext) {
        let marketplace = Marketplace {
            id: object::new(ctx),
            balance: balance::zero() // Corrected: removed ctx
        };
        transfer::share_object(marketplace);
    }

    /// List an asset for rent on the marketplace
    public fun list_for_rent(asset: Asset, price_per_day: u64, ctx: &mut TxContext) {
        let asset_id = object::id(&asset);
        let listing = Listing {
            id: object::new(ctx),
            asset_id: object::id(&asset),
            owner: tx_context::sender(ctx),
            price_per_day: price_per_day
        };

        event::emit(AssetListed {
            asset_id: asset_id,
            owner: tx_context::sender(ctx),
            price_per_day: price_per_day,
        });

        // Transfer the asset into the listing object to establish ownership
        transfer::public_transfer(asset, object::id_to_address(&object::id(&listing)));
        // Transfer the listing to the owner as a receipt
        transfer::public_transfer(listing, tx_context::sender(ctx));
    }
}
