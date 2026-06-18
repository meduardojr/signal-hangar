/**
 * StarRating — read-write star widget.
 * Controlled: value (0-5 float), onChange callback, optional readOnly.
 */
export default function StarRating({ value = 0, onChange, readOnly = false }) {
  const rounded = Math.round(value)

  return (
    <div className="star-rating" aria-label={`Rating: ${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`star${i <= rounded ? ' lit' : ''}${readOnly ? ' readonly' : ''}`}
          onClick={readOnly ? undefined : () => onChange?.(i)}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  )
}
