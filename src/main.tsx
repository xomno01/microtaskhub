import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- WEB3 WALLET SHIM ---
// This script simulates a Web3 wallet like MetaMask for development purposes.
// It's placed here to ensure `window.ethereum` is available before any component mounts.
if (!(window as any).ethereum) {
  (window as any).ethereum = {
    isMetaMask: true,
    request: async ({ method, params }: { method: string, params: any[] }) => {
      console.log(`[Web3 Shim] Received request: ${method}`, params);
      if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
        // Return a list of mock accounts
        return ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'];
      }
      if (method === 'eth_chainId') {
        // Return Sepolia Testnet Chain ID
        return '0xaa36a7';
      }
      throw new Error(`[Web3 Shim] Method ${method} not implemented.`);
    },
    on: (event: string, handler: (...args: any[]) => void) => {
      console.log(`[Web3 Shim] Registered listener for: ${event}`);
    },
    removeListener: (event: string, handler: (...args: any[]) => void) => {
       console.log(`[Web3 Shim] Removed listener for: ${event}`);
    }
  };
}
// --- END SHIM ---

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
