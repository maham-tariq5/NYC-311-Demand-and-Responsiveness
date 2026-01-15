import { getAllReports, getColumnValues, getFilteredCount, getMapPins, getPieChart } from '../services/ReportService';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ReportService', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    describe('getAllReports', () => {
        it('fetches reports with default parameters', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => [{ id: 1, complaintType: 'Noise' }],
            });

            const result = await getAllReports();

            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/reports/all?limit=50&start=0'));
            expect(result).toEqual([{ id: 1, complaintType: 'Noise' }]);
        });

        it('fetches reports with custom parameters and filters', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            });

            const filters = { complaintType: ['Noise'] };
            await getAllReports({ limit: 10, start: 20, filters });

            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('limit=10'));
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('start=20'));
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('filters=%7B%22complaintType%22%3A%5B%22Noise%22%5D%7D'));
        });

        it('handles fetch errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));
            const result = await getAllReports();
            expect(result).toEqual([]);
        });

        it('handles non-ok responses', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            });
            const result = await getAllReports();
            expect(result).toEqual([]);
        });
    });

    describe('getColumnValues', () => {
        it('fetches column values', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ['Value1', 'Value2'],
            });

            const result = await getColumnValues('complaintType');

            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('columnName=complaintType'));
            expect(result).toEqual(['Value1', 'Value2']);
        });

        it('handles errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Error'));
            const result = await getColumnValues('complaintType');
            expect(result).toEqual([]);
        });
    });

    describe('getFilteredCount', () => {
        it('fetches count', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => 100,
            });

            const result = await getFilteredCount();
            expect(result).toBe(100);
        });

        it('handles errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Error'));
            const result = await getFilteredCount();
            expect(result).toBe(0);
        });
    });

    describe('getMapPins', () => {
        it('fetches map pins', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => [{ id: 1, lat: 10, lon: 10 }],
            });

            const result = await getMapPins({ limit: 100, currentFilters: {} });
            expect(result).toEqual([{ id: 1, lat: 10, lon: 10 }]);
        });

        it('throws error on failure', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
            });

            await expect(getMapPins({ limit: 100, currentFilters: {} })).rejects.toThrow('Failed to fetch map pins');
        });
    });

    describe('getPieChart', () => {
        it('fetches pie chart data', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => [{ id: 1 }],
            });

            const result = await getPieChart(100, 'complaintType', {});
            expect(result).toEqual([{ id: 1 }]);
        });

        it('handles errors and returns empty array', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            });

            const result = await getPieChart(100, 'complaintType', {});
            expect(result).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
