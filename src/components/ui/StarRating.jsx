const StarRating = ({ note, size = 'sm' }) => {
  const sizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' }

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`${sizes[size]} ${i < note ? 'text-amber-400' : 'text-gray-200'}`}>
          ★
        </span>
      ))}
    </div>
  )
}

export default StarRating