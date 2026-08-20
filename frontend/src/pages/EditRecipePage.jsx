import { useParams, useNavigate } from 'react-router-dom'

import EditRecipe from '../components/EditRecipe'
import { useRecipes } from '../contexts/RecipesContext'

function EditRecipePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { recipes, loading, updateRecipe } = useRecipes()

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
    <EditRecipe
      recipe={recipe}
      onBack={() => navigate(`/recette/${id}`)}
      onUpdated={(updated) => {
        updateRecipe(updated)
        navigate(`/recette/${updated.id}`, { replace: true })
      }}
    />
  )
}

export default EditRecipePage