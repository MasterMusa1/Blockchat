import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Wallet from './Wallet';
import { SettingsProvider } from './contexts/SettingsContext';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Wallet>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </Wallet>
  </React.StrictMode>
);