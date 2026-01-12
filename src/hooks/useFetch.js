import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook to encapsulate the repetitive loading, error, and data state logic.
 * Reduces boilerplate in components that only need simple data fetching.
 * Uses a ref for fetchFunction to maintain a stable 'execute' function identity.
 */
const useFetch = (fetchFunction) => {
    const [data, setData] = useState(undefined); // Start with undefined to trigger default parameters
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Use a ref to store the latest fetchFunction to avoid identity changes in 'execute'
    const fetchFunctionRef = useRef(fetchFunction);
    useEffect(() => {
        fetchFunctionRef.current = fetchFunction;
    }, [fetchFunction]);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFunctionRef.current(...args);
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
    }, []); // Identity remains stable across renders

    return { data, loading, error, execute, setData };
};

export default useFetch;
