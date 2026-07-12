import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';

const DriverTable = ({ drivers = [], onEdit, onDelete, userRole, onUpdateScore }) => {
  const isAuthorized = userRole === 'FLEET_MANAGER' || userRole === 'SAFETY_OFFICER';
  
  const [editingScoreId, setEditingScoreId] = useState(null);
  const [scoreValue, setScoreValue] = useState('');
  const [scoreError, setScoreError] = useState('');

  const handleSaveScore = (id) => {
    const val = Number(scoreValue);
    if (scoreValue === '' || isNaN(val) || val < 0 || val > 100) {
      setScoreError('Must be 0-100');
      return;
    }
    onUpdateScore(id, val);
    setEditingScoreId(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Determine if a license is expired
  const isExpired = (expiryStr) => {
    if (!expiryStr) return false;
    try {
      const expiry = new Date(expiryStr);
      const today = new Date();
      // Compare only date portion
      today.setHours(0, 0, 0, 0);
      return expiry < today;
    } catch (e) {
      return false;
    }
  };

  if (drivers.length === 0) {
    return (
      <div className="card" style={{ padding: 0 }}>
        <div className="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A2.25 2.25 0 0 1 12.75 21.5h-1.5a2.25 2.25 0 0 1-2.25-2.263V19.13m-4.13-1.24a4.125 4.125 0 0 0-7.533 2.493 9.337 9.337 0 0 0 4.121.952c.983 0 1.928-.15 2.814-.428M9 7.558a3 3 0 1 1-3 0 3 3 0 0 1 3 0ZM18 7.558a3 3 0 1 1-3 0 3 3 0 0 1 3 0Zm-6 3.442a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            />
          </svg>
          <div className="empty-state-title">No drivers registered</div>
          <div className="empty-state-subtitle">
            {isAuthorized
              ? 'Get started by adding a driver using the registration panel on the left.'
              : 'There are currently no drivers available to view.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Driver Name</th>
            <th>License Number</th>
            <th>Category</th>
            <th>Expiry Date</th>
            <th>Contact Number</th>
            <th>Safety Score</th>
            <th>Status</th>
            {isAuthorized && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => {
            const expired = isExpired(d.licenseExpiry);
            return (
              <tr key={d.id}>
                <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                  {d.name}
                </td>
                <td>{d.licenseNumber}</td>
                <td style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {d.licenseCategory}
                </td>
                <td>
                  <span style={expired ? { color: 'var(--status-retired-sus)', fontWeight: 'bold' } : {}}>
                    {formatDate(d.licenseExpiry)}
                    {expired && (
                      <span 
                        style={{ 
                          marginLeft: '0.5rem', 
                          fontSize: '0.7rem', 
                          backgroundColor: 'var(--status-retired-sus-bg)', 
                          color: 'var(--status-retired-sus)', 
                          padding: '0.125rem 0.375rem', 
                          borderRadius: '4px',
                          fontWeight: '700',
                          verticalAlign: 'middle'
                        }}
                      >
                        EXPIRED
                      </span>
                    )}
                  </span>
                </td>
                <td>{d.contactNumber}</td>
                <td>
                  {editingScoreId === d.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input
                          type="number"
                          value={scoreValue}
                          onChange={(e) => {
                            setScoreValue(e.target.value);
                            setScoreError('');
                          }}
                          className="form-input"
                          style={{ width: '70px', padding: '0.25rem 0.5rem', fontSize: '0.85rem', margin: 0 }}
                          min="0"
                          max="100"
                          step="any"
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', minWidth: 'auto' }}
                          onClick={() => handleSaveScore(d.id)}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', minWidth: 'auto' }}
                          onClick={() => setEditingScoreId(null)}
                        >
                          ✕
                        </button>
                      </div>
                      {scoreError && (
                        <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '500' }}>
                          {scoreError}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {d.safetyScore !== undefined && d.safetyScore !== null ? d.safetyScore : 100}
                    </span>
                  )}
                </td>
                <td>
                  <StatusBadge status={d.status} />
                </td>
                {isAuthorized && (
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      {userRole === 'SAFETY_OFFICER' && (
                        <button
                          className="btn-icon edit"
                          type="button"
                          onClick={() => {
                            setEditingScoreId(d.id);
                            setScoreValue(d.safetyScore !== undefined && d.safetyScore !== null ? d.safetyScore : 100);
                            setScoreError('');
                          }}
                          title="Update Safety Score"
                          style={{ borderColor: '#0d9488', color: '#0d9488', backgroundColor: '#f0fdf4' }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            style={{ width: '1.1rem', height: '1.1rem' }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                          </svg>
                        </button>
                      )}
                      <button
                        className="btn-icon edit"
                        onClick={() => onEdit(d)}
                        title="Edit Driver"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          style={{ width: '1.1rem', height: '1.1rem' }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                          />
                        </svg>
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => onDelete(d.id)}
                        title="Delete Driver"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          style={{ width: '1.1rem', height: '1.1rem' }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DriverTable;
