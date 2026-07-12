import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import reportService from '../services/report.service';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#06b6d4'];

const ReportsPage = () => {
  const [fuelEfficiency, setFuelEfficiency] = useState([]);
  const [operationalCost, setOperationalCost] = useState([]);
  const [fleetUtilization, setFleetUtilization] = useState(null);
  const [vehicleRoi, setVehicleRoi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fe, oc, fu, roi] = await Promise.all([
        reportService.getFuelEfficiency(),
        reportService.getOperationalCost(),
        reportService.getFleetUtilization(),
        reportService.getVehicleRoi()
      ]);
      setFuelEfficiency(fe);
      setOperationalCost(oc);
      setFleetUtilization(fu);
      setVehicleRoi(roi);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleCsvExport = async (reportType) => {
    try {
      await reportService.downloadCsv(reportType);
    } catch (err) {
      setError('Failed to download CSV. Check permissions.');
    }
  };

  const ExportButton = ({ reportType }) => (
    <button
      onClick={() => handleCsvExport(reportType)}
      style={{
        padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)',
        borderRadius: '4px', background: 'white', cursor: 'pointer',
        fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)'
      }}
    >
      ⬇ Export CSV
    </button>
  );

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        </main>
      </div>
    );
  }

  // Prepare utilization pie data
  const utilizationPieData = fleetUtilization ? [
    { name: 'On Trip', value: fleetUtilization.summary.onTrip },
    { name: 'In Shop', value: fleetUtilization.summary.inShop },
    { name: 'Available', value: fleetUtilization.summary.available },
    { name: 'Retired', value: fleetUtilization.summary.retired }
  ].filter(d => d.value > 0) : [];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Fleet Reports & Analytics</h1>
            <p className="page-subtitle">Comprehensive fleet performance insights and data exports</p>
          </div>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        {/* Reports Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Fuel Efficiency Chart */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Fuel Efficiency (km/L)</h3>
              <ExportButton reportType="fuel-efficiency" />
            </div>
            {fuelEfficiency.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={fuelEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="regNumber" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="fuelEfficiency" fill="#2563eb" name="km/L" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Fleet Utilization Pie Chart */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Fleet Utilization</h3>
              <ExportButton reportType="fleet-utilization" />
            </div>
            {utilizationPieData.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No data available</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ResponsiveContainer width="60%" height={220}>
                  <PieChart>
                    <Pie data={utilizationPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {utilizationPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                    {fleetUtilization.summary.utilizationPercentage}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Utilization</div>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
                    {utilizationPieData.map((d, i) => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: COLORS[i % COLORS.length] }} />
                        <span>{d.name}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Operational Cost Chart */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Operational Cost (₹)</h3>
              <ExportButton reportType="operational-cost" />
            </div>
            {operationalCost.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={operationalCost}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="regNumber" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="fuelCosts" fill="#f59e0b" name="Fuel" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="expenses" fill="#dc2626" name="Expenses" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Vehicle ROI Chart */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Vehicle ROI (%)</h3>
              <ExportButton reportType="vehicle-roi" />
            </div>
            {vehicleRoi.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={vehicleRoi}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="regNumber" fontSize={11} />
                  <YAxis fontSize={11} unit="%" />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="roiPercentage" fill="#16a34a" name="ROI %" radius={[4, 4, 0, 0]}>
                    {vehicleRoi.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.roiPercentage >= 0 ? '#16a34a' : '#dc2626'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default ReportsPage;
