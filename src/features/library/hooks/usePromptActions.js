import { useCallback } from 'react'
import { usePromptStore } from '@/shared/stores/usePromptStore'
import { useUIStore }     from '@/shared/stores/useUIStore'
import { downloadMarkdown } from '@/shared/lib/markdown'

/**
 * Encapsulates all user-triggered prompt actions.
 * Components call these instead of touching the store directly,
 * keeping toast + modal orchestration in one place.
 */
export function usePromptActions() {
  const createPrompt = usePromptStore((s) => s.createPrompt)
  const updatePrompt = usePromptStore((s) => s.updatePrompt)
  const deletePrompt = usePromptStore((s) => s.deletePrompt)

  const showToast         = useUIStore((s) => s.showToast)
  const closeModal        = useUIStore((s) => s.closeModal)
  const closeDetail       = useUIStore((s) => s.closeDetail)
  const openEditModal     = useUIStore((s) => s.openEditModal)
  const modal             = useUIStore((s) => s.modal)

  const handleSave = useCallback(async (values) => {
    try {
      if (modal.editing) {
        await updatePrompt(modal.editing, values)
        showToast('Prompt updated.')
      } else {
        await createPrompt(values)
        showToast(modal.mode === 'forge' ? 'Forged prompt saved.' : 'Prompt created.')
      }
      closeModal()
    } catch (err) {
      alert(`Save failed: ${err.message}`)
    }
  }, [modal, createPrompt, updatePrompt, showToast, closeModal])

  const handleDelete = useCallback(async (prompt) => {
    if (!window.confirm(`Delete "${prompt.title}"?`)) return
    try {
      await deletePrompt(prompt)
      closeDetail()
      showToast('Prompt deleted.')
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    }
  }, [deletePrompt, closeDetail, showToast])

  const handleExport = useCallback((prompt) => {
    const filename = downloadMarkdown(prompt)
    showToast(`Exported: ${filename}`)
  }, [showToast])

  const handleCopy = useCallback((prompt) => {
    navigator.clipboard.writeText(prompt.content).then(() =>
      showToast('Copied to clipboard.')
    )
  }, [showToast])

  const handleEditFromDetail = useCallback((prompt) => {
    closeDetail()
    openEditModal(prompt)
  }, [closeDetail, openEditModal])

  return { handleSave, handleDelete, handleExport, handleCopy, handleEditFromDetail }
}
