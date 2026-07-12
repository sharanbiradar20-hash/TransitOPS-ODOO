import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/common/Sidebar';
import TripTable from '../components/trips/TripTable';
import tripService from '../services/trip.service';
import { useAuth } from '../context/AuthContext';

const TripsPage = () => {
  const { role } = useAuth();
  const isFleetManager = role === 'FLEET_MANAGER';

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    cargoWeight: '',
    plannedDistance: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await tripService.getTrips(params);
      setTrips(data);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Could not load trips. Please check authorization or server status.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const loadDropdownData = async () => {
    try {
      const [vehiclesData, driversData] = await Promise.all([
        tripService.getAvailableVehicles(),
        tripService.getAvailableDrivers()
      ]);
      setVehicles(vehiclesData);
      setDrivers(driversData);
    } catch (err) {
      setError('Failed to load available vehicles/drivers.');
    }
  };

  const handleShowForm = () => {
    setShowForm(true);
    loadDropdownData();
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

    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance } = formData;
    if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !plannedDistance) {
      setError('All fields are required.');
      return;
    }

    setFormLoading(true);
    try {
      await tripService.createTrip({
        source,
        destination,
        vehicleId: Number(vehicleId),
        driverId: Number(driverId),
        cargoWeight: Number(cargoWeight),
        plannedDistance: Number(plannedDistance)
      });
      setSuccess('Trip created successfully!');
      setFormData({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', plannedDistance: '' });
      setShowForm(false);
      loadTrips();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create trip.';
      setError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDispatch = async (tripId) => {
    setError(null);
    setSuccess(null);
    try {
      await tripService.dispatchTrip(tripId);
      setSuccess(`Trip #${tripId} dispatched successfully.`);
      loadTrips();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to dispatch trip.';
      setError(msg);
    }
  };

  const handleComplete = async (tripId, data) => {
    setError(null);
    setSuccess(null);
    try {
      await tripService.completeTrip(tripId, data);
      setSuccess(`Trip #${tripId} marked as completed.`);
      loadTrips();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to complete trip.';
      setError(msg);
    }
  };

  const handleCancel = async (tripId) => {
    setError(null);
    setSuccess(null);
    try {
      await tripService.cancelTrip(tripId);
      setSuccess(`Trip #${tripId} has been cancelled.`);
      loadTrips();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to cancel trip.';
      setError(msg);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'DISPATCHED', label: 'Dispatched' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Trip Management</h1>
            <p className="page-subtitle">Create, dispatch, and track trip assignments across the fleet</p>
          </div>
          {isFleetManager && (
            <button
              onClick={handleShowForm}
              style={{
                padding: '0.6rem 1.2rem', border: 'none', borderRadius: '6px',
                background: 'var(--accent-color)', color: 'white', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: '600'
              }}
            >
              + New Trip
            </button>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="auth-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Success Banner */}
        {success && (
          <div style={{
            marginBottom: '1.5rem', padding: '0.75rem 1rem', borderRadius: '6px',
            background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534',
            fontSize: '0.85rem', fontWeight: '500'
          }}>
            {success}
          </div>
        )}

        {/* Create Trip Form (Inline, shown for FLEET_MANAGER) */}
        {showForm && isFleetManager && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>Create New Trip</h3>
            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Source</label>
                  <input
                    type="text"
                    name="source"
                    className="form-input"
                    value={formData.source}
                    onChange={handleFormChange}
                    placeholder="e.g., Bangalore"
                  />
                </div>
                <div>
                  <label className="form-label">Destination</label>
                  <input
                    type="text"
                    name="destination"
                    className="form-input"
                    value={formData.destination}
                    onChange={handleFormChange}
                    placeholder="e.g., Chennai"
                  />
                </div>
                <div>
                  <label className="form-label">Vehicle</label>
                  <select name="vehicleId" className="form-input" value={formData.vehicleId} onChange={handleFormChange}>
                    <option value="">Select vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.regNumber} — {v.nameModel} (Max: {v.maxLoadCapacity}kg)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Driver</label>
                  <select name="driverId" className="form-input" value={formData.driverId} onChange={handleFormChange}>
                    <option value="">Select driver</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.licenseCategory}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    name="cargoWeight"
                    className="form-input"
                    value={formData.cargoWeight}
                    onChange={handleFormChange}
                    placeholder="e.g., 500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="form-label">Planned Distance (km)</label>
                  <input
                    type="number"
                    name="plannedDistance"
                    className="form-input"
                    value={formData.plannedDistance}
                    onChange={handleFormChange}
                    placeholder="e.g., 350"
                    min="0"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '0.5rem 1rem', border: '1px solid var(--border-color)',
                    borderRadius: '6px', background: 'white', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    padding: '0.5rem 1rem', border: 'none', borderRadius: '6px',
                    background: 'var(--accent-color)', color: 'white', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: '500',
                    opacity: formLoading ? 0.6 : 1
                  }}
                >
                  {formLoading ? 'Creating...' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
          <div className="table-controls">
            <div className="filter-group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
                style={{ width: '150px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trip Table */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid var(--border-color)',
                borderTopColor: 'var(--accent-color)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : (
            <TripTable
              trips={trips}
              onDispatch={handleDispatch}
              onComplete={handleComplete}
              onCancel={handleCancel}
              userRole={role}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default TripsPage;
