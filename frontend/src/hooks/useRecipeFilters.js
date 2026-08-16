import { useMemo, useState } from 'react'

export function useRecipeFilters(recipes) {
  const [search, setSearch] = useState('')
  const [season, setSeason] = useState('Tous')
  const [categories, setCategories] = useState([]) // [] = toutes les catégories
  const [favoriteOnly, setFavoriteOnly] = useState(false)

  // Coche/décoche une catégorie dans la sélection multiple.
  const toggleCategory = (value) => {
    setCategories((prev) =>
      prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value]
    )
  }

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (season !== 'Tous' && r.season !== season) return false

      // Une recette matche seulement si son ensemble de catégories correspond
      // EXACTEMENT à la sélection (ni plus, ni moins) — pas juste une inclusion.
      if (categories.length > 0) {
        const recipeCategories = r.category || []
        const sameSize = recipeCategories.length === categories.length
        const sameSet = categories.every((c) => recipeCategories.includes(c))
        if (!sameSize || !sameSet) return false
      }

      if (favoriteOnly && !r.favorite) return false
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [recipes, search, season, categories, favoriteOnly])

  const clearCategories = () => setCategories([])

  const activeCount = [season !== 'Tous', categories.length > 0, favoriteOnly].filter(Boolean).length

  const reset = () => {
    setSearch('')
    setSeason('Tous')
    setCategories([])
    setFavoriteOnly(false)
  }

  return {
    filtered, activeCount, reset,
    search, setSearch,
    season, setSeason,
    categories, toggleCategory, clearCategories,
    favoriteOnly, setFavoriteOnly,
  }
}