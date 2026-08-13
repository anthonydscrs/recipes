import { useState, useEffect } from 'react'
import Header from './components/Header'
import RecipeCard from './components/RecipeCard'
import RecipeDetail from './pages/RecipeDetail'

function App() {
  const [recipes, setRecipes] = useState([])
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

  if (selectedRecipe) {
    return (
      <>
        <Header />

        <RecipeDetail
          recipe={selectedRecipe}
          onBack={() => setSelectedRecipe(null)}
        />
      </>
    )
  }

  return (
    <>
      <Header />

      {loading && <p style={{ padding: 32 }}>Chargement…</p>}

      {error && (
        <p style={{ padding: 32, color: 'red' }}>{error}</p>
      )}

      {!loading && !error && (
        <main className="recipes-grid">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={setSelectedRecipe}
            />
          ))}
        </main>
      )}
    </>
  )
}

export default App