package com.example.cis4900.spring.template.reports.dao;

import com.example.cis4900.spring.template.reports.models.Report;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import java.util.List;
import java.util.Map;

public class ReportsDaoCustomImpl implements ReportsDaoCustom {

    @PersistenceContext
    private EntityManager entityManager;

    private final ObjectMapper objectMapper = new ObjectMapper();


    // findLimitedReports creates and executes a Mysql query on the database of all of the reports with filters. It also has start and limit to use as pages for the table
    // Params:
    // limit - How many reports should it return
    // start - What record should it start returning at
    // filters - What filters should be applied to the query
    // Returns: The array of the output query, in this case a two dimensional array

    @Override
    public Iterable<Report> findLimitedReports(String limit, String start, String filters) {
        StringBuilder sql = new StringBuilder("SELECT * FROM report WHERE 1=1");


        if (filters != null && !filters.isEmpty()) {
            String whereClause = buildWhereClause(filters);
            if (!whereClause.isEmpty()) {
                sql.append(" AND ").append(whereClause);
            }
        }

        sql.append(" ORDER BY Id");
        sql.append(" LIMIT ").append(limit);
        sql.append(" OFFSET ").append(start);


        System.out.println("Executing SQL: " + sql.toString());

        Query query = entityManager.createNativeQuery(sql.toString(), Report.class);
        return query.getResultList();
    }


    // findColumnValues creates and executes an SQL query that is used for column filtering in the table
    // Params:
    // limit - Which column should it search for
    // filters - What filters are already applied to the query
    // Returns: The array of the output query, in this case, a list of possibles

    @Override
    public Iterable<String> findColumnValues(String columnName, String currentFilters) {
        StringBuilder sql = new StringBuilder("SELECT DISTINCT " + columnName + " FROM report");

        // Append filters if they exist
        if (currentFilters != null && !currentFilters.isEmpty()) {
            String whereClause = buildWhereClause(currentFilters);
            if (!whereClause.isEmpty()) {
                sql.append(" WHERE ").append(whereClause);
            }
        }

        System.out.println("Executing SQL: " + sql.toString());

        Query query = entityManager.createNativeQuery(sql.toString());
        return query.getResultList();
    }

    // getFilteredCount creates and executes an SQL query that is used for getting the amount of records in the currently filtered table
    // Params:
    // filters - What filters are already applied to the query
    // Returns: The amount of records in the table with the current filters

    @Override
    public Integer getFilteredCount(String currentFilters) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM report");

        if (currentFilters != null && !currentFilters.isEmpty()) {
            String whereClause = buildWhereClause(currentFilters);
            if (!whereClause.isEmpty()) {
                sql.append(" WHERE ").append(whereClause);
            }
        }

        System.out.println("Executing SQL: " + sql.toString());

        Query query = entityManager.createNativeQuery(sql.toString());
        return ((Number) query.getSingleResult()).intValue();
    }

    // getMapMarkers fetches all of the latitude and longitude information from reports in a certain filter
    // Params:
    // limit - How many markers you want on the map (default 5000)
    // filters - What filters are already applied to the query
    // Returns: Id, complaintType, descriptorType, agencyName, latitude, longitude of the limit amount of reports

    public Iterable<Report> getMapMarkers(String limit, String currentFilters) {
        StringBuilder sql = new StringBuilder("SELECT Id, complaintType, descriptorType, agencyName, latitude, longitude FROM report");

        if (currentFilters != null && !currentFilters.isEmpty()) {
            String whereClause = buildWhereClause(currentFilters);
            if (!whereClause.isEmpty()) {
                sql.append(" WHERE ").append(whereClause);
            }
        }
        sql.append(" ORDER BY Id ");
        sql.append(" LIMIT ").append(limit);


        System.out.println("Executing SQL: " + sql.toString());
        Query query = entityManager.createNativeQuery(sql.toString());

        return query.getResultList();
    }


    // getChartData fetches all of the possibilties of a column with the current filters
    // Params:
    // limit - How many reports you want to fetch
    // column - What column you want to create the chart for
    // filters - What filters are already applied to the query
    // Returns: The column value for all of the reports (capped out at limit) with current filters

    public Iterable <Report> getChartData(String limit, String column, String currentFilters){
        StringBuilder sql = new StringBuilder("SELECT " + column + " FROM report");

        if(currentFilters != null && !currentFilters.isEmpty()){
            String whereClause = buildWhereClause(currentFilters);
            if (!whereClause.isEmpty()) {
                sql.append(" WHERE ").append(whereClause);
            }
        }
        sql.append(" ORDER BY Id");
        sql.append(" LIMIT ").append(limit);

        System.out.println("Executing SQL: " + sql.toString());
        Query query = entityManager.createNativeQuery(sql.toString());

        return query.getResultList();
    }

    // getHeatMapData fetches all the possibilities of the column for the heat map
    // Params:
    // limit - How many reports you want to fetch
    // column - What column you want to create the chart for
    // filters - What filters are already applied to the query
    // Returns: The column value for all of the reports (capped out at limit) with current filters

    public Iterable <Report> getHeatMapData(String limit, String column, String currentFilters){
        StringBuilder sql = new StringBuilder("SELECT " + column + " FROM report");

        if(currentFilters != null && !currentFilters.isEmpty()){
            String whereClause = buildWhereClause(currentFilters);
            if (!whereClause.isEmpty()){
                sql.append( " WHERE ").append(whereClause);
            }
        }

        sql.append(" ORDER BY Id");
        sql.append(" LIMIT ").append(limit);

        System.out.println("Executing SQL: " + sql.toString());
        Query query = entityManager.createNativeQuery(sql.toString());

        return query.getResultList();
    }


    // buildWhereClause builds SQL WHERE clause from JSon input
    // Params:
    // filtersJson - Json string of the filters that need to be turned into the WHERE clause
    // Returns: Outputs WHERE clause (not including where) for the filtering of each function above

    private String buildWhereClause(String filtersJson) {
        try {
            // Parse JSON string to Map
            Map<String, List<String>> filterMap = objectMapper.readValue(
                    filtersJson,
                    new TypeReference<Map<String, List<String>>>() {}
            );

            if (filterMap.isEmpty()) {
                return "";
            }

            StringBuilder whereClause = new StringBuilder();
            boolean first = true;

            for (Map.Entry<String, List<String>> entry : filterMap.entrySet()) {
                String columnName = entry.getKey();
                List<String> values = entry.getValue();

                if (values == null || values.isEmpty()) {
                    continue;
                }

                if (!first) {
                    whereClause.append(" AND ");
                }
                first = false;

                // Build IN clause for this column
                whereClause.append("(").append(columnName).append(" IN (");

                for (int i = 0; i < values.size(); i++) {
                    if (i > 0) {
                        whereClause.append(", ");
                    }
                    // Escape single quotes in values to prevent SQL injection
                    String escapedValue = values.get(i).replace("'", "''");
                    whereClause.append("'").append(escapedValue).append("'");
                }

                whereClause.append("))");
            }

            return whereClause.toString();

        } catch (Exception e) {
            System.err.println("Error parsing filters JSON: " + e.getMessage());
            e.printStackTrace();
            return "";
        }
    }
}

