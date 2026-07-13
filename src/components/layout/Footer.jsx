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
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-xs font-bold text-gray-900 uppercase tracking-widest text-center mb-10">
            Nos partenaires
          </p>
          <div className="flex items-center justify-center flex-wrap gap-10">
            {partenaires.map(p => (
              <a
                key={p.id}
                href={p.site_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 group transition-all duration-300"
              >
                {p.logo_url ? (
                  <img
                    src={p.logo_url}
                    alt={p.nom}
                    className="h-10 w-auto object-contain filter-none opacity-100 group-hover:scale-110 transition-all duration-300"
                    style={{ maxWidth: '140px' }}
                  />
                ) : (
                  <span className="text-base font-bold text-gray-700 group-hover:text-black transition-all">
                    {p.nom}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className={`${partenaires.length > 0 ? 'border-t border-gray-100' : ''} max-w-7xl mx-auto px-6 py-4`}>
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-gray-400">2026 Alicia</p>
          <img src="/founder2-logo.png" alt="Keba Foundation" className="h-5 w-auto object-contain" />
          <p className="text-xs text-gray-400">Tous droits réservés</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer