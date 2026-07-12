import API from './api';

const getKpis = async () => {
  const response = await API.get('/dashboard/kpis');
  return response.data; // Expected: { activeVehicles, availableVehicles, vehiclesInMaintenance, driversOnDuty, fleetUtilization }
};

const dashboardService = {
  getKpis,
};

export default dashboardService;
