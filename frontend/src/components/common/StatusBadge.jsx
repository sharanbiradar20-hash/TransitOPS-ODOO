import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase().replace(/\s+/g, '_');
  
  let color = 'green'; // default
  let label = status;

  switch (normalized) {
    case 'AVAILABLE':
    case 'ACTIVE':
    case 'ON_DUTY':
    case 'ON DUTY':
      color = 'green';
      label = 'Available';
      if (normalized === 'ON_DUTY' || normalized === 'ON DUTY') label = 'On Duty';
      break;
    case 'ON_TRIP':
    case 'ON TRIP':
    case 'IN_TRANSIT':
      color = 'blue';
      label = 'On Trip';
      break;
    case 'IN_SHOP':
    case 'IN SHOP':
    case 'MAINTENANCE':
    case 'OFF_DUTY':
    case 'OFF DUTY':
      color = 'amber';
      label = normalized.includes('SHOP') ? 'In Shop' : normalized.includes('MAINTENANCE') ? 'Maintenance' : 'Off Duty';
      break;
    case 'RETIRED':
    case 'SUSPENDED':
      color = 'red';
      label = normalized.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
      break;
    default:
      // Try to guess from text
      if (normalized.includes('OK') || normalized.includes('SUCCESS') || normalized.includes('YES')) {
        color = 'green';
      } else if (normalized.includes('PENDING') || normalized.includes('WAITING') || normalized.includes('PROCESS')) {
        color = 'blue';
      } else if (normalized.includes('WARN')) {
        color = 'amber';
      } else if (normalized.includes('FAIL') || normalized.includes('ERR') || normalized.includes('NO')) {
        color = 'red';
      } else {
        color = 'blue'; // fallback
      }
      break;
  }

  return (
    <span className={`status-pill ${color}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
