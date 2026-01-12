import { useState, useCallback } from 'react';

/**
 * Custom hook to encapsulate the repetitive loading, error, and data state logic.
 * reduces boilerplate in components that only need simple data fetching.
 */
const useFetch = (fetchFunction) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFunction(...args);
            setData(result);
            return result;
        } catch (err) {
            const errorMessage = err.message || 'An error occurred';
            setError(errorMessage);
            console.error('Fetch Error:', err); // Standard log with error context
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchFunction]);

    return { data, loading, error, execute, setData };
};

export default useFetch;
