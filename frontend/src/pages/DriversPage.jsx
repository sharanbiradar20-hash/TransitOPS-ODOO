import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/common/Sidebar';
import DriverForm from '../components/drivers/DriverForm';
import DriverTable from '../components/drivers/DriverTable';
import driverService from '../services/driver.service';
import { useAuth } from '../context/AuthContext';

const DriversPage = () => {
  const { role } = useAuth();
  const isAuthorized = role === 'FLEET_MANAGER' || role === 'SAFETY_OFFICER';

  const [drivers, setDrivers] = useState([]);
  const [editingDriver, setEditingDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Query filters state
  const [filters, setFilters] = useState({
    status: '',
  });

  // Client-side text search
  const [searchQuery, setSearchQuery] = useState('');

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiParams = {};
      if (filters.status) apiParams.status = filters.status;

      const data = await driverService.getDrivers(apiParams);
      setDrivers(data);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Could not load drivers list. Please check authorization or server status.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

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
      if (editingDriver) {
        // Update mode
        await driverService.updateDriver(editingDriver.id, formData);
        setEditingDriver(null);
      } else {
        // Create mode
        await driverService.createDriver(formData);
      }
      loadDrivers();
    } catch (err) {
      console.error('Error saving driver:', err);
      const msg = err.response?.data?.message || 'Failed to submit driver details.';
      setError(msg);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver from records?')) {
      try {
        setError(null);
        await driverService.deleteDriver(id);
        loadDrivers();
        if (editingDriver?.id === id) {
          setEditingDriver(null);
        }
      } catch (err) {
        console.error('Error deleting driver:', err);
        setError(err.response?.data?.message || 'Failed to delete driver.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingDriver(null);
  };

  // Filter drivers client-side by text query (name or license number)
  const filteredDrivers = drivers.filter((d) => {
    const term = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(term) ||
      d.licenseNumber.toLowerCase().includes(term)
    );
  });

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'ON_TRIP', label: 'On Trip' },
    { value: 'OFF_DUTY', label: 'Off Duty' },
    { value: 'SUSPENDED', label: 'Suspended' }
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Drivers Directory</h1>
            <p className="page-subtitle">Manage operator profiles, licensure classes, and scheduling statuses</p>
          </div>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        <div className={isAuthorized ? 'resource-grid' : ''}>
          {/* Form Column - Only visible for Fleet Managers or Safety Officers */}
          {isAuthorized && (
            <div>
              <DriverForm
                onSubmit={handleFormSubmit}
                editingDriver={editingDriver}
                onCancel={handleCancelEdit}
              />
            </div>
          )}

          {/* Table Column */}
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
                    placeholder="Search by driver name, license..."
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
                <DriverTable
                  drivers={filteredDrivers}
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

export default DriversPage;
