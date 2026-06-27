import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Avatar from '../../components/ui/Avatar'

const PrestataireMessages = () => {
  const { profile } = useAuth()
  const { missionId } = useParams()
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const bottomRef = useRef(null)
  const channelsRef = useRef([])

  useEffect(() => { fetchConversations() }, [])

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv)
      subscribeToMessages(selectedConv)
    }
    return () => {
      channelsRef.current.forEach(c => supabase.removeChannel(c))
      channelsRef.current = []
    }
  }, [selectedConv])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const fetchConversations = async () => {
    if (!profile?.id) return

    const { data } = await supabase
      .from('missions')
      .select('*, client:profiles!missions_client_id_fkey(id, nom, avatar_url)')
      .eq('prestataire_id', profile.id)
      .not('prestataire_id', 'is', null)
      .order('updated_at', { ascending: false })

    // Déduplique par client — une seule conversation par personne
    const seen = new Set()
    const deduplicated = (data || []).filter(m => {
      if (seen.has(m.client_id)) return false
      seen.add(m.client_id)
      return true
    })

    setConversations(deduplicated)

    if (missionId) {
      const mission = (data || []).find(m => m.id === missionId)
      if (mission) {
        const conv = deduplicated.find(c => c.client_id === mission.client_id)
        if (conv) { setSelectedConv(conv); setShowChat(true) }
      }
    } else if (deduplicated.length > 0) {
      setSelectedConv(deduplicated[0])
    }
    setLoading(false)
  }

  const fetchMessages = async (conv) => {
    if (!conv) return

    const { data: toutesLesMissions } = await supabase
      .from('missions')
      .select('id')
      .eq('client_id', conv.client_id)
      .eq('prestataire_id', profile?.id)

    const missionIds = (toutesLesMissions || []).map(m => m.id)
    if (missionIds.length === 0) { setMessages([]); return }

    const { data } = await supabase
      .from('messages')
      .select('*, expediteur:profiles!messages_expediteur_id_fkey(nom, avatar_url)')
      .in('mission_id', missionIds)
      .order('created_at', { ascending: true })

    setMessages(data || [])
  }

  const subscribeToMessages = async (conv) => {
    if (!conv) return

    channelsRef.current.forEach(c => supabase.removeChannel(c))
    channelsRef.current = []

    const { data: toutesLesMissions } = await supabase
      .from('missions')
      .select('id')
      .eq('client_id', conv.client_id)
      .eq('prestataire_id', profile?.id)

    const channels = (toutesLesMissions || []).map(m =>
      supabase.channel('msg_prest_' + m.id)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'messages',
          filter: 'mission_id=eq.' + m.id
        }, () => fetchMessages(conv))
        .subscribe()
    )
    channelsRef.current = channels
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv) return
    setSending(true)
    await supabase.from('messages').insert({
      mission_id: selectedConv.id,
      expediteur_id: profile?.id,
      contenu: newMessage.trim(),
    })
    setNewMessage('')
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleSelectConv = (conv) => {
    setSelectedConv(conv)
    setShowChat(true)
  }

  const formatTime = (date) => new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">

        <div className={`${showChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0 bg-white border-r border-gray-100 flex-col`}>
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-sm">Conversations</h2>
          </div>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <p className="text-gray-400 text-xs">Aucune conversation pour l'instant</p>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              {conversations.map(conv => (
                <button key={conv.client_id}
                  onClick={() => handleSelectConv(conv)}
                  className={`w-full px-5 py-4 text-left border-b border-gray-50 transition-all ${
                    selectedConv?.client_id === conv.client_id ? 'bg-gray-50 border-l-2 border-l-gray-900' : 'hover:bg-gray-50'
                  }`}>
                  <div className="flex items-center gap-3">
                    <Avatar url={conv.client?.avatar_url} nom={conv.client?.nom} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{conv.client?.nom}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">Client</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`${!showChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white`}>
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Sélectionnez une conversation</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                <button onClick={() => setShowChat(false)} className="md:hidden p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <Avatar url={selectedConv.client?.avatar_url} nom={selectedConv.client?.nom} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{selectedConv.client?.nom}</p>
                  <p className="text-xs text-gray-400">Client</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 text-xs text-center">Aucun message. Démarrez la conversation !</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.expediteur_id === profile?.id
                    const showDate = i === 0 || formatDate(messages[i - 1].created_at) !== formatDate(msg.created_at)
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="text-center my-4">
                            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{formatDate(msg.created_at)}</span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-xs sm:max-w-sm md:max-w-md">
                            {!isMe && <p className="text-xs text-gray-400 mb-1 px-1">{msg.expediteur?.nom}</p>}
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMe ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                            }`}>
                              {msg.contenu}
                            </div>
                            <p className={`text-xs text-gray-400 mt-1 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
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

              <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
                <div className="flex items-end gap-2">
                  <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown} placeholder="Écrire un message..." rows={1}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white resize-none" />
                  <button onClick={handleSend} disabled={sending || !newMessage.trim()}
                    className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center hover:bg-black transition-all disabled:opacity-40 flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PrestataireMessages