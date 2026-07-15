const VerifiedBadge = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }
  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
  }

  return (
    <span
      className={`inline-flex items-center justify-center ${sizes[size]} bg-blue-500 rounded-full flex-shrink-0`}
      title="Identite verifiee">
      <svg className={`${iconSizes[size]} text-white`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    </span>
  )
}

export default VerifiedBadge