const Avatar = ({ url, nom, size = 'md' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  }

  if (url) {
    return (
      <img
        src={url}
        alt={nom}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0`}
      />
    )
  }

  return (
    <div className={`${sizes[size]} bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-medium">
        {nom?.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

export default Avatar