import './RecipeCard.css'

function RecipeCard({ recipe, onClick }) {
  return (
    <article
      className="recipe-card"
      onClick={() => onClick?.(recipe)}
    >
      <div className="recipe-card__image-container">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="recipe-card__image"
        />

        <div className="recipe-card__badges">
          <span
            className={`recipe-badge ${
              recipe.season === 'Été'
                ? 'recipe-badge--summer'
                : 'recipe-badge--winter'
            }`}
          >
            {recipe.season === 'Été' ? '☀︎ Été' : '❄ Hiver'}
          </span>

<span
  className={`recipe-badge ${
    recipe.category === 'végé'
      ? 'recipe-badge--végé'
      : recipe.category === 'féculent'
      ? 'recipe-badge--féculent'
      : recipe.category === 'viande'
      ? 'recipe-badge--viande'
      : 'recipe-badge--dessert'
  }`}
>
  {recipe.category}
</span>
        </div>
      </div>

      <div className="recipe-card__content">
        <h3 className="recipe-card__title">
          {recipe.title}
        </h3>

        <p className="recipe-card__description">
          {recipe.description}
        </p>
      </div>
    </article>
  )
}

export default RecipeCard