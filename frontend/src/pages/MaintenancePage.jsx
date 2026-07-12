import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/common/Sidebar';
import StatusBadge from '../components/common/StatusBadge';
import maintenanceService from '../services/maintenance.service';
import vehicleService from '../services/vehicle.service';
import { useAuth } from '../context/AuthContext';

const MaintenancePage = () => {
  const { role } = useAuth();
  const isFleetManager = role === 'FLEET_MANAGER';

  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ vehicleId: '', issueDescription: '' });
  const [formLoading, setFormLoading] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await maintenanceService.getMaintenanceRecords(params);
      setRecords(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load maintenance records.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getVehicles();
      setVehicles(data);
    } catch (err) {
      // silent
    }
  };

  const handleShowForm = () => {
    setShowForm(true);
    loadVehicles();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.vehicleId || !formData.issueDescription) {
      setError('Vehicle and issue description are required.');
      return;
    }

    setFormLoading(true);
    try {
      await maintenanceService.createMaintenanceRecord({
        vehicleId: Number(formData.vehicleId),
        issueDescription: formData.issueDescription
      });
      setSuccess('Maintenance record created. Vehicle status set to In Shop.');
      setFormData({ vehicleId: '', issueDescription: '' });
      setShowForm(false);
      loadRecords();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create maintenance record.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm('Close this maintenance record and restore vehicle to Available?')) return;
    setError(null);
    setSuccess(null);
    try {
      await maintenanceService.closeMaintenanceRecord(id);
      setSuccess(`Maintenance record #${id} closed. Vehicle restored to Available.`);
      loadRecords();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to close maintenance record.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Maintenance Records</h1>
            <p className="page-subtitle">Track vehicle maintenance issues and shop status</p>
          </div>
          {isFleetManager && (
            <button onClick={handleShowForm} style={{ padding: '0.6rem 1.2rem', border: 'none', borderRadius: '6px', background: 'var(--accent-color)', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
              + New Record
            </button>
          )}
        </div>

        {error && <div className="auth-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
        {success && <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.85rem', fontWeight: '500' }}>{success}</div>}

        {/* Create Form */}
        {showForm && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>Log Maintenance Issue</h3>
            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Vehicle</label>
                  <select name="vehicleId" className="form-input" value={formData.vehicleId} onChange={handleFormChange}>
                    <option value="">Select vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.regNumber} — {v.nameModel}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Issue Description</label>
                  <input type="text" name="issueDescription" className="form-input" value={formData.issueDescription} onChange={handleFormChange} placeholder="Describe the maintenance issue..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>Cancel</button>
                <button type="submit" disabled={formLoading} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', background: 'var(--accent-color)', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', opacity: formLoading ? 0.6 : 1 }}>{formLoading ? 'Creating...' : 'Create Record'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Filter & Table */}
        <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="table-controls" style={{ marginBottom: '1rem' }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input" style={{ width: '150px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No maintenance records found</div>
              <div className="empty-state-subtitle">Records will appear here once created.</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Vehicle</th>
                    <th>Issue</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Closed</th>
                    {isFleetManager && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>#{r.id}</td>
                      <td style={{ fontSize: '0.85rem' }}>{r.vehicle ? r.vehicle.regNumber : `ID: ${r.vehicleId}`}</td>
                      <td style={{ fontSize: '0.85rem' }}>{r.issueDescription}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatDate(r.createdAt)}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatDate(r.closedAt)}</td>
                      {isFleetManager && (
                        <td style={{ textAlign: 'right' }}>
                          {r.status !== 'CLOSED' && (
                            <button onClick={() => handleClose(r.id)} style={{ padding: '0.35rem 0.65rem', border: 'none', borderRadius: '4px', background: '#16a34a', color: 'white', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500' }}>Close</button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MaintenancePage;
