import './HeartBtn.css'

function HeartBtn({ active, onClick, size = 18 }) {
  return (
    <button
      className="heart-btn"
      onClick={onClick}
      title={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={active ? '#E8534A' : 'none'}
        stroke={active ? '#E8534A' : '#C0A898'}
        strokeWidth="1.8"
        className={`heart-btn__icon ${active ? 'heart-btn__icon--active' : ''}`}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}

export default HeartBtn