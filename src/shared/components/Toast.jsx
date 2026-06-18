import { useUIStore } from '@/shared/stores/useUIStore'

export default function Toast() {
  const { visible, message } = useUIStore((s) => s.toast)
  return (
    <div className={`toast${visible ? ' show' : ''}`} role="status" aria-live="polite">
      <i className="ti ti-check" aria-hidden="true"></i>
      <span>{message}</span>
    </div>
  )
}
