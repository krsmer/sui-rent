module marketplace::marketplace {
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::coin;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, ID, UID};
    use sui::event;
    use sui::dynamic_object_field as dof;

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
    public fun list_for_rent(marketplace: &mut Marketplace, asset: Asset, price_per_day: u64, ctx: &mut TxContext) {
        let asset_id = object::id(&asset);
        let listing = Listing {
            id: object::new(ctx),
            asset_id: asset_id,
            owner: tx_context::sender(ctx),
            price_per_day: price_per_day
        };

        event::emit(AssetListed {
            asset_id: asset_id,
            owner: tx_context::sender(ctx),
            price_per_day: price_per_day,
        });

        // Asset'i listing içine koy
        dof::add(&mut listing.id, b"asset", asset);
        
        // Listing'i Marketplace'e dynamic field olarak ekle
        dof::add(&mut marketplace.id, asset_id, listing);
    }

    /// Rent an asset from the marketplace
    /// Error: Cannot rent your own asset (ERR_OWNER_CANNOT_RENT = 1)
    public fun rent_asset(
        marketplace: &mut Marketplace,
        asset_id: ID,
        payment: coin::Coin<SUI>,
        rental_days: u64,
        ctx: &mut TxContext
    ) {
        // Listing'i marketplace'den al
        let listing: &mut Listing = dof::borrow_mut(&mut marketplace.id, asset_id);
        
        // Kendi NFT'ini kiralayamazsın kontrolü
        assert!(listing.owner != tx_context::sender(ctx), 1); // ERR_OWNER_CANNOT_RENT
        
        // Ödeme miktarını kontrol et
        let total_price = listing.price_per_day * rental_days;
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= total_price, 2); // ERR_INSUFFICIENT_PAYMENT
        
        // Ödemeyi marketplace balance'ına ekle
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut marketplace.balance, payment_balance);
        
        // TODO: Rental tracking (kiralama kaydı) eklenecek
        // Şimdilik sadece ödeme alınıyor, asset hala listing içinde kalıyor
    }
}
