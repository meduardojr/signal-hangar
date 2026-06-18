import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'
import { truncate } from '@/shared/lib/utils'

// ----------------------------------------------------------------
// Supabase data helpers (not exported — used only by this store)
// ----------------------------------------------------------------

async function dbFetchPrompts() {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

async function dbFetchChangeLog() {
  const { data, error } = await supabase
    .from('change_log')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

async function dbLogChange(entry) {
  const { error } = await supabase.from('change_log').insert(entry)
  if (error) console.error('[SignalHangar] change_log insert failed:', error)
}

function diffPrompt(old, next) {
  const changes = []

  if (old.title !== next.title)
    changes.push({ field: 'title', from: old.title, to: next.title })

  if ((old.description ?? '') !== (next.description ?? ''))
    changes.push({ field: 'description', from: old.description ?? '', to: next.description ?? '' })

  if (old.content !== next.content)
    changes.push({ field: 'content', from: truncate(old.content, 60), to: truncate(next.content, 60) })

  if (JSON.stringify(old.project_types ?? []) !== JSON.stringify(next.projectTypes ?? []))
    changes.push({
      field: 'project_types',
      from: (old.project_types ?? []).join(', '),
      to:   (next.projectTypes  ?? []).join(', '),
    })

  if (JSON.stringify(old.keywords ?? []) !== JSON.stringify(next.keywords ?? []))
    changes.push({
      field: 'keywords',
      from: (old.keywords  ?? []).join(', '),
      to:   (next.keywords ?? []).join(', '),
    })

  return changes
}

// ----------------------------------------------------------------
// Store
// ----------------------------------------------------------------

export const usePromptStore = create((set, get) => ({
  prompts:    [],
  changelog:  [],
  loading:    false,
  error:      null,

  // ── Bootstrap ─────────────────────────────────────────────────

  loadAll: async () => {
    set({ loading: true, error: null })
    try {
      const [prompts, changelog] = await Promise.all([
        dbFetchPrompts(),
        dbFetchChangeLog(),
      ])
      set({ prompts, changelog, loading: false })
    } catch (err) {
      set({ error: err.message ?? 'Failed to load data.', loading: false })
    }
  },

  // ── Create ────────────────────────────────────────────────────

  createPrompt: async ({ title, description, content, rating, projectTypes, keywords }) => {
    const { data, error } = await supabase
      .from('prompts')
      .insert({ title, description, content, rating, project_types: projectTypes, keywords })
      .select()
      .single()

    if (error) throw error

    await dbLogChange({ prompt_id: data.id, prompt_title: data.title, action: 'created' })

    // Optimistic update
    set((s) => ({ prompts: [data, ...s.prompts] }))
    await get()._refreshChangelog()
    return data
  },

  // ── Update ────────────────────────────────────────────────────

  updatePrompt: async (oldPrompt, next) => {
    const { title, description, content, rating, projectTypes, keywords } = next
    const changes      = diffPrompt(oldPrompt, next)
    const ratingChanged = Number(oldPrompt.rating) !== Number(rating)

    const { data, error } = await supabase
      .from('prompts')
      .update({ title, description, content, rating, project_types: projectTypes, keywords })
      .eq('id', oldPrompt.id)
      .select()
      .single()

    if (error) throw error

    if (changes.length > 0 || ratingChanged) {
      await dbLogChange({
        prompt_id:    data.id,
        prompt_title: data.title,
        action:       'updated',
        changes:      changes.length ? changes : null,
        prev_rating:  ratingChanged ? oldPrompt.rating : null,
        new_rating:   ratingChanged ? rating            : null,
      })
    }

    set((s) => ({
      prompts: s.prompts.map((p) => (p.id === data.id ? data : p)),
    }))
    await get()._refreshChangelog()
    return data
  },

  // ── Delete ────────────────────────────────────────────────────

  deletePrompt: async (prompt) => {
    // Log first — before the FK becomes null
    await dbLogChange({ prompt_id: prompt.id, prompt_title: prompt.title, action: 'deleted' })

    const { error } = await supabase.from('prompts').delete().eq('id', prompt.id)
    if (error) throw error

    set((s) => ({
      prompts: s.prompts.filter((p) => p.id !== prompt.id),
    }))
    await get()._refreshChangelog()
  },

  // ── Internal ──────────────────────────────────────────────────

  _refreshChangelog: async () => {
    try {
      const changelog = await dbFetchChangeLog()
      set({ changelog })
    } catch (err) {
      console.error('[SignalHangar] changelog refresh failed:', err)
    }
  },
}))
