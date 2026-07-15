import { useNavigate } from 'react-router-dom'

const BackButton = ({ label = 'Retour', to = null }) => {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => to ? navigate(to) : navigate(-1)}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors font-light mb-6"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  )
}

export default BackButton