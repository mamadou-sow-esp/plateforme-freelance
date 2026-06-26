import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const Footer = () => {
  const [partenaires, setPartenaires] = useState([])

  useEffect(() => {
    fetchPartenaires()
  }, [])

  const fetchPartenaires = async () => {
    const { data } = await supabase
      .from('partenaires')
      .select('*')
      .eq('actif', true)
      .order('ordre', { ascending: true })
    setPartenaires(data || [])
  }

  return (
    <footer className="border-t border-gray-100 bg-white mt-auto">
      {partenaires.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-6">
            Nos partenaires
          </p>
          <div className="flex items-center justify-center flex-wrap gap-8">
            {partenaires.map(p => (
              <a
                key={p.id}
                href={p.site_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 group transition-all"
              >
                {p.logo_url ? (
                  <img
                    src={p.logo_url}
                    alt={p.nom}
                    className="h-8 object-contain grayscale group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100"
                  />
                ) : (
                  <span className="text-sm font-semibold text-gray-400 group-hover:text-gray-900 transition-all">
                    {p.nom}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-6 py-4 border-t border-gray-100">
  <div className="flex items-center justify-between">
    <p className="text-xs text-gray-400">2026 Alicia - Plateforme freelance du Senegal</p>
    <p className="text-xs text-gray-400">Tous droits reserves</p>
  </div>
</div>
    </footer>
  )
}

export default Footer