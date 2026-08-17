import { useEffect, useState } from 'react'
import FilterBar from '../components/FilterBar'
import { useRecipeFilters } from '../hooks/useRecipeFilters'
import { useToast } from '../contexts/ToastContext'
import defaultRecipeImage from '../assets/chat.JPG'
import './Planning.css'

const DAYS = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi', label: 'Samedi' },
  { key: 'dimanche', label: 'Dimanche' },
]

const MEALS = [
  { key: 'dejeuner', label: 'Déjeuner', icon: '🌞' },
  { key: 'diner', label: 'Dîner', icon: '🌙' },
]

function Planning({ recipes, onSelectRecipe }) {
  const { showError, showToast } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [pickingSlot, setPickingSlot] = useState(null)

  const [confirmingRemove, setConfirmingRemove] = useState(null)
  const [removing, setRemoving] = useState(false)

  const [confirmingClear, setConfirmingClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [clearError, setClearError] = useState(null)

  const [generatingList, setGeneratingList] = useState(false)

  const pickerFilters = useRecipeFilters(recipes ?? [])

  /*
   * ============================================
   * AUTH
   * ============================================
   */

  const token = localStorage.getItem('token')

  /*
   * ============================================
   * HEADERS AUTH
   * ============================================
   */

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  }

  /*
   * ============================================
   * CHARGEMENT DU PLANNING
   * ============================================
   */

  const fetchPlanning = () => {
    if (!token) {
      setError('Utilisateur non authentifié.')
      setLoading(false)
      return
    }

    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/planning`,
      {
        headers: authHeaders,
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            'Erreur lors du chargement du planning'
          )
        }

        return res.json()
      })
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPlanning()
  }, [])

  /*
   * ============================================
   * TROUVER UN CRÉNEAU
   * ============================================
   */

  const getItem = (day, meal) =>
    items.find(
      (item) =>
        item.day === day &&
        item.meal === meal
    )

  /*
   * ============================================
   * AFFICHAGE D'UN CRÉNEAU
   * ============================================
   */

  const renderSlot = (
    dayKey,
    dayLabel,
    mealKey,
    mealLabel
  ) => {
    const item = getItem(dayKey, mealKey)

    /*
     * CRÉNEAU REMPLI
     */
    if (item) {
      return (
        <button
          className="planning-slot planning-slot--filled"
          onClick={() =>
            onSelectRecipe
              ? onSelectRecipe({
                  id: item.recipe_id,
                })
              : null
          }
        >
          <img
            src={item.recipe_image || defaultRecipeImage}
            alt={item.recipe_title}
            className={`planning-slot__image ${
              !item.recipe_image
                ? 'planning-slot__image--fallback'
                : ''
            }`}
          />

          <span className="planning-slot__title">
            {item.recipe_title}
          </span>

          <span
            className="planning-slot__remove"
            onClick={(e) => {
              e.stopPropagation()
              setConfirmingRemove(item)
            }}
            role="button"
            aria-label="Retirer du planning"
          >
            ✕
          </span>
        </button>
      )
    }

    /*
     * CRÉNEAU VIDE
     */
    return (
      <button
        className="planning-slot planning-slot--empty"
        onClick={() =>
          setPickingSlot({
            day: dayKey,
            meal: mealKey,
          })
        }
        aria-label={`Ajouter une recette : ${dayLabel} ${mealLabel}`}
      >
        +
      </button>
    )
  }

  /*
   * ============================================
   * AJOUTER UNE RECETTE AU PLANNING
   * ============================================
   */

  const handlePick = async (recipeId) => {
    if (!pickingSlot) return

    const { day, meal } = pickingSlot

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/planning`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            recipe_id: recipeId,
            day,
            meal,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Erreur lors de l'ajout au planning"
        )
      }

      setItems((prev) => [
        ...prev.filter(
          (item) =>
            !(
              item.day === day &&
              item.meal === meal
            )
        ),
        data,
      ])

      setPickingSlot(null)
    } catch (err) {
      console.error(
        "Erreur ajout planning :",
        err
      )
      showError(
        err.message ||
          "L'ajout au planning a échoué, rien n'a été enregistré."
      )
    }
  }

  /*
   * ============================================
   * SUPPRIMER UN ÉLÉMENT
   * ============================================
   */

  const handleRemove = async () => {
    if (!confirmingRemove) return

    setRemoving(true)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/planning/${confirmingRemove.id}`,
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
            'Erreur lors de la suppression'
        )
      }

      setItems((prev) =>
        prev.filter(
          (item) =>
            item.id !== confirmingRemove.id
        )
      )

      setConfirmingRemove(null)
    } catch (err) {
      console.error(err)
      showError(
        err.message ||
          "La suppression a échoué, l'élément est toujours dans le planning."
      )
    } finally {
      setRemoving(false)
    }
  }

  /*
   * ============================================
   * VIDER LE PLANNING
   * ============================================
   */

  const handleClearAll = async () => {
    setClearing(true)
    setClearError(null)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/planning`,
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

  /*
   * ============================================
   * GÉNÉRER LA LISTE DE COURSES DEPUIS LE PLANNING
   * ============================================
   */

  const handleGenerateShoppingList = async () => {
    setGeneratingList(true)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/shopping-list/from-planning`,
        {
          method: 'POST',
          headers: authHeaders,
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Erreur lors de la génération de la liste de courses"
        )
      }

      showToast(
        'Liste de courses générée depuis le planning !',
        { type: 'success' }
      )
    } catch (err) {
      console.error(
        'Erreur génération liste de courses :',
        err
      )
      showError(
        err.message ||
          "La liste de courses n'a pas pu être générée."
      )
    } finally {
      setGeneratingList(false)
    }
  }

  /*
   * ============================================
   * RENDER
   * ============================================
   */

  return (
    <main className="planning-page">

      <div className="planning-header">

        <div>
          <h1 className="planning-title">
            Planning de la semaine
          </h1>

          <p className="planning-subtitle">
            Organisez vos repas de la semaine.
            Ouvrez une recette et cliquez sur
            « Ajouter au planning ».
          </p>
        </div>

        <div className="planning-header__actions">

          <button
            className="planning-generate-btn"
            onClick={handleGenerateShoppingList}
            disabled={
              generatingList || items.length === 0
            }
            aria-label="Générer la liste de courses depuis le planning"
          >
            <span className="planning-generate-btn__icon">
              🛒
            </span>

            <span className="planning-generate-btn__label">
              {generatingList
                ? 'Génération…'
                : 'Générer la liste de courses'}
            </span>
          </button>

          <button
            className="planning-clear-btn"
            onClick={() =>
              setConfirmingClear(true)
            }
            disabled={items.length === 0}
            aria-label="Tout supprimer"
          >
            <span className="planning-clear-btn__icon">
              🗑️
            </span>

            <span className="planning-clear-btn__label">
              Tout supprimer
            </span>
          </button>

        </div>

      </div>

      {loading && <p>Chargement…</p>}

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="planning-grid-wrapper planning-grid-wrapper--desktop">

            <table className="planning-grid">

              <thead>
                <tr>

                  <th className="planning-grid__corner">
                  </th>

                  {DAYS.map((day) => (
                    <th
                      key={day.key}
                      className="planning-grid__day-head"
                    >
                      {day.label}
                    </th>
                  ))}

                </tr>
              </thead>

              <tbody>

                {MEALS.map((meal) => (
                  <tr key={meal.key}>

                    <th className="planning-grid__meal-head">
                      <span>
                        {meal.icon}
                      </span>

                      {meal.label.toUpperCase()}
                    </th>

                    {DAYS.map((day) => (
                      <td
                        key={day.key}
                        className="planning-grid__cell"
                      >
                        {renderSlot(
                          day.key,
                          day.label,
                          meal.key,
                          meal.label
                        )}
                      </td>
                    ))}

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          <div className="planning-grid-wrapper planning-grid-wrapper--mobile">

            <table className="planning-grid planning-grid--mobile">

              <thead>

                <tr>

                  <th className="planning-grid__corner">
                  </th>

                  {MEALS.map((meal) => (
                    <th
                      key={meal.key}
                      className="planning-grid__day-head"
                    >
                      <span>
                        {meal.icon}
                      </span>

                      {meal.label}
                    </th>
                  ))}

                </tr>

              </thead>

              <tbody>

                {DAYS.map((day) => (
                  <tr key={day.key}>

                    <th className="planning-grid__meal-head">
                      {day.label}
                    </th>

                    {MEALS.map((meal) => (
                      <td
                        key={meal.key}
                        className="planning-grid__cell"
                      >
                        {renderSlot(
                          day.key,
                          day.label,
                          meal.key,
                          meal.label
                        )}
                      </td>
                    ))}

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        </>
      )}

      {pickingSlot && (
        <div
          className="planning-confirm-overlay"
          onClick={() =>
            setPickingSlot(null)
          }
        >

          <div
            className="planning-picker-box"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="planning-picker-header">

              <p>
                Choisir une recette —{' '}
                {
                  DAYS.find(
                    (day) =>
                      day.key ===
                      pickingSlot.day
                  )?.label
                }
                ,{' '}
                {
                  MEALS.find(
                    (meal) =>
                      meal.key ===
                      pickingSlot.meal
                  )?.label
                }
              </p>

              <button
                className="planning-picker-close"
                onClick={() =>
                  setPickingSlot(null)
                }
              >
                ✕
              </button>

            </div>

            <div className="planning-picker-filters">
              <FilterBar
                {...pickerFilters}
              />
            </div>

            <div className="planning-picker-list">

              {pickerFilters.filtered.map(
                (recipe) => (
                  <button
                    key={recipe.id}
                    className="planning-picker-item"
                    onClick={() =>
                      handlePick(recipe.id)
                    }
                  >

                    <img
                      src={recipe.image || defaultRecipeImage}
                      alt={recipe.title}
                      className={
                        !recipe.image
                          ? 'planning-picker-item__image--fallback'
                          : ''
                      }
                    />

                    <span>
                      {recipe.title}
                    </span>

                  </button>
                )
              )}

              {pickerFilters.filtered.length ===
                0 && (
                <p className="planning-empty">
                  Aucune recette ne correspond.
                </p>
              )}

            </div>

          </div>

        </div>
      )}

      {confirmingRemove && (
        <div className="planning-confirm-overlay">

          <div className="planning-confirm-box">

            <p className="planning-confirm-text">
              Retirer «{' '}
              {confirmingRemove.recipe_title}
              {' '}» du planning ?
            </p>

            <div className="planning-confirm-actions">

              <button
                className="planning-confirm-cancel"
                onClick={() =>
                  setConfirmingRemove(null)
                }
                disabled={removing}
              >
                Annuler
              </button>

              <button
                className="planning-confirm-delete"
                onClick={handleRemove}
                disabled={removing}
              >
                {removing
                  ? 'Suppression…'
                  : 'Retirer'}
              </button>

            </div>

          </div>

        </div>
      )}

      {confirmingClear && (
        <div className="planning-confirm-overlay">

          <div className="planning-confirm-box">

            <p className="planning-confirm-text">
              Vider entièrement le planning
              de la semaine ?
            </p>

            {clearError && (
              <p className="planning-confirm-error">
                {clearError}
              </p>
            )}

            <div className="planning-confirm-actions">

              <button
                className="planning-confirm-cancel"
                onClick={() =>
                  setConfirmingClear(false)
                }
                disabled={clearing}
              >
                Annuler
              </button>

              <button
                className="planning-confirm-delete"
                onClick={handleClearAll}
                disabled={clearing}
              >
                {clearing
                  ? 'Suppression…'
                  : 'Tout supprimer'}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  )
}

export default Planning