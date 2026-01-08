/**
 * Safely formats an error object or message for rendering in React.
 * Especially handles Pydantic validation error lists.
 */
export const formatError = (error) => {
    if (!error) return '';

    if (typeof error === 'string') return error;

    // Handle Pydantic validation errors (array of objects)
    if (Array.isArray(error)) {
        return error.map((err, index) => {
            const msg = err.msg || JSON.stringify(err);
            const field = err.loc ? ` (${err.loc.join('.')})` : '';
            return `${msg}${field}`;
        }).join(', ');
    }

    // Handle other objects
    if (typeof error === 'object') {
        if (error.detail) return formatError(error.detail);
        if (error.message) return error.message;
        return JSON.stringify(error);
    }

    return String(error);
};
