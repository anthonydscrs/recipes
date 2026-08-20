import { useNavigate } from 'react-router-dom'

import AddRecipe from '../components/AddRecipe'
import { useRecipes } from '../contexts/RecipesContext'

function AddRecipePage() {
  const navigate = useNavigate()
  const { addRecipe } = useRecipes()

  return (
    <AddRecipe
      onBack={() => navigate('/')}
      onCreated={(created) => {
        addRecipe(created)
        navigate(`/recette/${created.id}`, { replace: true })
      }}
    />
  )
}

export default AddRecipePage