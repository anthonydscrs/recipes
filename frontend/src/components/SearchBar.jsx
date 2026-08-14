import './SearchBar.css'

function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <svg className="search-bar__icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        className="search-bar__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher une recette…"
      />
    </div>
  )
}

export default SearchBar