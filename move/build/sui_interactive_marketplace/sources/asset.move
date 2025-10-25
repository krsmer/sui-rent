module marketplace::asset {
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID};
    use std::string::String;

    /// The main object representing a rentable asset
    struct Asset has key, store {
        id: UID,
        name: String,
        description: String,
        url: String
    }

    /// Create a new asset
    public fun create_asset(name: String, description: String, url: String, ctx: &mut TxContext) {
        let asset = Asset {
            id: object::new(ctx),
            name: name,
            description: description,
            url: url
        };
        transfer::public_transfer(asset, tx_context::sender(ctx));
    }
}
