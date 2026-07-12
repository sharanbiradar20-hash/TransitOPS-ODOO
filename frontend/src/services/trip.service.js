import API from './api';

const getTrips = async (filters = {}) => {
  const response = await API.get('/trips', { params: filters });
  return response.data;
};

const getAvailableVehicles = async () => {
  const response = await API.get('/vehicles/available');
  return response.data;
};

const getAvailableDrivers = async () => {
  const response = await API.get('/drivers/available');
  return response.data;
};

const createTrip = async (tripData) => {
  const response = await API.post('/trips', tripData);
  return response.data;
};

const dispatchTrip = async (id) => {
  const response = await API.patch(`/trips/${id}/dispatch`);
  return response.data;
};

const completeTrip = async (id, data = {}) => {
  const response = await API.patch(`/trips/${id}/complete`, data);
  return response.data;
};

const cancelTrip = async (id) => {
  const response = await API.patch(`/trips/${id}/cancel`);
  return response.data;
};

const tripService = {
  getTrips,
  getAvailableVehicles,
  getAvailableDrivers,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
};

export default tripService;
