import React, { useEffect, useState } from 'react';
import { getAllReports, getPieChart } from '../services/ReportService';
import { useFilters } from "../contexts/FiltersContext";
import { Report } from '../types/Report';
import { PieChart } from '@mui/x-charts';
import DropdownMenu, {DropdownItemCheckbox, DropdownItemCheckboxGroup} from '@atlaskit/dropdown-menu';

const HeatmapWrapper = React.lazy(() => import('./ReportsHeatmap'));


const ReportsDashboard: React.FC = () => {
    const { filters, setFilters } = useFilters();
    const [loading, setLoading] = useState(false);
    const [loadingChart, setLoadingChart] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [catAttribute, setCatAttribute] = useState("");
    const [pieChartData, setPieChartData] = useState<Report[]>([]);
    const DISPLAY_LIMIT = 20;    // limit for number of elements to display on chart
    const LIMIT = 5000;         // limit for fetching data 
    const [view, setView] = useState<'chart' | 'heatmap'>('chart');

    // load 5000 sample reports to find filter values
    useEffect(() => {
        // Fetches initial sample of reports to populate filter dropdown options
        // Params: None
        // Returns: None (updates reports state)
        const fetchReports = async () => {
            console.log('fetchReports');
            setLoading(true);
            setError(null);
            try {
                const startValue = 0;
                const data = await getAllReports({
                    limit: LIMIT,
                    start: startValue,
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
    }, []);


    const CATEGORICAL_DATA = [
        "complaintType",
        "descriptorType",
        "agencyName",
        "locationType",
        "addressType",
        "city",
        "borough",
        "openDataChannelType",
    ]

    const STATUS_FILTER_DATA = Array.from(
        new Set(reports.map(report => report.status))
    );
    const COMPLAINT_FILTER_DATA = Array.from(
        new Set(reports.map(report => report.complaintType))
    );
    const DESCRIPTOR_FILTER_DATA = Array.from(
        new Set(reports.map(report => report.descriptorType))
    );
    const AGENCY_FILTER_DATA = Array.from(
        new Set(reports.map(report => report.agencyName))
    );
    const LOCATION_FILTER_DATA = Array.from(
        new Set(reports.map(report => report.locationType))
    );
    const ADDRESS_FILTER_DATA = Array.from(
        new Set(reports.map(report => report.addressType))
    );
    const CITY_FILTER_DATA = Array.from(
        new Set(reports.map(report => report.city))
    );
    const BOROUGH_FILTER_DATA = Array.from(
        new Set(reports.map(report => report.borough))
    );
    const CHANNEL_FILTER_DATA = Array.from(
        new Set(reports.map(report => report.openDataChannelType))
    );

    // Fetches aggregated pie chart data for a specific column with applied filters
    // Params:
    // columnName - The categorical column to aggregate data by
    // currentfilters - Object containing active filter criteria by column name
    // Returns: None (updates pieChartData state)
    const fetchPieChartData = async (columnName: string, currentfilters: Record<string, string[]> ) => {
        console.log('fetchPieChartData');
        setLoadingChart(true);
        setError(null);
        try {
            const data = await getPieChart(
                LIMIT, columnName,currentfilters
            );
            setPieChartData(data);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg || 'Failed to find pie chart data');
        } finally {
            setLoadingChart(false);
        }
    };

    // Replaces empty string entries with 'NONE' label for better display
    // Params:
    // entries - Array of tuples containing label and count pairs
    // Returns: Modified entries array with empty strings replaced
    const fixDataStyling = (entries: [string, number][]) => {
        for (let i=0; i < entries.length; i++) {
            if (entries[i][0] === '""') entries[i][0] = 'NONE';
        }
        return entries;
    };

    // Calculates the sum of all counts in the entries array
    // Params:
    // entries - Array of tuples containing label and count pairs
    // Returns: Total sum of all counts
    const totalData = (entries: [string, number][]) => {
        let total = 0;
        for (let i=0; i < entries.length; i++) {
            total += entries[i][1];
        }
        return total;
    };

    // Trims data to top entries and combines remaining entries as 'OTHER'
    // Params:
    // data - Object with string keys and numeric counts
    // Returns: Array of top entries plus 'OTHER' category if needed
    const trimData = (data: Record<string, number> ) => {
        /*
            1. sorts data records from most popular to least
            2. saves the 20 most popular entries
            3. rest of the entries are combined and added as 'OTHER'
        */

        const entries = Object.entries(data);
        const sorted_entries = entries.sort((a, b) => b[1] - a[1]);
        let top_entries = sorted_entries.slice(0, DISPLAY_LIMIT);
        top_entries = fixDataStyling(top_entries);

        if (sorted_entries.length <= DISPLAY_LIMIT) return top_entries;

        const other_entries = sorted_entries.slice(DISPLAY_LIMIT);
        top_entries.push(['OTHER', totalData(other_entries)]);

        return top_entries;
    };

    // Processes reports into formatted pie chart data with percentages
    // Params:
    // reports - Array of Report objects to aggregate
    // Returns: Array of objects with id, value, and label for pie chart rendering
    const getCategoricalData = (reports: Report[]) => {
        const column_data: Record<string, number> = {};

        reports.forEach((report: Report) => {
            const key = JSON.stringify(report);
            column_data[key] = (column_data[key] || 0) + 1;
        });

        // trim data - top 20 shown, everything else labeled as 'OTHER'
        const trimmed_column_data = trimData(column_data);

        // add percentage of total to label
        const total = totalData(trimmed_column_data);
        for (const item of trimmed_column_data) {
            const percent = ((item[1] / total) * 100).toFixed(1);
            item[0] = `${percent}%: ${item[0]}`;
        }

        return trimmed_column_data.map(([label, value], index) => ({
            id: index,
            value: Number(value),
            label
        }));
    };

    // Toggles a filter value on or off for a specific column
    // Params:
    // column_name - The column to apply the filter to
    // val - The filter value to toggle
    // Returns: None (updates filters state)
    const toggleFilter = (column_name: string, val: string) => {
        setFilters(prev => {
            const updated = { ...prev };
            const isChecked = updated[column_name]?.includes(val) || false;

            if (isChecked) {
                // Remove the filter
                updated[column_name] = updated[column_name]?.filter(s => s !== val);
                if (updated[column_name]?.length === 0) delete updated[column_name];
            } else {
                // Add the filter
                updated[column_name] = [...(updated[column_name] || []), val];
            }

            return updated;
        });
    };

    // Clears all active filters
    const clearFilters = () => {
        setFilters({});
    };

    // Returns inline styles for dropdown container
    const dropDownContainer = () => ({
        display: "flex",
        height: "40px",
        marginBottom: "2px"
    });

    // Returns inline styles for dropdown name label
    const dropDownName = () => ({
        fontSize: '16px',
        border: "1px solid black",
        padding: "0 10px",
        alignContent: "center"
    });

    // Returns inline styles for dropdown select element
    const dropDownStyle = () => ({
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '16px',
        fontFamily: 'inherit'
    });

    // Renders a dropdown menu with checkboxes for filtering by column values
    // Params:
    // column_name - The name of the column to filter
    // filter_values - Array of possible filter values for this column
    // Returns: JSX element containing dropdown with checkbox filters
    const displayFilters = (column_name: string, filter_values: string[]) => (
        <DropdownMenu  trigger={column_name} shouldRenderToParent>
            <DropdownItemCheckboxGroup title={`${column_name} Filters`} id={`${column_name}-group`}>
                {filter_values.map((val) => (
                    <DropdownItemCheckbox
                        key={val}
                        id={val}
                        isSelected={filters[column_name]?.includes(val) || false}
                        onClick={() => toggleFilter(column_name, val)}
                    >
                        {val}
                    </DropdownItemCheckbox>
                ))}
            </DropdownItemCheckboxGroup>
        </DropdownMenu>
    );

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading filters…</div>;
    }

    if (error) return <div style={{ color: 'darkred', padding: '20px' }}>Error: {error}</div>;

    const categorical = CATEGORICAL_DATA;
    const catSelected = catAttribute || categorical[0];

    return (
        <div style={{ padding: '20px', maxWidth: "90%", margin: "auto" }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button onClick={() => setView('chart')} style={{ padding: '6px 12px', backgroundColor: view === 'chart' ? '#007bff' : '#ccc', color: view === 'chart' ? '#fff' : '#000', border: 'none', borderRadius: 6 }}>Chart</button>
                <button onClick={() => setView('heatmap')} style={{ padding: '6px 12px', backgroundColor: view === 'heatmap' ? '#007bff' : '#ccc', color: view === 'heatmap' ? '#fff' : '#000', border: 'none', borderRadius: 6 }}>Heatmap</button>
            </div>
            {/* Loading indicator */}
            {loadingChart && (
                <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: '#856404'
                }}>
                    Loading chart...
                </div>
            )}

            <div className="dashboard-controls">
                <div style={{borderRight: "transparent", ...dropDownName() }}><b>Categorical Data</b></div>
                <select
                    style={ dropDownStyle() }
                    onChange={(e) => setCatAttribute(e.target.value)}
                >
                    { categorical.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <button className="control-btn" onClick={() => clearFilters()}><b>Clear Filters</b></button>
                <button className="control-btn primary" onClick={() => fetchPieChartData(catSelected, filters)}><b>Go!</b></button>
            </div>

            { displayFilters('status',              STATUS_FILTER_DATA) }
            { displayFilters('complaintType',       COMPLAINT_FILTER_DATA) }
            { displayFilters('descriptorType',      DESCRIPTOR_FILTER_DATA) }
            { displayFilters('agencyName',          AGENCY_FILTER_DATA) }
            { displayFilters('locationType',        LOCATION_FILTER_DATA) }
            { displayFilters('addressType',         ADDRESS_FILTER_DATA) }
            { displayFilters('city',                CITY_FILTER_DATA) }
            { displayFilters('borough',             BOROUGH_FILTER_DATA) }
            { displayFilters('openDataChannelType', CHANNEL_FILTER_DATA) }

            <div style={{display: 'flex'}}>
                <div style={{ marginTop: 10 }}>
                    You selected: <b>{catSelected}</b>
                </div>
                <div style={{ marginTop: 10, marginLeft: 5 }}>
                    Filters: <b>{JSON.stringify(filters)}</b>
                </div>
            </div>

            {view === 'chart' && pieChartData && (
                <PieChart
                    series={[
                        {
                            data: getCategoricalData(pieChartData),
                            highlightScope: { fade: 'global', highlight: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },

                        }
                    ]}
                    height={550}
                />
            )}

            {view === 'heatmap' && (
                // lazy-load ReportsHeatmap to avoid adding a heavy dependency to chart-only flows
                <div style={{ marginTop: 12 }}>
                    {/* Dynamic import to reduce initial bundle size in case heatmap libs are heavy */}
                    <React.Suspense fallback={<div>Loading heatmap...</div>}>
                        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                        {/* @ts-ignore */}
                        {/** Importing dynamically so tests don't need leaflet.heat unless used */}
                        <HeatmapWrapper column={catSelected} />
                    </React.Suspense>
                </div>
            )}
        </div>
    );
};

export default ReportsDashboard;