import React from 'react';
import StatusBadge from '../common/StatusBadge';

const DriverTable = ({ drivers = [], onEdit, onDelete, userRole }) => {
  const isAuthorized = userRole === 'FLEET_MANAGER' || userRole === 'SAFETY_OFFICER';

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
                  <StatusBadge status={d.status} />
                </td>
                {isAuthorized && (
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
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
