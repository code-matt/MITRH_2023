import { Connection, PublicKey, SystemProgram, VersionedTransaction, TransactionMessage, TransactionInstruction, Keypair } from '@solana/web3.js';
import { createInitializeMintInstruction, getOrCreateAssociatedTokenAccount, createMintToInstruction, TOKEN_PROGRAM_ID, MINT_SIZE } from '@solana/spl-token';
import { createCreateMetadataAccountInstruction, PROGRAM_ID} from '@metaplex-foundation/mpl-token-metadata';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const Blockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
const mint = Keypair.generate();
const mintAuthority = Keypair.generate();

async function createToken(provider: any, tokenUri: string) {
    const instructions: TransactionInstruction[] = [];

    const createMintAccountInstruction = SystemProgram.createAccount({
        fromPubkey: provider.publicKey,
        newAccountPubkey: mint.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(MINT_SIZE),
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
    });

    const initializeMintInstruction = createInitializeMintInstruction(
        mint.publicKey,
        9,
        provider.publicKey,
        provider.publicKey,
    );

    const createMetadataInstruction = createCreateMetadataAccountInstruction(
        {
            metadata: PublicKey.findProgramAddressSync(
                [ Buffer.from('metadata'), PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer() ],
                PROGRAM_ID,
            )[0],
            mint: mint.publicKey,
            mintAuthority: provider.publicKey,
            payer: provider.publicKey,
            updateAuthority: provider.publicKey,
        },
        {
            createMetadataAccountArgs: {
                data: {
                    creators: null,
                    name: 'SOULSYNC',
                    symbol: 'SYNC',
                    uri: tokenUri,
                    sellerFeeBasisPoints: 0,
                },
                isMutable: false,
            }
        }
    );

    instructions.push(
        createMintAccountInstruction,
        initializeMintInstruction,
        createMetadataInstruction
    )
        
    const V0Message = new TransactionMessage({
        payerKey: provider.publicKey,
        recentBlockhash: Blockhash,
        instructions: instructions
    }).compileToV0Message([]);

    const token_transaction = new VersionedTransaction(V0Message);

    const { signature } = await provider.signAndSendTransaction(token_transaction, {maxRetries: 5});
    console.log(signature);
}

async function mintToken(provider: any, quantity: number) {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, provider.publicKey, mint.publicKey, provider.publicKey)
    const mintToWalletInstruction = createMintToInstruction(
        mint.publicKey,
        tokenAccount.address,
        mintAuthority.publicKey,
        quantity,
    )

    const instructions: TransactionInstruction[] = [mintToWalletInstruction];

    const V0Message = new TransactionMessage({
        payerKey: provider.publicKey,
        recentBlockhash: Blockhash,
        instructions: instructions
    }).compileToV0Message([]);

    const mint_transaction = new VersionedTransaction(V0Message);

    const { signature } = await provider.signAndSendTransaction(mint_transaction, {maxRetries: 5});
    console.log(signature);
}