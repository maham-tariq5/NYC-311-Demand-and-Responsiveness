import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

// Mock child components
jest.mock('../components/ReportsMap', () => {
    const MockReportsMap = () => <div data-testid="mock-reports-map">Reports Map</div>;
    MockReportsMap.displayName = 'ReportsMap';
    return MockReportsMap;
});
jest.mock('../components/ReportsTable', () => {
    const MockReportsTable = () => <div data-testid="mock-reports-table">Reports Table</div>;
    MockReportsTable.displayName = 'ReportsTable';
    return MockReportsTable;
});
jest.mock('../components/ReportsDashboard', () => {
    const MockReportsDashboard = () => <div data-testid="mock-reports-dashboard">Reports Dashboard</div>;
    MockReportsDashboard.displayName = 'ReportsDashboard';
    return MockReportsDashboard;
});

describe('App Component', () => {
    test('renders dashboard by default', () => {
        render(<App />);
        expect(screen.getByTestId('mock-reports-dashboard')).toBeInTheDocument();
        expect(screen.queryByTestId('mock-reports-table')).not.toBeInTheDocument();
        expect(screen.queryByTestId('mock-reports-map')).not.toBeInTheDocument();
    });

    test('switches to table view', () => {
        render(<App />);
        
        const tableButton = screen.getByText('Table');
        fireEvent.click(tableButton);

        expect(screen.getByTestId('mock-reports-table')).toBeInTheDocument();
        expect(screen.queryByTestId('mock-reports-dashboard')).not.toBeInTheDocument();
    });

    test('switches to map view', () => {
        render(<App />);
        
        const mapButton = screen.getByText('Map');
        fireEvent.click(mapButton);

        expect(screen.getByTestId('mock-reports-map')).toBeInTheDocument();
        expect(screen.queryByTestId('mock-reports-dashboard')).not.toBeInTheDocument();
    });
});
