import { useEffect, useState } from 'react'
import './ShoppingList.css'

function ShoppingList() {
  const [items, setItems] = useState([])
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [confirmingClear, setConfirmingClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [clearError, setClearError] = useState(null)

  /*
   * =========================
   * AUTH
   * =========================
   */

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

  /*
   * =========================
   * CHARGEMENT DE LA LISTE
   * =========================
   */

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
        .then((res) => {
          if (!res.ok) {
            throw new Error(
              'Erreur lors du chargement de la liste'
            )
          }

          return res.json()
        })
        .then(setItems)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }

    // Chargement initial
    fetchList()

    // Re-sync toutes les 4 secondes
    const interval = setInterval(fetchList, 4000)

    return () => clearInterval(interval)
  }, [])

  /*
   * =========================
   * AJOUTER UN ARTICLE
   * =========================
   */

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
      })
      .catch((err) => {
        setError(err.message)
      })
  }

  /*
   * =========================
   * COCHER / DÉCOCHER
   * =========================
   */

  const toggleItem = (item) => {
    const nextChecked = !item.is_checked
    const token = getToken()

    // Mise à jour immédiate de l'interface
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
            data.error ||
              "Erreur lors de la modification de l'article"
          )
        }
      })
      .catch((err) => {
        console.error(err)

        // Annule la modification locale si le backend échoue
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

  /*
   * =========================
   * SUPPRIMER UN ARTICLE
   * =========================
   */

  const removeItem = (id) => {
    const token = getToken()

    // Suppression immédiate de l'interface
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

        // Recharge la page pour resynchroniser
        // avec la BDD en cas d'erreur
        window.location.reload()
      })
  }

  /*
   * =========================
   * VIDER LA LISTE
   * =========================
   */

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

      if (!res.ok) {
        const body = await res
          .json()
          .catch(() => ({}))

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

      {/* MODALE CONFIRMATION */}

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

      {/* HEADER */}

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

      {/* AJOUT */}

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

      {/* ÉTATS */}

      {loading && (
        <p>
          Chargement…
        </p>
      )}

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {/* LISTE */}

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
                ✕
              </button>

            </li>
          ))}

          {items.length === 0 && (
            <p className="shopping-empty">
              Ta liste est vide.
            </p>
          )}

        </ul>
      )}

    </main>
  )
}

export default ShoppingList