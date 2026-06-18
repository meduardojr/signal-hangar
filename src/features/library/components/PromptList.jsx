import { usePromptStore }     from '@/shared/stores/usePromptStore'
import { useUIStore }         from '@/shared/stores/useUIStore'
import { useFilteredPrompts } from '../hooks/useFilteredPrompts'
import PromptRow              from './PromptRow'
import EmptyState             from '@/shared/components/EmptyState'

export default function PromptList() {
  const loading      = usePromptStore((s) => s.loading)
  const error        = usePromptStore((s) => s.error)
  const searchQ      = useUIStore((s) => s.searchQ)
  const activeType   = useUIStore((s) => s.activeType)
  const activeKw     = useUIStore((s) => s.activeKw)
  const clearFilters = useUIStore((s) => s.clearFilters)
  const { filtered } = useFilteredPrompts()

  if (loading) return (
    <div className="empty-state">
      <i className="ti ti-loader loading-spin" aria-hidden="true"></i>
      <h3>Loading…</h3>
    </div>
  )

  if (error) return (
    <EmptyState
      icon="ti-alert-triangle"
      title="Couldn't load prompts"
      body={`${error} — Check your Supabase credentials in .env and confirm the schema has been applied.`}
    />
  )

  if (filtered.length === 0) {
    const hasFilter = searchQ || activeType || activeKw
    return (
      <EmptyState
        icon={hasFilter ? 'ti-filter-off' : 'ti-inbox'}
        title={hasFilter ? 'No prompts match' : 'No prompts yet'}
        body={hasFilter ? 'Try adjusting your search or filters.' : 'Create your first prompt to get started.'}
        action={hasFilter && (
          <button className="btn-outline btn-sm" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      />
    )
  }

  return (
    <div className="prompt-list" role="list">
      {filtered.map((p, i) => (
        <PromptRow key={p.id} prompt={p} index={i} />
      ))}
    </div>
  )
}
