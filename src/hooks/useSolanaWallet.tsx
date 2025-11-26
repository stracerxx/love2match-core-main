import React, { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
} from '@solana/wallet-adapter-phantom';
import { clusterApiUrl } from '@solana/web3.js';

const SOLANA_CLUSTER = (import.meta.env.VITE_SOLANA_CLUSTER || 'mainnet-beta') as WalletAdapterNetwork;
const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(SOLANA_CLUSTER);

export const SolanaWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const network = SOLANA_CLUSTER;
  const endpoint = useMemo(() => SOLANA_RPC_URL, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaWalletProvider;
