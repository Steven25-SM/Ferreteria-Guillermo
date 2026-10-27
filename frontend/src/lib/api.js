import axios from 'axios';
export const api = axios.create({ baseURL: '/api', withCredentials: true });
export function getError(err) { return err.response?.data?.message || err.message || 'Ocurrió un error'; }
;
