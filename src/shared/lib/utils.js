// ----------------------------------------------------------------
// Date helpers
// ----------------------------------------------------------------

/** "Jan 15, 2025" */
export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** "Jan 15, 02:30 PM" */
export function fmtDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ----------------------------------------------------------------
// String helpers
// ----------------------------------------------------------------

/** Truncate with ellipsis */
export function truncate(str, n = 60) {
  if (!str) return ''
  return str.length > n ? `${str.slice(0, n)}…` : str
}

/** "my Prompt Title" → "my_prompt_title" */
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/** Escape double-quotes for YAML string values */
export function escapeYaml(str = '') {
  return str.replace(/"/g, '\\"')
}

// ----------------------------------------------------------------
// Array helpers
// ----------------------------------------------------------------

/** Unique sorted list of all values from a field across items */
export function collectUnique(items, key) {
  const set = new Set()
  items.forEach((item) => (item[key] ?? []).forEach((v) => set.add(v)))
  return [...set].sort()
}

/** Count occurrences of each value for a given array field */
export function countByField(items, key) {
  const map = {}
  items.forEach((item) => {
    ;(item[key] ?? []).forEach((v) => {
      map[v] = (map[v] ?? 0) + 1
    })
  })
  return map
}
