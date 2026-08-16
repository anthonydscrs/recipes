import { useState, useEffect } from 'react'
import Header from './components/Header'
import RecipeCard from './components/RecipeCard'
import RecipeDetail from './pages/RecipeDetail'
import AddRecipe from './pages/AddRecipe'
import EditRecipe from './pages/EditRecipe'
import FilterBar from './components/FilterBar'
import ShoppingList from './pages/ShoppingList'
import Planning from './pages/Planning'
import { useRecipeFilters } from './hooks/useRecipeFilters'
import { usePagination } from './hooks/usePagination'

function App() {
  const [tab, setTab] = useState('recettes')
  const [recipes, setRecipes] = useState([])
  const [favoriteIds, setFavoriteIds] = useState(new Set()) // TODO: brancher sur le backend une fois l'auth prête
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [addingRecipe, setAddingRecipe] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recipes`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Erreur lors du chargement des recettes')
        }

        return res.json()
      })
      .then((data) => setRecipes(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Changer d'onglet depuis le header referme toute vue recette en cours
  // (ajout / édition / détail), pour ne pas rester coincé dessus.
  const handleSetTab = (next) => {
    setAddingRecipe(false)
    setEditingRecipe(null)
    setSelectedRecipe(null)
    setTab(next)
  }

  const toggleFavorite = (id) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev)

      next.has(id)
        ? next.delete(id)
        : next.add(id)

      return next
    })
  }

  const recipesWithFavorite = recipes.map((r) => ({
    ...r,
    favorite: favoriteIds.has(r.id),
  }))

  // Filtres
  const filters = useRecipeFilters(recipesWithFavorite)

  // Pagination : 12 recettes par page
  const {
    paginated,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
  } = usePagination(filters.filtered, 12)

  if (addingRecipe) {
    return (
      <>
        <Header
          tab={tab}
          setTab={handleSetTab}
        />

        <AddRecipe
          onBack={() => setAddingRecipe(false)}
          onCreated={(created) => {
            setRecipes((prev) => [...prev, created])
            setAddingRecipe(false)
          }}
        />
      </>
    )
  }

  if (editingRecipe) {
    return (
      <>
        <Header
          tab={tab}
          setTab={handleSetTab}
        />

        <EditRecipe
          recipe={editingRecipe}
          onBack={() => setEditingRecipe(null)}
          onUpdated={(updated) => {
            setRecipes((prev) =>
              prev.map((r) =>
                r.id === updated.id
                  ? updated
                  : r
              )
            )

            setSelectedRecipe(updated)
            setEditingRecipe(null)
          }}
        />
      </>
    )
  }

  if (selectedRecipe) {
    const recipe =
      recipesWithFavorite.find(
        (r) => r.id === selectedRecipe.id
      ) ?? selectedRecipe

    return (
      <>
        <Header
          tab={tab}
          setTab={handleSetTab}
        />

        <RecipeDetail
          recipe={recipe}
          onBack={() => setSelectedRecipe(null)}
          onToggleFavorite={() => toggleFavorite(recipe.id)}
          onEdit={(r) => setEditingRecipe(r)}
          onDeleted={(id) => {
            setRecipes((prev) =>
              prev.filter((r) => r.id !== id)
            )

            setSelectedRecipe(null)
          }}
        />
      </>
    )
  }

  return (
    <>
      <Header
        tab={tab}
        setTab={handleSetTab}
      />

      {tab === 'courses' ? (
        <ShoppingList />
      ) : tab === 'planning' ? (
        <Planning
          recipes={recipesWithFavorite}
          onSelectRecipe={setSelectedRecipe}
        />
      ) : (
        <>
          {loading && (
            <p style={{ padding: 32 }}>
              Chargement…
            </p>
          )}

          {error && (
            <p style={{ padding: 32, color: 'red' }}>
              {error}
            </p>
          )}

          {!loading && !error && (
            <main className="recipes-page">

              <FilterBar {...filters} />

              <div className="recipes-header">

                <p className="recipes-count">
                  {filters.filtered.length} recette
                  {filters.filtered.length !== 1 ? 's' : ''}
                </p>

                <button
                  className="add-recipe-btn"
                  onClick={() => setAddingRecipe(true)}
                >
                  + Ajouter une recette
                </button>

              </div>

              <div className="recipes-grid">

                {paginated.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={setSelectedRecipe}
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
          )}
        </>
      )}
    </>
  )
}

export default App