import { useEffect, useState } from 'react'
import { useToast } from '../contexts/ToastContext'
import './ShoppingList.css'

// ─── Mascotte : chat assis qui attend, queue qui dandine ────────────────────
function WaitingCat() {
  return (
    <svg
      className="shopping-cat"
      viewBox="0 0 140 140"
      width="96"
      height="96"
      fill="none"
      aria-hidden="true"
    >
      {/* Queue — animée en CSS (dandine) */}
      <g className="shopping-cat__tail">
        <path
          d="M92 96 Q120 92 126 66 Q130 48 114 40"
          stroke="#100d0b"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Corps assis */}
      <ellipse cx="62" cy="98" rx="30" ry="26" fill="#100d0b" />
      {/* Reflet ventre */}
      <ellipse cx="62" cy="106" rx="15" ry="10" fill="#221c18" opacity="0.6" />

      {/* Cou */}
      <rect x="50" y="70" width="24" height="15" rx="7" fill="#100d0b" />

      {/* Tête */}
      <ellipse cx="62" cy="58" rx="25" ry="23" fill="#100d0b" />

      {/* Oreille gauche */}
      <polygon points="38,40 32,19 53,36" fill="#100d0b" />
      <polygon points="40,38 36,25 50,36" fill="#3d2a2a" />
      {/* Oreille droite */}
      <polygon points="86,40 92,19 71,36" fill="#100d0b" />
      <polygon points="84,38 88,25 74,36" fill="#3d2a2a" />

      {/* Yeux (mi-clos, chat qui patiente) */}
      <ellipse cx="53" cy="57" rx="6.5" ry="5" fill="#F3C835" />
      <ellipse cx="53" cy="57" rx="2.6" ry="4.4" fill="#100d0b" />
      <ellipse cx="71" cy="57" rx="6.5" ry="5" fill="#F3C835" />
      <ellipse cx="71" cy="57" rx="2.6" ry="4.4" fill="#100d0b" />

      {/* Nez */}
      <polygon points="62,63 59,66 65,66" fill="#c87070" />
      {/* Bouche */}
      <path d="M59,66 Q62,70 65,66" stroke="#c87070" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Moustaches */}
      <line x1="57" y1="65" x2="34" y2="61" stroke="#b8a898" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="57" y1="67" x2="34" y2="69" stroke="#b8a898" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="67" y1="65" x2="90" y2="61" stroke="#b8a898" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="67" y1="67" x2="90" y2="69" stroke="#b8a898" strokeWidth="1.1" strokeLinecap="round" />

      {/* Pattes avant, posées bien sagement */}
      <ellipse cx="48" cy="120" rx="9" ry="6.5" fill="#100d0b" />
      <ellipse cx="76" cy="120" rx="9" ry="6.5" fill="#100d0b" />
    </svg>
  )
}

