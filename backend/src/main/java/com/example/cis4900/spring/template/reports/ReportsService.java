package com.example.cis4900.spring.template.reports;

import com.example.cis4900.spring.template.reports.models.Report;


public interface ReportsService {

    public Iterable<Report> allReports(String limit, String start, String filters);

    public Iterable<String> columnFilter(String columnName, String currentFilters);

    public Integer getFilteredCount(String currentFilters);

    public Iterable<Report> displayMap(String limit, String currentFilters);

    public Iterable <Report> chartData(String limit, String column, String currentFilters);

    public Iterable <Report> heatMapData(String limit, String colimn, String currentFilters);
}
