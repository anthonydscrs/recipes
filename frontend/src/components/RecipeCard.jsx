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
              recipe.category === 'Dessert'
                ? 'recipe-badge--dessert'
                : 'recipe-badge--dish'
            }`}
          >
            {recipe.category}
          </span>
<span
  className={`recipe-badge ${
    recipe.tags === 'végé'
      ? 'recipe-badge--végé'
      : recipe.tags === 'féculent'
      ? 'recipe-badge--féculent'
      : 'recipe-badge--viande'
  }`}
>
  {recipe.tags}
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