package com.example.cis4900.spring.template.reports;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.cis4900.spring.template.reports.dao.ReportsDao;
import com.example.cis4900.spring.template.reports.models.Report;

@Service
public class ReportsServiceImpl implements ReportsService {
    @Autowired
    private ReportsDao reportsDao;

    // These functions receive the request from ReportsController, and execute the correct ReportsDao function.
    // It then returns the result back to the Controller to then return it back to the frontend
    // All function comments are in the ReportsDaoCustomImpl.java file

    @Override
    public Iterable<Report> allReports(String limit, String start, String filters) {
        System.out.println("allReports called with limit: " + limit + "start: " + start + "filters: " + filters);
        return reportsDao.findLimitedReports(limit, start, filters);
    }

    @Override
    public Iterable<String> columnFilter(String columnName, String currentFilters) {
        System.out.println("columnFilter called with columnName: " + columnName + ", currentFilters: " + currentFilters);
        return reportsDao.findColumnValues(columnName, currentFilters);
    }

    @Override
    public Integer getFilteredCount(String currentFilters) {
        return reportsDao.getFilteredCount(currentFilters);
    }

    @Override
    public Iterable<Report> displayMap(String limit, String currentFilters) {
        return reportsDao.getMapMarkers(limit, currentFilters);
    }

    @Override
    public Iterable <Report> chartData(String limit, String column, String currentFilters){
        return reportsDao.getChartData(limit, column, currentFilters);
    }

    @Override
    public Iterable <Report> heatMapData(String limit, String column, String currentFilters){
        return reportsDao.getHeatMapData(limit, column, currentFilters);
    }
}
