use anchor_lang::prelude::*;

#[event]

pub struct TransferEvent {
    pub is_native: bool,
    pub amount: u64,
    pub data: String,
    pub receipt: Pubkey,
    pub from: Pubkey,
    pub to: Pubkey,
}
