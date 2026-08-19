import { useParams, useNavigate } from 'react-router-dom'

import RecipeDetail from './RecipeDetail'
import { useRecipes } from '../contexts/RecipesContext'

function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    recipes,
    loading,
    toggleFavorite,
    updateRecipeRating,
    removeRecipe,
  } = useRecipes()

  const recipe = recipes.find(
    (recipe) => String(recipe.id) === id
  )

  if (loading) {
    return <p style={{ padding: 32 }}>Chargement…</p>
  }

  if (!recipe) {
    return (
      <p style={{ padding: 32 }}>
        Recette introuvable.
      </p>
    )
  }

  return (
    <RecipeDetail
      recipe={recipe}
      onBack={() => navigate(-1)}
      onToggleFavorite={() =>
        toggleFavorite(recipe.id)
      }
      onRatingChange={(value) =>
        updateRecipeRating(recipe.id, value)
      }
      onEdit={(recipeToEdit) =>
        navigate(`/recette/${recipeToEdit.id}/modifier`)
      }
      onDeleted={(deletedId) => {
        removeRecipe(deletedId)
        navigate('/')
      }}
    />
  )
}

export default RecipeDetailPage