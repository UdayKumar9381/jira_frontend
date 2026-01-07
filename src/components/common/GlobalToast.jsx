import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './GlobalToast.css';

const GlobalToast = () => {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const handleForbidden = (event) => {
            setToast({
                message: event.detail,
                type: 'error'
            });

            // Auto-hide after 5 seconds
            setTimeout(() => {
                setToast(null);
            }, 5000);
        };

        window.addEventListener('api-forbidden', handleForbidden);
        return () => window.removeEventListener('api-forbidden', handleForbidden);
    }, []);

    if (!toast) return null;

    return (
        <div className={`global-toast-container ${toast.type} animate-slide-up`}>
            <div className="toast-content">
                <AlertTriangle className="toast-icon" size={20} />
                <span className="toast-message">{toast.message}</span>
                <button className="toast-close" onClick={() => setToast(null)}>
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default GlobalToast;
