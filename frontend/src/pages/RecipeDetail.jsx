import { useState } from 'react'
import HeartBtn from '../components/HeartBtn'
import StarRating from '../components/StarRating'
import './RecipeDetail.css'

function RecipeDetail({ recipe, onBack, onEdit, onDeleted }) {
  const [activeTab, setActiveTab] = useState('ingredients')
  const [isFavorite, setIsFavorite] = useState(false)
  const [rating, setRating] = useState(0)

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/recipes/${recipe.id}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(
          body.error || 'Erreur lors de la suppression de la recette'
        )
      }

      onDeleted(recipe.id)
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  return (
    <main className="recipe-detail">

      <button
        className="recipe-detail__back"
        onClick={onBack}
      >
        ← TOUTES LES RECETTES
      </button>

      {confirmingDelete && (
        <div className="recipe-detail__confirm-overlay">
          <div className="recipe-detail__confirm-box">
            <p className="recipe-detail__confirm-text">
              Supprimer définitivement « {recipe.title} » ?
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
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                className="recipe-detail__confirm-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="recipe-detail__layout">

        {/* COLONNE GAUCHE */}
        <section className="recipe-detail__main">

          {/* LIGNE BADGES + ACTIONS MOBILE (icônes, visible seulement en mobile) */}
          <div className="recipe-detail__badges-row">

            <div className="recipe-detail__badges">
              <span
                className={`recipe-detail__badge ${
                  recipe.season === 'Été'
                    ? 'recipe-detail__badge--summer'
                    : 'recipe-detail__badge--winter'
                }`}
              >
                {recipe.season === 'Été' ? '☀️ Été' : '❄️ Hiver'}
              </span>

              <span
                className={`recipe-detail__badge recipe-detail__badge--${recipe.category}`}
              >
                {{
  viande: '🥩 Viande',
  'végé': '🥦 Végé',
  'féculent': '🌾 Féculent',
  dessert: '🍰 Dessert',
}[recipe.category]}
              </span>
            </div>

            <div className="recipe-detail__actions-mobile">
              <button
                className="recipe-detail__icon-btn recipe-detail__icon-btn--edit"
                onClick={() => onEdit(recipe)}
                aria-label="Modifier la recette"
              >
                ✏️
              </button>
              <button
                className="recipe-detail__icon-btn recipe-detail__icon-btn--delete"
                onClick={() => setConfirmingDelete(true)}
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
        <StarRating rating={rating} onChange={setRating} size={20} />
        <HeartBtn
          active={isFavorite}
          onClick={() => setIsFavorite((prev) => !prev)}
          size={22}
        />
      </div>

          <p className="recipe-detail__description">
            {recipe.description}
          </p>

          <img
            src={recipe.image}
            alt={recipe.title}
            className="recipe-detail__image"
          />

          {/* ACTIONS SOUS LA PHOTO (visible seulement sur PC) */}
          <div className="recipe-detail__footer-actions">

            <button
              className="recipe-detail__action recipe-detail__action--edit"
              onClick={() => onEdit(recipe)}
            >
              <span className="recipe-detail__action-icon">✏️</span>
              <span>Modifier</span>
            </button>

            <button
              className="recipe-detail__action recipe-detail__action--delete"
              onClick={() => setConfirmingDelete(true)}
            >
              <span className="recipe-detail__action-icon">🗑️</span>
              <span>Supprimer</span>
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
              onClick={() => setActiveTab('ingredients')}
            >
              INGRÉDIENTS ({recipe.ingredients.length})
            </button>

            <button
              className={`recipe-detail__tab ${
                activeTab === 'preparation'
                  ? 'recipe-detail__tab--active'
                  : ''
              }`}
              onClick={() => setActiveTab('preparation')}
            >
              PRÉPARATION
            </button>

          </div>

          {/* CONTENU DE L'ONGLET */}
          <div className="recipe-detail__content">

            {activeTab === 'ingredients' && (
              <div className="recipe-detail__ingredients">
                {recipe.ingredients.map((ingredient, index) => (
                  <div
                    className="recipe-detail__ingredient"
                    key={index}
                  >
                    <span>−</span>
                    <p>{ingredient}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'preparation' && (
              <div className="recipe-detail__preparation">
                {recipe.preparation.map((step, index) => (
                  <div
                    className="recipe-detail__step"
                    key={index}
                  >
                    <span>{index + 1}</span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            )}

          </div>

        </section>

      </div>

    </main>
  )
}

export default RecipeDetail