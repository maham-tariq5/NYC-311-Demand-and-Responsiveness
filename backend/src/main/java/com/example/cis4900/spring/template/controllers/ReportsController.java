package com.example.cis4900.spring.template.controllers;

import com.example.cis4900.spring.template.reports.ReportsService;
import com.example.cis4900.spring.template.reports.models.Report;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping(path = "/api/reports")
public class ReportsController {
    private ReportsService reportsService;

    @Autowired
    ReportsController(ReportsService reportsService) {
        this.reportsService = reportsService;
    }


    @GetMapping("/mapDisplay")
    private @ResponseBody Iterable<Report> displayMap(@RequestParam(defaultValue = "5000") String limit, @RequestParam(defaultValue = "") String currentFilters) {
        return reportsService.displayMap(limit, currentFilters);
    }


    @GetMapping("/columnFilter")
    private @ResponseBody Iterable<String> getFilters(@RequestParam(defaultValue = "") String columnName, @RequestParam(defaultValue = "") String currentFilters) {
        return reportsService.columnFilter(columnName, currentFilters);
    }

    @GetMapping("/all")
    private @ResponseBody Iterable<Report> allReports(@RequestParam(defaultValue = "10") String limit, @RequestParam(defaultValue = "0") String start, @RequestParam(defaultValue = "") String filters) {
        return reportsService.allReports(limit, start, filters);
    }

    @GetMapping("/count")
    private @ResponseBody Integer count(@RequestParam(defaultValue = "") String currentFilters) {
        return reportsService.getFilteredCount(currentFilters);
    }

    @GetMapping("/pieChart")
    private @ResponseBody Iterable<Report> chartData(@RequestParam(defaultValue = "") String limit, @RequestParam(defaultValue = "") String column, @RequestParam(defaultValue = "") String currentFilters){
        return reportsService.chartData(limit, column, currentFilters);
    }

    @GetMapping("/heatMap")
    private @ResponseBody Iterable<Report> heatMapData(@RequestParam(defaultValue = "") String limit, @RequestParam(defaultValue = "") String column, @RequestParam(defaultValue = "") String currentFilters){
        return reportsService.heatMapData(limit, column, currentFilters);
    }
}

