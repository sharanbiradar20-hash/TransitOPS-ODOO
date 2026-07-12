import React from 'react';
import Button from '../common/Button';

const DashboardFilters = ({ selectedRegion, onRegionChange, onRefresh, loading }) => {
  const regions = [
    { value: '', label: 'All Regions' },
    { value: 'North', label: 'North Region' },
    { value: 'South', label: 'South Region' },
    { value: 'East', label: 'East Region' },
    { value: 'West', label: 'West Region' }
  ];

  return (
    <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
            Filter BY:
          </span>
          <select
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value)}
            className="form-input"
            style={{ width: '180px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', margin: 0 }}
          >
            {regions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="secondary"
          onClick={onRefresh}
          disabled={loading}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            style={{ width: '0.9rem', height: '0.9rem', transform: loading ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default DashboardFilters;
