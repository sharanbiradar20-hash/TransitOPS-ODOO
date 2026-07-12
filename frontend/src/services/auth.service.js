import API from './api';

const login = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  return response.data; // Expected response shape: { token, name, role }
};

const register = async (name, email, password, role) => {
  const response = await API.post('/auth/register', { name, email, password, role });
  return response.data;
};

const authService = {
  login,
  register,
};

export default authService;
