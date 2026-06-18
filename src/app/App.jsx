import { useEffect } from 'react'
import { usePromptStore } from '@/shared/stores/usePromptStore'
import { useUIStore }     from '@/shared/stores/useUIStore'
import { TABS }           from '@/shared/lib/constants'
import Toast              from '@/shared/components/Toast'
import LibraryPage        from '@/features/library/components/LibraryPage'
import PromptModal        from '@/features/library/components/PromptModal'
import DetailView         from '@/features/library/components/DetailView'
import ForgePage          from '@/features/forge/components/ForgePage'
import ChangelogPage      from '@/features/changelog/components/ChangelogPage'

export default function App() {
  const loadAll          = usePromptStore((s) => s.loadAll)
  const activeTab        = useUIStore((s) => s.activeTab)
  const setActiveTab     = useUIStore((s) => s.setActiveTab)
  const openCreateModal  = useUIStore((s) => s.openCreateModal)
  const detailPrompt     = useUIStore((s) => s.detailPrompt)

  // Bootstrap data on mount
  useEffect(() => { loadAll() }, [loadAll])

  return (
    <div id="shell">
      {/* ── Masthead ── */}
      <header className="masthead">
        <div className="logo">PROMPT<em>VAULT</em></div>

        <nav className="nav-tabs" aria-label="Main navigation">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <i className={`ti ${tab.icon}`} aria-hidden="true"></i>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="masthead-right">
          <button className="btn" onClick={openCreateModal}>
            <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 12, marginRight: 4 }}></i>
            NEW PROMPT
          </button>
        </div>
      </header>

      {/* ── Pages ── */}
      {activeTab === 'library'  && <LibraryPage />}
      {activeTab === 'forge'    && <ForgePage />}
      {activeTab === 'log'      && <ChangelogPage />}

      {/* ── Global overlays ── */}
      <PromptModal />
      {detailPrompt && <DetailView />}
      <Toast />
    </div>
  )
}
