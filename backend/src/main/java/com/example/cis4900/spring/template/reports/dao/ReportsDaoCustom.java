package com.example.cis4900.spring.template.reports.dao;

import com.example.cis4900.spring.template.reports.models.Report;

public interface ReportsDaoCustom {
    Iterable<Report> findLimitedReports(String limit, String start, String filters);

    Integer getFilteredCount(String currentFilters);

    Iterable<String> findColumnValues(String columnName, String currentFilters);

    Iterable <Report> getMapMarkers(String limit, String currentFilters);

    Iterable <Report> getChartData(String limit, String column, String currentFilters);

    Iterable <Report> getHeatMapData(String limit, String column, String currentFilters);
}