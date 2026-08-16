const API_URL = import.meta.env.VITE_BACKEND_URL

const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
  })

  return response
}

export default apiFetch