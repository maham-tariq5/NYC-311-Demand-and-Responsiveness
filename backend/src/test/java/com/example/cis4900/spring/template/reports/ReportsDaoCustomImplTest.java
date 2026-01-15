package com.example.cis4900.spring.template.reports;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;

import com.example.cis4900.spring.template.reports.dao.ReportsDaoCustomImpl;
import com.example.cis4900.spring.template.reports.models.Report;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

public class ReportsDaoCustomImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    // The DAO implementation under test, with mocks injected
    @InjectMocks
    private ReportsDaoCustomImpl reportsDaoCustomImpl;


    @BeforeEach
    void setUp() {
        // Initialize the Mockito annotations so @Mock and @InjectMocks work
        MockitoAnnotations.initMocks(this);
    }


    /**
     * Helper method to create a sample list of Report objects
     * that can be used as fake DB results in multiple tests.
     */
    private List<Report> sampleReports() {
        List<Report> list = new ArrayList<>();
        Report r1 = new Report(
            "Illegal Parking", "Parking on Sidewalk", "Parking Enforcment", "Sidewalk",
            "200 Flatbush Ave", "11217", "Residential", "New York", "Open",
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

        list.add(r1);
        list.add(r2);
        return list;
    }


    @Test
    @DisplayName("getMapMarkers: no filters")
    void getMapMarkersNoFilters() {
        // Arrange:
        // Simulate DB returning a list of reports with no filters applied
        List<Report> expected = sampleReports();

        // When the DAO calls entityManager.createNativeQuery(...), return our mock Query
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        // When getResultList() is called on that Query, return the sample list
        when(query.getResultList()).thenReturn(expected);

        // Act:
        // Call the method under test
        Iterable<Report> results =
            reportsDaoCustomImpl.getMapMarkers("5000", "");

        // Assert:
        // The DAO should return the same list it got from the Query
        assertNotNull(results);
        assertEquals(expected, results);

        // Capture the SQL string that was passed into createNativeQuery(...)
        ArgumentCaptor<String> sqlCaptor = ArgumentCaptor.forClass(String.class);
        verify(entityManager).createNativeQuery(sqlCaptor.capture());
        String sql = sqlCaptor.getValue();

        // Verify that the SQL is correct for "no filters" case
        assertTrue(sql.startsWith(
            "SELECT Id, complaintType, descriptorType, agencyName, latitude, longitude FROM report"
        ));
        assertTrue(sql.contains(" ORDER BY Id "));
        assertTrue(sql.endsWith(" LIMIT 5000"));
    }


    @Test
    @DisplayName("getChartData: no filters")
    void getChartDataNoFilters() {
        // Arrange: DAO should fetch chart data for `complaintType` with no filters
        List<Report> expected = sampleReports();

        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(expected);

        // Act
        Iterable<Report> results =
            reportsDaoCustomImpl.getChartData("5000", "complaintType", "");

        // Assert
        assertNotNull(results);
        assertEquals(expected, results);

        // Capture the generated SQL and verify it
        ArgumentCaptor<String> sqlCaptor = ArgumentCaptor.forClass(String.class);
        verify(entityManager).createNativeQuery(sqlCaptor.capture());
        String sql = sqlCaptor.getValue();

        assertEquals(
            "SELECT complaintType FROM report ORDER BY Id LIMIT 5000",
            sql
        );
    }


    @Test
    @DisplayName("getChartData: with filters")
    void getChartDataWithFilters() {
        // Arrange:
        // Chart data with a JSON filter that restricts complaintType
        List<Report> expected = sampleReports();
        String filters = "{\"complaintType\":[\"Noise - Residential\"]}";

        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(expected);

        // Act:
        // Call the DAO with filters
        Iterable<Report> results =
            reportsDaoCustomImpl.getChartData("100", "complaintType", filters);

        // Assert:
        // Service returns what the Query returned
        assertNotNull(results);
        assertEquals(expected, results);

        // Check that the SQL includes a WHERE clause with the correct IN condition
        ArgumentCaptor<String> sqlCaptor = ArgumentCaptor.forClass(String.class);
        verify(entityManager).createNativeQuery(sqlCaptor.capture());
        String sql = sqlCaptor.getValue();

        assertTrue(sql.startsWith("SELECT complaintType FROM report WHERE "));
        assertTrue(sql.contains("complaintType IN ('Noise - Residential')"));
        assertTrue(sql.endsWith("ORDER BY Id LIMIT 100"));
    }


    @Test
    @DisplayName("getHeatMapData: no filters")
    void getHeatMapDataNoFilters() {
        // Arrange:
        // Heatmap data for createdDate with no filters
        List<Report> expected = sampleReports();

        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(expected);

        // Act
        Iterable<Report> results =
            reportsDaoCustomImpl.getHeatMapData("5000", "createdDate", "");

        // Assert
        assertNotNull(results);
        assertEquals(expected, results);

        // Verify the SQL that was executed
        ArgumentCaptor<String> sqlCaptor = ArgumentCaptor.forClass(String.class);
        verify(entityManager).createNativeQuery(sqlCaptor.capture());
        String sql = sqlCaptor.getValue();

        assertEquals(
            "SELECT createdDate FROM report ORDER BY Id LIMIT 5000",
            sql
        );
    }


    @Test
    @DisplayName("getHeatMapData: with filters")
    void getHeatMapDataWithFilters() {
        // Arrange:
        // Heatmap data but filtered by complaintType
        List<Report> expected = sampleReports();
        String filters = "{\"complaintType\":[\"Noise - Residential\"]}";

        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(expected);

        // Act
        Iterable<Report> results =
            reportsDaoCustomImpl.getHeatMapData("100", "createdDate", filters);

        // Assert
        assertNotNull(results);
        assertEquals(expected, results);

        // Capture and verify the SQL with WHERE clause
        ArgumentCaptor<String> sqlCaptor = ArgumentCaptor.forClass(String.class);
        verify(entityManager).createNativeQuery(sqlCaptor.capture());
        String sql = sqlCaptor.getValue();

        assertTrue(sql.startsWith("SELECT createdDate FROM report WHERE "));
        assertTrue(sql.contains("complaintType IN ('Noise - Residential')"));
        assertTrue(sql.endsWith("ORDER BY Id LIMIT 100"));
    }
}


