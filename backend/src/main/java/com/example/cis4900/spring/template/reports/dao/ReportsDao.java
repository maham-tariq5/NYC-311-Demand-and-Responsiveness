package com.example.cis4900.spring.template.reports.dao;

import com.example.cis4900.spring.template.reports.models.Report;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportsDao extends CrudRepository<Report, Integer>, ReportsDaoCustom {

    @Query("SELECT COUNT(*) FROM Report")
    Integer getCount();

}