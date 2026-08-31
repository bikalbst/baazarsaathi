import { ChevronLeft, MessageCircle, Minus, Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'

const idOf = (value) => String(value?._id || value?.id || value || '')

export default function FloatingChat() {
  const { isAuthenticated, user } = useAuth()
  const chat = useChat()
  const [draft, setDraft] = useState('')
  const stopTypingTimer = useRef(null)
  const scrollAnchor = useRef(null)

  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.messages])

  useEffect(() => () => clearTimeout(stopTypingTimer.current), [])

  if (!isAuthenticated || user.role === 'admin') return null

  const otherParticipant = (conversation) => conversation?.participants?.find((participant) => idOf(participant) !== idOf(user))
  const selectedOther = otherParticipant(chat.selectedConversation)

  const handleDraft = (event) => {
    setDraft(event.target.value)
    chat.emitTyping('typing')
    clearTimeout(stopTypingTimer.current)
    stopTypingTimer.current = setTimeout(() => chat.emitTyping('stop_typing'), 900)
  }

  const submit = async (event) => {
    event.preventDefault()
    const content = draft.trim()
    if (!content) return
    setDraft('')
    chat.emitTyping('stop_typing')
    try { await chat.sendMessage(content) } catch { setDraft(content) }
  }

  if (!chat.isOpen) {
    return <button className="focus-ring fixed bottom-5 right-5 z-[60] flex h-14 items-center gap-2 rounded-full bg-primary px-5 font-bold text-white shadow-xl" type="button" onClick={chat.openInbox}><MessageCircle className="h-6 w-6" />Chat</button>
  }

  return (
    <aside className={`fixed bottom-4 right-4 z-[60] w-[calc(100vw-2rem)] max-w-[370px] overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-2xl ${chat.isMinimized ? '' : 'h-[min(540px,calc(100vh-2rem))]'}`} aria-label="Messages">
      <header className="flex h-14 items-center gap-2 bg-primary px-3 text-white">
        {chat.selectedConversation && !chat.isMinimized && <button className="rounded-full p-1 hover:bg-white/10" type="button" onClick={chat.openInbox} aria-label="Back to conversations"><ChevronLeft /></button>}
        <div className="min-w-0 flex-1"><div className="truncate font-bold">{selectedOther?.name || 'Messages'}</div>{chat.selectedConversation && !chat.isMinimized && <div className="truncate text-xs text-white/75">{chat.selectedConversation.listingRef?.title}</div>}</div>
        <button className="rounded-full p-1 hover:bg-white/10" type="button" onClick={chat.minimizeChat} aria-label="Minimize chat"><Minus /></button>
        <button className="rounded-full p-1 hover:bg-white/10" type="button" onClick={chat.closeChat} aria-label="Close chat"><X /></button>
      </header>
      {!chat.isMinimized && (
        <div className="flex h-[calc(100%-3.5rem)] flex-col">
          {chat.error && <div className="bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{chat.error}</div>}
          {!chat.selectedConversation ? (
            <div className="flex-1 overflow-y-auto p-2">
              {chat.conversations.length === 0 && <div className="p-8 text-center text-sm text-on-surface-variant">No conversations yet. Open a listing and message its seller.</div>}
              {chat.conversations.map((conversation) => {
                const participant = otherParticipant(conversation)
                return <button className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-surface-container-low" key={idOf(conversation)} type="button" onClick={() => chat.openConversation(conversation)}><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container font-bold">{participant?.name?.[0] || '?'}</span><span className="min-w-0"><span className="block truncate font-semibold">{participant?.name || 'Marketplace user'}</span><span className="block truncate text-xs text-on-surface-variant">{conversation.listingRef?.title || 'Listing conversation'}</span></span></button>
              })}
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto bg-surface p-3">
                {chat.messages.length === 0 && <div className="py-10 text-center text-sm text-on-surface-variant">Ask about availability, condition, or pickup.</div>}
                {chat.messages.map((message) => {
                  const own = idOf(message.sender) === idOf(user)
                  return <div className={`flex ${own ? 'justify-end' : 'justify-start'}`} key={idOf(message)}><div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${own ? 'rounded-br-sm bg-primary text-white' : 'rounded-bl-sm bg-white shadow-sm'}`}><p className="whitespace-pre-wrap break-words">{message.content}</p><time className={`mt-1 block text-[10px] ${own ? 'text-white/70' : 'text-on-surface-variant'}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div></div>
                })}
                {chat.typingUser && <p className="text-xs text-on-surface-variant">{chat.typingUser.name} is typing…</p>}
                <div ref={scrollAnchor} />
              </div>
              <form className="flex gap-2 border-t border-outline-variant p-3" onSubmit={submit}><input className="focus-ring min-w-0 flex-1 rounded-full border border-outline-variant px-4 py-2 text-sm" value={draft} onChange={handleDraft} placeholder="Write a message…" maxLength={2000} aria-label="Message" /><button className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50" type="submit" disabled={!draft.trim()} aria-label="Send message"><Send className="h-4 w-4" /></button></form>
            </>
          )}
        </div>
      )}
    </aside>
  )
}
