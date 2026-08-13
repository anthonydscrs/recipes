import './StarRating.css'

function StarRating({ rating = 0, onChange, size = 18, max = 5 }) {
  return (
    <div className="star-rating">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          className="star-rating__btn"
          onClick={() => onChange?.(star)}
          title={`${star} étoile${star > 1 ? 's' : ''}`}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={star <= rating ? '#F3C94B' : 'none'}
            stroke={star <= rating ? '#F3C94B' : '#C0A898'}
            strokeWidth="1.5"
            className={`star-rating__icon ${star <= rating ? 'star-rating__icon--active' : ''}`}
          >
            <path d="M12 2.5l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 17.4l-5.9 3.3 1.2-6.6-4.9-4.6 6.7-.9L12 2.5z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default StarRating