#!/bin/bash
set -e

echo "Loading data from CSV..."
mariadb -u root -p"${MYSQL_ROOT_PASSWORD}" --local-infile=1 template_db <<-EOSQL
    SET GLOBAL local_infile = 1;

    LOAD DATA LOCAL INFILE '/docker-entrypoint-initdb.d/initDataset.csv'
    INTO TABLE report
    FIELDS TERMINATED BY ','
    ENCLOSED BY '"'
    LINES TERMINATED BY '\n'
    IGNORE 1 ROWS
    (@dummyKey, createdDate, closedDate, agencyName, complaintType, descriptorType, locationType, incidentZip, incidentAddress, addressType, city, status, communityBoard, borough, openDataChannelType, latitude, longitude);

    SELECT COUNT(*) as 'Total rows loaded:' FROM report;
EOSQL

echo "Data load complete!"