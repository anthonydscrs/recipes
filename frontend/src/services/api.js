const API_URL = import.meta.env.VITE_BACKEND_URL

export async function apiFetch(
  endpoint,
  options = {}
) {
  const token = localStorage.getItem('token')

  const headers = {
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // On ajoute Content-Type uniquement si on envoie du JSON
  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  )

  if (!response.ok) {
    let errorMessage = 'Erreur serveur'

    try {
      const data = await response.json()
      errorMessage =
        data.error || errorMessage
    } catch {
      // La réponse n'est pas du JSON
    }

    throw new Error(errorMessage)
  }

  // Certaines requêtes peuvent ne rien retourner
  if (response.status === 204) {
    return null
  }

  return response.json()
}