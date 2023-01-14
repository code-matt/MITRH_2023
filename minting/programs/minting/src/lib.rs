use anchor_lang::prelude::*;
pub mod instructions;
use instructions::*;


declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod minting {
    use super::*;

    pub fn create_token_mint(
        ctx: Context<CreateTokenMint>, 
        metadata_title: String, 
        metadata_symbol: String, 
        metadata_uri: String,
        mint_authority_pda_bump: u8,
    ) -> Result<()> {
        instructions::create_token_mint(
            ctx, 
            metadata_title, 
            metadata_symbol, 
            metadata_uri,
            mint_authority_pda_bump,
        )
    }

    pub fn mint_to_self(
        ctx: Context<MintToSelf>, 
        amount: u64,
        mint_authority_pda_bump: u8,
    ) -> Result<()> {

        instructions::mint_to_self(
            ctx, 
            amount,
            mint_authority_pda_bump,
        )
    }

    pub fn mint_to_other(
        ctx: Context<MintToOther>, 
        amount: u64,
        mint_authority_pda_bump: u8,
    ) -> Result<()> {

        instructions::mint_to_other(
            ctx, 
            amount,
            mint_authority_pda_bump,
        )
    }

    pub fn transfer(
        ctx: Context<Transfer>, 
        amount: u64,
    ) -> Result<()> {

        instructions::transfer(
            ctx, 
            amount,
        )
    }
}

