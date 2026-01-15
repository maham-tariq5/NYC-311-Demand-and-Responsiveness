package com.example.cis4900.spring.template.reports;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.example.cis4900.spring.template.reports.dao.ReportsDao;
import com.example.cis4900.spring.template.reports.models.Report;

public class ReportsServiceImplTest {

    @Mock
    private ReportsDao reportsDao;

    @InjectMocks
    private ReportsServiceImpl reportsServiceImpl;

    private ReportsService reportsService;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.initMocks(this);
        this.reportsService = reportsServiceImpl;
    }

    private Iterable<Report> sampleList() {
        List<Report> reports = new ArrayList<>();

        Report r1 = new Report(
            "Illegal Parking", "Parking on Sidewalk", "Parking Enforcment", "Sidewalk", "200 Flatbush Ave", "11217",
            "Residential", "New York", "Open",
            "2025-11-05", "2025-11-12", "10 Brooklyn",
            "Brooklyn", "Mobile App", 40.6836, -73.9760
        );
        r1.setId(1);

        Report r2 = new Report(
            "Noise - Residential", "Banging/Pounding", "New York City Police Department",
            "Residential Building/House", "300 Flatbush Ave", "11212",
            "ADDRESS", "BROOKLYN", "In Progress",
            "2025-11-05", "2025-11-12", "10 Brooklyn",
            "Brooklyn", "Mobile App", 40.6836, -73.9760
        );
        r2.setId(2);

        reports.add(r1);
        reports.add(r2);
        return reports;
    }

    private Iterable<Report> filteredSampleList() {
        List<Report> reports = new ArrayList<>();

        Report r2 = new Report(
            "Noise - Residential", "Banging/Pounding", "New York City Police Department",
            "Residential Building/House", "300 Flatbush Ave", "11212",
            "ADDRESS", "BROOKLYN", "In Progress",
            "2025-11-05", "2025-11-12", "10 Brooklyn",
            "Brooklyn", "Mobile App", 40.6836, -73.9760
        );
        r2.setId(2);

        reports.add(r2);
        return reports;
    }

    private static final String EMPTY = "";

    private static final String SAMPLE_FILTER = "{\"complaintType\":[\"Noise - Residential\"]}";

    private static final String BAD_FILTER = "Not-JSON-Filter";

    private static final String ALLREPORTS_DEFAULT_LIMIT = "10";

    private static final String ALLREPORTS_CUSTOM_LIMIT = "50";

    private static final String ALLREPORTS_LARGE_LIMIT = "1000";

    private static final String ALLREPORTS_DEFAULT_START = "0";

    private static final String ALLREPORTS_CUSTOM_START = "20";

    private static final String ALLREPORTS_LARGE_START = "500";

    private static final List<String> COLUMN_VALUES = List.of("filter1", "filter2", "filter3");

    private static final List<String> NO_COLUMN_VALUES = new ArrayList<>();

    private static final String COLUMN_NAME = "column name";

    private static final String MAP_DEFAULT_LIMIT = "5000";
    
    private static final String MAP_CUSTOM_LIMIT = "10";

    private static final String CHART_TEST_LIMIT = "5000";

    private static final String CHART_TEST_COLUMN = "complaintType";

    private static final String HEAT_TEST_LIMIT = "5000";

    private static final String HEAT_TEST_COLUMN = "createdDate";


    @Test
    void allReportsSuccessDefaultValues() {
        Iterable<Report> sampleReports = sampleList();
        when(reportsDao.findLimitedReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, EMPTY)).thenReturn(sampleReports);

        Iterable<Report> results = reportsService.allReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, EMPTY);

        assertNotNull(results);
        assertEquals(sampleReports, results);
        verify(reportsDao).findLimitedReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, EMPTY);
    }

    @Test
    void allReportsSuccessFilters() {
        Iterable<Report> sampleReportsFiltered = filteredSampleList();
        when(reportsDao.findLimitedReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, SAMPLE_FILTER)).thenReturn(sampleReportsFiltered);

        Iterable<Report> results = reportsService.allReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, SAMPLE_FILTER);

        assertNotNull(results);
        assertEquals(sampleReportsFiltered, results);
        verify(reportsDao).findLimitedReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, SAMPLE_FILTER);
    }

    @Test
    void allReportsSuccessCustomStart() {
        Iterable<Report> sampleReports = sampleList();
        when(reportsDao.findLimitedReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_CUSTOM_START, EMPTY)).thenReturn(sampleReports);

        Iterable<Report> results = reportsService.allReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_CUSTOM_START, EMPTY);

        assertNotNull(results);
        assertEquals(sampleReports, results);
        verify(reportsDao).findLimitedReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_CUSTOM_START, EMPTY);
    }

    @Test
    void allReportsSuccessCustomLimit() {
        Iterable<Report> sampleReports = sampleList();
        when(reportsDao.findLimitedReports(ALLREPORTS_CUSTOM_LIMIT, ALLREPORTS_DEFAULT_START, EMPTY)).thenReturn(sampleReports);

        Iterable<Report> results = reportsService.allReports(ALLREPORTS_CUSTOM_LIMIT, ALLREPORTS_DEFAULT_START, EMPTY);

        assertNotNull(results);
        assertEquals(sampleReports, results);
        verify(reportsDao).findLimitedReports(ALLREPORTS_CUSTOM_LIMIT, ALLREPORTS_DEFAULT_START, EMPTY);
    }

    @Test
    void allReportsSuccessLargeLimitAndStart() {
        Iterable<Report> sampleReports = sampleList();
        when(reportsDao.findLimitedReports(ALLREPORTS_LARGE_LIMIT, ALLREPORTS_LARGE_START, EMPTY)).thenReturn(sampleReports);

        Iterable<Report> results = reportsService.allReports(ALLREPORTS_LARGE_LIMIT, ALLREPORTS_LARGE_START, EMPTY);

        assertNotNull(results);
        assertEquals(sampleReports, results);
        verify(reportsDao).findLimitedReports(ALLREPORTS_LARGE_LIMIT, ALLREPORTS_LARGE_START, EMPTY);
    }

    @Test
    void allReportsSuccessNullFilters() {
        Iterable<Report> sampleReports = sampleList();
        when(reportsDao.findLimitedReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, null)).thenReturn(sampleReports);

        Iterable<Report> results = reportsService.allReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, null);

        assertNotNull(results);
        assertEquals(sampleReports, results);
        verify(reportsDao).findLimitedReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, null);
    }

    @Test
    void allReportsReturnsNullWhenDaoReturnsNull() {
        when(reportsDao.findLimitedReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, EMPTY)).thenReturn(null);

        Iterable<Report> results = reportsService.allReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, EMPTY);

        assertNull(results);
        verify(reportsDao).findLimitedReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, EMPTY);
    }

    @Test
    void allReportsReturnsEmptyWhenNoReports() {
        Iterable<Report> emptyReports = new ArrayList<>();
        when(reportsDao.findLimitedReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, EMPTY)).thenReturn(emptyReports);

        Iterable<Report> results = reportsService.allReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, EMPTY);

        assertNotNull(results);
        assertFalse(results.iterator().hasNext());
        verify(reportsDao).findLimitedReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, EMPTY);
    }

    @Test
    void allReportsHandlesInvalidFilters() {
        Iterable<Report> sampleReports = sampleList();
        when(reportsDao.findLimitedReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, BAD_FILTER)).thenReturn(sampleReports);

        Iterable<Report> results = reportsService.allReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, BAD_FILTER);

        assertNotNull(results);
        assertEquals(sampleReports, results);
        verify(reportsDao).findLimitedReports(ALLREPORTS_DEFAULT_LIMIT, ALLREPORTS_DEFAULT_START, BAD_FILTER);
    }

    @Test
    void allReportsInvalidParameters() {
        Iterable<Report> emptyReports = new ArrayList<>();
        when(reportsDao.findLimitedReports(null, null, null)).thenReturn(emptyReports);

        Iterable<Report> results = reportsService.allReports(null, null, null);

        assertNotNull(results);
        assertFalse(results.iterator().hasNext());
        verify(reportsDao).findLimitedReports(null, null, null);
    }

    @Test
    void columnFilterSuccessNoFilters() {
        when(reportsDao.findColumnValues(COLUMN_NAME, EMPTY)).thenReturn(COLUMN_VALUES);

        Iterable<String> results = reportsService.columnFilter(COLUMN_NAME, EMPTY);

        assertNotNull(results);
        assertIterableEquals(COLUMN_VALUES, results);
        verify(reportsDao).findColumnValues(COLUMN_NAME, EMPTY);
    }

    @Test
    void columnFilterSuccessFilters() {
        when(reportsDao.findColumnValues(COLUMN_NAME, SAMPLE_FILTER)).thenReturn(COLUMN_VALUES);

        Iterable<String> results = reportsService.columnFilter(COLUMN_NAME, SAMPLE_FILTER);

        assertNotNull(results);
        assertIterableEquals(COLUMN_VALUES, results);
        verify(reportsDao).findColumnValues(COLUMN_NAME, SAMPLE_FILTER);
    }

    @Test
    void columnFilterSuccessNoSampleValues() {
        when(reportsDao.findColumnValues(COLUMN_NAME, EMPTY)).thenReturn(NO_COLUMN_VALUES);

        Iterable<String> results = reportsService.columnFilter(COLUMN_NAME, EMPTY);

        assertNotNull(results);
        assertIterableEquals(NO_COLUMN_VALUES, results);
        verify(reportsDao).findColumnValues(COLUMN_NAME, EMPTY);
    }

    @Test
    void columnFilterInvalidParameters() {
        when(reportsDao.findColumnValues(null, null)).thenReturn(NO_COLUMN_VALUES);

        Iterable<String> results = reportsService.columnFilter(null, null);

        assertNotNull(results);
        assertFalse(results.iterator().hasNext());
        verify(reportsDao).findColumnValues(null, null);
    }

    @Test
    void getFilteredCountSuccessDefault() {
        Integer expectedCount = 0;
        when(reportsDao.getFilteredCount(EMPTY)).thenReturn(expectedCount);

        Integer count = reportsService.getFilteredCount(EMPTY);

        assertNotNull(count);
        assertEquals(expectedCount, count);
        verify(reportsDao).getFilteredCount(EMPTY);
    }

    @Test
    void getFilteredCountSuccessWithFilters() {
        Integer expectedCount = 5;
        when(reportsDao.getFilteredCount(SAMPLE_FILTER)).thenReturn(expectedCount);

        Integer count = reportsService.getFilteredCount(SAMPLE_FILTER);

        assertNotNull(count);
        assertEquals(expectedCount, count);
        verify(reportsDao).getFilteredCount(SAMPLE_FILTER);
    }

    @Test
    void getFilteredCountSuccessNullFilters() {
        Integer expectedCount = 0;
        when(reportsDao.getFilteredCount(null)).thenReturn(expectedCount);

        Integer count = reportsService.getFilteredCount(null);

        assertNotNull(count);
        assertEquals(expectedCount, count);
        verify(reportsDao).getFilteredCount(null);
    }

    @Test
    void displayMapSuccessDefault() {
        Iterable<Report> sampleReports = sampleList();
        when(reportsDao.getMapMarkers(MAP_DEFAULT_LIMIT, EMPTY)).thenReturn(sampleReports);

        Iterable<Report> results = reportsService.displayMap(MAP_DEFAULT_LIMIT, EMPTY);

        assertNotNull(results);
        assertEquals(sampleReports, results);
        verify(reportsDao).getMapMarkers(MAP_DEFAULT_LIMIT, EMPTY);
    }

    @Test
    void displayMapSuccessFilters() {
        Iterable<Report> sampleReports = sampleList();
        when(reportsDao.getMapMarkers(MAP_DEFAULT_LIMIT, SAMPLE_FILTER)).thenReturn(sampleReports);

        Iterable<Report> results = reportsService.displayMap(MAP_DEFAULT_LIMIT, SAMPLE_FILTER);

        assertNotNull(results);
        assertEquals(sampleReports, results);
        verify(reportsDao).getMapMarkers(MAP_DEFAULT_LIMIT, SAMPLE_FILTER);
    }

    @Test
    void displayMapSuccessCustomLimit() {
        Iterable<Report> sampleReports = sampleList();
        when(reportsDao.getMapMarkers(MAP_CUSTOM_LIMIT, SAMPLE_FILTER)).thenReturn(sampleReports);

        Iterable<Report> results = reportsService.displayMap(MAP_CUSTOM_LIMIT, SAMPLE_FILTER);

        assertNotNull(results);
        assertEquals(sampleReports, results);
        verify(reportsDao).getMapMarkers(MAP_CUSTOM_LIMIT, SAMPLE_FILTER);
    }

    @Test
    void displayMapSuccessNullFilters() {
        Iterable<Report> sampleReports = sampleList();
        when(reportsDao.getMapMarkers(MAP_DEFAULT_LIMIT, null)).thenReturn(sampleReports);

        Iterable<Report> results = reportsService.displayMap(MAP_DEFAULT_LIMIT, null);

        assertNotNull(results);
        assertEquals(sampleReports, results);
        verify(reportsDao).getMapMarkers(MAP_DEFAULT_LIMIT, null);
    }

    // Sprint 7 Unit tests for chart

    @Test
    void getChartDataSuccessDefault() {
        // Chart data request for "complaintType" with NO filters.
        // DAO returns a normal list of reports.
        Iterable<Report> sampleReports = sampleList();
        when(reportsDao.getChartData(CHART_TEST_LIMIT, CHART_TEST_COLUMN, EMPTY)).thenReturn(sampleReports);

        // Call the service method under test
        Iterable<Report> results = reportsService.chartData(CHART_TEST_LIMIT, CHART_TEST_COLUMN, EMPTY);

        // Service should: Not return null, return exactly what DAO returned, Call DAO once with the same argument
        assertNotNull(results);
        assertEquals(sampleReports, results);
        verify(reportsDao).getChartData(CHART_TEST_LIMIT, CHART_TEST_COLUMN, EMPTY);
    }

    @Test
    void getChartDataSuccessWithFilters() {
        // This simulates the chart being filtered by complaintType.
        Iterable<Report> filteredReports = filteredSampleList();

        when(reportsDao.getChartData(CHART_TEST_LIMIT, CHART_TEST_COLUMN, SAMPLE_FILTER)).thenReturn(filteredReports);

        // Call service with the same filters
        Iterable<Report> results = reportsService.chartData(CHART_TEST_LIMIT, CHART_TEST_COLUMN, SAMPLE_FILTER);

        // Confirms: Filters are passed straight through to DAO, result from DAO is returned unchanged
        assertNotNull(results);
        assertEquals(filteredReports, results);
        verify(reportsDao).getChartData(CHART_TEST_LIMIT, CHART_TEST_COLUMN, SAMPLE_FILTER);
    }

    @Test
    void getChartDataSuccessNullFilters() {
        // Filters are explicitly null instead of empty string.
        Iterable<Report> sampleReports = sampleList();
        when(reportsDao.getChartData(CHART_TEST_LIMIT, CHART_TEST_COLUMN, null)).thenReturn(sampleReports);

        Iterable<Report> results = reportsService.chartData(CHART_TEST_LIMIT, CHART_TEST_COLUMN, null);

        // Confirms that null filters are allowed and not altered
        assertNotNull(results);
        assertEquals(sampleReports, results);
        verify(reportsDao).getChartData(CHART_TEST_LIMIT, CHART_TEST_COLUMN, null);
    }

    @Test
    void getChartDataReturnsEmptyWhenNoData() {
        // DAO returns an empty list (no matching reports for the chart).
        Iterable<Report> emptyReports = new ArrayList<>();
        when(reportsDao.getChartData(CHART_TEST_LIMIT, CHART_TEST_COLUMN, EMPTY)).thenReturn(emptyReports);

        Iterable<Report> results = reportsService.chartData(CHART_TEST_LIMIT, CHART_TEST_COLUMN, EMPTY);

        // Service should: Return a non-null iterable, but that iterable should be empty
        assertNotNull(results);
        assertFalse(results.iterator().hasNext());
        verify(reportsDao).getChartData(CHART_TEST_LIMIT, CHART_TEST_COLUMN, EMPTY);
    }

    @Test
    void getChartDataReturnsNullWhenDaoReturnsNull() {
        // Edge case: DAO returns null instead of a collection.
        when(reportsDao.getChartData(CHART_TEST_LIMIT, CHART_TEST_COLUMN, EMPTY)).thenReturn(null);

        Iterable<Report> results = reportsService.chartData(CHART_TEST_LIMIT, CHART_TEST_COLUMN, EMPTY);

        // Confirms that the service currently just passes null through
        assertNull(results);
        verify(reportsDao).getChartData(CHART_TEST_LIMIT, CHART_TEST_COLUMN, EMPTY);
    }

    // Sprint 8 Tests for Heatmap

    @Test
    void getHeatMapDataSuccessDefault() {
        // No filters, default limit + a column (e.g., createdDate)
        Iterable<Report> sampleReports = sampleList();
        when(reportsDao.getHeatMapData(HEAT_TEST_LIMIT, HEAT_TEST_COLUMN, EMPTY))
            .thenReturn(sampleReports);

        Iterable<Report> results =
            reportsService.heatMapData(HEAT_TEST_LIMIT, HEAT_TEST_COLUMN, EMPTY);

        assertNotNull(results);
        assertEquals(sampleReports, results);
        verify(reportsDao).getHeatMapData(HEAT_TEST_LIMIT, HEAT_TEST_COLUMN, EMPTY);
    }

    @Test
    void getHeatMapDataSuccessWithFilters() {
        // Heatmap request that is filtered, e.g. by complaintType
        Iterable<Report> filteredReports = filteredSampleList();

        when(reportsDao.getHeatMapData(HEAT_TEST_LIMIT, HEAT_TEST_COLUMN, SAMPLE_FILTER))
            .thenReturn(filteredReports);

        Iterable<Report> results =
            reportsService.heatMapData(HEAT_TEST_LIMIT, HEAT_TEST_COLUMN, SAMPLE_FILTER);

        assertNotNull(results);
        assertEquals(filteredReports, results);
        verify(reportsDao).getHeatMapData(HEAT_TEST_LIMIT, HEAT_TEST_COLUMN, SAMPLE_FILTER);
    }

    @Test
    void getHeatMapDataSuccessNullFilters() {
        // Explicitly passing null filters instead of empty string
        Iterable<Report> sampleReports = sampleList();
        when(reportsDao.getHeatMapData(HEAT_TEST_LIMIT, HEAT_TEST_COLUMN, null))
            .thenReturn(sampleReports);

        Iterable<Report> results =
            reportsService.heatMapData(HEAT_TEST_LIMIT, HEAT_TEST_COLUMN, null);

        assertNotNull(results);
        assertEquals(sampleReports, results);
        verify(reportsDao).getHeatMapData(HEAT_TEST_LIMIT, HEAT_TEST_COLUMN, null);
    }

    @Test
    void getHeatMapDataReturnsEmptyWhenNoData() {
        // DAO returns an empty list (no matching rows for the heatmap)
        Iterable<Report> emptyReports = new ArrayList<>();
        when(reportsDao.getHeatMapData(HEAT_TEST_LIMIT, HEAT_TEST_COLUMN, EMPTY))
            .thenReturn(emptyReports);

        Iterable<Report> results =
            reportsService.heatMapData(HEAT_TEST_LIMIT, HEAT_TEST_COLUMN, EMPTY);

        assertNotNull(results);
        assertFalse(results.iterator().hasNext());
        verify(reportsDao).getHeatMapData(HEAT_TEST_LIMIT, HEAT_TEST_COLUMN, EMPTY);
    }

    @Test
    void getHeatMapDataReturnsNullWhenDaoReturnsNull() {
        // Edge case: DAO returns null
        when(reportsDao.getHeatMapData(HEAT_TEST_LIMIT, HEAT_TEST_COLUMN, EMPTY))
            .thenReturn(null);

        Iterable<Report> results =
            reportsService.heatMapData(HEAT_TEST_LIMIT, HEAT_TEST_COLUMN, EMPTY);

        assertNull(results);
        verify(reportsDao).getHeatMapData(HEAT_TEST_LIMIT, HEAT_TEST_COLUMN, EMPTY);
    }

    @Test
    void getHeatMapDataInvalidParameters() {
        // Edge case: null for all arguments; service should just pass them through.
        Iterable<Report> emptyReports = new ArrayList<>();
        when(reportsDao.getHeatMapData(null, null, null)).thenReturn(emptyReports);

        Iterable<Report> results = reportsService.heatMapData(null, null, null);

        assertNotNull(results);
        assertFalse(results.iterator().hasNext());
        verify(reportsDao).getHeatMapData(null, null, null);
    }
}

