import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ReportsMap from '../components/ReportsMap';
import { getMapPins } from '../services/ReportService';
import { useFilters } from '../contexts/FiltersContext';

// Mock services and context
jest.mock('../services/ReportService');
jest.mock('../contexts/FiltersContext');

// Mock Leaflet and React-Leaflet
jest.mock('leaflet', () => ({
    Icon: {
        Default: {
            mergeOptions: jest.fn(),
            prototype: { _getIconUrl: jest.fn() }
        }
    }
}));

jest.mock('react-leaflet', () => ({
    MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({ children }: { children: React.ReactNode }) => <div data-testid="marker">{children}</div>,
    Popup: ({ children }: { children: React.ReactNode }) => <div data-testid="popup">{children}</div>,
}));

const mockGetMapPins = getMapPins as jest.MockedFunction<typeof getMapPins>;
const mockUseFilters = useFilters as jest.MockedFunction<typeof useFilters>;

// Sample data
// The component expects raw array data from getMapPins
const mockRawReports = [
    [1, 'Noise', 'Loud Music', 'NYPD', 40.7128, -74.0060],
    [2, 'Heat', 'No Heat', 'HPD', 40.7129, -74.0061]
];

describe('ReportsMap Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseFilters.mockReturnValue({
            filters: {},
            setFilters: jest.fn(),
            stagedFilters: {},
            setStagedFilters: jest.fn()
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockGetMapPins.mockResolvedValue(mockRawReports as any);
    });

    test('renders map and markers', async () => {
        render(<ReportsMap />);

        // Check loading state
        expect(screen.getByText(/Loading map pins/i)).toBeInTheDocument();

        // Wait for data to load
        await waitFor(() => {
            expect(screen.queryByText(/Loading map pins/i)).not.toBeInTheDocument();
        });

        // Check if markers are rendered
        const markers = screen.getAllByTestId('marker');
        expect(markers).toHaveLength(2);

        // Check count display
        expect(screen.getByText('Showing 2 reports')).toBeInTheDocument();
    });

    test('handles error state', async () => {
        mockGetMapPins.mockRejectedValue(new Error('API Error'));

        render(<ReportsMap />);

        await waitFor(() => {
            expect(screen.getByText('Error: API Error')).toBeInTheDocument();
        });
    });

    test('filters out invalid coordinates', async () => {
        const invalidData = [
            [1, 'Valid', 'Desc', 'Agency', 40.7128, -74.0060],
            [2, 'Invalid', 'Desc', 'Agency', 'NaN', 'NaN'] // Invalid coords
        ];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockGetMapPins.mockResolvedValue(invalidData as any);

        render(<ReportsMap />);

        await waitFor(() => {
            expect(screen.getByText('Showing 1 reports')).toBeInTheDocument();
        });
        
        const markers = screen.getAllByTestId('marker');
        expect(markers).toHaveLength(1);
    });
});
