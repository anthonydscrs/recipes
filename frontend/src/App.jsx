import { useState, useEffect } from 'react'
import Header from './components/Header'
import RecipeCard from './components/RecipeCard'
import RecipeDetail from './pages/RecipeDetail'
import FilterBar from './components/FilterBar'
import { useRecipeFilters } from './hooks/useRecipeFilters'

function App() {
  const [recipes, setRecipes] = useState([])
  const [favoriteIds, setFavoriteIds] = useState(new Set()) // TODO: remplacer par le backend
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recipes`)
      .then((res) => {
        if (!res.ok) throw new Error('Erreur lors du chargement des recettes')
        return res.json()
      })
      .then((data) => setRecipes(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const toggleFavorite = (id) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const recipesWithFavorite = recipes.map((r) => ({ ...r, favorite: favoriteIds.has(r.id) }))
  const filters = useRecipeFilters(recipesWithFavorite)

  if (selectedRecipe) {
    const recipe = recipesWithFavorite.find((r) => r.id === selectedRecipe.id) ?? selectedRecipe
    return (
      <>
        <Header />
        <RecipeDetail recipe={recipe} onBack={() => setSelectedRecipe(null)} onToggleFavorite={() => toggleFavorite(recipe.id)} />
      </>
    )
  }

  return (
    <>
      <Header />
      {loading && <p style={{ padding: 32 }}>Chargement…</p>}
      {error && <p style={{ padding: 32, color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <main className="recipes-page">
          <FilterBar {...filters} />
          <p className="recipes-count">
            {filters.filtered.length} recette{filters.filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="recipes-grid">
            {filters.filtered.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onClick={setSelectedRecipe} onToggleFavorite={() => toggleFavorite(recipe.id)} />
            ))}
          </div>
        </main>
      )}
    </>
  )
}

export default App