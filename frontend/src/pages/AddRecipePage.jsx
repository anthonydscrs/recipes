import { useNavigate } from 'react-router-dom'

import AddRecipe from '../components/AddRecipe'
import { useRecipes } from '../contexts_tmp/RecipesContext'

function AddRecipePage() {
  const navigate = useNavigate()
  const { addRecipe } = useRecipes()

  return (
    <AddRecipe
      onBack={() => navigate(-1)}
      onCreated={(created) => {
        addRecipe(created)
        navigate(`/recette/${created.id}`)
      }}
    />
  )
}

export default AddRecipePage