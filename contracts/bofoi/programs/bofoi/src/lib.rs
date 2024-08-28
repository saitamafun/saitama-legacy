use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{ Mint, Token, TokenAccount, TransferChecked, transfer_checked}};

declare_id!("8Kc1XgpHpMEqC8nTEAzqXU61m9drjrEujLGMgDwXfk9r");

pub mod  events;

#[program]
pub mod bofoi {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>, bump: u8) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.bump = bump;
        state.transfer_count = 0;

        Ok(())
    }

    pub fn native_transfer(ctx: Context<NativeTransfer>, amount: u64,  data: String) -> Result<()> {
        let receipt = &mut ctx.accounts.receipt;
        let state = &mut ctx.accounts.state;
        
        receipt.data = data.clone();
    

        anchor_lang::solana_program::program::invoke_signed(
            &anchor_lang::solana_program::system_instruction::transfer(
                ctx.accounts.from.key,
                ctx.accounts.to.key,
                amount,
            ),
            &[
                ctx.accounts.from.to_account_info(),
                ctx.accounts.to.clone(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[],
        )?;

        state.transfer_count += 1;


        emit!(events::TransferEvent{ 
            amount, 
            data,
            is_native: true, 
            from: ctx.accounts.from.key(), 
            to: ctx.accounts.to.key(),
            receipt: ctx.accounts.receipt.key()
        });

        Ok(())
    }

    pub fn spl_transfer(ctx: Context<SplTransfer>,  amount: u64, data: String) -> Result<()> {
        let receipt = &mut ctx.accounts.receipt;
        let state = &mut ctx.accounts.state;
        
        receipt.data= data.clone();
        
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.from_ata.to_account_info(), 
            mint: ctx.accounts.mint.to_account_info(), 
            to: ctx.accounts.to_ata.to_account_info(), 
            authority: ctx.accounts.from.to_account_info(),
        };

        transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(), 
                cpi_accounts
            ), 
            amount, 
            ctx.accounts.mint.decimals
        )?;

        state.transfer_count += 1;

        emit!(events::TransferEvent{ 
            data,
            amount, 
            is_native:false, 
            from: ctx.accounts.from.key(), 
            to: ctx.accounts.to.key(),
            receipt: ctx.accounts.receipt.key()
        });

        Ok(())
    }

    
}

#[account]
pub struct InitializeState {
    transfer_count: u64,
    bump: u8,
}

#[account]
pub struct Receipt {
    bump: u8,
    data: String,
}

impl Receipt {
    fn len(data: String) -> usize{
        4 + 16 + data.len()
    }
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct Initialize<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    #[account(
        init,
        payer=payer, 
        seeds=[b"bofoi"], 
        space=16 + 1,
        bump
    )]
    state: Account<'info, InitializeState>,

    system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64, data: String)]
pub struct NativeTransfer<'info> {
    #[account(mut)]
    pub from: Signer<'info>,
    #[account(mut)]
    /// CHECK:
    pub to: AccountInfo<'info>,

    #[account(mut, seeds=[b"bofoi"], bump=state.bump)]
    pub state: Account<'info, InitializeState>,

    #[account(
        init, 
        payer=from,
        space=4 + Receipt::len(data), 
        seeds=[&[state.transfer_count.try_into().unwrap()], from.key.as_ref(),], 
        bump
    )]
    pub receipt: Account<'info, Receipt>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction(amount: u64, data: String)]
pub struct SplTransfer<'info> {
    #[account(mut)]
    pub from: Signer<'info>,

    #[account(mut)]
    /// CHECK:
    pub to: AccountInfo<'info>,

    #[account(mut, token::mint=mint, token::authority=from)]
    pub from_ata: Account<'info, TokenAccount>,

    #[account(init_if_needed, payer=from, associated_token::mint=mint, associated_token::authority=to)]
    pub to_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub mint: Account<'info, Mint>,


    #[account(mut, seeds=[b"bofoi"], bump=state.bump)]
    pub state: Account<'info, InitializeState>,

    #[account(
        init, 
        payer=from,
        space=Receipt::len(data), 
        seeds=[&[state.transfer_count.try_into().unwrap()], from.key.as_ref(),], 
        bump
    )]
    pub receipt: Account<'info, Receipt>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>
}
