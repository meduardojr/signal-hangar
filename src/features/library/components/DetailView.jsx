import { useMemo } from 'react'
import { useUIStore }       from '@/shared/stores/useUIStore'
import { usePromptStore }   from '@/shared/stores/usePromptStore'
import { usePromptActions } from '../hooks/usePromptActions'
import { fmtDate, fmtDateTime, truncate } from '@/shared/lib/utils'

function RatingChange({ prev, next }) {
  return (
    <div className="r-change">
      <i className="ti ti-star" aria-hidden="true" style={{ fontSize: 11, color: 'var(--amber)' }}></i>
      <span style={{ textDecoration: 'line-through', color: 'var(--ink4)' }}>
        {Number(prev).toFixed(1)}
      </span>
      <i className="ti ti-arrow-right" aria-hidden="true" style={{ fontSize: 10, color: 'var(--ink4)' }}></i>
      <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{Number(next).toFixed(1)}</span>
    </div>
  )
}

function LogEntry({ entry }) {
  const cls  = entry.action === 'created' ? 'c' : entry.action === 'updated' ? 'u' : 'd'
  const lbl  = entry.action === 'created' ? 'CREATED' : entry.action === 'updated' ? 'UPDATED' : 'DELETED'
  const icon = entry.action === 'created' ? 'sparkles' : entry.action === 'updated' ? 'pencil' : 'trash'

  return (
    <div className="log-row">
      <div className={`log-dot ${cls}`}>
        <i className={`ti ti-${icon}`} aria-hidden="true"></i>
      </div>
      <div className="log-card">
        <div className="log-card-top">
          <span className={`log-action-lbl lal-${cls}`}>{lbl}</span>
          <span className="log-time">{fmtDateTime(entry.created_at)}</span>
        </div>
        <div className="log-changes">
          {(entry.changes ?? []).map((c, i) => (
            <div className="lc-row" key={i}>
              <span className="lc-field">{c.field}:</span>{' '}
              {c.from && <><span className="lc-old">{truncate(c.from)}</span> → </>}
              <span className="lc-new">{truncate(c.to)}</span>
            </div>
          ))}
          {entry.prev_rating != null && (
            <RatingChange prev={entry.prev_rating} next={entry.new_rating} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function DetailView() {
  const prompt     = useUIStore((s) => s.detailPrompt)
  const closeDetail = useUIStore((s) => s.closeDetail)
  const changelog  = usePromptStore((s) => s.changelog)
  const { handleExport, handleCopy, handleEditFromDetail } = usePromptActions()

  const logs = useMemo(() => {
    if (!prompt) return []
    return changelog
      .filter((l) => l.prompt_id === prompt.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [prompt, changelog])

  if (!prompt) return null
  const p = prompt

  return (
    <div className="detail-overlay" role="dialog" aria-modal="true" aria-label={p.title}>
      {/* Sticky top bar */}
      <div className="detail-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn-outline btn-sm" onClick={closeDetail}>
            <i className="ti ti-arrow-left" aria-hidden="true"></i> BACK
          </button>
          <span style={{ fontSize: 11, color: 'var(--ink3)' }}>
            LIBRARY / {p.title.toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          <button className="btn-outline btn-sm" onClick={() => handleExport(p)}>
            <i className="ti ti-markdown" aria-hidden="true"></i> EXPORT .MD
          </button>
          <button className="btn-outline btn-sm" onClick={() => handleCopy(p)}>
            <i className="ti ti-copy" aria-hidden="true"></i> COPY
          </button>
          <button className="btn btn-sm" onClick={() => handleEditFromDetail(p)}>
            <i className="ti ti-edit" aria-hidden="true"></i> EDIT
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="detail-body">
        <h1 className="detail-h1">{p.title}</h1>
        {p.description && <p className="detail-sub">{p.description}</p>}
        <hr className="detail-rule" />

        <div className="meta-grid">
          <div className="meta-cell">
            <div className="mc-l">RATING</div>
            <div className="mc-v" style={{ color: 'var(--amber)' }}>
              {Number(p.rating).toFixed(1)} / 5.0
            </div>
          </div>
          <div className="meta-cell">
            <div className="mc-l">CREATED</div>
            <div className="mc-v">{fmtDate(p.created_at)}</div>
          </div>
          <div className="meta-cell">
            <div className="mc-l">UPDATED</div>
            <div className="mc-v">{fmtDate(p.updated_at)}</div>
          </div>
        </div>

        {(p.project_types ?? []).length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
            {p.project_types.map((t) => (
              <span className="ttag" key={t} style={{ fontSize: 10, padding: '3px 9px' }}>{t}</span>
            ))}
          </div>
        )}

        {(p.keywords ?? []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 20 }}>
            {p.keywords.map((k) => (
              <span className="kw-badge" key={k}>{k}</span>
            ))}
          </div>
        )}

        <div className="detail-section-lbl">PROMPT CONTENT</div>
        <div className="detail-content">{p.content}</div>

        {logs.length > 0 && (
          <>
            <div className="detail-section-lbl" style={{ marginTop: 32 }}>
              CHANGE HISTORY
            </div>
            {logs.map((l) => <LogEntry entry={l} key={l.id} />)}
          </>
        )}
      </div>
    </div>
  )
}
