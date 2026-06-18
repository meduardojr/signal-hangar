/** Default project-type options shown in the prompt form. */
export const DEFAULT_PROJECT_TYPES = [
  'Website',
  'Game',
  'E-Commerce',
  'Mobile App',
  'Dashboard',
  'API',
  'CLI Tool',
  'Blog',
  'Portfolio',
  'SaaS',
]

/** Sort options used in the Library toolbar. */
export const SORT_OPTIONS = [
  { value: 'updated',  label: 'Recently Updated' },
  { value: 'rating-h', label: 'Rating ↓' },
  { value: 'rating-l', label: 'Rating ↑' },
  { value: 'az',       label: 'Name A–Z' },
  { value: 'newest',   label: 'Newest First' },
]

/** Tab definitions for the main navigation. */
export const TABS = [
  { id: 'library', label: 'LIBRARY', icon: 'ti-books'   },
  { id: 'forge',   label: 'FORGE',   icon: 'ti-wand'    },
  { id: 'log',     label: 'LOG',     icon: 'ti-history' },
]

/** Toast auto-dismiss duration (ms). */
export const TOAST_DURATION_MS = 2600
