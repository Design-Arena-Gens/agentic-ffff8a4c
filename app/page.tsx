'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './page.module.css'

interface Message {
  role: 'user' | 'assistant' | 'tool'
  content: string
  toolCall?: string
  toolResult?: any
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      })

      const data = await response.json()

      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${data.error}`
        }])
      } else {
        setMessages(prev => [...prev, ...data.messages])
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: Failed to communicate with the agent.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>🤖 Agentic LLM</h1>
          <p className={styles.subtitle}>AI Assistant with Tool-Calling Capabilities</p>
        </div>

        <div className={styles.chatContainer}>
          <div className={styles.messages}>
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                <p>👋 Hello! I'm an agentic AI assistant.</p>
                <p>I can help you with:</p>
                <ul>
                  <li>🔍 Web searches and information retrieval</li>
                  <li>🧮 Mathematical calculations</li>
                  <li>🌤️ Weather information</li>
                  <li>💱 Currency conversions</li>
                  <li>📝 General knowledge and reasoning</li>
                </ul>
                <p>Try asking me something!</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                {msg.role === 'tool' ? (
                  <div className={styles.toolMessage}>
                    <div className={styles.toolHeader}>
                      🔧 Tool: {msg.toolCall}
                    </div>
                    <div className={styles.toolResult}>
                      {typeof msg.toolResult === 'object'
                        ? JSON.stringify(msg.toolResult, null, 2)
                        : msg.toolResult}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.messageHeader}>
                      {msg.role === 'user' ? '👤 You' : '🤖 Agent'}
                    </div>
                    <div className={styles.messageContent}>
                      {msg.content}
                    </div>
                  </>
                )}
              </div>
            ))}

            {loading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.messageHeader}>🤖 Agent</div>
                <div className={styles.messageContent}>
                  <div className={styles.thinking}>Thinking...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className={styles.inputForm}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className={styles.input}
              disabled={loading}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={loading || !input.trim()}
            >
              {loading ? '⏳' : '➤'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
