import { useState } from 'react'
import HeartBtn from '../components/HeartBtn'
import StarRating from '../components/StarRating'
import './RecipeDetail.css'

function RecipeDetail({ recipe, onBack }) {
  const [activeTab, setActiveTab] = useState('ingredients')
  const [isFavorite, setIsFavorite] = useState(false)
  const [rating, setRating] = useState(0)

  return (
    <main className="recipe-detail">

      <button
        className="recipe-detail__back"
        onClick={onBack}
      >
        ← TOUTES LES RECETTES
      </button>

      <div className="recipe-detail__layout">

        {/* COLONNE GAUCHE */}
        <section className="recipe-detail__main">

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