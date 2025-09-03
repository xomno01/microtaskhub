
import React from 'react';
// FIX: Imported InformationCircleIcon from the central Icons component.
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XIcon } from './Icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

const typeMap = {
    success: {
        bgColor: 'bg-green-600',
        Icon: CheckCircleIcon,
    },
    error: {
        bgColor: 'bg-red-600',
        Icon: XCircleIcon,
    },
    info: {
        bgColor: 'bg-blue-600',
        Icon: InformationCircleIcon,
    }
}

export const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  const { bgColor, Icon } = typeMap[type];

  return (
    <div 
      className={`w-full flex items-center gap-4 p-4 rounded-lg text-white shadow-lg animate-slide-in-left ${bgColor}`}
      role="alert"
      aria-live="assertive"
    >
      <Icon className="w-6 h-6 flex-shrink-0" />
      <p className="text-sm font-medium flex-grow">{message}</p>
      <button onClick={onDismiss} aria-label="Dismiss message" className="ml-4 opacity-70 hover:opacity-100 flex-shrink-0">
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

// FIX: Removed local definition of InformationCircleIcon as it is now in Icons.tsx.
