import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// leaflet.heat attaches a heatLayer factory to L
import 'leaflet.heat';
import { useFilters } from '../contexts/FiltersContext';
import { getHeatMap, getMapPins } from '../services/ReportService';
import { Report } from '../types/Report';

type HeatPoint = [number, number, number];

// Creates and manages a Leaflet heatmap layer on the map
// Params:
// points - Array of heat points with latitude, longitude, and intensity values
// Returns: null (renders layer directly to map)
const HeatLayer: React.FC<{ points: HeatPoint[] }> = ({ points }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;
        const heatFactory = (L as any).heatLayer as (pts: HeatPoint[], opts?: any) => L.Layer;
        const layer = heatFactory(points, { radius: 25, blur: 15, maxZoom: 17 }).addTo(map);
        return () => {
            if (map && layer) map.removeLayer(layer);
        };
    }, [map, points]);

    return null;
};

// Renders a heatmap visualization of report data with applied filters
// Params:
// column - Optional column name to filter heatmap data by
// Returns: JSX element containing the map container with heatmap layer
const ReportsHeatmap: React.FC<{ column?: string }> = ({ column }) => {
    const { filters } = useFilters();
    const [points, setPoints] = useState<HeatPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const LIMIT = 5000;

    useEffect(() => {
        // Fetches heatmap data from backend and processes it into coordinate points
        // Params: None
        // Returns: None (updates points state)
        const fetchHeat = async () => {
            setLoading(true);
            setError(null);
            try {
                // Try backend heatMap endpoint first
                const heatData = await getHeatMap({ limit: LIMIT, column: column, currentFilters: filters });

                // Heat endpoint might return objects with latitude/longitude or it might
                // return aggregated values. If lat/lon exist, use them. Otherwise fallback.
                let computedPoints: HeatPoint[] = [];

                if (Array.isArray(heatData) && heatData.length > 0) {
                    // Case 1: array of objects with latitude/longitude
                    if (typeof heatData[0] === 'object' && heatData[0] !== null && 'latitude' in heatData[0] && 'longitude' in heatData[0]) {
                        computedPoints = (heatData as Report[])
                            .map(r => [Number(r.latitude), Number(r.longitude), 0.6] as HeatPoint)
                            .filter(p => !isNaN(p[0]) && !isNaN(p[1]));
                    } else if (Array.isArray(heatData[0]) && heatData[0].length >= 5) {
                        // Case 2: array of arrays like mapDisplay: [id, complaintType, descriptorType, agencyName, latitude, longitude]
                        computedPoints = (heatData as any[])
                            .map((rArr: any[]) => [Number(rArr[4]), Number(rArr[5]), 0.6] as HeatPoint)
                            .filter(p => !isNaN(p[0]) && !isNaN(p[1]));
                    }
                }

                // If heatData didn't return lat/lon points, fallback to map pins endpoint
                if (computedPoints.length === 0) {
                    const mapPins = await getMapPins({ limit: LIMIT, currentFilters: filters });

                    // mapPins may be either an array of Report objects or an array of arrays
                    if (Array.isArray(mapPins) && mapPins.length > 0) {
                        if (Array.isArray(mapPins[0])) {
                            // array-of-arrays: [id, complaintType, descriptorType, agencyName, latitude, longitude]
                            computedPoints = (mapPins as any[])
                                .map((rArr: any[]) => [Number(rArr[4]), Number(rArr[5]), 0.6] as HeatPoint)
                                .filter(p => !isNaN(p[0]) && !isNaN(p[1]));
                        } else {
                            // array of objects
                            computedPoints = (mapPins as Report[])
                                .map(r => [Number((r as any).latitude), Number((r as any).longitude), 0.6] as HeatPoint)
                                .filter(p => !isNaN(p[0]) && !isNaN(p[1]));
                        }
                    }
                }

                setPoints(computedPoints);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                setError(msg || 'Failed to load heatmap data');
            } finally {
                setLoading(false);
            }
        };

        fetchHeat();
    }, [filters, column]);

    if (error) return <div style={{ padding: 20, color: 'darkred' }}>Error: {error}</div>;

    return (
        <div style={{ position: 'relative' }}>
            {loading && (
                <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6 }}>
                    Loading heatmap...
                </div>
            )}

            <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6 }}>
                Showing {points.length} points
            </div>

            <MapContainer center={[40.73061, -73.935242]} zoom={11} style={{ height: '800px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <HeatLayer points={points} />
            </MapContainer>
        </div>
    );
};

export default ReportsHeatmap;