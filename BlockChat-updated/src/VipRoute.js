import React from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';

const VipRoute = ({ children }) => {
    const { isVip } = useOutletContext();

    if (!isVip) {
        // If the user is not a VIP, redirect them to the home page.
        return <Navigate to="/" />;
    }

    return children;
};

export default VipRoute;