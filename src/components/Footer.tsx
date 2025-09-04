import React from 'react';
import { LogoIcon } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-surface border-t border-gray-200/80">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <LogoIcon className="w-7 h-7 text-brand-primary" />
            <span className="text-lg font-bold text-brand-text">MicroTask Hub</span>
          </div>
          <p className="text-sm text-brand-secondary">&copy; {new Date().getFullYear()} MicroTask Hub. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-brand-secondary hover:text-brand-text">Privacy Policy</a>
            <a href="#" className="text-sm text-brand-secondary hover:text-brand-text">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
