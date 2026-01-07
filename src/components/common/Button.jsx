import React from 'react';
import './Button.css';
import PropTypes from 'prop-types';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    return (
        <button className={`jira-btn jira-btn-${variant} ${className}`} {...props}>
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'subtle', 'link']),
    className: PropTypes.string,
};

export default Button;
