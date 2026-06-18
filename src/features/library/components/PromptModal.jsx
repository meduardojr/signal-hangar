import { useEffect, useState, useCallback } from 'react'
import { useUIStore }       from '@/shared/stores/useUIStore'
import { usePromptActions } from '../hooks/usePromptActions'
import { useFilteredPrompts } from '../hooks/useFilteredPrompts'
import StarRating           from '@/shared/components/StarRating'
import { DEFAULT_PROJECT_TYPES } from '@/shared/lib/constants'

const MODAL_TITLES = {
  create: 'NEW PROMPT',
  edit:   'EDIT PROMPT',
  forge:  'SAVE FORGED PROMPT',
}

export default function PromptModal() {
  const { open, mode, initial } = useUIStore((s) => s.modal)
  const closeModal              = useUIStore((s) => s.closeModal)
  const { handleSave }          = usePromptActions()
  const { allTypes }            = useFilteredPrompts()

  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [content,     setContent]     = useState('')
  const [rating,      setRating]      = useState(0)
  const [selTypes,    setSelTypes]    = useState([])
  const [keywords,    setKeywords]    = useState([])
  const [newType,     setNewType]     = useState('')
  const [tagInput,    setTagInput]    = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (!open) return
    setTitle(initial?.title ?? '')
    setDescription(initial?.description ?? '')
    setContent(initial?.content ?? '')
    setRating(initial?.rating != null ? Number(initial.rating) : 0)
    setSelTypes([...(initial?.project_types ?? [])])
    setKeywords([...(initial?.keywords ?? [])])
    setTagInput('')
    setNewType('')
  }, [open, initial])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, closeModal])

  const toggleType = useCallback((t) => {
    setSelTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }, [])

  const addCustomType = useCallback(() => {
    const v = newType.trim()
    if (!v) return
    setSelTypes((prev) => prev.includes(v) ? prev : [...prev, v])
    setNewType('')
  }, [newType])

  const handleTagKey = useCallback((e) => {
    if (e.key !== 'Enter' && e.key !== ',') return
    e.preventDefault()
    const v = tagInput.trim().replace(/,$/, '')
    if (v && !keywords.includes(v)) setKeywords((prev) => [...prev, v])
    setTagInput('')
  }, [tagInput, keywords])

  const removeTag = useCallback((i) => {
    setKeywords((prev) => prev.filter((_, idx) => idx !== i))
  }, [])

  const onSubmit = useCallback(() => {
    if (!title.trim() || !content.trim()) {
      alert('Title and prompt content are required.')
      return
    }
    handleSave({
      title:        title.trim(),
      description:  description.trim(),
      content:      content.trim(),
      rating,
      projectTypes: selTypes,
      keywords,
    })
  }, [title, description, content, rating, selTypes, keywords, handleSave])

  if (!open) return null

  const allTypeOptions = [...new Set([...DEFAULT_PROJECT_TYPES, ...allTypes])]

  return (
    <div
      className="overlay"
      onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
      role="dialog"
      aria-modal="true"
      aria-label={MODAL_TITLES[mode]}
    >
      <div className="modal">
        <div className="modal-top">
          <div className="modal-ttl">{MODAL_TITLES[mode]}</div>
          <button className="btn-icon" onClick={closeModal} aria-label="Close modal">
            <i className="ti ti-x" aria-hidden="true"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Title */}
          <div className="fg">
            <label className="fl" htmlFor="pm-title">TITLE</label>
            <input
              id="pm-title"
              type="text"
              style={{ width: '100%' }}
              placeholder="e.g. Full-Stack SaaS Boilerplate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="fg">
            <label className="fl" htmlFor="pm-desc">DESCRIPTION</label>
            <input
              id="pm-desc"
              type="text"
              style={{ width: '100%' }}
              placeholder="One-line summary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="fg">
            <label className="fl" htmlFor="pm-content">PROMPT CONTENT</label>
            <textarea
              id="pm-content"
              placeholder="Write your detailed prompt here…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="row2">
            {/* Project types */}
            <div className="fg" style={{ margin: 0 }}>
              <label className="fl">PROJECT TYPES</label>
              <div className="type-grid">
                {allTypeOptions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`topt${selTypes.includes(t) ? ' sel' : ''}`}
                    onClick={() => toggleType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <input
                  type="text"
                  placeholder="Custom type…"
                  style={{ flex: 1, fontSize: 11, padding: '6px 9px' }}
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomType() } }}
                />
                <button type="button" className="btn-outline btn-sm" onClick={addCustomType}>
                  + ADD
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="fg" style={{ margin: 0 }}>
              <label className="fl">RATING</label>
              <div className="rating-row">
                <StarRating value={rating} onChange={setRating} />
                <div className="r-num">{rating.toFixed(1)}</div>
              </div>
              <input
                type="range"
                min="0" max="50" step="1"
                value={Math.round(rating * 10)}
                onChange={(e) => setRating(parseInt(e.target.value) / 10)}
                style={{ width: '100%', marginTop: 10 }}
                aria-label="Rating slider"
              />
            </div>
          </div>

          {/* Keyword tags */}
          <div className="fg" style={{ marginTop: 16 }}>
            <label className="fl">
              KEYWORD TAGS{' '}
              <span style={{ fontWeight: 400, color: 'var(--ink4)' }}>(Enter or comma to add)</span>
            </label>
            <div
              className="tag-box"
              onClick={() => document.getElementById('pm-tag-input')?.focus()}
              role="group"
              aria-label="Keyword tags"
            >
              {keywords.map((t, i) => (
                <span key={`${t}-${i}`} className="kw-chip" style={{ fontSize: 10, padding: '2px 8px', cursor: 'default', background: 'var(--paper2)' }}>
                  {t}
                  <span className="tag-x" onClick={() => removeTag(i)} aria-label={`Remove ${t}`}>×</span>
                </span>
              ))}
              <input
                id="pm-tag-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                placeholder={keywords.length === 0 ? 'idempotency, MVC, JWT…' : ''}
              />
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn-outline" onClick={closeModal}>CANCEL</button>
          <button className="btn" onClick={onSubmit}>SAVE PROMPT</button>
        </div>
      </div>
    </div>
  )
}
