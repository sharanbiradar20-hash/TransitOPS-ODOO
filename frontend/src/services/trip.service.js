import api from './api';

export const getAvailableVehicles = () => api.get('/vehicles/available');
export const getAvailableDrivers = () => api.get('/drivers/available');

export const createTrip = (data) => api.post('/trips', data);
export const dispatchTrip = (id) => api.patch(`/trips/${id}/dispatch`);
export const completeTrip = (id, data) => api.patch(`/trips/${id}/complete`, data);
export const cancelTrip = (id) => api.patch(`/trips/${id}/cancel`);
