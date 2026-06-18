import { useMemo } from 'react'
import { usePromptStore } from '@/shared/stores/usePromptStore'
import { useUIStore } from '@/shared/stores/useUIStore'
import { collectUnique, countByField } from '@/shared/lib/utils'

export function useFilteredPrompts() {
  const prompts    = usePromptStore((s) => s.prompts)
  const searchQ    = useUIStore((s) => s.searchQ)
  const sortVal    = useUIStore((s) => s.sortVal)
  const activeType = useUIStore((s) => s.activeType)
  const activeKw   = useUIStore((s) => s.activeKw)

  const allTypes   = useMemo(() => collectUnique(prompts, 'project_types'), [prompts])
  const allKeywords = useMemo(() => collectUnique(prompts, 'keywords'),     [prompts])
  const typeCounts  = useMemo(() => countByField(prompts, 'project_types'), [prompts])

  const filtered = useMemo(() => {
    let list = [...prompts]

    if (activeType)
      list = list.filter((p) => (p.project_types ?? []).includes(activeType))

    if (activeKw)
      list = list.filter((p) => (p.keywords ?? []).includes(activeKw))

    if (searchQ) {
      const q = searchQ.toLowerCase()
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        (p.keywords      ?? []).some((k) => k.toLowerCase().includes(q)) ||
        (p.project_types ?? []).some((t) => t.toLowerCase().includes(q))
      )
    }

    switch (sortVal) {
      case 'rating-h': list.sort((a, b) => Number(b.rating)   - Number(a.rating));   break
      case 'rating-l': list.sort((a, b) => Number(a.rating)   - Number(b.rating));   break
      case 'az':       list.sort((a, b) => a.title.localeCompare(b.title));           break
      case 'newest':   list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break
      default:         list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)); break
    }

    return list
  }, [prompts, activeType, activeKw, searchQ, sortVal])

  return { filtered, allTypes, allKeywords, typeCounts }
}
