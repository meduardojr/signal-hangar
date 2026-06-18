import { create } from 'zustand'
import { TOAST_DURATION_MS } from '@/shared/lib/constants'

let toastTimer = null

export const useUIStore = create((set, get) => ({
  // ── Navigation ────────────────────────────────────────────────
  activeTab: 'library',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ── Library filters ───────────────────────────────────────────
  searchQ:    '',
  sortVal:    'updated',
  activeType: null,
  activeKw:   null,
  expandedId: null,

  setSearchQ:    (q)   => set({ searchQ: q }),
  setSortVal:    (v)   => set({ sortVal: v }),
  setActiveType: (t)   => set({ activeType: t }),
  toggleType:    (t)   => set((s) => ({ activeType: s.activeType === t ? null : t })),
  toggleKw:      (k)   => set((s) => ({ activeKw:   s.activeKw   === k ? null : k })),
  toggleExpand:  (id)  => set((s) => ({ expandedId: s.expandedId === id ? null : id })),
  clearFilters:  ()    => set({ searchQ: '', activeType: null, activeKw: null }),

  // ── Detail overlay ────────────────────────────────────────────
  detailPrompt: null,
  openDetail:   (p)  => set({ detailPrompt: p }),
  closeDetail:  ()   => set({ detailPrompt: null }),

  // ── Prompt modal (create / edit / forge-save) ─────────────────
  modal: {
    open:    false,
    mode:    'create',   // 'create' | 'edit' | 'forge'
    initial: null,
    editing: null,       // full prompt object when mode === 'edit'
  },

  openCreateModal: () =>
    set({ modal: { open: true, mode: 'create', initial: null, editing: null } }),

  openEditModal: (prompt) =>
    set({ modal: { open: true, mode: 'edit', initial: prompt, editing: prompt } }),

  openForgeSaveModal: (forgeData) =>
    set({
      modal: {
        open: true,
        mode: 'forge',
        editing: null,
        initial: {
          title:         forgeData.title,
          description:   forgeData.description ?? '',
          content:       forgeData.content,
          rating:        0,
          project_types: [],
          keywords:      forgeData.keywords ?? [],
        },
      },
    }),

  closeModal: () =>
    set((s) => ({ modal: { ...s.modal, open: false } })),

  // ── Toast ─────────────────────────────────────────────────────
  toast: { visible: false, message: '' },

  showToast: (message) => {
    if (toastTimer) clearTimeout(toastTimer)
    set({ toast: { visible: true, message } })
    toastTimer = setTimeout(
      () => set({ toast: { visible: false, message: '' } }),
      TOAST_DURATION_MS
    )
  },
}))
