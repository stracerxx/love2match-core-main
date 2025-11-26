/**
 * Blockchain integration for Solana LOVE token
 * Token Contract: 3WTUkdFMhzH58fBLPfvjjL3qHRCDPLn6MhLN6VZerTvW
 */

interface TokenAccountResponse {
  result?: {
    value?: Array<{
      account?: {
        data?: {
          parsed?: {
            info?: {
              tokenAmount?: {
                uiAmount?: number;
              };
            };
          };
        };
      };
    }>;
  };
}

interface BalanceResponse {
  result?: {
    value?: number;
  };
}

export const LOVE_TOKEN_MINT = '3WTUkdFMhzH58fBLPfvjjL3qHRCDPLn6MhLN6VZerTvW';
export const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
export const SOLANA_CLUSTER = import.meta.env.VITE_SOLANA_CLUSTER || 'mainnet-beta';

export const blockchainApi = {
  /**
   * Get on-chain LOVE token balance for a Solana wallet
   * @param walletAddress Solana public key (base58)
   */
  async getOnChainBalance(walletAddress: string): Promise<number> {
    try {
      const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            walletAddress,
            { mint: LOVE_TOKEN_MINT },
            { encoding: 'jsonParsed' }
          ]
        })
      });

      const data: TokenAccountResponse = await response.json();
      if (data.result?.value?.[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount !== undefined) {
        return data.result.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      }
      return 0;
    } catch (error) {
      console.error('Failed to fetch on-chain balance:', error);
      return 0;
    }
  },

  /**
   * Get Solana SOL balance for a wallet
   */
  async getSolBalance(walletAddress: string): Promise<number> {
    try {
      const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [walletAddress]
        })
      });

      const data: BalanceResponse = await response.json();
      if (data.result?.value !== undefined) {
        return data.result.value / 1e9; // Convert lamports to SOL
      }
      return 0;
    } catch (error) {
      console.error('Failed to fetch SOL balance:', error);
      return 0;
    }
  },

  /**
   * Bridge in-app tokens to on-chain (requires user to connect wallet via Phantom/Magic/etc.)
   * This is a placeholder for future implementation
   * @param walletAddress User's Solana wallet address
   * @param amount Amount of tokens to bridge
   * @param tokenType 'LOVE' or 'LOVE2'
   */
  async bridgeToChain(walletAddress: string, amount: number, tokenType: 'LOVE' | 'LOVE2'): Promise<string> {
    if (tokenType !== 'LOVE2') {
      throw new Error('Only LOVE2 tokens can be bridged to Solana blockchain');
    }

    const currentUser = await (await fetch(SOLANA_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getLatestBlockhash',
        params: []
      })
    })).json();

    console.log(`[Bridge] Initiating bridge of ${amount} ${tokenType} to wallet ${walletAddress}`);
    console.log(`[Bridge] User must sign transaction with their Solana wallet`);
    console.log(`[Bridge] Token Mint: ${LOVE_TOKEN_MINT}`);

    throw new Error('Bridging requires Solana wallet integration. Please connect your Phantom wallet and sign the transaction.');
  },

  async bridgeFromChain(walletAddress: string, amount: number): Promise<string> {
    console.log(`[Bridge] Initiating reverse bridge of ${amount} LOVE2 from wallet ${walletAddress}`);
    console.log(`[Bridge] User must sign burn/lock transaction on Solana`);

    throw new Error('Reverse bridging requires Solana wallet integration. Please connect your Phantom wallet and sign the transaction.');
  },

  /**
   * Get price of LOVE token from on-chain data or oracle
   * This is a placeholder for future implementation
   */
  async getTokenPrice(): Promise<number> {
    return 0.01;
  },

  /**
   * Swap SOL for LOVE tokens via Jupiter or Raydium
   * This is a placeholder for future implementation
   */
  async swapSolForLove(walletAddress: string, solAmount: number): Promise<string> {
    console.log(`[Swap] Initiating SOL to LOVE2 swap for ${solAmount} SOL`);
    console.log(`[Swap] Using Jupiter aggregator for best price`);

    throw new Error('SOL-to-LOVE2 swap requires Jupiter integration. Please connect your Phantom wallet.');
  },

  /**
   * Withdraw LOVE2 tokens to a Solana wallet
   * @param userId User's ID
   * @param walletAddress Solana wallet address to withdraw to
   * @param amount Amount of LOVE2 tokens to withdraw
   */
  async withdrawLove2ToWallet(userId: string, walletAddress: string, amount: number): Promise<string> {
    const { data: user, error: userError } = await (await import('@/integrations/supabase/client')).supabase
      .from('users')
      .select('love2_balance')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!user) throw new Error('User not found');

    const balance = Number(user.love2_balance || 0);
    if (balance < amount) {
      throw new Error('Insufficient LOVE2 balance');
    }

    console.log(`[Withdrawal] Processing withdrawal of ${amount} LOVE2 to ${walletAddress}`);
    console.log(`[Withdrawal] Current balance: ${balance} LOVE2`);
    console.log(`[Withdrawal] This will create a Solana transaction to transfer tokens`);

    throw new Error('Withdrawal requires Solana wallet connection and transaction signing. Feature coming soon.');
  }
};

export default blockchainApi;
