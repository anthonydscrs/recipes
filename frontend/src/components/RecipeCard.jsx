import HeartBtn from './HeartBtn'
import chat from '../assets/chat.JPG'
import './RecipeCard.css'

const CATEGORY_LABELS = {
  viande: '🥩 Viande',
  'végé': '🥦 Végé',
  'féculent': '🌾 Féculent',
  dessert: '🍰 Dessert',
  cocktail: '🍸 Cocktail',
}

function RecipeCard({ recipe, onClick, onToggleFavorite }) {
  const categories = Array.isArray(recipe.category)
    ? recipe.category
    : recipe.category
      ? [recipe.category]
      : []

  return (
    <article className="recipe-card" onClick={() => onClick?.(recipe)}>
      <div className="recipe-card__image-container">
        <img src={recipe.image || chat} alt={recipe.title} className="recipe-card__image" />

        <div className="recipe-card__badges">
          <span className={`recipe-badge ${recipe.season === 'Été' ? 'recipe-badge--summer' : 'recipe-badge--winter'}`}>
            {recipe.season === 'Été' ? '☀️ Été' : '❄️ Hiver'}
          </span>
          {categories.map((cat) => (
            <span key={cat} className={`recipe-badge recipe-badge--${cat}`}>
              {CATEGORY_LABELS[cat]}
            </span>
          ))}
        </div>

        <div className="recipe-card__heart">
          <HeartBtn
            active={recipe.favorite}
            size={16}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite?.() }}
          />
        </div>

        {recipe.rating != null && (
          <div className="recipe-card__rating">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="#F3C94B"
              stroke="#F3C94B"
              strokeWidth="1.5"
            >
              <path d="M12 2.5l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 17.4l-5.9 3.3 1.2-6.6-4.9-4.6 6.7-.9L12 2.5z" />
            </svg>
            {recipe.rating}
          </div>
        )}
      </div>

      <div className="recipe-card__content">
        <h3 className="recipe-card__title">{recipe.title}</h3>
        <p className="recipe-card__description">{recipe.description}</p>
      </div>
    </article>
  )
}

export default RecipeCard