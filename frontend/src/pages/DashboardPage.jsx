import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/common/Sidebar';
import KpiCard from '../components/dashboard/KpiCard';
import UtilizationChart from '../components/dashboard/UtilizationChart';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import dashboardService from '../services/dashboard.service';

const DashboardPage = () => {
  const [kpis, setKpis] = useState({
    activeVehicles: 0,
    availableVehicles: 0,
    vehiclesInMaintenance: 0,
    driversOnDuty: 0,
    fleetUtilization: 0,
  });
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKpis = useCallback(async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true);
      setError(null);
    }
    try {
      const params = {};
      if (region) {
        params.region = region;
      }
      const data = await dashboardService.getKpis(params);
      
      // Calculate active vehicles (ON_TRIP) from total vehicles and utilization percentage
      // since the backend returns totalVehicles and fleetUtilization instead of activeVehicles.
      const activeVehicles = Math.round((data.fleetUtilization * data.totalVehicles) / 100) || 0;

      setKpis({
        activeVehicles: activeVehicles,
        availableVehicles: data.availableVehicles || 0,
        vehiclesInMaintenance: data.maintenanceVehicles || 0,
        driversOnDuty: data.driversOnDuty || 0,
        fleetUtilization: data.fleetUtilization || 0,
      });
    } catch (err) {
      console.error('Failed to load KPIs:', err);
      if (showLoadingState) {
        setError('Failed to fetch dashboard metrics. Please check the backend connection.');
      }
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, [region]);

  useEffect(() => {
    // Initial fetch on mount with loading spinner
    fetchKpis(true);

    // Setup 5-second polling loop for background updates
    const intervalId = setInterval(() => {
      fetchKpis(false);
    }, 5000);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchKpis]);

  const handleRefresh = () => {
    fetchKpis(true);
  };

  const handleRegionChange = (selectedReg) => {
    setRegion(selectedReg);
    // Note: The backend's /api/dashboard/kpis endpoint does not currently support query filters or region parameters.
    // The dropdown serves as a visual layout placeholder for future backend expansion.
  };

  // SVGs for KPIs
  const activeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '1.5rem', height: '1.5rem' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 0M8 21.17a8.25 8.25 0 1 1 8 0M12 7v5l2.5 2.5" />
    </svg>
  );

  const availableIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '1.5rem', height: '1.5rem' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );

  const maintenanceIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '1.5rem', height: '1.5rem' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.67 2.67 0 0 0 21 17.25l-5.83-5.83m0 0a2.99 2.99 0 0 1-3.75-3.75l-5.83-5.83A2.67 2.67 0 0 0 2 5.25l5.83 5.83m0 0a2.99 2.99 0 0 1 3.75 3.75Zm-2.58-1.58A1.87 1.87 0 0 0 6 12v3.75m12-9h-3.75a1.87 1.87 0 0 0-1.87 1.87v3.75" />
    </svg>
  );

  const driversIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '1.5rem', height: '1.5rem' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm-7.125 7.875h10.5a.375.375 0 0 0 .375-.375v-.75a2.25 2.25 0 0 0-2.25-2.25h-6.75a2.25 2.25 0 0 0-2.25 2.25v.75a.375.375 0 0 0 .375.375Z" />
    </svg>
  );

  const utilizationIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '1.5rem', height: '1.5rem' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Operational Dashboard</h1>
            <p className="page-subtitle">Real-time indicators and fleet performance overview</p>
          </div>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: '2rem' }}>
            {error}
            <button className="btn btn-secondary" onClick={handleRefresh} style={{ marginLeft: '1rem', padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
              Retry
            </button>
          </div>
        )}

        <DashboardFilters 
          selectedRegion={region} 
          onRegionChange={handleRegionChange} 
          onRefresh={handleRefresh} 
          loading={loading} 
        />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh', flexDirection: 'column' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid var(--border-color)',
              borderTopColor: 'var(--accent-color)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
              Fetching latest statistics...
            </span>
          </div>
        ) : (
          <div className="dashboard-grid">
            <div>
              <div className="kpis-grid">
                <KpiCard 
                  label="Active (On Trip)" 
                  value={kpis.activeVehicles} 
                  icon={activeIcon} 
                  color="blue" 
                />
                <KpiCard 
                  label="Available Vehicles" 
                  value={kpis.availableVehicles} 
                  icon={availableIcon} 
                  color="green" 
                />
                <KpiCard 
                  label="In Shop / Maintenance" 
                  value={kpis.vehiclesInMaintenance} 
                  icon={maintenanceIcon} 
                  color="warning" 
                />
                <KpiCard 
                  label="Drivers On Duty" 
                  value={kpis.driversOnDuty} 
                  icon={driversIcon} 
                  color="blue" 
                />
              </div>

              <div className="card" style={{ padding: '1.5rem 1.75rem' }}>
                <div className="card-title">TransitOps Quick Guide</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <p>Welcome to the <strong>TransitOps Fleet Management Portal</strong>. Here you can perform live supervision of active inventory, equipment telemetry register records, and staff schedules.</p>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <li><strong>Vehicles Management:</strong> View registers, filters, or add new cargo machinery. Role <em>FLEET_MANAGER</em> permission is required for inserts/updates.</li>
                    <li><strong>Drivers Directory:</strong> Keep track of CDL categories and expiry dates. Register updates are restricted to <em>FLEET_MANAGER</em> or <em>SAFETY_OFFICER</em> staff roles.</li>
                    <li><strong>KPI Panel:</strong> Track overall utilization metrics, active trucks breakdowns and maintenance records dynamically.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <UtilizationChart 
                activeVehicles={kpis.activeVehicles} 
                availableVehicles={kpis.availableVehicles} 
                vehiclesInMaintenance={kpis.vehiclesInMaintenance} 
                fleetUtilization={kpis.fleetUtilization} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
