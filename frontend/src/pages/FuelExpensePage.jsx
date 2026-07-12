import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/common/Sidebar';
import reportService from '../services/report.service';
import vehicleService from '../services/vehicle.service';
import { useAuth } from '../context/AuthContext';

const FuelExpensePage = () => {
  const { role } = useAuth();
  const canCreate = role === 'FLEET_MANAGER' || role === 'DRIVER';
  const canCreateExpense = role === 'FLEET_MANAGER' || role === 'FINANCIAL_ANALYST';

  const [fuelLogs, setFuelLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Operational cost for selected vehicle
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [operationalCost, setOperationalCost] = useState(null);

  // Form toggle
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  // Fuel form
  const [fuelForm, setFuelForm] = useState({ vehicleId: '', liters: '', cost: '', date: '' });
  const [fuelFormLoading, setFuelFormLoading] = useState(false);

  // Expense form
  const [expenseForm, setExpenseForm] = useState({ vehicleId: '', type: '', amount: '', date: '' });
  const [expenseFormLoading, setExpenseFormLoading] = useState(false);

  const loadFuelLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedVehicleId) params.vehicleId = selectedVehicleId;
      const data = await reportService.getFuelLogs(params);
      setFuelLogs(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load fuel logs.');
    } finally {
      setLoading(false);
    }
  }, [selectedVehicleId]);

  useEffect(() => {
    loadFuelLogs();
  }, [loadFuelLogs]);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await vehicleService.getVehicles();
        setVehicles(data);
      } catch (err) { /* silent */ }
    };
    loadVehicles();
  }, []);

  // Load operational cost when vehicle filter changes
  useEffect(() => {
    if (selectedVehicleId) {
      const loadCost = async () => {
        try {
          const data = await reportService.getVehicleOperationalCost(selectedVehicleId);
          setOperationalCost(data);
        } catch (err) {
          setOperationalCost(null);
        }
      };
      loadCost();
    } else {
      setOperationalCost(null);
    }
  }, [selectedVehicleId]);

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!fuelForm.vehicleId || !fuelForm.liters || !fuelForm.cost || !fuelForm.date) {
      setError('All fuel log fields are required.');
      return;
    }
    setFuelFormLoading(true);
    try {
      await reportService.createFuelLog({
        vehicleId: Number(fuelForm.vehicleId),
        liters: Number(fuelForm.liters),
        cost: Number(fuelForm.cost),
        date: fuelForm.date
      });
      setSuccess('Fuel log recorded successfully.');
      setFuelForm({ vehicleId: '', liters: '', cost: '', date: '' });
      setShowFuelForm(false);
      loadFuelLogs();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create fuel log.');
    } finally {
      setFuelFormLoading(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!expenseForm.vehicleId || !expenseForm.type || !expenseForm.amount || !expenseForm.date) {
      setError('All expense fields are required.');
      return;
    }
    setExpenseFormLoading(true);
    try {
      await reportService.createExpense({
        vehicleId: Number(expenseForm.vehicleId),
        type: expenseForm.type,
        amount: Number(expenseForm.amount),
        date: expenseForm.date
      });
      setSuccess('Expense recorded successfully.');
      setExpenseForm({ vehicleId: '', type: '', amount: '', date: '' });
      setShowExpenseForm(false);
      loadFuelLogs();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create expense.');
    } finally {
      setExpenseFormLoading(false);
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Fuel & Expenses</h1>
            <p className="page-subtitle">Log fuel consumption and miscellaneous expenses per vehicle</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {canCreate && (
              <button onClick={() => setShowFuelForm(true)} style={{ padding: '0.6rem 1.2rem', border: 'none', borderRadius: '6px', background: 'var(--accent-color)', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>+ Fuel Log</button>
            )}
            {canCreateExpense && (
              <button onClick={() => setShowExpenseForm(true)} style={{ padding: '0.6rem 1.2rem', border: 'none', borderRadius: '6px', background: '#7c3aed', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>+ Expense</button>
            )}
          </div>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
        {success && <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.85rem', fontWeight: '500' }}>{success}</div>}

        {/* Fuel Log Form */}
        {showFuelForm && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>Log Fuel Entry</h3>
            <form onSubmit={handleFuelSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Vehicle</label>
                  <select name="vehicleId" className="form-input" value={fuelForm.vehicleId} onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}>
                    <option value="">Select</option>
                    {vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNumber}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Liters</label>
                  <input type="number" className="form-input" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} placeholder="e.g., 45" min="0" step="0.1" />
                </div>
                <div>
                  <label className="form-label">Cost (₹)</label>
                  <input type="number" className="form-input" value={fuelForm.cost} onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} placeholder="e.g., 4200" min="0" />
                </div>
                <div>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={fuelForm.date} onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowFuelForm(false)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" disabled={fuelFormLoading} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', background: 'var(--accent-color)', color: 'white', cursor: 'pointer', fontSize: '0.85rem', opacity: fuelFormLoading ? 0.6 : 1 }}>{fuelFormLoading ? 'Saving...' : 'Save Fuel Log'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Expense Form */}
        {showExpenseForm && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>Log Expense</h3>
            <form onSubmit={handleExpenseSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Vehicle</label>
                  <select name="vehicleId" className="form-input" value={expenseForm.vehicleId} onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}>
                    <option value="">Select</option>
                    {vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNumber}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <select className="form-input" value={expenseForm.type} onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}>
                    <option value="">Select type</option>
                    <option value="toll">Toll</option>
                    <option value="parking">Parking</option>
                    <option value="repair">Repair</option>
                    <option value="misc">Misc</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" className="form-input" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="e.g., 1500" min="0" />
                </div>
                <div>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowExpenseForm(false)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" disabled={expenseFormLoading} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', background: '#7c3aed', color: 'white', cursor: 'pointer', fontSize: '0.85rem', opacity: expenseFormLoading ? 0.6 : 1 }}>{expenseFormLoading ? 'Saving...' : 'Save Expense'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Filter & Operational Cost Summary */}
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '0.25rem' }}>Filter by Vehicle</label>
              <select value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} className="form-input" style={{ width: '180px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
                <option value="">All Vehicles</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNumber} — {v.nameModel}</option>)}
              </select>
            </div>
            {operationalCost && (
              <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Total Operational Cost</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-color)' }}>{formatCurrency(operationalCost.totalOperationalCost)}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Fuel: {formatCurrency(operationalCost.breakdown.fuelCosts)} | Expenses: {formatCurrency(operationalCost.breakdown.expenses)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fuel Logs Table */}
        <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>Fuel Logs</h3>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : fuelLogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No fuel logs found</div>
              <div className="empty-state-subtitle">Fuel logs will appear here once recorded.</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Vehicle</th>
                    <th>Liters</th>
                    <th>Cost</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>#{log.id}</td>
                      <td style={{ fontSize: '0.85rem' }}>{log.vehicle ? log.vehicle.regNumber : `ID: ${log.vehicleId}`}</td>
                      <td>{Number(log.liters).toFixed(1)} L</td>
                      <td>{formatCurrency(Number(log.cost))}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatDate(log.date)}</td>
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

export default FuelExpensePage;
