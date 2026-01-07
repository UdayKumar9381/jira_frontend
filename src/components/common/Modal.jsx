import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, width = 600 }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="jira-modal-overlay" onClick={onClose}>
            <div
                className="jira-modal-content"
                style={{ width: width }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="jira-modal-header">
                    <h3>{title}</h3>
                    <button className="jira-modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="jira-modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
    width: PropTypes.number,
};

export default Modal;