function ShoppingList() {
  const { showError } = useToast()
  const [items, setItems] = useState([])
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [confirmingClear, setConfirmingClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [clearError, setClearError] = useState(null)

  /* =========================
     AUTH
     ========================= */

  const getAuthUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem('user') || 'null'
      )
    } catch {
      return null
    }
  }

  const getToken = () => {
    return localStorage.getItem('token')
  }

  /* =========================
     CHARGEMENT DE LA LISTE
     ========================= */

  useEffect(() => {
    const user = getAuthUser()
    const token = getToken()

    if (!user || !token) {
      setError(
        'Vous devez être connecté pour accéder à la liste de courses.'
      )
      setLoading(false)
      return
    }

    const fetchList = () => {
      fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/shopping-list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then(async (res) => {
          const data = await res.json().catch(() => ({}))

          if (!res.ok) {
            throw new Error(
              data.error ||
                'Erreur lors du chargement de la liste'
            )
          }

          return data
        })
        .then(setItems)
        .catch((err) => {
          console.error(err)
          setError(err.message)
        })
        .finally(() => setLoading(false))
    }

    fetchList()

    const interval = setInterval(fetchList, 4000)

    return () => clearInterval(interval)
  }, [])

  /* =========================
     AJOUTER UN ARTICLE
     ========================= */

  const addItem = (e) => {
    e.preventDefault()

    if (!label.trim()) return

    const user = getAuthUser()
    const token = getToken()

    if (!user || !token) {
      setError(
        'Vous devez être connecté pour ajouter un article.'
      )
      return
    }

    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/shopping-list`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: label.trim(),
        }),
      }
    )
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          throw new Error(
            data.error ||
              "Erreur lors de l'ajout de l'article"
          )
        }

        return data
      })
      .then((created) => {
        setItems((prev) => [created, ...prev])
        setLabel('')
        setError(null)
      })
      .catch((err) => {
        console.error(err)
        setError("Achète de la pâtée plutôt")
      })
  }

  /* =========================
     COCHER / DÉCOCHER
     ========================= */

  const toggleItem = (item) => {
    const nextChecked = !item.is_checked
    const token = getToken()

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              is_checked: nextChecked,
            }
          : i
      )
    )

    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/shopping-list/${item.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_checked: nextChecked,
        }),
      }
    )
      .then(async (res) => {
        if (!res.ok) {
          const data = await res
            .json()
            .catch(() => ({}))

          throw new Error(
              "Erreur lors de la modification de l'article"
          )
        }
      })
      .catch((err) => {
        console.error(err)
        showError(
          "Le changement n'a pas été enregistré."
        )

        // Annule la modification locale
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  is_checked: !nextChecked,
                }
              : i
          )
        )
      })
  }

  /* =========================
     SUPPRIMER UN ARTICLE
     ========================= */

  const removeItem = (id) => {
    const token = getToken()

    setItems((prev) =>
      prev.filter((i) => i.id !== id)
    )

    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/shopping-list/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(async (res) => {
        if (!res.ok) {
          const data = await res
            .json()
            .catch(() => ({}))

          throw new Error(
            data.error ||
              "Erreur lors de la suppression de l'article"
          )
        }
      })
      .catch((err) => {
        console.error(err)
        showError(
          "La suppression n'a pas été enregistrée, la liste va être resynchronisée."
        )

        // Resynchronise avec le backend (laisse le temps de lire la notification)
        setTimeout(() => window.location.reload(), 1800)
      })
  }

  /* =========================
     VIDER LA LISTE
     ========================= */

  const handleClearAll = async () => {
    const user = getAuthUser()
    const token = getToken()

    if (!user || !token) {
      setClearError(
        'Vous devez être connecté.'
      )
      return
    }

    setClearing(true)
    setClearError(null)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/shopping-list`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const body = await res
        .json()
        .catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          body.error ||
            `Erreur ${res.status} lors de la suppression`
        )
      }

      setItems([])
      setConfirmingClear(false)
    } catch (err) {
      setClearError(err.message)
    } finally {
      setClearing(false)
    }
  }

  return (
    <main className="shopping-page">

      {/* =========================
          MODALE CONFIRMATION
          ========================= */}

      {confirmingClear && (
        <div className="shopping-confirm-overlay">
          <div className="shopping-confirm-box">

            <p className="shopping-confirm-text">
              Vider entièrement la liste de courses ?
            </p>

            {clearError && (
              <p className="shopping-confirm-error">
                {clearError}
              </p>
            )}

            <div className="shopping-confirm-actions">

              <button
                className="shopping-confirm-cancel"
                onClick={() =>
                  setConfirmingClear(false)
                }
                disabled={clearing}
              >
                Annuler
              </button>

              <button
                className="shopping-confirm-delete"
                onClick={handleClearAll}
                disabled={clearing}
              >
                {clearing
                  ? 'Suppression…'
                  : 'Supprimer'}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* =========================
          HEADER
          ========================= */}

      <div className="shopping-header">

        <h1 className="shopping-title">
          Liste de courses
        </h1>

        <button
          className="shopping-clear-btn"
          onClick={() =>
            setConfirmingClear(true)
          }
          disabled={items.length === 0}
          aria-label="Tout supprimer"
        >
          <span className="shopping-clear-btn__icon">
            🗑️
          </span>

          <span className="shopping-clear-btn__label">
            Tout supprimer
          </span>
        </button>

      </div>

      {/* =========================
          AJOUT
          ========================= */}

      <form
        className="shopping-add"
        onSubmit={addItem}
      >

        <input
          type="text"
          placeholder="Ajouter un article…"
          value={label}
          onChange={(e) =>
            setLabel(e.target.value)
          }
        />

        <button type="submit">
          Ajouter
        </button>

      </form>

      {/* =========================
          ÉTATS
          ========================= */}

      {loading && (
        <p>Chargement…</p>
      )}

      {error && (
        <p className="shopping-error">
          {error}
        </p>
      )}

      {/* =========================
          LISTE
          ========================= */}

      {!loading && !error && (
        <ul className="shopping-list">

          {items.map((item) => (
            <li
              key={item.id}
              className={`shopping-item ${
                item.is_checked
                  ? 'shopping-item--checked'
                  : ''
              }`}
            >

              <label>

                <input
                  type="checkbox"
                  checked={!!item.is_checked}
                  onChange={() =>
                    toggleItem(item)
                  }
                />

                {item.label}

              </label>

              <button
                className="shopping-item__delete"
                onClick={() =>
                  removeItem(item.id)
                }
                type="button"
                aria-label={`Supprimer ${item.label}`}
              >  
  🗑️
              </button>

            </li>
          ))}

          {/* =========================
              LISTE VIDE
              ========================= */}

          {items.length === 0 && (
            <div className="shopping-empty">

              <div
                className="shopping-empty__cart"
                aria-hidden="true"
              >
                <WaitingCat />
              </div>

              <p className="shopping-empty__title">
                Votre panier est vide
              </p>

              <p className="shopping-empty__text">
                Ajoutez des ingrédients ou utilisez
                "Ajouter aux courses" depuis une recette.
              </p>

            </div>
          )}

        </ul>
      )}

    </main>
  )
}

export default ShoppingList