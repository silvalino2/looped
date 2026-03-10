import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  timeout: 300000 // 5 min for video uploads
})

// Response interceptor — handle 401s globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('looped_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

