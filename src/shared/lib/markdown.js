import { escapeYaml, slugify, fmtDate } from './utils'

// ----------------------------------------------------------------
// Export
// ----------------------------------------------------------------

/**
 * Serialise a prompt to a Markdown string with YAML frontmatter.
 * The frontmatter includes the current rating so that the Forge
 * feature can weight synthesis by quality.
 */
export function promptToMarkdown(p) {
  const types    = (p.project_types ?? []).map((t) => `"${t}"`).join(', ')
  const keywords = (p.keywords      ?? []).map((k) => `"${k}"`).join(', ')

  const frontmatter = [
    '---',
    `title: "${escapeYaml(p.title)}"`,
    `rating: ${Number(p.rating).toFixed(1)}`,
    `types: [${types}]`,
    `keywords: [${keywords}]`,
    `created: ${p.created_at}`,
    `updated: ${p.updated_at}`,
    '---',
  ].join('\n')

  const kwSection = p.keywords?.length
    ? `## Keywords\n\n${p.keywords.map((k) => `- \`${k}\``).join('\n')}\n\n`
    : ''

  return [
    frontmatter,
    '',
    `# ${p.title}`,
    '',
    `> **Rating:** ${Number(p.rating).toFixed(1)} / 5.0`,
    '',
    p.description ? `## Description\n\n${p.description}\n` : '',
    '## Prompt',
    '',
    p.content,
    '',
    kwSection,
    '## Metadata',
    '',
    `- **Project Types:** ${(p.project_types ?? []).join(', ') || '—'}`,
    `- **Created:** ${fmtDate(p.created_at)}`,
    `- **Last Updated:** ${fmtDate(p.updated_at)}`,
    '',
  ].join('\n')
}

/**
 * Trigger a browser download of a prompt as a .md file.
 * Returns the filename used.
 */
export function downloadMarkdown(p) {
  const content  = promptToMarkdown(p)
  const filename = `${slugify(p.title)}.md`
  const blob     = new Blob([content], { type: 'text/markdown' })
  const url      = URL.createObjectURL(blob)
  const a        = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return filename
}

// ----------------------------------------------------------------
// Parse (used by Forge to inspect uploaded files)
// ----------------------------------------------------------------

/** Extract the numeric rating from YAML frontmatter, or null. */
export function parseRating(content) {
  const m = content.match(/^rating:\s*([\d.]+)/m)
  return m ? parseFloat(m[1]) : null
}

/** Strip frontmatter and return a short body preview. */
export function bodyPreview(content, maxLen = 120) {
  const stripped = content.replace(/^---[\s\S]*?---\n?/, '').trim()
  return stripped.length > maxLen ? `${stripped.slice(0, maxLen)}…` : stripped
}
