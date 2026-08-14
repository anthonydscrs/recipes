import { useMemo, useState } from 'react'

export function useRecipeFilters(recipes) {
  const [search, setSearch] = useState('')
  const [season, setSeason] = useState('Tous')
  const [category, setCategory] = useState('Tous')
  const [favoriteOnly, setFavoriteOnly] = useState(false)

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (season !== 'Tous' && r.season !== season) return false
      if (category !== 'Tous' && r.category !== category) return false
      if (favoriteOnly && !r.favorite) return false
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [recipes, search, season, category, favoriteOnly])

  const activeCount = [season !== 'Tous', category !== 'Tous', favoriteOnly].filter(Boolean).length

  const reset = () => {
    setSearch('')
    setSeason('Tous')
    setCategory('Tous')
    setFavoriteOnly(false)
  }

  return {
    filtered, activeCount, reset,
    search, setSearch,
    season, setSeason,
    category, setCategory,
    favoriteOnly, setFavoriteOnly,
  }
}