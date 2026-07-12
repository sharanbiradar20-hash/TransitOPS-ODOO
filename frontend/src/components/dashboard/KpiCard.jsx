import React from 'react';

const KpiCard = ({ label, value, icon, color = 'blue' }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-details">
        <span className="kpi-value">{value}</span>
        <span className="kpi-label">{label}</span>
      </div>
      <div className={`kpi-icon-wrapper ${color}`}>
        {icon}
      </div>
    </div>
  );
};

export default KpiCard;
