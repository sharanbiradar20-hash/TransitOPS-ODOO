import React from 'react';
import StatusBadge from '../common/StatusBadge';

const VehicleTable = ({ vehicles = [], onEdit, onDelete, userRole }) => {
  const isFleetManager = userRole === 'FLEET_MANAGER';

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (vehicles.length === 0) {
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
              d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.29-4.877A1.5 1.5 0 0 0 20.334 11.25H9.75m0 7.5V12m-6 3.75h1.5m3-3.75h3m-3 3.75h3M6 9h3M9 6v3m3-3v3m3-3v3M10.457 4.75h6.417c.504 0 .97.283 1.202.73l1.83 3.535M10.457 4.75a3 3 0 0 0-3 3v2m3-5a3 3 0 0 1 3 3v2"
            />
          </svg>
          <div className="empty-state-title">No vehicles registered</div>
          <div className="empty-state-subtitle">
            {isFleetManager
              ? 'Get started by adding a vehicle using the registration panel on the left.'
              : 'There are currently no vehicles available to view.'}
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
            <th>Reg Number</th>
            <th>Name / Model</th>
            <th>Type</th>
            <th>Max Load</th>
            <th>Odometer</th>
            <th>Acquisition Cost</th>
            <th>Region</th>
            <th>Status</th>
            {isFleetManager && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.id}>
              <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                {v.regNumber}
              </td>
              <td>{v.nameModel}</td>
              <td style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {v.type}
              </td>
              <td>{formatNumber(v.maxLoadCapacity)} kg</td>
              <td>{formatNumber(v.odometer)} km</td>
              <td>{formatCurrency(v.acquisitionCost)}</td>
              <td>{v.region}</td>
              <td>
                <StatusBadge status={v.status} />
              </td>
              {isFleetManager && (
                <td>
                  <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                    <button
                      className="btn-icon edit"
                      onClick={() => onEdit(v)}
                      title="Edit Vehicle"
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
                      onClick={() => onDelete(v.id)}
                      title="Delete Vehicle"
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleTable;
