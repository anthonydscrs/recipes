import { useState } from 'react'
import FilterPill from './FilterPill'
import SearchBar from './SearchBar'
import './FilterBar.css'

const CATEGORY_LABELS = {
  viande: '🥩 Viande',
  végé: '🥦 Végé',
  féculent: '🌾 Féculent',
  dessert: '🍰 Dessert',
}

function FilterBar({
  search, setSearch,
  season, setSeason,
  categories, toggleCategory, clearCategories,
  favoriteOnly, setFavoriteOnly,
  activeCount,
}) {
  const [panelOpen, setPanelOpen] = useState(false)

  return (
    <div className="filter-bar">
      <div className="filter-bar__row">
        <SearchBar value={search} onChange={setSearch} />

        <button
          className={`filter-bar__fav-btn ${favoriteOnly ? 'filter-bar__fav-btn--active' : ''}`}
          onClick={() => setFavoriteOnly(!favoriteOnly)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={favoriteOnly ? '#E8534A' : 'none'} stroke={favoriteOnly ? '#E8534A' : 'currentColor'} strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Favoris
        </button>

        <button
          className={`filter-bar__toggle ${panelOpen ? 'filter-bar__toggle--active' : ''}`}
          onClick={() => setPanelOpen((o) => !o)}
        >
          Filtres
          {activeCount > 0 && <span className="filter-bar__count">{activeCount}</span>}
        </button>
      </div>

      {panelOpen && (
        <div className="filter-bar__panel">
          <div className="filter-bar__filter-row">
            <span className="filter-bar__label">Saison</span>
            <div className="filter-bar__pills">
              <FilterPill label="Toutes" active={season === 'Tous'} onClick={() => setSeason('Tous')} />
              <FilterPill label="☀️ Été" active={season === 'Été'} onClick={() => setSeason('Été')} />
              <FilterPill label=" ❄️ Hiver" active={season === 'Hiver'} onClick={() => setSeason('Hiver')} />
            </div>
          </div>

          <div className="filter-bar__divider" />

          <div className="filter-bar__filter-row">
            <span className="filter-bar__label">Catégorie</span>
            <div className="filter-bar__pills">
              <FilterPill
                label="Toutes"
                active={categories.length === 0}
                onClick={clearCategories}
              />
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <FilterPill
                  key={key}
                  label={label}
                  active={categories.includes(key)}
                  onClick={() => toggleCategory(key)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterBar