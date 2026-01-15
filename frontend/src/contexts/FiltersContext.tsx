import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FiltersContextType {
    filters: Record<string, string[]>;
    setFilters: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    stagedFilters: Record<string, string[]>;
    setStagedFilters: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

// Provides filter state management across the application
// Params:
// children - React components to be wrapped by the provider
// Returns: JSX element wrapping children with filter context
export const FiltersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [filters, setFilters] = useState<Record<string, string[]>>({});
    const [stagedFilters, setStagedFilters] = useState<Record<string, string[]>>({});

    return (
        <FiltersContext.Provider value={{ filters, setFilters, stagedFilters, setStagedFilters }}>
            {children}
        </FiltersContext.Provider>
    );
};

// Custom hook to access filter context
// Params: None
// Returns: FiltersContextType object containing filters state and setters
export const useFilters = () => {
    const context = useContext(FiltersContext);
    if (!context) {
        throw new Error('useFilters must be used within FiltersProvider');
    }
    return context;
};