import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import PropTypes from 'prop-types'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const RecipesContext = createContext(null)

export function RecipesProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const { showError } = useToast()

  const [recipes, setRecipes] = useState([])
  const [favoriteIds, setFavoriteIds] = useState(
    new Set()
  )

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
        showError(
          "La mise à jour des favoris n'a pas été enregistrée."
        )

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

  // ============================================
  // NOTE (RATING)
  // ============================================
  // Propage la note personnelle mise à jour depuis RecipeDetail
  // vers la liste des recettes, pour que RecipeCard reflète le
  // changement immédiatement (sans reload), comme les favoris.

  const updateRecipeRating = (id, value) => {
    setRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === id
          ? { ...recipe, rating: value }
          : recipe
      )
    )
  }

  // ============================================
  // CRUD LOCAL (après réponse backend réussie)
  // ============================================

  const addRecipe = (recipe) => {
    setRecipes((prev) => [...prev, recipe])
  }

  const updateRecipe = (updated) => {
    setRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === updated.id ? updated : recipe
      )
    )
  }

  const removeRecipe = (id) => {
    setRecipes((prev) =>
      prev.filter((recipe) => recipe.id !== id)
    )
  }

  // ============================================
  // RECETTES AVEC FAVORI FUSIONNÉ
  // ============================================

  const recipesWithFavorite = useMemo(
    () =>
      recipes.map((recipe) => ({
        ...recipe,
        favorite: favoriteIds.has(recipe.id),
      })),
    [recipes, favoriteIds]
  )

  const value = useMemo(
    () => ({
      recipes: recipesWithFavorite,
      loading,
      error,
      toggleFavorite,
      updateRecipeRating,
      addRecipe,
      updateRecipe,
      removeRecipe,
    }),
    [recipesWithFavorite, loading, error]
  )

  return (
    <RecipesContext.Provider value={value}>
      {children}
    </RecipesContext.Provider>
  )
}

RecipesProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export function useRecipes() {
  return useContext(RecipesContext)
}