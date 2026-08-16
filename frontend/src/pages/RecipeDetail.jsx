import { useEffect, useState } from 'react'
import HeartBtn from '../components/HeartBtn'
import StarRating from '../components/StarRating'
import chat from '../assets/chat.jpg'
import './RecipeDetail.css'

const PLANNING_DAYS = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi', label: 'Samedi' },
  { key: 'dimanche', label: 'Dimanche' },
]

const PLANNING_MEALS = [
  { key: 'dejeuner', label: 'Déjeuner', icon: '🌞' },
  { key: 'diner', label: 'Dîner', icon: '🌙' },
]

const CATEGORY_LABELS = {
  viande: '🥩 Viande',
  'végé': '🥦 Végé',
  'féculent': '🌾 Féculent',
  dessert: '🍰 Dessert',
}

function RecipeDetail({ recipe, onBack, onEdit, onDeleted, onToggleFavorite, onRatingChange }) {
  const [activeTab, setActiveTab] = useState('ingredients')

  const [rating, setRating] = useState(recipe.rating ?? 0)

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const [addingToList, setAddingToList] = useState(false)
  const [addedToList, setAddedToList] = useState(false)

  const [pickingPlanningSlot, setPickingPlanningSlot] = useState(false)
  const [addingToPlanning, setAddingToPlanning] = useState(false)
  const [addedToPlanning, setAddedToPlanning] = useState(false)

  const [planningItems, setPlanningItems] = useState([])
  const [loadingPlanning, setLoadingPlanning] = useState(false)

  /*
   * ============================================
   * AUTH
   * ============================================
   */

  const token = localStorage.getItem('token')

  /*
   * Headers utilisés pour toutes les requêtes
   * nécessitant une authentification.
   */
  const authHeaders = {
    Authorization: `Bearer ${token}`,
  }

  /*
   * ============================================
   * NOTE (RATING)
   * ============================================
   * La note est propre à l'utilisateur connecté et persiste
   * côté backend (table `ratings`, une valeur par user+recette).
   * `recipe.rating` vient déjà scopé à l'utilisateur connecté
   * (GET /api/recipes), donc on se resynchronise dessus à chaque
   * changement de recette affichée, sans requête supplémentaire.
   */

  useEffect(() => {
    setRating(recipe.rating ?? 0)
  }, [recipe.id, recipe.rating])

  const handleRate = async (value) => {
    const previousRating = rating

    // Mise à jour optimiste
    setRating(value)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ratings/${recipe.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({ value }),
        }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))

        throw new Error(
          body.error || "Erreur lors de l'enregistrement de la note"
        )
      }

      const data = await res.json()

      setRating(data.value ?? value)
      onRatingChange?.(data.value ?? value)
    } catch (err) {
      console.error('Erreur enregistrement note :', err)
      setRating(previousRating)
    }
  }

  /*
   * ============================================
   * SUPPRESSION
   * ============================================
   */

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/recipes/${recipe.id}`,
        {
          method: 'DELETE',
          headers: authHeaders,
        }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))

        throw new Error(
          body.error ||
            'Erreur lors de la suppression de la recette'
        )
      }

      onDeleted(recipe.id)
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  /*
   * ============================================
   * AJOUT AUX COURSES
   * ============================================
   */

  const handleAddToShoppingList = async () => {
    setAddingToList(true)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/shopping-list/from-recipe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({
            recipe_id: recipe.id,
          }),
        }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))

        throw new Error(
          body.error ||
            "Erreur lors de l'ajout aux courses"
        )
      }

      setAddedToList(true)

      setTimeout(() => {
        setAddedToList(false)
      }, 2000)
    } catch (err) {
      console.error('Erreur ajout courses :', err)
    } finally {
      setAddingToList(false)
    }
  }

  /*
   * ============================================
   * PLANNING
   * ============================================
   */

  const handleAddToPlanning = async () => {
    setLoadingPlanning(true)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/planning`,
        {
          headers: authHeaders,
        }
      )

      if (!res.ok) {
        throw new Error(
          'Erreur lors du chargement du planning'
        )
      }

      const data = await res.json()

      setPlanningItems(data)
      setPickingPlanningSlot(true)
    } catch (err) {
      console.error('Erreur chargement planning :', err)
    } finally {
      setLoadingPlanning(false)
    }
  }

  /*
   * Vérifie si un créneau est déjà occupé
   */

  const isPlanningSlotOccupied = (day, meal) => {
    return planningItems.some(
      (item) =>
        item.day === day &&
        item.meal === meal
    )
  }

  /*
   * Ajoute la recette dans le créneau choisi
   */

  const handleConfirmPlanning = async (
    day,
    meal
  ) => {
    if (isPlanningSlotOccupied(day, meal)) {
      return
    }

    setAddingToPlanning(true)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/planning`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({
            recipe_id: recipe.id,
            day,
            meal,
          }),
        }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))

        throw new Error(
          body.error ||
            "Erreur lors de l'ajout au planning"
        )
      }

      const saved = await res.json()

      setPlanningItems((prev) => [
        ...prev.filter(
          (item) =>
            !(
              item.day === day &&
              item.meal === meal
            )
        ),
        saved,
      ])

      setPickingPlanningSlot(false)
      setAddedToPlanning(true)

      setTimeout(() => {
        setAddedToPlanning(false)
      }, 2000)
    } catch (err) {
      console.error(
        'Erreur ajout planning :',
        err
      )
    } finally {
      setAddingToPlanning(false)
    }
  }

  /*
   * ============================================
   * CATÉGORIES
   * ============================================
   */

  const categories = Array.isArray(recipe.category)
    ? recipe.category
    : recipe.category
      ? recipe.category
          .split(',')
          .map((cat) => cat.trim())
      : []

  return (
    <main className="recipe-detail">

      <button
        className="recipe-detail__back"
        onClick={onBack}
      >
        ← TOUTES LES RECETTES
      </button>

      {/* =========================================
          MODALE SUPPRESSION
      ========================================= */}

      {confirmingDelete && (
        <div className="recipe-detail__confirm-overlay">

          <div className="recipe-detail__confirm-box">

            <p className="recipe-detail__confirm-text">
              Supprimer définitivement «{' '}
              {recipe.title}
              » ?
              Cette action est irréversible.
            </p>

            {deleteError && (
              <p className="recipe-detail__confirm-error">
                {deleteError}
              </p>
            )}

            <div className="recipe-detail__confirm-actions">

              <button
                className="recipe-detail__confirm-cancel"
                onClick={() =>
                  setConfirmingDelete(false)
                }
                disabled={deleting}
              >
                Annuler
              </button>

              <button
                className="recipe-detail__confirm-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? 'Suppression…'
                  : 'Supprimer'}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =========================================
          MODALE PLANNING
      ========================================= */}

      {pickingPlanningSlot && (
        <div
          className="recipe-detail__confirm-overlay"
          onClick={() =>
            setPickingPlanningSlot(false)
          }
        >

          <div
            className="recipe-detail__confirm-box"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <p className="recipe-detail__confirm-text">
              Ajouter « {recipe.title} » au
              planning — choisis un créneau
              disponible :
            </p>

            {PLANNING_DAYS.map((day) => (
              <div
                key={day.key}
                className="recipe-detail__planning-row"
              >

                <span className="recipe-detail__planning-day">
                  {day.label}
                </span>

                <div className="recipe-detail__planning-meals">

                  {PLANNING_MEALS.map((meal) => {
                    const occupied =
                      isPlanningSlotOccupied(
                        day.key,
                        meal.key
                      )

                    return (
                      <button
                        key={meal.key}
                        className={`recipe-detail__planning-meal-btn ${
                          occupied
                            ? 'recipe-detail__planning-meal-btn--occupied'
                            : ''
                        }`}
                        onClick={() =>
                          handleConfirmPlanning(
                            day.key,
                            meal.key
                          )
                        }
                        disabled={
                          addingToPlanning ||
                          occupied
                        }
                      >
                        {occupied
                          ? '✓ Déjà occupé'
                          : `${meal.icon} ${meal.label}`}
                      </button>
                    )
                  })}

                </div>

              </div>
            ))}

            <div className="recipe-detail__confirm-actions">

              <button
                className="recipe-detail__confirm-cancel"
                onClick={() =>
                  setPickingPlanningSlot(false)
                }
                disabled={addingToPlanning}
              >
                Annuler
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =========================================
          CONTENU
      ========================================= */}

      <div className="recipe-detail__layout">

        {/* COLONNE GAUCHE */}

        <section className="recipe-detail__main">

          {/* BADGES + ACTIONS MOBILE */}

          <div className="recipe-detail__badges-row">

            <div className="recipe-detail__badges">

              <span
                className={`recipe-detail__badge ${
                  recipe.season === 'Été'
                    ? 'recipe-detail__badge--summer'
                    : 'recipe-detail__badge--winter'
                }`}
              >
                {recipe.season === 'Été'
                  ? '☀️ Été'
                  : '❄️ Hiver'}
              </span>

              {categories.map((cat) => (
                <span
                  key={cat}
                  className={`recipe-detail__badge recipe-detail__badge--${cat}`}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </span>
              ))}

            </div>

            <div className="recipe-detail__actions-mobile">

              <button
                className="recipe-detail__icon-btn recipe-detail__icon-btn--cart"
                onClick={
                  handleAddToShoppingList
                }
                disabled={addingToList}
                aria-label="Ajouter les ingrédients aux courses"
              >
                {addedToList
                  ? '✅'
                  : '🛒'}
              </button>

              <button
                className="recipe-detail__icon-btn recipe-detail__icon-btn--planning"
                onClick={
                  handleAddToPlanning
                }
                disabled={loadingPlanning}
                aria-label="Ajouter au planning"
              >
                {addedToPlanning
                  ? '✅'
                  : '📅'}
              </button>

              <button
                className="recipe-detail__icon-btn recipe-detail__icon-btn--edit"
                onClick={() =>
                  onEdit(recipe)
                }
                aria-label="Modifier la recette"
              >
                ✏️
              </button>

              <button
                className="recipe-detail__icon-btn recipe-detail__icon-btn--delete"
                onClick={() =>
                  setConfirmingDelete(true)
                }
                aria-label="Supprimer la recette"
              >
                🗑️
              </button>

            </div>

          </div>

          <h1 className="recipe-detail__title">
            {recipe.title}
          </h1>

          <div className="recipe-detail__rating">

            <StarRating
              rating={rating}
              onChange={handleRate}
              size={20}
            />

            <HeartBtn
              active={recipe.favorite}
              onClick={() => onToggleFavorite?.()}
              size={22}
            />

          </div>

          <p className="recipe-detail__description">
            {recipe.description}
          </p>

          <img
            src={recipe.image || chat}
            alt={recipe.title}
            className="recipe-detail__image"
          />

          {/* ACTIONS PC */}

          <div className="recipe-detail__footer-actions">

            <button
              className="recipe-detail__action recipe-detail__action--cart"
              onClick={
                handleAddToShoppingList
              }
              disabled={addingToList}
            >
              <span className="recipe-detail__action-icon">
                🛒
              </span>

              <span>
                {addingToList
                  ? 'Ajout…'
                  : addedToList
                    ? 'Ajouté !'
                    : 'Ajouter aux courses'}
              </span>
            </button>

            <button
              className="recipe-detail__action recipe-detail__action--planning"
              onClick={
                handleAddToPlanning
              }
              disabled={loadingPlanning}
            >
              <span className="recipe-detail__action-icon">
                📅
              </span>

              <span>
                {addedToPlanning
                  ? 'Ajouté !'
                  : 'Ajouter au planning'}
              </span>
            </button>

            <button
              className="recipe-detail__action recipe-detail__action--edit"
              onClick={() =>
                onEdit(recipe)
              }
            >
              <span className="recipe-detail__action-icon">
                ✏️
              </span>

              <span>
                Modifier
              </span>
            </button>

            <button
              className="recipe-detail__action recipe-detail__action--delete"
              onClick={() =>
                setConfirmingDelete(true)
              }
            >
              <span className="recipe-detail__action-icon">
                🗑️
              </span>

              <span>
                Supprimer
              </span>
            </button>

          </div>

        </section>

        {/* COLONNE DROITE */}

        <section className="recipe-detail__card">

          <div className="recipe-detail__tabs">

            <button
              className={`recipe-detail__tab ${
                activeTab === 'ingredients'
                  ? 'recipe-detail__tab--active'
                  : ''
              }`}
              onClick={() =>
                setActiveTab(
                  'ingredients'
                )
              }
            >
              INGRÉDIENTS (
              {recipe.ingredients.length}
              )
            </button>

            <button
              className={`recipe-detail__tab ${
                activeTab === 'preparation'
                  ? 'recipe-detail__tab--active'
                  : ''
              }`}
              onClick={() =>
                setActiveTab(
                  'preparation'
                )
              }
            >
              PRÉPARATION
            </button>

          </div>

          <div className="recipe-detail__content">

            {activeTab === 'ingredients' && (
              <div className="recipe-detail__ingredients">

                {recipe.ingredients.map(
                  (ingredient, index) => (
                    <div
                      className="recipe-detail__ingredient"
                      key={index}
                    >
                      <span>−</span>
                      <p>
                        {ingredient}
                      </p>
                    </div>
                  )
                )}

              </div>
            )}

            {activeTab === 'preparation' && (
              <div className="recipe-detail__preparation">

                {recipe.preparation.map(
                  (step, index) => (
                    <div
                      className="recipe-detail__step"
                      key={index}
                    >
                      <span>
                        {index + 1}
                      </span>

                      <p>{step}</p>
                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </section>

      </div>

    </main>
  )
}

export default RecipeDetail