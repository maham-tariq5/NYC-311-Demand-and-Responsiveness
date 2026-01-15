package com.example.cis4900.spring.template.reports.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
@Table(name="report")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer Id;

    @Column(name = "createdDate")
    private String createdDate;

    @Column(name = "closedDate")
    private String closedDate;

    @Column(name = "agencyName")
    private String agencyName;

    @Column(name = "complaintType")
    private String complaintType;

    @Column(name = "descriptorType")
    private String descriptorType;

    @Column(name = "locationType")
    private String locationType;

    @Column(name = "incidentZip")
    private String incidentZip;

    @Column(name = "incidentAddress")
    private String incidentAddress;

    @Column(name = "addressType")
    private String addressType;

    @Column(name = "city")
    private String city;

    @Column(name = "status")
    private String status;

    @Column(name = "communityBoard")
    private String communityBoard;

    @Column(name = "borough")
    private String borough;

    @Column(name = "openDataChannelType")
    private String openDataChannelType;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    public Report(){
        complaintType = null;
        descriptorType = null;
        agencyName = null;
        locationType = null;
        incidentAddress = null;
        incidentZip = null;
        addressType = null;
        city = null;
        status = null;
        createdDate = null;
        closedDate = null;
        communityBoard = null;
        borough = null;
        openDataChannelType = null;
        latitude = 0.0;
        longitude = 0.0;
    }

    public Report(String complaintType, String descriptorType, String agencyName, String locationType,
                  String incidentAddress, String incidentZip, String addressType, String city,
                  String status, String createdDate, String closedDate, String communityBoard,
                  String borough, String openDataChannelType, double latitude, double longitude){
        this.complaintType = complaintType;
        this.descriptorType = descriptorType;
        this.agencyName = agencyName;
        this.locationType = locationType;
        this.incidentAddress = incidentAddress;
        this.incidentZip = incidentZip;
        this.addressType = addressType;
        this.city = city;
        this.status = status;
        this.createdDate = createdDate;
        this.closedDate = closedDate;
        this.communityBoard = communityBoard;
        this.borough = borough;
        this.openDataChannelType = openDataChannelType;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // FIXED: Changed from Integer to Long to match field type
    public int getId() {
        return Id;
    }

    public void setId(Integer Id) {
        this.Id = Id;
    }

    public String getComplaintType() {
        return complaintType;
    }

    public void setComplaintType(String complaintType) {
        this.complaintType = complaintType;
    }

    public String getDescriptorType() {
        return descriptorType;
    }

    public void setDescriptorType(String descriptorType) {
        this.descriptorType = descriptorType;
    }

    public String getAgencyName() {
        return agencyName;
    }

    public void setAgencyName(String agencyName) {
        this.agencyName = agencyName;
    }

    public String getLocationType() {
        return locationType;
    }

    public void setLocationType(String locationType) {
        this.locationType = locationType;
    }

    public String getIncidentAddress() {
        return incidentAddress;
    }

    public void setIncidentAddress(String incidentAddress) {
        this.incidentAddress = incidentAddress;
    }

    public String getIncidentZip() {
        return incidentZip;
    }

    public void setIncidentZip(String incidentZip) {
        this.incidentZip = incidentZip;
    }

    public String getAddressType() {
        return addressType;
    }

    public void setAddressType(String addressType) {
        this.addressType = addressType;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(String createdDate) {
        this.createdDate = createdDate;
    }

    public String getClosedDate() {
        return closedDate;
    }

    public void setClosedDate(String closedDate) {
        this.closedDate = closedDate;
    }

    public String getCommunityBoard() {
        return communityBoard;
    }

    public void setCommunityBoard(String communityBoard) {
        this.communityBoard = communityBoard;
    }

    public String getBorough() {
        return borough;
    }

    public void setBorough(String borough) {
        this.borough = borough;
    }

    public String getOpenDataChannelType() {
        return openDataChannelType;
    }

    public void setOpenDataChannelType(String openDataChannelType) {
        this.openDataChannelType = openDataChannelType;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    @Override
    public String toString() {
        return "Report{" +
                "Id=" + Id +
                ", complaintType='" + complaintType + '\'' +
                ", descriptorType='" + descriptorType + '\'' +
                ", agencyName='" + agencyName + '\'' +
                ", locationType='" + locationType + '\'' +
                ", incidentAddress='" + incidentAddress + '\'' +
                ", incidentZip='" + incidentZip + '\'' +
                ", addressType='" + addressType + '\'' +
                ", city='" + city + '\'' +
                ", status='" + status + '\'' +
                ", createdDate='" + createdDate + '\'' +
                ", closedDate='" + closedDate + '\'' +
                ", communityBoard='" + communityBoard + '\'' +
                ", borough='" + borough + '\'' +
                ", openDataChannelType='" + openDataChannelType + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                '}';
    }
}