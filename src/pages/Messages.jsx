import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

const Messages = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { missionId } = useParams()
  const [missions, setMissions] = useState([])
  const [selectedMission, setSelectedMission] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const bottomRef = useRef(null)

  const font = { fontFamily: "'DM Sans', sans-serif" }

  useEffect(() => {
    fetchMissions()
  }, [])

  useEffect(() => {
    if (selectedMission) {
      fetchMessages(selectedMission.id)
      const unsub = subscribeToMessages(selectedMission.id)
      return unsub
    }
  }, [selectedMission])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMissions = async () => {
    if (!profile?.id) return

    const { data } = await supabase
      .from('missions')
      .select(`
        *,
        client:profiles!missions_client_id_fkey(id, nom),
        prestataire:profiles!missions_prestataire_id_fkey(id, nom)
      `)
      .or(`client_id.eq.${profile.id},prestataire_id.eq.${profile.id}`)
      .not('prestataire_id', 'is', null)
      .order('updated_at', { ascending: false })

    const result = data || []
    setMissions(result)

    if (missionId) {
      const mission = result.find(m => m.id === missionId)
      if (mission) { setSelectedMission(mission); setShowChat(true) }
    } else if (result.length > 0) {
      setSelectedMission(result[0])
    }

    setLoading(false)
  }

  const fetchMessages = async (mId) => {
    const { data } = await supabase
      .from('messages')
      .select(`*, expediteur:profiles!messages_expediteur_id_fkey(nom)`)
      .eq('mission_id', mId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const subscribeToMessages = (mId) => {
    const channel = supabase
      .channel(`messages_${mId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `mission_id=eq.${mId}`
      }, () => { fetchMessages(mId) })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedMission) return
    setSending(true)
    await supabase.from('messages').insert({
      mission_id: selectedMission.id,
      expediteur_id: profile?.id,
      contenu: newMessage.trim(),
    })
    setNewMessage('')
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleSelectMission = (mission) => {
    setSelectedMission(mission)
    setShowChat(true)
  }

  const getInterlocuteur = (mission) => {
    if (!mission) return null
    if (mission.client?.id === profile?.id) return mission.prestataire
    return mission.client
  }

  const formatTime = (date) => new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

  const navLinks = profile?.role === 'client' ? [
    { to: '/client/dashboard', label: 'Dashboard' },
    { to: '/client/rechercher', label: 'Rechercher' },
    { to: '/client/missions', label: 'Mes missions' },
    { to: '/client/messages', label: 'Messages' },
  ] : [
    { to: '/prestataire/dashboard', label: 'Dashboard' },
    { to: '/prestataire/missions', label: 'Missions' },
    { to: '/prestataire/profil', label: 'Mon profil' },
    { to: '/prestataire/messages', label: 'Messages' },
  ]

  const messagesPath = profile?.role === 'client' ? '/client/messages' : '/prestataire/messages'

  return (
    <div className="h-screen flex flex-col" style={{ ...font, background: '#f9fafb' }}>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <img src={logo} alt="Alicia" className="w-12 h-12 md:w-16 md:h-16 object-contain" />

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`text-sm transition-colors ${
                  link.to === messagesPath
                    ? 'font-medium text-black border-b-2 border-black pb-0.5'
                    : 'text-gray-400 hover:text-black'
                }`}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {profile?.nom?.charAt(0).toUpperCase()}
              </span>
            </div>
            <button onClick={handleSignOut}
              className="text-xs text-gray-400 hover:text-black transition-colors font-light hidden md:block">
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Corps */}
      <div className="flex flex-1 overflow-hidden">

        {/* Liste conversations — cachée sur mobile si chat ouvert */}
        <div className={`${showChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0 bg-white border-r border-gray-100 flex-col`}>
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-medium text-gray-900 text-sm">Conversations</h2>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400 text-xs font-light">Chargement...</p>
            </div>
          ) : missions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div>
                <p className="text-gray-900 text-sm font-medium mb-1">Aucune conversation</p>
                <p className="text-gray-400 text-xs font-light">
                  Les conversations apparaissent quand une mission est en cours
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              {missions.map(mission => {
                const interlocuteur = getInterlocuteur(mission)
                const isSelected = selectedMission?.id === mission.id
                return (
                  <button
                    key={mission.id}
                    onClick={() => handleSelectMission(mission)}
                    className={`w-full px-4 py-4 text-left border-b border-gray-50 transition-all ${
                      isSelected ? 'bg-gray-50 border-l-2 border-l-black' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {interlocuteur?.nom?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {interlocuteur?.nom}
                        </p>
                        <p className="text-xs text-gray-400 font-light truncate mt-0.5">
                          {mission.titre}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Zone chat */}
        <div className={`${!showChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white`}>

          {!selectedMission ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-sm font-light">
                  Selectionnez une conversation
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header chat */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                {/* Bouton retour mobile */}
                <button
                  onClick={() => setShowChat(false)}
                  className="md:hidden p-1 -ml-1 text-gray-400 hover:text-black transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">
                    {getInterlocuteur(selectedMission)?.nom?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getInterlocuteur(selectedMission)?.nom}
                  </p>
                  <p className="text-xs text-gray-400 font-light truncate">
                    {selectedMission.titre}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 text-xs font-light text-center">
                      Aucun message pour l'instant.{'\n'}Demarrez la conversation !
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.expediteur_id === profile?.id
                    const showDate = i === 0 ||
                      formatDate(messages[i - 1].created_at) !== formatDate(msg.created_at)

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="text-center my-4">
                            <span className="text-xs text-gray-400 font-light bg-gray-50 px-3 py-1 rounded-full">
                              {formatDate(msg.created_at)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-xs sm:max-w-sm md:max-w-md">
                            {!isMe && (
                              <p className="text-xs text-gray-400 font-light mb-1 px-1">
                                {msg.expediteur?.nom}
                              </p>
                            )}
                            <div className={`px-4 py-2.5 rounded-2xl text-sm font-light leading-relaxed ${
                              isMe
                                ? 'bg-black text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                            }`}>
                              {msg.contenu}
                            </div>
                            <p className={`text-xs text-gray-400 font-light mt-1 px-1 ${
                              isMe ? 'text-right' : 'text-left'
                            }`}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ecrire un message..."
                    rows={1}
                    style={font}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light resize-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                    className="w-10 h-10 bg-black rounded-xl flex items-center justify-center hover:bg-gray-900 transition-all disabled:opacity-40 flex-shrink-0"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-300 font-light mt-1 hidden md:block">
                  Entree pour envoyer
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages