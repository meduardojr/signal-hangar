import { useUIStore }        from '@/shared/stores/useUIStore'
import { useFilteredPrompts } from '../hooks/useFilteredPrompts'
import { SORT_OPTIONS }       from '@/shared/lib/constants'
import LibrarySidebar         from './LibrarySidebar'
import StatStrip              from './StatStrip'
import PromptList             from './PromptList'

export default function LibraryPage() {
  const searchQ      = useUIStore((s) => s.searchQ)
  const sortVal      = useUIStore((s) => s.sortVal)
  const activeType   = useUIStore((s) => s.activeType)
  const activeKw     = useUIStore((s) => s.activeKw)
  const setSearchQ   = useUIStore((s) => s.setSearchQ)
  const setSortVal   = useUIStore((s) => s.setSortVal)
  const toggleType   = useUIStore((s) => s.toggleType)
  const { filtered, allTypes } = useFilteredPrompts()

  return (
    <div className="page active lib-page">
      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="search-wrap">
          <i className="ti ti-search" aria-hidden="true"></i>
          <input
            type="search"
            placeholder="Search title, content, tags…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            aria-label="Search prompts"
          />
        </div>

        <div className="divider-v"></div>

        <select
          value={sortVal}
          onChange={(e) => setSortVal(e.target.value)}
          style={{ width: 170 }}
          aria-label="Sort order"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {allTypes.map((t) => (
            <button
              key={t}
              className={`filter-pill${activeType === t ? ' on' : ''}`}
              onClick={() => toggleType(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body: sidebar + main ── */}
      <div className="lib-body">
        <LibrarySidebar />

        <main className="lib-main">
          <StatStrip />

          <div className="sort-row">
            <span>
              {filtered.length} prompt{filtered.length !== 1 ? 's' : ''}
            </span>
            <span style={{ color: 'var(--amber)', fontSize: 11 }}>
              {activeType && `[${activeType}]`}
              {activeKw   && ` #${activeKw}`}
            </span>
          </div>

          <PromptList />
        </main>
      </div>
    </div>
  )
}
