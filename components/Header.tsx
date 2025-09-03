import React from 'react';
import { HomeIcon, ClipboardListIcon, UserIcon, LogoIcon, AdminIcon } from './Icons';
import { User, UserRole } from '../types';

type Page = 'home' | 'tasks' | 'dashboard' | 'admin';

interface HeaderProps {
  user: User | null;
  currentPage: Page;
  network: string;
  onNavigate: (page: Page) => void;
  onDisconnect: () => void;
  onConnect: () => void;
}

const truncateAddress = (address: string) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

export const Header: React.FC<HeaderProps> = ({ user, currentPage, network, onNavigate, onDisconnect, onConnect }) => {
  const NavLink: React.FC<{ page: Page; icon: React.ReactNode; label: string }> = ({ page, icon, label }) => (
    <button
      onClick={() => onNavigate(page)}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        currentPage === page ? 'text-brand-primary bg-amber-100/60' : 'text-brand-secondary hover:text-brand-text hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const renderNavLinks = () => {
    if (!user) return null;

    if (user.role === 'ADMIN') {
        return (
            <>
                <NavLink page="home" icon={<HomeIcon className="w-5 h-5" />} label="Home" />
                <NavLink page="admin" icon={<AdminIcon className="w-5 h-5" />} label="Admin Panel" />
            </>
        )
    }

    // Unified links for all 'USER' roles
    return (
        <>
            <NavLink page="home" icon={<HomeIcon className="w-5 h-5" />} label="Home" />
            <NavLink page="tasks" icon={<ClipboardListIcon className="w-5 h-5" />} label="Browse Tasks" />
            <NavLink page="dashboard" icon={<UserIcon className="w-5 h-5" />} label="My Dashboard" />
        </>
    );
  };

  return (
    <header className="bg-brand-surface/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200/80">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
             <LogoIcon className="w-8 h-8 text-brand-primary" />
            <span className="text-xl font-bold text-brand-text tracking-tight">MicroTask Hub</span>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            {renderNavLinks()}
          </nav>
          <div className="flex items-center gap-4">
             {user ? (
                 <>
                    <div className="text-right hidden sm:block">
                        <span className="text-sm font-semibold text-brand-text">
                            {user.role === 'ADMIN' ? user.name : truncateAddress(user.id)}
                        </span>
                        <p className="text-xs text-brand-secondary">{user.role === 'USER' ? network : 'Administrator'}</p>
                    </div>
                    <button onClick={onDisconnect} className="bg-white text-brand-secondary border font-medium text-sm py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
                        {user.role === 'ADMIN' ? 'Log Out' : 'Disconnect'}
                    </button>
                 </>
             ) : (
                <button onClick={onConnect} className="bg-brand-primary text-white font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-brand-primary-dark transition-colors duration-300">
                    Connect Wallet
                </button>
             )}
          </div>
        </div>
      </div>
    </header>
  );
};