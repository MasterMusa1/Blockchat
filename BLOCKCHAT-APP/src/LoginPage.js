import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: 'var(--background-color)',
  textAlign: 'center',
  padding: '20px',
};

const logoStyle = {
  width: '180px',
  height: '180px',
  marginBottom: '40px',
};

const titleStyle = {
  color: 'var(--text-color)',
  fontSize: '2.5rem',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
};

const subtitleStyle = {
  color: 'var(--text-secondary)',
  fontSize: '1.2rem',
  marginBottom: '40px',
};

const LoginPage = () => {
  return (
    <div style={pageStyle}>
      <img src="https://i.imgur.com/siB8l8m.png" alt="BlockChat Logo" style={logoStyle} />
      <h1 style={titleStyle}>BlockChat</h1>
      <p style={subtitleStyle}>Your Web3 Messaging Hub on Solana.</p>
      <WalletMultiButton />
    </div>
  );
};

export default LoginPage;