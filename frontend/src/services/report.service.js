import API from './api';

const getFuelEfficiency = async () => {
  const response = await API.get('/reports/fuel-efficiency');
  return response.data;
};

const getOperationalCost = async () => {
  const response = await API.get('/reports/operational-cost');
  return response.data;
};

const getFleetUtilization = async () => {
  const response = await API.get('/reports/fleet-utilization');
  return response.data;
};

const getVehicleRoi = async () => {
  const response = await API.get('/reports/vehicle-roi');
  return response.data;
};

// CSV export - triggers file download
const downloadCsv = async (reportType) => {
  const response = await API.get(`/reports/${reportType}?export=csv`, {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${reportType}-report.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Fuel/Expense services
const getFuelLogs = async (filters = {}) => {
  const response = await API.get('/fuel-logs', { params: filters });
  return response.data;
};

const createFuelLog = async (data) => {
  const response = await API.post('/fuel-logs', data);
  return response.data;
};

const createExpense = async (data) => {
  const response = await API.post('/fuel-logs/expenses', data);
  return response.data;
};

const getVehicleOperationalCost = async (vehicleId) => {
  const response = await API.get(`/vehicles/${vehicleId}/operational-cost`);
  return response.data;
};

const reportService = {
  getFuelEfficiency,
  getOperationalCost,
  getFleetUtilization,
  getVehicleRoi,
  downloadCsv,
  getFuelLogs,
  createFuelLog,
  createExpense,
  getVehicleOperationalCost,
};

export default reportService;
