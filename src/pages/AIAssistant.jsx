import { useState } from 'react'
import { Bot, Eye, EyeOff, KeyRound, Loader2, Send, ShieldAlert, Sparkles, Timer, Trash2 } from 'lucide-react'
import { storage } from '../lib/storage'
import { askAI } from '../lib/aiClients'
import { useStudy } from '../context/StudyContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getSubjectById } from '../data/subjects'

const PROVIDERS = [
  { id: 'claude', label: 'Claude', hint: 'console.anthropic.com', defaultModel: 'claude-sonnet-5' },
  { id: 'gemini', label: 'Gemini', hint: 'aistudio.google.com/apikey', defaultModel: 'gemini-3.6-flash' },
]

function ProviderKeyCard({ provider, settings, onChange }) {
  const [showKey, setShowKey] = useState(false)
  const config = settings[provider.id] || { apiKey: '', model: provider.defaultModel }

  return (
    <div className="rounded-2xl border border-white/10 bg-base-800 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Bot size={16} className="text-neon-cyan" />
        </div>
        <div>
          <p className="text-sm font-semibold">{provider.label}</p>
          <p className="text-[11px] text-white/35">Get a key at {provider.hint}</p>
        </div>
      </div>

      <label className="block text-xs text-white/50 mb-1">API key</label>
      <div className="relative mb-3">
        <input
          type={showKey ? 'text' : 'password'}
          value={config.apiKey}
          onChange={(e) => onChange(provider.id, { ...config, apiKey: e.target.value })}
          placeholder={`Paste your ${provider.label} API key`}
          className="w-full rounded-lg bg-base-700 border border-white/10 px-3 py-2 pr-9 text-sm focus:outline-none focus:border-neon-cyan/50"
        />
        <button
          type="button"
          onClick={() => setShowKey((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
        >
          {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      <label className="block text-xs text-white/50 mb-1">Model</label>
      <input
        type="text"
        value={config.model}
        onChange={(e) => onChange(provider.id, { ...config, model: e.target.value })}
        placeholder={provider.defaultModel}
        className="w-full rounded-lg bg-base-700 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan/50"
      />

      <p className="text-[11px] text-white/30 mt-2">
        {config.apiKey ? '✓ Key saved in this browser.' : 'No key saved yet.'}
      </p>
    </div>
  )
}

export default function AIAssistant() {
  const { timer, timerSubjectId } = useStudy()
  const [settings, setSettings] = useState(() => storage.getAISettings())
  const [messages, setMessages] = useLocalStorage('sq_ai_chat_v1', [])
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const activeProvider = settings.activeProvider || 'claude'
  const activeConfig = settings[activeProvider] || {}

  const persistSettings = (next) => {
    setSettings(next)
    storage.saveAISettings(next)
  }

  const updateProviderConfig = (providerId, config) => {
    persistSettings({ ...settings, [providerId]: config })
  }

  const setActiveProvider = (providerId) => {
    persistSettings({ ...settings, activeProvider: providerId })
  }

  const handleAsk = async (e) => {
    e.preventDefault()
    const trimmed = prompt.trim()
    if (!trimmed || isLoading) return

    setError(null)
    const userMessage = { role: 'user', text: trimmed, provider: activeProvider }
    setMessages((prev) => [...prev, userMessage])
    setPrompt('')
    setIsLoading(true)

    try {
      // Timer state lives in StudyContext (see FocusTimer.jsx), completely
      // independent of this page — awaiting this API call, or navigating
      // anywhere else while it's in flight, never touches the timer.
      const reply = await askAI({
        provider: activeProvider,
        apiKey: activeConfig.apiKey,
        model: activeConfig.model,
        prompt: trimmed,
      })
      setMessages((prev) => [...prev, { role: 'assistant', text: reply, provider: activeProvider }])
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">AI Assistant</h2>
        <p className="text-white/50 text-sm mt-1">
          Bring your own Claude or Gemini API key and ask study questions without leaving StudyQuest.
        </p>
      </div>

      {timer.isRunning && (
        <div className="flex items-center gap-2 rounded-xl border border-neon-green/30 bg-neon-green/5 px-4 py-2.5 text-sm text-neon-green">
          <Timer size={15} />
          Your focus session keeps running in the background ({timer.clockLabel}
          {timerSubjectId ? ` · ${getSubjectById(timerSubjectId).name}` : ''}) — using the assistant won't pause or
          reset it.
        </div>
      )}

      <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 flex items-start gap-2.5">
        <ShieldAlert size={16} className="text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-200/80 leading-relaxed">
          Keys are stored only in this browser's local storage and sent directly from your browser to Anthropic /
          Google — there's no backend in this hackathon build to keep them secret. Fine for a personal demo; don't
          reuse a production key here.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {PROVIDERS.map((provider) => (
          <ProviderKeyCard key={provider.id} provider={provider} settings={settings} onChange={updateProviderConfig} />
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-base-800 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10">
          <div className="inline-flex rounded-xl bg-base-700 p-1">
            {PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setActiveProvider(provider.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeProvider === provider.id ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {provider.label}
              </button>
            ))}
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70"
            >
              <Trash2 size={12} /> Clear chat
            </button>
          )}
        </div>

        <div className="flex-1 max-h-[420px] overflow-y-auto px-4 sm:px-5 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-white/30 text-sm">
              <Sparkles size={22} className="mx-auto mb-2 opacity-50" />
              Ask a study question — e.g. "explain photosynthesis in 3 bullet points" or "check this proof for
              errors".
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-white/10 text-white'
                      : 'bg-base-700 border border-white/5 text-white/85'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Loader2 size={14} className="animate-spin" /> Thinking…
            </div>
          )}
        </div>

        {error && (
          <div className="px-4 sm:px-5 py-2 text-xs text-red-300 bg-red-500/10 border-t border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleAsk} className="border-t border-white/10 p-3 sm:p-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-white/30 pl-1">
            <KeyRound size={14} />
          </div>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ask ${PROVIDERS.find((p) => p.id === activeProvider)?.label}…`}
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-white/30"
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple px-3.5 py-2 text-xs font-semibold text-base-950 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <Send size={13} /> Send
          </button>
        </form>
      </div>
    </div>
  )
}
