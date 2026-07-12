import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';

const TripTable = ({ trips = [], onDispatch, onComplete, onCancel, userRole }) => {
  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  const [completeData, setCompleteData] = useState({ actualDistance: '', fuelConsumed: '' });
  const [completeFormId, setCompleteFormId] = useState(null);

  const canPerformActions = userRole === 'FLEET_MANAGER' || userRole === 'DRIVER';

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelClick = (tripId) => {
    setCancelConfirmId(tripId);
  };

  const handleCancelConfirm = (tripId) => {
    onCancel(tripId);
    setCancelConfirmId(null);
  };

  const handleCancelDismiss = () => {
    setCancelConfirmId(null);
  };

  const handleCompleteClick = (tripId) => {
    setCompleteFormId(tripId);
    setCompleteData({ actualDistance: '', fuelConsumed: '' });
  };

  const handleCompleteSubmit = (tripId) => {
    const data = {};
    if (completeData.actualDistance) data.actualDistance = Number(completeData.actualDistance);
    if (completeData.fuelConsumed) data.fuelConsumed = Number(completeData.fuelConsumed);
    onComplete(tripId, data);
    setCompleteFormId(null);
  };

  const handleCompleteDismiss = () => {
    setCompleteFormId(null);
  };

  if (trips.length === 0) {
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
              d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
            />
          </svg>
          <div className="empty-state-title">No trips found</div>
          <div className="empty-state-subtitle">
            Trips will appear here once they are created.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Cancel Confirmation Dialog */}
      {cancelConfirmId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ padding: '2rem', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary-color)' }}>Confirm Cancellation</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)' }}>
              Are you sure you want to cancel this trip? The vehicle and driver will be released back to available status.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                className="btn-icon"
                onClick={handleCancelDismiss}
                style={{
                  padding: '0.5rem 1rem', border: '1px solid var(--border-color)',
                  borderRadius: '6px', background: 'white', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: '500'
                }}
              >
                No, Keep It
              </button>
              <button
                onClick={() => handleCancelConfirm(cancelConfirmId)}
                style={{
                  padding: '0.5rem 1rem', border: 'none', borderRadius: '6px',
                  background: '#dc2626', color: 'white', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: '500'
                }}
              >
                Yes, Cancel Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Form Dialog */}
      {completeFormId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ padding: '2rem', maxWidth: '420px', width: '90%' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary-color)' }}>Complete Trip</h3>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Enter the actual trip data (optional):
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input
                type="number"
                className="form-input"
                placeholder="Actual Distance (km)"
                value={completeData.actualDistance}
                onChange={(e) => setCompleteData(prev => ({ ...prev, actualDistance: e.target.value }))}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              />
              <input
                type="number"
                className="form-input"
                placeholder="Fuel Consumed (liters)"
                value={completeData.fuelConsumed}
                onChange={(e) => setCompleteData(prev => ({ ...prev, fuelConsumed: e.target.value }))}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCompleteDismiss}
                style={{
                  padding: '0.5rem 1rem', border: '1px solid var(--border-color)',
                  borderRadius: '6px', background: 'white', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleCompleteSubmit(completeFormId)}
                style={{
                  padding: '0.5rem 1rem', border: 'none', borderRadius: '6px',
                  background: '#16a34a', color: 'white', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: '500'
                }}
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Route</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Cargo (kg)</th>
              <th>Distance (km)</th>
              <th>Status</th>
              <th>Created</th>
              {canPerformActions && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id}>
                <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                  #{trip.id}
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem' }}>
                    {trip.source} → {trip.destination}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem' }}>
                  {trip.vehicle ? `${trip.vehicle.regNumber}` : `ID: ${trip.vehicleId}`}
                </td>
                <td style={{ fontSize: '0.8rem' }}>
                  {trip.driver ? trip.driver.name : `ID: ${trip.driverId}`}
                </td>
                <td>{Number(trip.cargoWeight).toLocaleString()}</td>
                <td>
                  {trip.actualDistance
                    ? `${Number(trip.actualDistance).toLocaleString()} / ${Number(trip.plannedDistance).toLocaleString()}`
                    : Number(trip.plannedDistance).toLocaleString()
                  }
                </td>
                <td>
                  <StatusBadge status={trip.status} />
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {formatDate(trip.createdAt)}
                </td>
                {canPerformActions && (
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end', gap: '0.4rem' }}>
                      {/* Dispatch button - shown only for DRAFT trips and FLEET_MANAGER */}
                      {trip.status === 'DRAFT' && userRole === 'FLEET_MANAGER' && (
                        <button
                          onClick={() => onDispatch(trip.id)}
                          title="Dispatch Trip"
                          style={{
                            padding: '0.35rem 0.65rem', border: 'none', borderRadius: '4px',
                            background: '#2563eb', color: 'white', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: '500'
                          }}
                        >
                          Dispatch
                        </button>
                      )}

                      {/* Complete button - shown only for DISPATCHED trips and DRIVER */}
                      {trip.status === 'DISPATCHED' && userRole === 'DRIVER' && (
                        <button
                          onClick={() => handleCompleteClick(trip.id)}
                          title="Complete Trip"
                          style={{
                            padding: '0.35rem 0.65rem', border: 'none', borderRadius: '4px',
                            background: '#16a34a', color: 'white', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: '500'
                          }}
                        >
                          Complete
                        </button>
                      )}

                      {/* Cancel button - shown only for DISPATCHED trips and FLEET_MANAGER */}
                      {trip.status === 'DISPATCHED' && userRole === 'FLEET_MANAGER' && (
                        <button
                          onClick={() => handleCancelClick(trip.id)}
                          title="Cancel Trip"
                          style={{
                            padding: '0.35rem 0.65rem', border: 'none', borderRadius: '4px',
                            background: '#dc2626', color: 'white', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: '500'
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TripTable;
