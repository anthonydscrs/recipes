import { useNavigate } from 'react-router-dom'

import RecipeCard from '../components/RecipeCard'
import FilterBar from '../components/FilterBar'

import { useRecipeFilters } from '../hooks/useRecipeFilters'
import { usePagination } from '../hooks/usePagination'
import { useRecipes } from '../contexts_tmp/RecipesContext'

function RecipesPage() {
  const navigate = useNavigate()

  const { recipes, loading, error, toggleFavorite } =
    useRecipes()

  const filters = useRecipeFilters(recipes)

  const {
    paginated,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
  } = usePagination(filters.filtered, 12)

  if (loading) {
    return <p style={{ padding: 32 }}>Chargement…</p>
  }

  if (error) {
    return (
      <p style={{ padding: 32, color: 'red' }}>
        {error}
      </p>
    )
  }

  return (
    <main className="recipes-page">

      <FilterBar {...filters} />

      <div className="recipes-header">

        <p className="recipes-count">
          {filters.filtered.length}{' '}
          recette
          {filters.filtered.length !== 1 ? 's' : ''}
        </p>

        <button
          className="add-recipe-btn"
          onClick={() => navigate('/recette/ajouter')}
        >
          + Ajouter une recette
        </button>

      </div>

      <div className="recipes-grid">

        {paginated.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={(r) => navigate(`/recette/${r.id}`)}
            onToggleFavorite={() =>
              toggleFavorite(recipe.id)
            }
          />
        ))}

      </div>

      {totalPages > 1 && (
        <div className="recipes-pagination">

          <button
            className="recipes-pagination__arrow"
            onClick={previousPage}
            disabled={currentPage === 1}
            aria-label="Page précédente"
          >
            ←
          </button>

          <div className="recipes-pagination__pages">

            {Array.from(
              { length: totalPages },
              (_, index) => {
                const page = index + 1

                return (
                  <button
                    key={page}
                    className={`recipes-pagination__page ${
                      currentPage === page
                        ? 'recipes-pagination__page--active'
                        : ''
                    }`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                )
              }
            )}

          </div>

          <button
            className="recipes-pagination__arrow"
            onClick={nextPage}
            disabled={currentPage === totalPages}
            aria-label="Page suivante"
          >
            →
          </button>

        </div>
      )}

    </main>
  )
}

export default RecipesPage