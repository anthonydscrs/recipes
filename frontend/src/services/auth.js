const API_URL = import.meta.env.VITE_BACKEND_URL

export async function login(pseudo, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pseudo,
      password,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.error || 'Identifiants incorrects'
    )
  }

  return data
}