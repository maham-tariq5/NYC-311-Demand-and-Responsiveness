import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import ReportsDashboard from '../components/ReportsDashboard';
import { getAllReports, getPieChart } from '../services/ReportService';
import { useFilters } from '../contexts/FiltersContext';
import { Report } from '../types/Report';

// Mock services and context
jest.mock('../services/ReportService');
jest.mock('../contexts/FiltersContext');

// Mock MUI Charts
jest.mock('@mui/x-charts', () => ({
    PieChart: () => <div data-testid="pie-chart" />,
}));

// Mock Atlaskit Dropdown
jest.mock('@atlaskit/dropdown-menu', () => {
    const DropdownMenu = ({ children, trigger }: { children: React.ReactNode; trigger: React.ReactNode }) => (
        <div data-testid="dropdown-menu">
            <button>{trigger}</button>
            {children}
        </div>
    );
    return {
        __esModule: true,
        default: DropdownMenu,
        DropdownItemCheckbox: ({ children, onClick, isSelected }: { children: React.ReactNode; onClick: () => void; isSelected: boolean }) => (
            <button 
                data-testid={`dropdown-item-${children}`} 
                onClick={onClick}
                data-selected={isSelected}
            >
                {children}
            </button>
        ),
        DropdownItemCheckboxGroup: ({ children, title }: { children: React.ReactNode; title: string }) => (
            <div data-testid={`dropdown-group-${title}`}>
                {title}
                {children}
            </div>
        ),
    };
});

const mockGetAllReports = getAllReports as jest.MockedFunction<typeof getAllReports>;
const mockGetPieChart = getPieChart as jest.MockedFunction<typeof getPieChart>;
const mockUseFilters = useFilters as jest.MockedFunction<typeof useFilters>;

const mockReports: Report[] = [
    {
        id: 1,
        complaintType: 'Noise',
        descriptorType: 'Loud Music',
        agencyName: 'NYPD',
        locationType: 'Street',
        incidentAddress: '123 Main St',
        incidentZip: '10001',
        addressType: 'Address',
        city: 'New York',
        status: 'Open',
        createdDate: '2023-01-01',
        closedDate: '',
        communityBoard: '1',
        borough: 'Manhattan',
        openDataChannelType: 'Phone',
        latitude: 40.7128,
        longitude: -74.0060
    },
    {
        id: 2,
        complaintType: 'Heat',
        descriptorType: 'No Heat',
        agencyName: 'HPD',
        locationType: 'Apartment',
        incidentAddress: '456 Elm St',
        incidentZip: '10002',
        addressType: 'Address',
        city: 'New York',
        status: 'Closed',
        createdDate: '2023-01-02',
        closedDate: '2023-01-03',
        communityBoard: '2',
        borough: 'Brooklyn',
        openDataChannelType: 'Online',
        latitude: 40.7129,
        longitude: -74.0061
    }
];

const mockPieData: Report[] = [
    { ...mockReports[0], complaintType: 'Noise' },
    { ...mockReports[0], complaintType: 'Noise' },
    { ...mockReports[0], complaintType: 'Heat' },
];

describe('ReportsDashboard Component', () => {
    const setFilters = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseFilters.mockReturnValue({
            filters: {},
            setFilters: setFilters,
            stagedFilters: {},
            setStagedFilters: jest.fn()
        });
        mockGetAllReports.mockResolvedValue(mockReports);
        mockGetPieChart.mockResolvedValue(mockPieData);
    });

    test('renders dashboard and loads initial data', async () => {
        await act(async () => {
            render(<ReportsDashboard />);
        });

        // Check loading state (might be too fast to catch, but we can check calls)
        expect(mockGetAllReports).toHaveBeenCalled();

        // Check if dropdowns are rendered
        expect(screen.getByText('Categorical Data')).toBeInTheDocument();
        expect(screen.getAllByTestId('dropdown-menu').length).toBeGreaterThan(0);
    });

    test('fetches and displays pie chart when "Go!" is clicked', async () => {
        await act(async () => {
            render(<ReportsDashboard />);
        });

        const goButton = screen.getByText('Go!');
        
        await act(async () => {
            fireEvent.click(goButton);
        });

        expect(mockGetPieChart).toHaveBeenCalled();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    test('handles filter selection', async () => {
        await act(async () => {
            render(<ReportsDashboard />);
        });

        // Find a filter item (mocked)
        const filterItem = screen.getByTestId('dropdown-item-Noise');
        
        await act(async () => {
            fireEvent.click(filterItem);
        });

        expect(setFilters).toHaveBeenCalled();
    });

    test('clears filters', async () => {
        await act(async () => {
            render(<ReportsDashboard />);
        });

        const clearButton = screen.getByText('Clear Filters');
        
        await act(async () => {
            fireEvent.click(clearButton);
        });

        expect(setFilters).toHaveBeenCalledWith({});
    });

    test('handles error state', async () => {
        mockGetAllReports.mockRejectedValue(new Error('Dashboard Error'));

        await act(async () => {
            render(<ReportsDashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Error: Dashboard Error')).toBeInTheDocument();
        });
    });
});
