import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/common/Sidebar';
import VehicleForm from '../components/vehicles/VehicleForm';
import VehicleTable from '../components/vehicles/VehicleTable';
import vehicleService from '../services/vehicle.service';
import { useAuth } from '../context/AuthContext';

const VehiclesPage = () => {
  const { role } = useAuth();
  const isFleetManager = role === 'FLEET_MANAGER';

  const [vehicles, setVehicles] = useState([]);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // API Query filters state
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    region: '',
  });

  // Client-side text search
  const [searchQuery, setSearchQuery] = useState('');

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Clean up empty params
      const apiParams = {};
      if (filters.status) apiParams.status = filters.status;
      if (filters.type) apiParams.type = filters.type;
      if (filters.region) apiParams.region = filters.region;

      const data = await vehicleService.getVehicles(apiParams);
      setVehicles(data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Could not load vehicles list. Please check authorization or server status.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (formData) => {
    try {
      setError(null);
      if (editingVehicle) {
        // Update mode
        await vehicleService.updateVehicle(editingVehicle.id, formData);
        setEditingVehicle(null);
      } else {
        // Create mode
        await vehicleService.createVehicle(formData);
      }
      loadVehicles();
    } catch (err) {
      console.error('Error saving vehicle:', err);
      const msg = err.response?.data?.message || 'Failed to submit vehicle. Check input types and uniqueness.';
      setError(msg);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    // Scroll smoothly to form on mobile devices
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle from current registers?')) {
      try {
        setError(null);
        await vehicleService.deleteVehicle(id);
        loadVehicles();
        if (editingVehicle?.id === id) {
          setEditingVehicle(null);
        }
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        setError(err.response?.data?.message || 'Failed to delete vehicle.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingVehicle(null);
  };

  // Filter vehicles client-side by text query (regNumber or nameModel)
  const filteredVehicles = vehicles.filter((v) => {
    const term = searchQuery.toLowerCase();
    return (
      v.regNumber.toLowerCase().includes(term) ||
      v.nameModel.toLowerCase().includes(term)
    );
  });

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'TRUCK', label: 'Truck' },
    { value: 'VAN', label: 'Van' },
    { value: 'CAR', label: 'Car' },
    { value: 'TRAILER', label: 'Trailer' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'ON_TRIP', label: 'On Trip' },
    { value: 'IN_SHOP', label: 'In Shop' },
    { value: 'RETIRED', label: 'Retired' }
  ];

  const regionOptions = [
    { value: '', label: 'All Regions' },
    { value: 'North', label: 'North' },
    { value: 'South', label: 'South' },
    { value: 'East', label: 'East' },
    { value: 'West', label: 'West' }
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Fleet Vehicles</h1>
            <p className="page-subtitle">Track, register, and update vehicle assets and telemetry configurations</p>
          </div>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        <div className={isFleetManager ? 'resource-grid' : ''}>
          {/* Form Section - Only shown for Fleet Managers */}
          {isFleetManager && (
            <div>
              <VehicleForm
                onSubmit={handleFormSubmit}
                editingVehicle={editingVehicle}
                onCancel={handleCancelEdit}
              />
            </div>
          )}

          {/* Table Section */}
          <div style={{ flex: 1 }}>
            <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
              <div className="table-controls">
                <div className="search-input-wrapper">
                  <span className="search-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '1.1rem', height: '1.1rem' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.63 10.63Z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by registration, model..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="form-input"
                    style={{ width: '130px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="form-input"
                    style={{ width: '120px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <select
                    name="region"
                    value={filters.region}
                    onChange={handleFilterChange}
                    className="form-input"
                    style={{ width: '130px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  >
                    {regionOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                <VehicleTable
                  vehicles={filteredVehicles}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  userRole={role}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VehiclesPage;
