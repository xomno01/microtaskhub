import React, { useState } from 'react';
import { LogoIcon } from './Icons';

interface ConnectWalletViewProps {
  onConnect: () => void;
  onAdminLogin: (email: string) => boolean;
}

export const ConnectWalletView: React.FC<ConnectWalletViewProps> = ({ onConnect, onAdminLogin }) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdminLogin(adminEmail);
  };

  return (
    <div className="flex-grow flex flex-col justify-center items-center p-4 text-center">
      <div className="w-full max-w-md mx-auto animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-6">
          <LogoIcon className="w-12 h-12 text-brand-primary" />
          <span className="text-4xl font-bold text-brand-text tracking-tight">MicroTask Hub</span>
        </div>

        <p className="text-lg text-brand-secondary mb-8">
          The decentralized platform for micro-tasks. Connect your wallet to begin creating or completing tasks.
        </p>

        {!showAdminLogin ? (
          <div className="space-y-4">
            <button
              onClick={onConnect}
              className="w-full max-w-xs mx-auto bg-brand-primary text-white font-semibold py-3.5 px-8 rounded-lg shadow-lg hover:bg-brand-primary-dark transition-all duration-300 transform hover:scale-105"
            >
              Connect Wallet
            </button>
            <button
              onClick={() => setShowAdminLogin(true)}
              className="text-sm text-brand-secondary hover:text-brand-text underline"
            >
              Admin Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdminSubmit} className="mt-8 space-y-4 bg-white p-6 rounded-lg shadow-md border animate-fade-in">
            <h3 className="font-semibold text-brand-text">Administrator Login</h3>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary"
              required
            />
            <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-brand-primary text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-brand-primary-dark transition-colors">
                    Log In
                </button>
                 <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1 bg-gray-100 text-brand-secondary font-medium py-2.5 px-6 rounded-lg hover:bg-gray-200 transition-colors">
                    Back
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};