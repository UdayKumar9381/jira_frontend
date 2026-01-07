import React, { forwardRef } from 'react';
import './Input.css';
import PropTypes from 'prop-types';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className={`jira-input-wrapper ${className}`}>
            {label && <label className="jira-label">{label}</label>}
            <input
                ref={ref}
                className={`jira-input ${error ? 'jira-input-error' : ''}`}
                {...props}
            />
            {error && <span className="jira-error-msg">{error}</span>}
        </div>
    );
});

Input.propTypes = {
    label: PropTypes.string,
    error: PropTypes.string,
    className: PropTypes.string,
};

Input.displayName = 'Input';

export default Input;
