import React from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BLOCKCHAT_WALLET_ADDRESS, ADMIN_WALLET_ADDRESS } from './constants';

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
};

const modalContentStyle = {
    backgroundColor: 'var(--surface-color)',
    padding: '30px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    color: 'var(--text-color)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
};

const closeButtonStyle = {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '1.5rem',
    position: 'absolute',
    top: '15px',
    right: '20px',
    cursor: 'pointer',
};

const packageGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginTop: '20px',
};

const packageCardStyle = {
    backgroundColor: 'var(--background-color)',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid var(--border-color)',
};

const buyButtonStyle = {
    backgroundColor: 'var(--button-alert-color)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '15px',
    fontWeight: 'bold',
};

const creditPackages = [
    { sol: 0.01, credits: 100 },
    { sol: 0.05, credits: 600 },
    { sol: 0.1, credits: 1300 },
    { sol: 0.5, credits: 7000 },
    { sol: 1, credits: 15000 },
    { sol: 0, credits: "Lifetime NFT", isNFT: true },
];

const BuyCreditsModal = ({ isOpen, onClose, onPurchaseSuccess }) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [loading, setLoading] = React.useState(false);

    const handlePurchase = async (pkg) => {
        if (!publicKey) {
            alert('Please connect your wallet first.');
            return;
        }

        const isAdmin = publicKey.toBase58() === ADMIN_WALLET_ADDRESS;

        if (isAdmin) {
            alert(`Admin privilege: Acquired ${pkg.credits.toLocaleString()} credits without payment.`);
            onPurchaseSuccess(pkg.credits);
            onClose();
            return;
        }

        if (pkg.isNFT) {
            alert('NFT purchases should be done through the marketplace.');
            return;
        }

        setLoading(true);
        try {
            const lamports = pkg.sol * LAMPORTS_PER_SOL;
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(BLOCKCHAT_WALLET_ADDRESS),
                    lamports: lamports,
                })
            );

            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight }
            } = await connection.getLatestBlockhashAndContext();

            const signature = await sendTransaction(transaction, connection, { minContextSlot });

            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            
            // The onPurchaseSuccess function updates the user's credit balance
            onPurchaseSuccess(pkg.credits);
            alert(`Purchase successful! You sent ${pkg.sol} SOL for ${pkg.credits} credits. Your balance is updated.`);
            onClose();

        } catch (error) {
            console.error('Purchase failed:', error);
            alert(`Purchase failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={{...modalContentStyle, position: 'relative'}} onClick={e => e.stopPropagation()}>
                <button style={closeButtonStyle} onClick={onClose}>&times;</button>
                <h2>Buy Credits</h2>
                <p style={{color: 'var(--text-secondary)'}}>Credits are added to your account after your SOL payment is confirmed on the blockchain.</p>
                <div style={packageGridStyle}>
                    {creditPackages.map(pkg => (
                        <div key={pkg.credits} style={packageCardStyle}>
                            <h3 style={{margin: '0 0 5px 0', color: 'var(--primary-color)'}}>{pkg.isNFT ? pkg.credits : pkg.credits.toLocaleString()}</h3>
                            <p style={{margin: 0, fontSize: '0.9rem'}}>{pkg.isNFT ? 'Unlimited Messaging' : `${pkg.sol} SOL`}</p>
                            <button style={buyButtonStyle} onClick={() => handlePurchase(pkg)} disabled={loading}>
                                {loading ? 'Processing...' : 'Buy'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BuyCreditsModal;