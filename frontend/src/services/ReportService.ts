import { Report } from '../types/Report';


interface APIFilters {
    limit?: number;
    start?: number;
    filters?: Record<string, string[]>;
}


// Helper: Append filters (if any) to URLSearchParams
const appendFilters = (
    params: URLSearchParams,
    key: string,
    filters?: Record<string, string[]>
) => {
    if (filters && Object.keys(filters).length > 0) {
        params.append(key, JSON.stringify(filters));
    }
};

// Universal fetch helper
// Type: Generic placeholder
// Params:
// endpoint - API endpoint to fetch
// fallback - Returns fallback object if response is invalid or fetch fails
const fetchJSON = async <Type>(endpoint: string, fallback: Type): Promise<Type> => {
    console.log("Fetching from:", endpoint);
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();

    } catch (err) {
        console.error("Fetch error:", err);
        return fallback;
    }
};


// Fetches paginated reports with optional filtering
// Params:
// requestFilters - Object containing limit, start offset, and filter criteria
// Returns: Promise resolving to array of Report objects
export const getAllReports = async (requestFilters: APIFilters = {}): Promise<Report[]> => {
    const params = new URLSearchParams();

    const limit = requestFilters.limit || 50;
    const start = requestFilters.start || 0;
    params.append('limit', limit.toString());
    params.append('start', start.toString());

    appendFilters(params, "filters", requestFilters.filters);

    const endpoint = `/api/reports/all?${params.toString()}`;
    return fetchJSON<Report[]>(endpoint, []);
};

// Fetches unique values for a specific column with optional filtering
// Params:
// columnName - The column name to retrieve unique values from
// currentfilters - Optional filters to apply when getting column values
// Returns: Promise resolving to array of unique string values
export const getColumnValues = async (
    columnName: string,
    currentfilters?: Record<string, string[]>
): Promise<string[]> => {
    const params = new URLSearchParams({ columnName });

    // Add filters to query string if they exist
    appendFilters(params, "currentFilters", currentfilters);

    const endpoint = `/api/reports/columnFilter?${params.toString()}`;
    return fetchJSON<string[]>(endpoint, []);
};

// Fetches the count of reports matching the specified filters
// Params:
// filters - Optional filter criteria to count matching records
// Returns: Promise resolving to the number of matching reports
export const getFilteredCount = async (filters?: Record<string, string[]>): Promise<number> => {
    const params = new URLSearchParams();

    // Send filters as JSON string
    appendFilters(params, "currentFilters", filters);

    const endpoint = `/api/reports/count?${params.toString()}`;
    return fetchJSON<number>(endpoint, 0);
};

// Fetches report data formatted for map pin display
// Params:
// params - Object containing limit and filter criteria for map pins
// Returns: Promise resolving to array of Report objects with location data
export const getMapPins = async (params: {
    limit: number;
    currentFilters: Record<string, string[]>;
}): Promise<Report[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', params.limit.toString());

    // Send filters as a JSON string
    appendFilters(queryParams, "currentFilters", params.currentFilters);

    const endpoint = `/api/reports/mapDisplay?${queryParams.toString()}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error('Failed to fetch map pins');
    }

    return response.json();
};

// Fetches report data formatted for heatmap visualization
// Params:
// params - Object containing limit, optional column filter, and filter criteria
// Returns: Promise resolving to heatmap data (format varies based on backend response)
export const getHeatMap = async (params: {
    limit: number;
    column?: string;
    currentFilters: Record<string, string[]>;
}): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', params.limit.toString());

    if (params.column) {
        queryParams.append('column', params.column);
    }

    // Send filters as a JSON string
    appendFilters(queryParams, "currentFilters", params.currentFilters);

    const endpoint = `/api/reports/heatMap?${queryParams.toString()}`;
    return fetchJSON(endpoint, []);
};

// Fetches aggregated data for pie chart visualization by column
// Params:
// limit - Maximum number of records to fetch
// column - Column name to aggregate data by
// currentfilters - Optional filters to apply to the data
// Returns: Promise resolving to array of Report objects for pie chart rendering
export const getPieChart = async (
    limit: number,
    column: string,
    currentfilters?: Record<string, string[]>,
): Promise<Report[]> => {
    const params = new URLSearchParams({ column });
    params.append('limit', limit.toString());

    // Add filters to query string if they exist
    appendFilters(params, "currentFilters", currentfilters);

    const endpoint = `/api/reports/pieChart?${params.toString()}`;
    return fetchJSON<Report[]>(endpoint, []);
};