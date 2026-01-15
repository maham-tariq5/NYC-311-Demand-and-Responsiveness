package com.example.cis4900.spring.template.reports;

//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//import java.util.NoSuchElementException;
//import java.util.Optional;
//
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//
//import com.example.cis4900.spring.template.reports.dao.ReportsDao;
//import com.example.cis4900.spring.template.reports.models.Report;
//
//public class PlaceholderImplTest {
//
//    @Mock
//    private ReportsDao reportsDao;
//
//    @InjectMocks
//    private ReportsServiceImpl reportsServiceImpl;
//
//    private ReportsService reportsService;
//
//    @BeforeEach
//    void setUp() {
//
//        MockitoAnnotations.initMocks(this);
//        this.reportsService = reportsServiceImpl;
//    }
//
//    private Report sample() {
//        Report r = new Report(
//            "Illegal Parking", "Parking on Sidewalk", "Parking Enforcment", "Sidewalk", "200 Flatbush Ave", "11217",
//            "Residential", "New York", "Open",
//            "2025-11-05", "2025-11-12", "10 Brooklyn",
//            "Brooklyn", "Mobile App", 40.6836, -73.9760
//        );
//        r.setId(10);
//        return r;
//    }
//
//
//    @Test
//    void addReportSuccessReturnsJsonWithReportToString() {
//        Report r = sample();
//        when(reportsDao.save(r)).thenReturn(r);
//
//        String result = reportsService.addReport(r);
//
//        assertNotNull(result);
//        assertTrue(result.startsWith("{\"report\":\""));
//        assertTrue(result.contains("complaintType='Illegal Parking'"));
//        verify(reportsDao).save(r);
//    }
//
//
//    @Test
//    void addReportDaoThrowsReturnsExceptionMessage() {
//        Report r = sample();
//        when(reportsDao.save(r)).thenThrow(new RuntimeException("DB down"));
//
//        String result = reportsService.addReport(r);
//
//        assertEquals("DB down", result);
//        verify(reportsDao).save(r);
//    }
//
//
//    @Test
//    void getReportFoundReturnsEntity() {
//        Report r = sample();
//        when(reportsDao.findById(10)).thenReturn(Optional.of(r));
//
//        Report found = reportsService.getReport(10);
//
//        assertNotNull(found);
//        assertEquals(10, found.getId());
//        assertEquals("Illegal Parking", found.getComplaintType());
//        verify(reportsDao).findById(10);
//    }
//
//
//    @Test
//    void getReportMissingThrowsNoSuchElementException() {
//        when(reportsDao.findById(99)).thenReturn(Optional.empty());
//
//        assertThrows(NoSuchElementException.class, () -> reportsService.getReport(99));
//        verify(reportsDao).findById(99);
//    }
//
//
//    @Test
//    void updateReportSuccessReturnsUpdated() {
//        Report r = sample();
//        when(reportsDao.save(r)).thenReturn(r);
//
//        String msg = reportsService.updateReport(r);
//
//        assertEquals("Updated", msg);
//        verify(reportsDao).save(r);
//    }
//
//
//    @Test
//    void deleteReportSuccessReturnsDeleted() {
//        String msg = reportsService.deleteReport(10);
//
//        assertEquals("Deleted", msg);
//        verify(reportsDao).deleteById(10);
//    }
//}
//
