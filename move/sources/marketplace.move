module marketplace::marketplace {
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::coin;
    use sui::clock::{Self, Clock};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, ID, UID};
    use sui::event;
    use sui::dynamic_object_field as dof;

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
        price_per_day: u64,
        rented_until: u64, // Timestamp in milliseconds (0 if not rented)
        renter: address,   // Current renter address (0x0 if not rented)
        earned_amount: u64, // Total earnings accumulated from rentals
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
    /// Generic function that accepts any object with key + store abilities
    public fun list_for_rent<T: key + store>(
        marketplace: &mut Marketplace, 
        asset: T, 
        price_per_day: u64, 
        ctx: &mut TxContext
    ) {
        let asset_id = object::id(&asset);
        let listing = Listing {
            id: object::new(ctx),
            asset_id: asset_id,
            owner: tx_context::sender(ctx),
            price_per_day: price_per_day,
            rented_until: 0,
            renter: @0x0,
            earned_amount: 0,
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
    /// Asset is transferred to renter, and will automatically return to owner after rental period
    public fun rent_asset(
        marketplace: &mut Marketplace,
        asset_id: ID,
        payment: coin::Coin<SUI>,
        rental_days: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Listing'i marketplace'den al
        let listing: &mut Listing = dof::borrow_mut(&mut marketplace.id, asset_id);
        
        // Kendi NFT'ini kiralayamazsın kontrolü
        assert!(listing.owner != tx_context::sender(ctx), 1); // ERR_OWNER_CANNOT_RENT
        
        // Şu anda kiralanmış mı kontrol et
        let current_time = clock::timestamp_ms(clock);
        assert!(listing.rented_until < current_time, 3); // ERR_ALREADY_RENTED
        
        // Ödeme miktarını kontrol et
        let total_price = listing.price_per_day * rental_days;
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= total_price, 2); // ERR_INSUFFICIENT_PAYMENT
        
        // Ödemeyi marketplace balance'ına ekle
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut marketplace.balance, payment_balance);
        
        // Kazancı listing'e kaydet
        listing.earned_amount = listing.earned_amount + total_price;
        
        // Kiralama bilgilerini güncelle
        let rental_duration_ms = rental_days * 86400000; // days to milliseconds
        listing.rented_until = current_time + rental_duration_ms;
        listing.renter = tx_context::sender(ctx);
        
        // Asset remains in listing, will be returned to owner via return_asset function
    }

    /// Claim back an asset from the marketplace
    /// Only owner can claim, and only if the asset was never rented
    /// If asset was rented, use return_asset after rental period ends
    /// Error: Not the owner (ERR_NOT_OWNER = 4)
    /// Error: Asset is currently rented (ERR_STILL_RENTED = 5)
    public fun claim_asset<T: key + store>(
        marketplace: &mut Marketplace,
        asset_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Listing'i marketplace'den çıkar
        let Listing {
            id,
            asset_id: _,
            owner,
            price_per_day: _,
            rented_until,
            renter,
            earned_amount,
        } = dof::remove(&mut marketplace.id, asset_id);

        // Sadece owner geri alabilir
        assert!(owner == tx_context::sender(ctx), 4); // ERR_NOT_OWNER

        // Şu anda kiralanmamış olmalı veya kiralama süresi dolmuş olmalı
        let current_time = clock::timestamp_ms(clock);
        assert!(rented_until < current_time || renter == @0x0, 5); // ERR_STILL_RENTED

        // Kazanılmış ücreti owner'a öde
        if (earned_amount > 0) {
            let earnings = coin::take(&mut marketplace.balance, earned_amount, ctx);
            transfer::public_transfer(earnings, owner);
        };

        // Asset'i listing'den çıkar ve owner'a gönder
        let asset: T = dof::remove(&mut id, b"asset");
        transfer::public_transfer(asset, owner);

        // Listing objesini yok et
        object::delete(id);
    }

    /// Return a rented asset back to the owner after rental period ends
    /// Can be called by anyone (renter, owner, or third party)
    /// Automatically transfers asset back to owner and pays earnings
    /// Error: Rental period not ended (ERR_RENTAL_NOT_ENDED = 7)
    public fun return_asset<T: key + store>(
        marketplace: &mut Marketplace,
        asset_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Listing'i marketplace'den çıkar
        let Listing {
            id,
            asset_id: _,
            owner,
            price_per_day: _,
            rented_until,
            renter,
            earned_amount,
        } = dof::remove(&mut marketplace.id, asset_id);

        // Kiralama süresi bitmiş olmalı
        let current_time = clock::timestamp_ms(clock);
        assert!(rented_until <= current_time, 7); // ERR_RENTAL_NOT_ENDED
        
        // Sadece kiralanmış asset'ler return edilebilir
        assert!(renter != @0x0, 8); // ERR_NOT_RENTED

        // Kazanılmış ücreti owner'a öde
        if (earned_amount > 0) {
            let earnings = coin::take(&mut marketplace.balance, earned_amount, ctx);
            transfer::public_transfer(earnings, owner);
        };

        // Asset'i listing'den çıkar ve owner'a geri gönder
        let asset: T = dof::remove(&mut id, b"asset");
        transfer::public_transfer(asset, owner);

        // Listing objesini yok et
        object::delete(id);
    }
}
