use template_db;

create table if not exists report
(
    Id int auto_increment comment 'Primary Key'
        primary key,
    complaintType varchar(50) null,
    descriptorType varchar(50) null,
    agencyName varchar(50) null,
    locationType varchar(50) null,
    incidentAddress varchar(50) null,
    incidentZip varchar(50) null,
    addressType varchar(50) null,
    city varchar(50) null,
    status varchar(50) null,
    createdDate varchar(50) null,
    closedDate varchar(50) null,
    communityBoard varchar(50) null,
    borough varchar(50) null,
    openDataChannelType varchar(50) null,
    latitude double null,
    longitude double null
);

