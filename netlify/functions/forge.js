/**
 * netlify/functions/forge.js
 *
 * Server-side proxy for the Forge feature.  Receives uploaded .md
 * file contents + user options from the browser, calls the Anthropic
 * API using the secret ANTHROPIC_API_KEY env var, and returns the
 * synthesized prompt text + suggested keyword tags.
 *
 * The API key is NEVER shipped to the browser — it lives only in this
 * function's runtime environment (Netlify → Site settings → Environment
 * variables).
 */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL         = 'claude-sonnet-4-20250514'
const MAX_TOKENS    = 4000

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function json(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) }
}

function buildSystemPrompt(opt) {
  return `You are an expert AI prompt engineer and technical architect. \
You analyse AI prompt documents (Markdown with YAML frontmatter) and \
synthesise improved, superior prompts.

Tasks:
1. ${opt.compare
    ? 'Deeply compare the uploaded prompts — identify overlaps, gaps, conflicting patterns, and unique strengths.'
    : 'Analyse the uploaded prompts.'}
2. ${opt.merge
    ? 'Extract the best patterns, structures, and specifications from each input.'
    : 'Use the content of each prompt as-is.'}
3. ${opt.rating
    ? 'Weight your synthesis toward higher-rated prompts (rating is in YAML frontmatter, e.g. rating: 4.5).'
    : 'Treat all inputs equally regardless of rating.'}
4. Generate ONE new, comprehensive, improved prompt that outperforms any individual input.
5. ${opt.tags
    ? 'After the synthesised prompt, output a line that starts exactly with "SUGGESTED_TAGS:" followed by a comma-separated list of 5-10 technical keyword tags (e.g. MVC, idempotency, JWT).'
    : ''}

Output format (strict):
## Analysis
- <bullet comparing inputs>
- <bullet>
- <bullet>

## Synthesised Prompt
<the full, production-ready prompt here>

${opt.tags ? 'SUGGESTED_TAGS: tag1, tag2, tag3' : ''}

Rules:
- No YAML frontmatter in output.
- No meta-commentary outside the format above.
- The synthesised prompt must be ready to paste into Bolt, Lovable, or Cursor.`
}

// ----------------------------------------------------------------
// Handler
// ----------------------------------------------------------------

export const handler = async (event) => {
  // Pre-flight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' })
  }

  // Parse body
  let payload
  try {
    payload = JSON.parse(event.body)
  } catch {
    return json(400, { error: 'Invalid JSON body.' })
  }

  const { files, options } = payload

  if (!Array.isArray(files) || files.length === 0) {
    return json(400, { error: 'Provide at least one .md file.' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return json(500, { error: 'ANTHROPIC_API_KEY is not set on the server.' })
  }

  const opt = {
    compare: options?.compare ?? true,
    merge:   options?.merge   ?? true,
    rating:  options?.rating  ?? true,
    tags:    options?.tags    ?? true,
  }

  const filesBlock = files
    .map((f, i) => `=== FILE ${i + 1}: ${f.name} ===\n${f.content}`)
    .join('\n\n')

  const enabledOpts = [
    opt.compare && 'deep comparison',
    opt.merge   && 'merge best patterns',
    opt.rating  && 'rating-weighted synthesis',
    opt.tags    && 'suggest keyword tags',
  ].filter(Boolean).join(', ')

  const userMessage =
    `Analyse and synthesise the following ${files.length} prompt file(s).\n` +
    `Options: ${enabledOpts}\n\n${filesBlock}`

  // Call Anthropic
  let anthropicRes
  try {
    anthropicRes = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-key':       apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      MODEL,
        max_tokens: MAX_TOKENS,
        system:     buildSystemPrompt(opt),
        messages:   [{ role: 'user', content: userMessage }],
      }),
    })
  } catch (err) {
    return json(502, { error: `Could not reach Anthropic API: ${err.message}` })
  }

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text()
    return json(anthropicRes.status, { error: `Anthropic error: ${errText}` })
  }

  const data = await anthropicRes.json()
  const raw  = (data.content ?? []).map((b) => b.text ?? '').join('')

  // Split off SUGGESTED_TAGS
  const tagMatch     = raw.match(/^SUGGESTED_TAGS:\s*(.+)$/m)
  const suggestedTags = tagMatch
    ? tagMatch[1].split(',').map((t) => t.trim()).filter(Boolean)
    : []
  const result = raw.replace(/^SUGGESTED_TAGS:.+$/m, '').trim()

  return json(200, { result, suggestedTags })
}
