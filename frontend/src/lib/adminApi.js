import axios from 'axios';

export const adminApi = axios.create({ baseURL: '/api' });

adminApi.interceptors.request.use(config => {
  const token = sessionStorage.getItem('fg_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const endpoint = error.config?.url || '';
    // Never log out on a bad password at /admin-auth/login.
    if (status === 401 && endpoint.startsWith('/admin/')) {
      sessionStorage.removeItem('fg_admin_token');
      sessionStorage.removeItem('fg_admin_user');
      window.dispatchEvent(new Event('fg:admin-session-expired'));
    }
    return Promise.reject(error);
  }
);
