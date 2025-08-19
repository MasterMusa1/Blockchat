import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { clusterApiUrl } from '@solana/web3.js';
import { Buffer } from 'buffer';

window.Buffer = Buffer;

require('@solana/wallet-adapter-react-ui/styles.css');

const Wallet = ({ children }) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // The PhantomWalletAdapter and other modern adapters are designed to be "wallet-standard" compliant.
    // This means they automatically detect the environment:
    //  - On desktop, they'll look for a browser extension.
    //  - On mobile, they'll use deep-linking to open the corresponding wallet app (e.g., Phantom, Solflare).
    // No special configuration is needed for this mobile detection to work.
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter({ network }),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            {/* 
              The `autoConnect` prop is added to WalletProvider.
              This will attempt to automatically reconnect to the last used wallet on page load,
              providing a smoother experience for returning users on both mobile and desktop.
            */}
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default Wallet;