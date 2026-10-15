import axios from 'axios'

// Para producción sirve tanto una API bajo el mismo dominio como un backend independiente.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  withCredentials: true
})

export default api
