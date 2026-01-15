import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportsTable from '../components/ReportsTable';
import { getAllReports, getColumnValues, getFilteredCount } from '../services/ReportService';
import { useFilters } from '../contexts/FiltersContext';
import { Report } from '../types/Report';

// Mock the services
jest.mock('../services/ReportService');
jest.mock('../contexts/FiltersContext');

const mockGetAllReports = getAllReports as jest.MockedFunction<typeof getAllReports>;
const mockGetColumnValues = getColumnValues as jest.MockedFunction<typeof getColumnValues>;
const mockGetFilteredCount = getFilteredCount as jest.MockedFunction<typeof getFilteredCount>;
const mockUseFilters = useFilters as jest.MockedFunction<typeof useFilters>;

// Sample data
const mockReports: Report[] = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    complaintType: i % 2 === 0 ? 'Noise' : 'Heat',
    descriptorType: 'Desc',
    agencyName: 'Agency',
    locationType: 'Loc',
    incidentAddress: 'Addr',
    incidentZip: '10000',
    addressType: 'AddrType',
    city: 'City',
    status: 'Open',
    createdDate: '2023-01-01',
    closedDate: '',
    communityBoard: '1',
    borough: 'Borough',
    openDataChannelType: 'Phone',
    latitude: 40.0,
    longitude: -74.0
}));

describe('ReportsTable Component', () => {
    const mockSetFilters = jest.fn();
    const mockSetStagedFilters = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementations
        mockUseFilters.mockReturnValue({
            filters: {},
            setFilters: mockSetFilters,
            stagedFilters: {},
            setStagedFilters: mockSetStagedFilters
        });

        mockGetAllReports.mockResolvedValue(mockReports);
        mockGetFilteredCount.mockResolvedValue(100);
        mockGetColumnValues.mockResolvedValue(['Value 1', 'Value 2']);
    });

    test('renders table with reports', async () => {
        render(<ReportsTable />);

        // Check loading state initially
        expect(screen.getByText(/Loading reports/i)).toBeInTheDocument();

        // Wait for reports to load
        await waitFor(() => {
            expect(screen.getAllByText('Noise').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Heat').length).toBeGreaterThan(0);
        });

        // Check headers
        expect(screen.getByText('complaintType')).toBeInTheDocument();
        expect(screen.getByText('agencyName')).toBeInTheDocument();
    });

    test('handles pagination next button', async () => {
        render(<ReportsTable />);

        await waitFor(() => {
            expect(screen.getAllByText('Noise').length).toBeGreaterThan(0);
        });

        const nextButton = screen.getByText('Next →');
        fireEvent.click(nextButton);

        // Should trigger a new fetch with updated start parameter
        await waitFor(() => {
            expect(mockGetAllReports).toHaveBeenCalledWith(expect.objectContaining({
                start: 10 // LIMIT is 10
            }));
        });
    });

    test('opens filter dropdown and loads values', async () => {
        render(<ReportsTable />);

        await waitFor(() => {
            expect(screen.getAllByText('Noise').length).toBeGreaterThan(0);
        });

        // Find filter button for 'complaintType'
        // The button text is "⚲" inside the header cell for complaintType
        // We can find the header first
        const complaintTypeHeader = screen.getByText('complaintType').closest('th');
        const filterButton = complaintTypeHeader?.querySelector('button');
        
        if (filterButton) {
            fireEvent.click(filterButton);
        } else {
            throw new Error('Filter button not found');
        }

        // Should call getColumnValues
        expect(mockGetColumnValues).toHaveBeenCalledWith('complaintType', {});

        // Should display values
        await waitFor(() => {
            expect(screen.getByText('Value 1')).toBeInTheDocument();
            expect(screen.getByText('Value 2')).toBeInTheDocument();
        });
    });

    test('stages a filter when checkbox is clicked', async () => {
        // Setup staged filters mock behavior for the test
        let stagedFiltersState: Record<string, string[]> = {};
        mockSetStagedFilters.mockImplementation((update) => {
             if (typeof update === 'function') {
                stagedFiltersState = update(stagedFiltersState);
             } else {
                stagedFiltersState = update;
             }
        });
        
        // Re-mock useFilters to use the local state variable if needed, 
        // but the component uses the value from context. 
        // Since we can't easily update the hook return value dynamically in a simple mock without a wrapper,
        // we will just check if setStagedFilters was called correctly.

        render(<ReportsTable />);

        await waitFor(() => {
            expect(screen.getAllByText('Noise').length).toBeGreaterThan(0);
        });

        // Open filter for complaintType
        const complaintTypeHeader = screen.getByText('complaintType').closest('th');
        const filterButton = complaintTypeHeader?.querySelector('button');
        if (filterButton) fireEvent.click(filterButton);

        await waitFor(() => {
            expect(screen.getByText('Value 1')).toBeInTheDocument();
        });

        // Click checkbox for Value 1
        const checkbox = screen.getByLabelText('Value 1');
        fireEvent.click(checkbox);

        // Verify setStagedFilters was called
        expect(mockSetStagedFilters).toHaveBeenCalled();
    });
});
