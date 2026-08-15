import { useEffect, useState } from 'react'
import './ShoppingList.css'

// TODO: group_id/added_by en dur en attendant l'auth
const GROUP_ID = 1
const USER_ID = 1

function ShoppingList() {
  const [items, setItems] = useState([])
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [confirmingClear, setConfirmingClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [clearError, setClearError] = useState(null)

useEffect(() => {
  const fetchList = () => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shopping-list?group_id=${GROUP_ID}`)
      .then((res) => {
        if (!res.ok) throw new Error('Erreur lors du chargement de la liste')
        return res.json()
      })
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  fetchList() // chargement initial

  const interval = setInterval(fetchList, 4000) // re-sync toutes les 4s
  return () => clearInterval(interval)
}, [])

  const addItem = (e) => {
    e.preventDefault()
    if (!label.trim()) return

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shopping-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_id: GROUP_ID, added_by: USER_ID, label }),
    })
      .then((res) => res.json())
      .then((created) => {
        setItems((prev) => [created, ...prev])
        setLabel('')
      })
  }

  const toggleItem = (item) => {
    const nextChecked = !item.is_checked
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_checked: nextChecked } : i))
    )
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shopping-list/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_checked: nextChecked }),
    })
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shopping-list/${id}`, {
      method: 'DELETE',
    })
  }

  const handleClearAll = async () => {
    setClearing(true)
    setClearError(null)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/shopping-list?group_id=${GROUP_ID}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Erreur ${res.status} lors de la suppression`)
      }

      setItems([])
      setConfirmingClear(false)
    } catch (err) {
      setClearError(err.message)
      setClearing(false)
    }
  }

  return (
    <main className="shopping-page">

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
                onClick={() => setConfirmingClear(false)}
                disabled={clearing}
              >
                Annuler
              </button>
              <button
                className="shopping-confirm-delete"
                onClick={handleClearAll}
                disabled={clearing}
              >
                {clearing ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="shopping-header">
        <h1 className="shopping-title">Liste de courses</h1>
        <button
          className="shopping-clear-btn"
          onClick={() => setConfirmingClear(true)}
          disabled={items.length === 0}
          aria-label="Tout supprimer"
        >
          <span className="shopping-clear-btn__icon">🗑️</span>
          <span className="shopping-clear-btn__label">Tout supprimer</span>
        </button>
      </div>

      <form className="shopping-add" onSubmit={addItem}>
        <input
          type="text"
          placeholder="Ajouter un article…"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <button type="submit">Ajouter</button>
      </form>

      {loading && <p>Chargement…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <ul className="shopping-list">
          {items.map((item) => (
            <li key={item.id} className={`shopping-item ${item.is_checked ? 'shopping-item--checked' : ''}`}>
              <label>
                <input
                  type="checkbox"
                  checked={!!item.is_checked}
                  onChange={() => toggleItem(item)}
                />
                {item.label}
              </label>
              <button className="shopping-item__delete" onClick={() => removeItem(item.id)}>✕</button>
            </li>
          ))}
          {items.length === 0 && <p className="shopping-empty">Ta liste est vide.</p>}
        </ul>
      )}
    </main>
  )
}

export default ShoppingList