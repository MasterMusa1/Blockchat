import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Navigate } from 'react-router-dom';
import { ADMIN_WALLET_ADDRESS } from './constants';

const AdminRoute = ({ children }) => {
    const { publicKey } = useWallet();

    const isAdmin = publicKey && publicKey.toBase58() === ADMIN_WALLET_ADDRESS;

    if (!isAdmin) {
        // If the user is not the admin, redirect them to the home page.
        return <Navigate to="/" />;
    }

    return children;
};

export default AdminRoute;