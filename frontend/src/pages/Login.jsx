import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import catIllustration from '../assets/chatt.png'
import './Login.css'

// ─── Trace de patte ──────────────────────────────────────────────────────────
function PawPrint({ size = 32, opacity = 0.18, rotate = 0, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="login-paw"
      style={{ transform: `rotate(${rotate}deg)`, opacity, ...style }}
    >
      <ellipse cx="32" cy="42" rx="14" ry="11" fill="#100d0b" />
      <ellipse cx="14" cy="26" rx="6" ry="7.5" fill="#100d0b" />
      <ellipse cx="25" cy="20" rx="6" ry="7.5" fill="#100d0b" />
      <ellipse cx="39" cy="20" rx="6" ry="7.5" fill="#100d0b" />
      <ellipse cx="50" cy="26" rx="6" ry="7.5" fill="#100d0b" />
    </svg>
  )
}

// ─── Décor de pattes disséminées sur la page ─────────────────────────────────
const PAW_LAYOUT = [
  { size: 30, opacity: 0.38, rotate: -18, style: { top: '5%', left: '6%' } },
  { size: 22, opacity: 0.32, rotate: 40, style: { top: '4%', left: '22%' } },
  { size: 26, opacity: 0.38, rotate: 12, style: { top: '8%', right: '10%' } },
  { size: 18, opacity: 0.30, rotate: -25, style: { top: '18%', right: '22%' } },
  { size: 30, opacity: 0.34, rotate: 30, style: { top: '28%', right: '4%' } },
  { size: 20, opacity: 0.30, rotate: -8, style: { top: '38%', left: '4%' } },
  { size: 22, opacity: 0.32, rotate: 24, style: { top: '20%', left: '20%' } },
  { size: 18, opacity: 0.28, rotate: -20, style: { top: '44%', right: '36%' } },
  { size: 24, opacity: 0.34, rotate: 20, style: { top: '48%', left: '16%' } },
  { size: 22, opacity: 0.32, rotate: -30, style: { top: '52%', right: '14%' } },
  { size: 20, opacity: 0.30, rotate: 14, style: { top: '58%', left: '42%' } },
  { size: 18, opacity: 0.28, rotate: -14, style: { top: '62%', right: '32%' } },
  { size: 26, opacity: 0.34, rotate: -10, style: { bottom: '24%', right: '7%' } },
  { size: 18, opacity: 0.30, rotate: 35, style: { bottom: '30%', left: '20%' } },
  { size: 28, opacity: 0.32, rotate: 18, style: { bottom: '8%', left: '9%' } },
  { size: 20, opacity: 0.30, rotate: -15, style: { bottom: '5%', left: '30%' } },
  { size: 24, opacity: 0.34, rotate: 8, style: { bottom: '10%', right: '20%' } },
  { size: 18, opacity: 0.28, rotate: -35, style: { bottom: '2%', right: '5%' } },
]

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
      {PAW_LAYOUT.map((paw, index) => (
        <PawPrint key={index} {...paw} />
      ))}

      <div className="login-hero">
        <img src={catIllustration} alt="Chat noir" className="login-cat" />
        <h1 className="login-brand">Jiji-sama</h1>
        <p className="login-tagline">Vos recettes, votre planning</p>
      </div>

      <form
        className="login-form"
        onSubmit={handleSubmit}
      >
        <h2>Connexion</h2>
        <p className="login-form-subtitle">Entrez votre pseudo et votre mot de passe.</p>

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