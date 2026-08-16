import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

function Login() {
  const { login } = useAuth()

  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      await login(pseudo, password)
    } catch (err) {
      console.error('Erreur login :', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <form
        className="login-form"
        onSubmit={handleSubmit}
      >
        <h1>Connexion</h1>

        <div>
          <label htmlFor="pseudo">
            Pseudo
          </label>

          <input
            id="pseudo"
            type="text"
            value={pseudo}
            onChange={(event) =>
              setPseudo(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="password">
            Mot de passe
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />
        </div>

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? 'Connexion...'
            : 'Se connecter'}
        </button>
      </form>
    </main>
  )
}

export default Login