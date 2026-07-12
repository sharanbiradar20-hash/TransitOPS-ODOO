import API from './api';

const getKpis = async (params = {}) => {
  const response = await API.get('/dashboard/kpis', { params });
  return response.data; // Expected: { activeVehicles, availableVehicles, vehiclesInMaintenance, driversOnDuty, fleetUtilization }
};

const dashboardService = {
  getKpis,
};

export default dashboardService;
