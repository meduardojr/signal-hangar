import { memo } from 'react'
import { useUIStore }        from '@/shared/stores/useUIStore'
import { usePromptActions }  from '../hooks/usePromptActions'

const PromptRow = memo(function PromptRow({ prompt, index }) {
  const expandedId   = useUIStore((s) => s.expandedId)
  const toggleExpand = useUIStore((s) => s.toggleExpand)
  const openDetail   = useUIStore((s) => s.openDetail)
  const openEdit     = useUIStore((s) => s.openEditModal)

  const { handleDelete, handleExport, handleCopy } = usePromptActions()

  const p        = prompt
  const expanded = expandedId === p.id

  return (
    <article className="prompt-row">
      {/* ── Header row (always visible) ── */}
      <div className="pr-head" onClick={() => toggleExpand(p.id)}>
        <div className="pr-index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </div>

        <div className="pr-info">
          <div className="pr-title">{p.title}</div>
          <div className="pr-desc">{p.description || 'No description'}</div>
        </div>

        <div className="pr-meta">
          <div className="type-tags">
            {(p.project_types ?? []).slice(0, 2).map((t) => (
              <span className="ttag" key={t}>{t}</span>
            ))}
          </div>
          <div className="rating-tag">
            <i className="ti ti-star-filled" aria-hidden="true"></i>
            {Number(p.rating).toFixed(1)}
          </div>
          <div className="pr-actions">
            <button className="btn-icon" title="Edit"      onClick={(e) => { e.stopPropagation(); openEdit(p) }}>
              <i className="ti ti-edit" aria-hidden="true"></i>
            </button>
            <button className="btn-icon" title="Export .md" onClick={(e) => { e.stopPropagation(); handleExport(p) }}>
              <i className="ti ti-markdown" aria-hidden="true"></i>
            </button>
            <button className="btn-icon" title="Copy prompt" onClick={(e) => { e.stopPropagation(); handleCopy(p) }}>
              <i className="ti ti-copy" aria-hidden="true"></i>
            </button>
            <button className="btn-icon" title="Delete" style={{ color: 'var(--red)' }}
              onClick={(e) => { e.stopPropagation(); handleDelete(p) }}>
              <i className="ti ti-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>

      {/* ── Expanded body ── */}
      {expanded && (
        <div className="pr-expand open">
          <div className="pr-content-preview">{p.content}</div>

          {(p.keywords ?? []).length > 0 && (
            <div className="pr-kw">
              {p.keywords.map((k) => (
                <span className="kw-badge" key={k}>{k}</span>
              ))}
            </div>
          )}

          <div className="expand-actions">
            <button className="btn btn-sm" onClick={() => openDetail(p)}>
              <i className="ti ti-external-link" aria-hidden="true"></i> FULL VIEW
            </button>
            <button className="btn-outline btn-sm" onClick={() => handleExport(p)}>
              <i className="ti ti-markdown" aria-hidden="true"></i> EXPORT .MD
            </button>
            <button className="btn-outline btn-sm" onClick={() => handleCopy(p)}>
              <i className="ti ti-copy" aria-hidden="true"></i> COPY
            </button>
          </div>
        </div>
      )}
    </article>
  )
})

export default PromptRow
