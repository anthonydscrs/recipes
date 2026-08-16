import { useState, useEffect } from 'react'

import Header from './components/Header'
import RecipeCard from './components/RecipeCard'
import RecipeDetail from './pages/RecipeDetail'
import AddRecipe from './pages/AddRecipe'
import EditRecipe from './pages/EditRecipe'
import FilterBar from './components/FilterBar'
import ShoppingList from './pages/ShoppingList'
import Planning from './pages/Planning'
import Login from './pages/Login'

import { useRecipeFilters } from './hooks/useRecipeFilters'
import { usePagination } from './hooks/usePagination'
import { useAuth } from './contexts/AuthContext'

function App() {
  const {
    user,
    isAuthenticated,
  } = useAuth()

  const [tab, setTab] = useState('recettes')
  const [recipes, setRecipes] = useState([])
  const [favoriteIds, setFavoriteIds] = useState(
    new Set()
  )

  const [selectedRecipe, setSelectedRecipe] =
    useState(null)

  const [addingRecipe, setAddingRecipe] =
    useState(false)

  const [editingRecipe, setEditingRecipe] =
    useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ============================================
  // CHARGEMENT DES RECETTES
  // ============================================

  useEffect(() => {
    // Pas de requête si l'utilisateur n'est pas connecté
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')

    const authHeaders = {
      Authorization: `Bearer ${token}`,
    }

    Promise.all([
      fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/recipes`,
        { headers: authHeaders }
      ).then((res) => {
        if (!res.ok) {
          throw new Error(
            'Erreur lors du chargement des recettes'
          )
        }

        return res.json()
      }),

      fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/favorites`,
        { headers: authHeaders }
      ).then((res) => {
        if (!res.ok) {
          throw new Error(
            'Erreur lors du chargement des favoris'
          )
        }

        return res.json()
      }),
    ])
      .then(([recipesData, favoritesData]) => {
        setRecipes(recipesData)

        setFavoriteIds(
          new Set(
            favoritesData.map(
              (recipe) => recipe.id
            )
          )
        )

        setError(null)
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isAuthenticated])

  // ============================================
  // CHANGEMENT D'ONGLET
  // ============================================

  const handleSetTab = (next) => {
    setAddingRecipe(false)
    setEditingRecipe(null)
    setSelectedRecipe(null)
    setTab(next)
  }

  // ============================================
  // FAVORIS
  // ============================================

  const toggleFavorite = (id) => {
    const token = localStorage.getItem('token')
    const wasFavorite = favoriteIds.has(id)

    // Mise à jour immédiate de l'interface
    setFavoriteIds((prev) => {
      const next = new Set(prev)

      if (wasFavorite) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })

    const request = wasFavorite
      ? fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/favorites/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      : fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/favorites`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              recipe_id: id,
            }),
          }
        )

    request
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            'Erreur lors de la mise à jour des favoris'
          )
        }
      })
      .catch((err) => {
        console.error(err)

        // Annule la modification locale si le backend échoue
        setFavoriteIds((prev) => {
          const next = new Set(prev)

          if (wasFavorite) {
            next.add(id)
          } else {
            next.delete(id)
          }

          return next
        })
      })
  }

  const recipesWithFavorite = recipes.map(
    (recipe) => ({
      ...recipe,
      favorite: favoriteIds.has(recipe.id),
    })
  )

  // ============================================
  // FILTRES
  // ============================================

  const filters = useRecipeFilters(
    recipesWithFavorite
  )

  // ============================================
  // PAGINATION
  // ============================================

  const {
    paginated,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
  } = usePagination(
    filters.filtered,
    12
  )

  // ============================================
  // SI PAS CONNECTÉ
  // ============================================

  if (!isAuthenticated) {
    return <Login />
  }

  // ============================================
  // AJOUT RECETTE
  // ============================================

  if (addingRecipe) {
    return (
      <>
        <Header
          tab={tab}
          setTab={handleSetTab}
        />

        <AddRecipe
          onBack={() =>
            setAddingRecipe(false)
          }
          onCreated={(created) => {
            setRecipes((prev) => [
              ...prev,
              created,
            ])

            setAddingRecipe(false)
          }}
        />
      </>
    )
  }

  // ============================================
  // MODIFICATION RECETTE
  // ============================================

  if (editingRecipe) {
    return (
      <>
        <Header
          tab={tab}
          setTab={handleSetTab}
        />

        <EditRecipe
          recipe={editingRecipe}
          onBack={() =>
            setEditingRecipe(null)
          }
          onUpdated={(updated) => {
            setRecipes((prev) =>
              prev.map((recipe) =>
                recipe.id === updated.id
                  ? updated
                  : recipe
              )
            )

            setSelectedRecipe(updated)
            setEditingRecipe(null)
          }}
        />
      </>
    )
  }

  // ============================================
  // DÉTAIL RECETTE
  // ============================================

  if (selectedRecipe) {
    const recipe =
      recipesWithFavorite.find(
        (recipe) =>
          recipe.id === selectedRecipe.id
      ) ?? selectedRecipe

    return (
      <>
        <Header
          tab={tab}
          setTab={handleSetTab}
        />

        <RecipeDetail
          recipe={recipe}
          onBack={() =>
            setSelectedRecipe(null)
          }
          onToggleFavorite={() =>
            toggleFavorite(recipe.id)
          }
          onEdit={(recipeToEdit) =>
            setEditingRecipe(recipeToEdit)
          }
          onDeleted={(id) => {
            setRecipes((prev) =>
              prev.filter(
                (recipe) =>
                  recipe.id !== id
              )
            )

            setSelectedRecipe(null)
          }}
        />
      </>
    )
  }

  // ============================================
  // SITE PRINCIPAL
  // ============================================

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
            <p
              style={{
                padding: 32,
                color: 'red',
              }}
            >
              {error}
            </p>
          )}

          {!loading && !error && (
            <main className="recipes-page">

              <FilterBar {...filters} />

              <div className="recipes-header">

                <p className="recipes-count">
                  {filters.filtered.length}{' '}
                  recette
                  {filters.filtered.length !== 1
                    ? 's'
                    : ''}
                </p>

                <button
                  className="add-recipe-btn"
                  onClick={() =>
                    setAddingRecipe(true)
                  }
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
                      toggleFavorite(
                        recipe.id
                      )
                    }
                  />
                ))}

              </div>

              {totalPages > 1 && (
                <div className="recipes-pagination">

                  <button
                    className="recipes-pagination__arrow"
                    onClick={
                      previousPage
                    }
                    disabled={
                      currentPage === 1
                    }
                    aria-label="Page précédente"
                  >
                    ←
                  </button>

                  <div className="recipes-pagination__pages">

                    {Array.from(
                      {
                        length: totalPages,
                      },
                      (_, index) => {
                        const page =
                          index + 1

                        return (
                          <button
                            key={page}
                            className={`recipes-pagination__page ${
                              currentPage ===
                              page
                                ? 'recipes-pagination__page--active'
                                : ''
                            }`}
                            onClick={() =>
                              goToPage(page)
                            }
                          >
                            {page}
                          </button>
                        )
                      }
                    )}

                  </div>

                  <button
                    className="recipes-pagination__arrow"
                    onClick={
                      nextPage
                    }
                    disabled={
                      currentPage ===
                      totalPages
                    }
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