/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

// Mock react-leaflet to avoid DOM/canvas operations in jsdom
jest.mock('react-leaflet', () => {
  /* eslint-disable @typescript-eslint/no-var-requires */
  const React = require('react');
  return {
    __esModule: true,
    MapContainer: ({ children, ...props }: any) => React.createElement('div', props, children),
    TileLayer: (_props: any) => React.createElement('div', null),
    useMap: () => ({ addLayer: jest.fn(), removeLayer: jest.fn() }),
  };
});

// Mock leaflet + leaflet.heat factory so heatLayer calls are no-ops
jest.mock('leaflet', () => ({
  heatLayer: (_points: any[], _opts?: any) => ({ addTo: (_map: any) => ({ _mockLayer: true }) }),
}));
// Prevent the real leaflet.heat script from executing (it expects global L)
jest.mock('leaflet.heat', () => ({}));

// The component uses FiltersContext and ReportService.
import ReportsHeatmap from '../components/ReportsHeatmap';

// Mock the ReportService module used by ReportsHeatmap
jest.mock('../services/ReportService', () => ({
  getHeatMap: jest.fn(),
  getMapPins: jest.fn(),
}));

import * as ReportService from '../services/ReportService';

// Mock the FiltersContext module's `useFilters` hook
jest.mock('../contexts/FiltersContext', () => ({
  useFilters: jest.fn(),
}));
import { useFilters } from '../contexts/FiltersContext';

describe('ReportsHeatmap', () => {
  const defaultFilters = { filters: {}, stagedFilters: {} } as any;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders loading state then message when no points', async () => {
    // Simulate heatMap returning column values (strings) which are not coords
    (ReportService.getHeatMap as jest.Mock).mockResolvedValue(['2025-11-30 00:00:00']);
    (useFilters as jest.Mock).mockReturnValue(defaultFilters);

    render(<ReportsHeatmap />);

    // The component initially renders a container for the map; wait for async work
    await waitFor(() => {
      // Since there are no coordinates, we expect the component to show the "0 points found" text
      expect(screen.getByText(/0 points/i)).toBeInTheDocument();
    });
  });

  test('falls back to getMapPins when heatmap returns non-coordinate data', async () => {
    // heatMap returns non-coordinate data
    (ReportService.getHeatMap as jest.Mock).mockResolvedValue(['not-coords']);
    (useFilters as jest.Mock).mockReturnValue(defaultFilters);

    // getMapPins returns array-of-arrays with lat at index 4 and lon at index 5
    const sampleRows = [
      [1, 'Type', 'Sub', 'Agency', 40.1, -73.2],
      [2, 'Type2', 'Sub2', 'Agency2', 41.2, -72.3],
    ];
    (ReportService.getMapPins as jest.Mock).mockResolvedValue(sampleRows as any);

    render(<ReportsHeatmap />);

    // Wait for the fallback to populate points; the component should show number of points
    await waitFor(() => {
      expect(screen.getByText(/2 points/i)).toBeInTheDocument();
    });
  });

  test('handles object-shaped map pins with latitude/longitude properties', async () => {
    (ReportService.getHeatMap as jest.Mock).mockResolvedValue([]);
    (useFilters as jest.Mock).mockReturnValue(defaultFilters);

    const objPins = [
      { id: 1, latitude: 39.0, longitude: -70.0 },
      { id: 2, latitude: 38.5, longitude: -71.1 },
    ];
    (ReportService.getMapPins as jest.Mock).mockResolvedValue(objPins as any);

    render(<ReportsHeatmap />);

    await waitFor(() => {
      expect(screen.getByText(/2 points/i)).toBeInTheDocument();
    });
  });
});
