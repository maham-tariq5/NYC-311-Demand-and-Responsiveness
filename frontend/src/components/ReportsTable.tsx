import React, { useEffect, useState } from 'react';
import { getAllReports, getColumnValues, getFilteredCount } from '../services/ReportService';
import { useFilters } from "../contexts/FiltersContext";
import { Report } from '../types/Report';

// Renders a paginated data table with advanced filtering capabilities
// Params: None
// Returns: JSX element containing the filterable reports table
const ReportsTable: React.FC = () => {
    const { filters, setFilters, stagedFilters, setStagedFilters } = useFilters();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageInput, setPageInput] = useState('1');
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [openFilter, setOpenFilter] = useState<string | null>(null);
    const [filterValues, setFilterValues] = useState<Record<string, string[]>>({});
    const [loadingFilters, setLoadingFilters] = useState<Record<string, boolean>>({});
    const [filterValuesCache, setFilterValuesCache] = useState<Record<string, { filters: string, values: string[] }>>({});
    const LIMIT = 10;

    const COLUMN_ORDER = [
        "id",
        "complaintType",
        "descriptorType",
        "agencyName",
        "locationType",
        "incidentAddress",
        "incidentZip",
        "addressType",
        "city",
        "status",
        "createdDate",
        "closedDate",
        "communityBoard",
        "borough",
        "openDataChannelType",
        "latitude",
        "longitude",
    ];

    useEffect(() => {
        // Fetches paginated reports data based on current page and applied filters
        // Params: None
        // Returns: None (updates reports state)
        const fetchReports = async () => {
            setLoading(true);
            setError(null);
            try {
                const startValue = currentPage * LIMIT;
                const data = await getAllReports({
                    limit: LIMIT,
                    start: startValue,
                    filters: filters
                });
                setReports(data);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                setError(msg || 'Failed to load reports');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [currentPage, filters]);

    // Fetch total count whenever filters change
    useEffect(() => {
        // Fetches the total count of records matching current filters
        // Params: None
        // Returns: None (updates totalRecords and totalPages state)
        const fetchCount = async () => {
            try {
                const count = await getFilteredCount(filters);
                setTotalRecords(count);
                setTotalPages(Math.ceil(count / LIMIT));
            } catch (err) {
                console.error('Failed to fetch count:', err);
            }
        };

        fetchCount();
    }, [filters]);

    // Loads unique values for a column's filter dropdown with caching
    // Params:
    // column - The column name to load filter values for
    // Returns: None (updates filterValues and filterValuesCache state)
    const loadFilterValues = async (column: string) => {
        // Create a cache key based on current applied filters (excluding this column)
        const otherFilters = { ...filters };
        delete otherFilters[column];
        const cacheKey = JSON.stringify(otherFilters);

        // Check if we have cached values for this filter state
        if (filterValuesCache[column] && filterValuesCache[column].filters === cacheKey) {
            console.log(`Using cached values for ${column}`);
            setFilterValues(prev => ({ ...prev, [column]: filterValuesCache[column].values }));
            return;
        }

        setLoadingFilters(prev => ({ ...prev, [column]: true }));
        try {
            const values: string[] = await getColumnValues(column, otherFilters);
            setFilterValues(prev => ({ ...prev, [column]: values }));

            // Cache the results
            setFilterValuesCache(prev => ({
                ...prev,
                [column]: { filters: cacheKey, values: values }
            }));
        } catch (err) {
            console.error(`Failed to load filter values for ${column}:`, err);
            setFilterValues(prev => ({ ...prev, [column]: [] }));
        } finally {
            setLoadingFilters(prev => ({ ...prev, [column]: false }));
        }
    };

    // Handles filter button click to open/close dropdown and load values
    // Params:
    // column - The column name whose filter button was clicked
    // Returns: None (updates openFilter state and triggers value loading)
    const handleFilterButtonClick = (column: string) => {
        const isOpening = openFilter !== column;
        setOpenFilter(isOpening ? column : null);

        if (isOpening) {
            loadFilterValues(column);
        }
    };

    // Toggles a filter value in staged filters (not yet applied)
    // Params:
    // column - The column name to filter
    // value - The filter value to toggle
    // Returns: None (updates stagedFilters state)
    const handleStagedFilterChange = (column: string, value: string) => {
        setStagedFilters(prev => {
            const currentFilters = prev[column] || [];
            const newFilters = currentFilters.includes(value)
                ? currentFilters.filter(v => v !== value)
                : [...currentFilters, value];

            if (newFilters.length === 0) {
                // Remove the column from staged filters if no values selected
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [column]: _, ...rest } = prev;
                return rest;
            }

            return { ...prev, [column]: newFilters };
        });
    };

    // Applies staged filters to active filters and resets pagination
    // Params: None
    // Returns: None (updates filters state and clears cache)
    const applyFilters = () => {
        setFilters(stagedFilters);
        // Clear cache when filters change since available values will be different
        setFilterValuesCache({});
        setFilterValues({});
        setCurrentPage(0);
        setPageInput('1');
        setOpenFilter(null);
    };

    // Clears all staged filters without applying them
    // Params: None
    // Returns: None (resets stagedFilters state to empty)
    const clearStagedFilters = () => {
        setStagedFilters({});
    };

    // Clears all active and staged filters and resets pagination
    // Params: None
    // Returns: None (resets all filter-related state)
    const clearFilters = () => {
        setFilters({});
        setStagedFilters({});
        setFilterValuesCache({});
        setFilterValues({});
        setCurrentPage(0);
        setPageInput('1');
    };

    // Removes filter for a specific column and resets pagination
    // Params:
    // column - The column name whose filter should be removed
    // Returns: None (updates filters and stagedFilters state)
    const clearColumnFilter = (column: string) => {
        setFilters(prev => {
            const rest = { ...prev };
            delete rest[column];
            return rest;
        });
        setStagedFilters(prev => {
            const rest = { ...prev };
            delete rest[column];
            return rest;
        });
        setFilterValuesCache({});
        setFilterValues({});
        setCurrentPage(0);
        setPageInput('1');
    };

    // Advances to the next page of results
    // Params: None
    // Returns: None (increments currentPage state)
    const handleNextPage = () => {
        setCurrentPage(prev => prev + 1);
        setPageInput(String(currentPage + 2));
    };

    // Goes back to the previous page of results
    // Params: None
    // Returns: None (decrements currentPage state if not on first page)
    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
            setPageInput(String(currentPage));
        }
    };

    // Navigates to the first page of results
    // Params: None
    // Returns: None (resets currentPage to 0)
    const handleFirstPage = () => {
        setCurrentPage(0);
        setPageInput('1');
    };

    // Navigates to the page number entered in the input field
    // Params: None
    // Returns: None (updates currentPage based on pageInput value)
    const handleGoToPage = () => {
        const pageNum = parseInt(pageInput, 10);
        if (!isNaN(pageNum) && pageNum > 0) {
            setCurrentPage(pageNum - 1);
        }
    };

    // Updates the page input field value as user types
    // Params:
    // e - React change event from the input field
    // Returns: None (updates pageInput state)
    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPageInput(e.target.value);
    };

    // Triggers page navigation when Enter key is pressed in page input
    // Params:
    // e - React keyboard event from the input field
    // Returns: None (calls handleGoToPage on Enter key)
    const handlePageInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleGoToPage();
        }
    };

    if (loading && currentPage === 0 && Object.keys(filters).length === 0) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading reports…</div>;
    }

    if (error) return <div style={{ color: 'darkred', padding: '20px' }}>Error: {error}</div>;

    const headers = COLUMN_ORDER;
    const startRecord = currentPage * LIMIT + 1;
    const endRecord = currentPage * LIMIT + reports.length;
    const activeFilterCount = Object.keys(filters).length;
    const stagedFilterCount = Object.keys(stagedFilters).length;
    const hasUnappliedChanges = JSON.stringify(filters) !== JSON.stringify(stagedFilters);

    return (
        <div style={{ padding: '20px' }}>
            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
                <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#e7f3ff',
                    borderRadius: '8px',
                    border: '1px solid #0066cc'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                            <strong style={{ color: '#0066cc' }}>Active Filters:</strong>
                            {Object.entries(filters).map(([column, values]) => (
                                <div key={column} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 8px',
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    border: '1px solid #0066cc'
                                }}>
                                    <span><strong>{column}:</strong> {values.join(', ')}</span>
                                    <button
                                        onClick={() => clearColumnFilter(column)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#dc3545',
                                            cursor: 'pointer',
                                            padding: '0 4px',
                                            fontSize: '16px',
                                            fontWeight: 'bold'
                                        }}
                                        title="Remove filter"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={clearFilters}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Staged Filters Actions */}
            {(stagedFilterCount > 0 || hasUnappliedChanges) && (
                <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '8px',
                    border: '1px solid #ffc107',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong style={{ color: '#856404' }}>
                            {stagedFilterCount > 0 ? `${stagedFilterCount} filter(s) selected` : 'Filters cleared'}
                        </strong>
                        {stagedFilterCount > 0 && (
                            <span style={{ fontSize: '13px', color: '#856404' }}>
                                ({Object.entries(stagedFilters).map(([col, vals]) => `${col}: ${vals.length}`).join(', ')})
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={clearStagedFilters}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: 'white',
                                color: '#856404',
                                border: '1px solid #ffc107',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}
                        >
                            Clear Selection
                        </button>
                        <button
                            onClick={applyFilters}
                            style={{
                                padding: '6px 16px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600'
                            }}
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            <div style={{
                marginBottom: '20px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
            }}>
                <button
                    onClick={handleFirstPage}
                    disabled={currentPage === 0}
                    style={{
                        padding: '8px 16px',
                        cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                        backgroundColor: currentPage === 0 ? '#e9ecef' : '#007bff',
                        color: currentPage === 0 ? '#6c757d' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: '500'
                    }}
                >
                    First
                </button>

                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    style={{
                        padding: '8px 16px',
                        cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                        backgroundColor: currentPage === 0 ? '#e9ecef' : '#007bff',
                        color: currentPage === 0 ? '#6c757d' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: '500'
                    }}
                >
                    ← Previous
                </button>

                <span style={{
                    padding: '8px 16px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    fontWeight: '500'
                }}>
                    Page {currentPage + 1} {totalPages > 0 && `of ${totalPages}`}
                </span>

                <span style={{ color: '#6c757d' }}>
                    (Records {startRecord} - {endRecord}{totalRecords > 0 && ` of ${totalRecords}`})
                </span>

                <button
                    onClick={handleNextPage}
                    disabled={reports.length < LIMIT}
                    style={{
                        padding: '8px 16px',
                        cursor: reports.length < LIMIT ? 'not-allowed' : 'pointer',
                        backgroundColor: reports.length < LIMIT ? '#e9ecef' : '#007bff',
                        color: reports.length < LIMIT ? '#6c757d' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: '500'
                    }}
                >
                    Next →
                </button>

                <div style={{
                    marginLeft: 'auto',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                }}>
                    <label htmlFor="pageInput" style={{ fontWeight: '500', color: '#495057' }}>
                        Go to page:
                    </label>
                    <input
                        id="pageInput"
                        type="number"
                        min="1"
                        value={pageInput}
                        onChange={handlePageInputChange}
                        onKeyPress={handlePageInputKeyPress}
                        style={{
                            width: '70px',
                            padding: '6px 10px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    />
                    <button
                        onClick={handleGoToPage}
                        style={{
                            padding: '6px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Go
                    </button>
                </div>
            </div>

            {/* Loading indicator */}
            {loading && (
                <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: '#856404'
                }}>
                    Loading filtered results...
                </div>
            )}

            {/* Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #dee2e6', borderRadius: '8px' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', backgroundColor: 'white' }}>
                    <thead>
                    <tr>
                        {headers.map(h => (
                            <th key={h} style={{
                                border: '1px solid #dee2e6',
                                padding: '12px',
                                textAlign: 'left',
                                background: '#f8f9fa',
                                fontWeight: '600',
                                color: '#495057',
                                position: 'sticky',
                                top: 0,
                                minWidth: '150px',
                                zIndex: 10
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                    <span>{h}</span>
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => handleFilterButtonClick(h)}
                                            style={{
                                                padding: '4px 8px',
                                                backgroundColor: stagedFilters[h]?.length ? '#ffc107' : filters[h]?.length ? '#007bff' : 'white',
                                                color: (stagedFilters[h]?.length || filters[h]?.length) ? 'white' : '#495057',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            ⚲ {stagedFilters[h]?.length ? `(${stagedFilters[h].length})` : filters[h]?.length ? `(${filters[h].length})` : ''}
                                        </button>

                                        {openFilter === h && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                right: 0,
                                                marginTop: '4px',
                                                backgroundColor: 'white',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '4px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                zIndex: 1000,
                                                minWidth: '250px',
                                                maxHeight: '400px',
                                                overflowY: 'auto'
                                            }}>
                                                <div style={{
                                                    padding: '8px 12px',
                                                    borderBottom: '1px solid #dee2e6',
                                                    fontWeight: 'bold',
                                                    position: 'sticky',
                                                    top: 0,
                                                    backgroundColor: 'white',
                                                    zIndex: 1
                                                }}>
                                                    Filter {h}
                                                </div>
                                                {loadingFilters[h] ? (
                                                    <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                                                        Loading values...
                                                    </div>
                                                ) : filterValues[h]?.length === 0 ? (
                                                    <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                                                        No values available
                                                    </div>
                                                ) : (
                                                    filterValues[h]?.map(value => (
                                                        <label
                                                            key={value}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                padding: '8px 12px',
                                                                cursor: 'pointer',
                                                                fontSize: '14px',
                                                                borderBottom: '1px solid #f0f0f0',
                                                                backgroundColor: stagedFilters[h]?.includes(value) ? '#fff3cd' : 'transparent'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!stagedFilters[h]?.includes(value)) {
                                                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!stagedFilters[h]?.includes(value)) {
                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                }
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={stagedFilters[h]?.includes(value) || false}
                                                                onChange={() => handleStagedFilterChange(h, value)}
                                                                style={{ marginRight: '8px' }}
                                                            />
                                                            <span style={{ wordBreak: 'break-word' }}>{value}</span>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {reports.length === 0 ? (
                        <tr>
                            <td colSpan={headers.length} style={{
                                padding: '40px',
                                textAlign: 'center',
                                color: '#6c757d'
                            }}>
                                {loading ? 'Loading...' : `No records found ${activeFilterCount > 0 ? 'matching the current filters' : ''}`}
                            </td>
                        </tr>
                    ) : (
                        reports.map((report, idx) => (
                            <tr key={idx} style={{
                                background: idx % 2 === 0 ? '#fff' : '#f8f9fa',
                                transition: 'background-color 0.2s'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f8f9fa'}
                            >
                                {headers.map(h => (
                                    <td key={h} style={{
                                        border: '1px solid #dee2e6',
                                        padding: '10px',
                                        color: '#212529'
                                    }}>
                                        {String(report[h as keyof Report] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Bottom Pagination Info */}
            <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#6c757d',
                fontSize: '14px'
            }}>
                {reports.length === LIMIT ? (
                    <span>Showing {LIMIT} records per page. Click &quot;Next&quot; to view more.</span>
                ) : reports.length > 0 ? (
                    <span>Showing last {reports.length} records.</span>
                ) : (
                    <span>End of records reached.</span>
                )}
            </div>
        </div>
    );
};

export default ReportsTable;