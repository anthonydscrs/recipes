import { useState, useEffect } from 'react'
import Header from './components/Header'
import RecipeCard from './components/RecipeCard'
import RecipeDetail from './pages/RecipeDetail'
import AddRecipe from './pages/AddRecipe'
import EditRecipe from './pages/EditRecipe'
import FilterBar from './components/FilterBar'
import { useRecipeFilters } from './hooks/useRecipeFilters'

function App() {
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

  if (addingRecipe) {
    return (
      <>
        <Header />
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
        <Header />
        <EditRecipe
          recipe={editingRecipe}
          onBack={() => setEditingRecipe(null)}
          onUpdated={(updated) => {
            setRecipes((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r))
            )
            setSelectedRecipe(updated)
            setEditingRecipe(null)
          }}
        />
      </>
    )
  }

  if (selectedRecipe) {
    const recipe = recipesWithFavorite.find((r) => r.id === selectedRecipe.id) ?? selectedRecipe
    return (
      <>
        <Header />
        <RecipeDetail
          recipe={recipe}
          onBack={() => setSelectedRecipe(null)}
          onToggleFavorite={() => toggleFavorite(recipe.id)}
          onEdit={(r) => setEditingRecipe(r)}
          onDeleted={(id) => {
            setRecipes((prev) => prev.filter((r) => r.id !== id))
            setSelectedRecipe(null)
          }}
        />
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
          <div className="recipes-header">
            <p className="recipes-count">
              {filters.filtered.length} recette{filters.filtered.length !== 1 ? 's' : ''}
            </p>
            <button className="add-recipe-btn" onClick={() => setAddingRecipe(true)}>
              + Ajouter une recette
            </button>
          </div>
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