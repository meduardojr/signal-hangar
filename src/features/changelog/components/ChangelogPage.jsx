import { usePromptStore } from '@/shared/stores/usePromptStore'
import { fmtDateTime, truncate } from '@/shared/lib/utils'
import EmptyState from '@/shared/components/EmptyState'

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

const ACTION_META = {
  created: { cls: 'c', lbl: 'CREATED', icon: 'sparkles' },
  updated: { cls: 'u', lbl: 'UPDATED', icon: 'pencil'   },
  deleted: { cls: 'd', lbl: 'DELETED', icon: 'trash'    },
}

function LogCard({ entry }) {
  const meta = ACTION_META[entry.action] ?? ACTION_META.updated

  return (
    <div className="log-row">
      <div className={`log-dot ${meta.cls}`}>
        <i className={`ti ti-${meta.icon}`} aria-hidden="true"></i>
      </div>
      <div className="log-card">
        <div className="log-card-top">
          <span className={`log-action-lbl lal-${meta.cls}`}>{meta.lbl}</span>
          <span className="log-time">{fmtDateTime(entry.created_at)}</span>
        </div>
        <div className="log-name">{entry.prompt_title}</div>
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

export default function ChangelogPage() {
  const changelog = usePromptStore((s) => s.changelog)

  return (
    <div className="page active">
      <div className="log-wrap">
        {changelog.length === 0 ? (
          <EmptyState
            icon="ti-history"
            title="No entries yet"
            body="Changes appear here after creating or editing prompts."
          />
        ) : (
          changelog.map((entry) => <LogCard entry={entry} key={entry.id} />)
        )}
      </div>
    </div>
  )
}
