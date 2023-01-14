use {
    anchor_lang::{
        prelude::*,
        solana_program::program::invoke_signed,
    },
    anchor_spl::{token,associated_token},
    mpl_token_metadata::instruction as mpl_instruction,
};


pub fn create_token_mint(
    ctx: Context<CreateTokenMint>, 
    metadata_title: String, 
    metadata_symbol: String, 
    metadata_uri: String,
    mint_authority_pda_bump: u8,
) -> Result<()> {

    msg!("Creating metadata account...");
    msg!("Metadata account address: {}", &ctx.accounts.metadata_account.key());
    invoke_signed(
        &mpl_instruction::create_metadata_accounts_v3(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata_account.key(),     
            ctx.accounts.mint_account.key(),
            ctx.accounts.mint_authority.key(), 
            ctx.accounts.payer.key(),
            ctx.accounts.mint_authority.key(),       
            metadata_title,               
            metadata_symbol,
            metadata_uri,                      
            None,                    
            0,                                    
            true,                              
            false,                                          
            None,                                           
            None,
            None
        ),
        &[
            ctx.accounts.metadata_account.to_account_info(),
            ctx.accounts.mint_account.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        &[
            &[
                b"mint_authority_", 
                ctx.accounts.mint_account.key().as_ref(),
                &[mint_authority_pda_bump],
            ]
        ]
    )?;

    msg!("Token mint created successfully.");

    Ok(())
}

#[derive(Accounts)]
pub struct CreateTokenMint<'info> {
    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,
    #[account(
        init,
        payer = payer,
        mint::decimals = 9,
        mint::authority = mint_authority.key(),
    )]
    pub mint_account: Account<'info, token::Mint>,
    #[account(
        init, 
        payer = payer,
        space = 8 + 32,
        seeds = [
            b"mint_authority_", 
            mint_account.key().as_ref(),
        ],
        bump
    )]
    pub mint_authority: Account<'info, MintAuthorityPda>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    /// CHECK: Metaplex will check this
    pub token_metadata_program: UncheckedAccount<'info>,
}

pub fn mint_to_self(
    ctx: Context<MintToSelf>, 
    amount: u64,
    mint_authority_pda_bump: u8,
) -> Result<()> {

    msg!("Minting token to token account...");
    msg!("Mint: {}", &ctx.accounts.mint_account.to_account_info().key());   
    msg!("Token Address: {}", &ctx.accounts.token_account.key());     
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.mint_account.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
            &[&[
                b"mint_authority_", 
                ctx.accounts.mint_account.key().as_ref(),
                &[mint_authority_pda_bump],
            ]]
        ),
        amount,
    )?;

    msg!("Token minted to wallet successfully.");

    Ok(())
}


#[derive(Accounts)]
#[instruction(amount: u64, mint_authority_pda_bump: u8)]
pub struct MintToSelf<'info> {
    #[account(
        mut,
        mint::decimals = 9,
        mint::authority = mint_authority.key(),
    )]
    pub mint_account: Account<'info, token::Mint>,
    #[account(
        mut, 
        seeds = [
            b"mint_authority_", 
            mint_account.key().as_ref()
        ],
        bump = mint_authority_pda_bump
    )]
    pub mint_authority: Account<'info, MintAuthorityPda>,
    #[account(
        init,
        payer = payer,
        associated_token::mint = mint_account,
        associated_token::authority = payer,
    )]
    pub token_account: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
}

pub fn mint_to_other(
    ctx: Context<MintToOther>, 
    amount: u64,
    mint_authority_pda_bump: u8,
) -> Result<()> {

    msg!("Minting token to token account...");
    msg!("Mint: {}", &ctx.accounts.mint_account.to_account_info().key());   
    msg!("Token Address: {}", &ctx.accounts.token_account.key());     
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.mint_account.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
            &[&[
                b"mint_authority_", 
                ctx.accounts.mint_account.key().as_ref(),
                &[mint_authority_pda_bump],
            ]]
        ),
        amount,
    )?;

    msg!("Token minted to wallet successfully.");

    Ok(())
}

#[derive(Accounts)]
#[instruction(amount: u64, mint_authority_pda_bump: u8)]
pub struct MintToOther<'info> {
    #[account(
        mut,
        mint::decimals = 9,
        mint::authority = mint_authority.key(),
    )]
    pub mint_account: Account<'info, token::Mint>,
    #[account(
        mut, 
        seeds = [
            b"mint_authority_", 
            mint_account.key().as_ref()
        ],
        bump = mint_authority_pda_bump
    )]
    pub mint_authority: Account<'info, MintAuthorityPda>,
    /// CHECK: This is for airdrops
    pub recipient: UncheckedAccount<'info>,
    #[account(
        init,
        payer = payer,
        associated_token::mint = mint_account,
        associated_token::authority = recipient,
    )]
    pub token_account: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
}

pub fn transfer(
    ctx: Context<Transfer>, 
    amount: u64,
) -> Result<()> {

    msg!("Transferring {} tokens to new token account...", amount);
    msg!("Mint: {}", &ctx.accounts.mint_account.to_account_info().key());   
    msg!("Owner Token Address: {}", &ctx.accounts.owner_token_account.key());  
    msg!("Recipient Token Address: {}", &ctx.accounts.recipient_token_account.key());
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.owner_token_account.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        ),
        amount,
    )?;

    msg!("Tokens transferred to wallet successfully.");

    Ok(())
}


#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut)]
    pub mint_account: Account<'info, token::Mint>,
    #[account(
        mut,
        associated_token::mint = mint_account,
        associated_token::authority = owner,
    )]
    pub owner_token_account: Account<'info, token::TokenAccount>,
    #[account(
        init,
        payer = owner,
        associated_token::mint = mint_account,
        associated_token::authority = recipient,
    )]
    pub recipient_token_account: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Crediting not Debiting
    pub recipient: UncheckedAccount<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
}

#[account]
pub struct MintAuthorityPda {}
