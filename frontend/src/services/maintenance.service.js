import API from './api';

const getMaintenanceRecords = async (filters = {}) => {
  const response = await API.get('/maintenance', { params: filters });
  return response.data;
};

const createMaintenanceRecord = async (data) => {
  const response = await API.post('/maintenance', data);
  return response.data;
};

const closeMaintenanceRecord = async (id) => {
  const response = await API.patch(`/maintenance/${id}/close`);
  return response.data;
};

const maintenanceService = {
  getMaintenanceRecords,
  createMaintenanceRecord,
  closeMaintenanceRecord,
};

export default maintenanceService;
