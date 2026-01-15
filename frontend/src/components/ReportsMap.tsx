import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useFilters } from '../contexts/FiltersContext';
import { getMapPins } from '../services/ReportService';
import { Report } from '../types/Report';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Type for the raw report data from the API
type RawReportData = [
    number,  // id
    string,  // complaintType
    string,  // descriptorType
    string,  // agencyName
    number,  // latitude
    number   // longitude
];

// Renders an interactive map with markers showing report locations
// Params: None
// Returns: JSX element containing the map container with report markers
const ReportsMap: React.FC = () => {
    const { filters } = useFilters();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const LIMIT = 2000;

    useEffect(() => {
        // Fetches map pin data from backend and converts to Report objects
        // Params: None
        // Returns: None (updates reports state)
        const fetchMapPins = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getMapPins({
                    limit: LIMIT,
                    currentFilters: filters
                }) as unknown as RawReportData[];

                const mappedReports = data.map((reportArray) => ({
                    id: reportArray[0],
                    complaintType: reportArray[1],
                    descriptorType: reportArray[2],
                    agencyName: reportArray[3],
                    latitude: reportArray[4],
                    longitude: reportArray[5],
                    locationType: "",
                    incidentAddress: "",
                    incidentZip: "",
                    addressType: "",
                    city: "",
                    status: "",
                    createdDate: "",
                    closedDate: "",
                    communityBoard: "",
                    borough: "",
                    openDataChannelType: ""
                }));

                const validReports = mappedReports.filter(
                    (report: Report) =>
                        report.latitude &&
                        report.longitude &&
                        !isNaN(Number(report.latitude)) &&
                        !isNaN(Number(report.longitude))
                );

                setReports(validReports);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                setError(msg || 'Failed to load map pins');
            } finally {
                setLoading(false);
            }
        };

        fetchMapPins();
    }, [filters]);

    if (error) {
        return <div style={{ padding: '20px', color: 'darkred' }}>Error: {error}</div>;
    }

    return (
        <div style={{ position: 'relative' }}>
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    padding: '10px 20px',
                    backgroundColor: 'rgba(255, 243, 205, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid #ffc107',
                    fontWeight: '500'
                }}>
                    Loading map pins...
                </div>
            )}

            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                fontWeight: '500',
                fontSize: '14px'
            }}>
                Showing {reports.length} reports
            </div>

            <MapContainer
                center={[40.73061, -73.935242]}
                zoom={11}
                style={{ height: '800px', width: '100%' }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {reports.map((report, index) => (
                    <Marker
                        key={`${report.id}-${index}`}
                        position={[Number(report.latitude), Number(report.longitude)]}
                    >
                        <Popup>
                            <div style={{ minWidth: '200px' }}>
                                <strong>Report #{report.id}</strong>
                                <br />
                                <strong>Type:</strong> {report.complaintType}
                                <br />
                                <strong>Descriptor:</strong> {report.descriptorType}
                                <br />
                                <strong>Agency:</strong> {report.agencyName}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default ReportsMap;