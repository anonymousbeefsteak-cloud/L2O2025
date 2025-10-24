
import React, { useEffect, useRef } from 'react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error' | 'warning';
    visible: boolean;
    onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, visible, onClose }) => {
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (visible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [visible, onClose]);

    if (!visible) return null;

    const typeClasses = {
        success: "bg-green-500 text-white",
        error: "bg-red-500 text-white",
        warning: "bg-yellow-500 text-white"
    };

    return (
        <div ref={notificationRef} className={`fixed top-5 right-5 max-w-sm p-4 rounded-lg shadow-lg z-50 transition-opacity duration-300 animate-slide-in ${typeClasses[type]}`}>
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium whitespace-pre-wrap">{message}</p>
                <button onClick={onClose} className="ml-4 text-xl font-bold leading-none">&times;</button>
            </div>
            <style>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};
