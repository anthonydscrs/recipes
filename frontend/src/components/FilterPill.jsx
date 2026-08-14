import './FilterPill.css'

function FilterPill({ label, active, onClick }) {
  return (
    <button className={`filter-pill ${active ? 'filter-pill--active' : ''}`} onClick={onClick}>
      {label}
    </button>
  )
}

export default FilterPill