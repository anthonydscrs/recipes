import HeartBtn from './HeartBtn'
import './RecipeCard.css'

const CATEGORY_LABELS = {
  viande: '🥩 Viande',
  'végé': '🥦 Végé',
  'féculent': '🌾 Féculent',
  dessert: '🍰 Dessert',
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
        <img src={recipe.image} alt={recipe.title} className="recipe-card__image" />

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
      </div>

      <div className="recipe-card__content">
        <h3 className="recipe-card__title">{recipe.title}</h3>
        <p className="recipe-card__description">{recipe.description}</p>
      </div>
    </article>
  )
}

export default RecipeCard