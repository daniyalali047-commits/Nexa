import { useEffect, useRef, useState } from 'react'
import './App.css'
import { connectWs } from './ws'

function App() {
  const socket = useRef(null)
  const typingTimer = useRef(null)
  const [name, setName] = useState('')
  const [draftName, setDraftName] = useState('')
  const [draftMessage, setDraftMessage] = useState('')
  const [typers, setTypers] = useState([])
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const client = connectWs()
    socket.current = client

    const handleRoomNotice = (userName) => {
      console.log(`${userName} had joined the group`)
    }
    const handleChatMessage = (message) => {
      setMessages((prev) => [...prev, { ...message, incoming: true }])
    }
    const handleTyping = (typingData) => {
      setTypers((current) => {
        if (typingData.isTyping) {
          return current.includes(typingData.userName) ? current : [...current, typingData.userName]
        }
        return current.filter((userName) => userName !== typingData.userName)
      })
    }

    client.on('roomNotice', handleRoomNotice)
    client.on('chatmessage', handleChatMessage)
    client.on('typing', handleTyping)

    return () => {
      clearTimeout(typingTimer.current)
      client.off('roomNotice', handleRoomNotice)
      client.off('chatmessage', handleChatMessage)
      client.off('typing', handleTyping)
      client.disconnect()
      socket.current = null
    }
  }, [])

  function handleDraftMessageChange(event) {
    const value = event.target.value
    setDraftMessage(value)
    clearTimeout(typingTimer.current)

    if (!value) {
      socket.current?.emit('typing', { userName: name, isTyping: false })
      return
    }

    socket.current?.emit('typing', { userName: name, isTyping: true })
    typingTimer.current = setTimeout(() => {
      socket.current?.emit('typing', { userName: name, isTyping: false })
    }, 1000)
  }

  function enterChat(event) {
    event.preventDefault()
    const trimmedName = draftName.trim()
    if (!trimmedName) return
    socket.current?.emit('JoinRoom', trimmedName)
    setName(trimmedName)
  }

  function sendMessage(event) {
    event.preventDefault()
    const text = draftMessage.trim()
    if (!text) return
    const message = {
      id: Date.now(),
      text,
      sender: name,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    }
    setMessages((current) => [...current, message])
    socket.current?.emit('chatmessage', message)
    clearTimeout(typingTimer.current)
    socket.current?.emit('typing', { userName: name, isTyping: false })
    setDraftMessage('')
  }

  if (!name) {
    return <main className="welcome-shell">
      <section className="welcome-card">
        <div className="nexa-logo"><span className="brand-mark">N</span><strong>NEXA</strong><sup>TM</sup></div>
        <p className="eyebrow">Private chat space</p>
        <h1>Your space for<br /><em>good conversation.</em></h1>
        <p className="welcome-copy">Enter your name to join.</p>
        <form onSubmit={enterChat} className="name-form">
          <label htmlFor="name">Your name</label>
          <div className="input-row"><input id="name" value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="Your name" autoFocus /><button type="submit" aria-label="Enter chat">-&gt;</button></div>
        </form>
      </section>
      <p className="welcome-footer">NEXA / PRIVATE CHAT SPACE</p>
    </main>
  }

  return <main className="chat-shell">
    <section className="conversation">
      <header className="conversation-header">
        <div className="brand-mark small">{name.charAt(0).toUpperCase()}</div>
        <div><p className="room-label">PRIVATE ROOM</p><h2>{name}</h2></div>
        <span className="online-state"><i></i> Online</span>
      </header>
      <div className="message-area">
        {messages.length === 0 && <div className="empty-state"><div className="empty-mark">N</div><h1>Welcome, {name}.</h1><p>Your conversation starts here.</p></div>}
        {messages.map((message) => <article className={`message ${message.incoming ? 'incoming' : 'sent'}`} key={message.id}><div className="bubble">{message.text}</div><div className="message-meta"><span>{message.sender}</span><time>{message.time}</time></div></article>)}
        {typers.length > 0 && <p className="typing-indicator">{typers.join(', ')} {typers.length === 1 ? 'is' : 'are'} typing...</p>}
      </div>
      <form className="composer" onSubmit={sendMessage}><input value={draftMessage} onChange={handleDraftMessageChange} placeholder="Write a message..." aria-label="Message" autoComplete="off" /><button className="send-button" type="submit"><span>Send</span><b aria-hidden="true">-&gt;</b></button></form>
    </section>
  </main>
}

export default App
