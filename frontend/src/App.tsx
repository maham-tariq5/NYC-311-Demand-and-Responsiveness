import React, {useState} from "react";
import ReportsTable from "./components/ReportsTable";
import ReportsMap from "./components/ReportsMap";
import ReportsDashboard from "./components/ReportsDashboard";
import { FiltersProvider } from "./contexts/FiltersContext";
import "leaflet/dist/leaflet.css";

const App: React.FC = () => {

  const [activeTab, setActiveTab] = useState<"dashboard" | "table" | "map">("dashboard");

  return (
    <FiltersProvider>
    <div className="container">
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>All Reports</h2>

        <div id="switchStateButton">
          <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`nav-btn ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>Table</button>
          <button className={`nav-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>Map</button>
        </div>
      </header>

      {activeTab === "map" &&
      <div data-testid="reports-map">
        <ReportsMap />
      </div>}

      {activeTab === "table" && 
      <div data-testid="reports-table">
        <ReportsTable />
      </div>}

      {activeTab === "dashboard" && 
      <div data-testid="reports-dashboard">
        <ReportsDashboard />
      </div>}
    </div>
    </FiltersProvider>
  );
};

export default App;
