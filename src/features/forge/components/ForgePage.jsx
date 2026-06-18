import { useRef, useState, useCallback } from 'react'
import { useUIStore }    from '@/shared/stores/useUIStore'
import { parseRating, bodyPreview } from '@/shared/lib/markdown'

const DEFAULT_OPTIONS = {
  compare: true,
  merge:   true,
  rating:  true,
  tags:    true,
}

function OptRow({ label, desc, checked, onChange }) {
  return (
    <div className="forge-opt-row">
      <div>
        <div className="forge-opt-lbl">{label}</div>
        <div className="forge-opt-desc">{desc}</div>
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </div>
  )
}

export default function ForgePage() {
  const openForgeSaveModal = useUIStore((s) => s.openForgeSaveModal)
  const showToast          = useUIStore((s) => s.showToast)

  const [files,         setFiles]         = useState([])
  const [dragOver,      setDragOver]      = useState(false)
  const [options,       setOptions]       = useState(DEFAULT_OPTIONS)
  const [status,        setStatus]        = useState('idle')  // idle|loading|done|error
  const [result,        setResult]        = useState('')
  const [suggestedTags, setSuggestedTags] = useState([])
  const [errorMsg,      setErrorMsg]      = useState('')
  const fileInputRef = useRef(null)

  const readFiles = useCallback((fileList) => {
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setFiles((prev) =>
          prev.find((f) => f.name === file.name)
            ? prev
            : [...prev, { name: file.name, content: ev.target.result }]
        )
      }
      reader.readAsText(file)
    })
  }, [])

  const removeFile  = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))
  const clearAll    = () => { setFiles([]); resetOutput() }
  const resetOutput = () => { setResult(''); setSuggestedTags([]); setStatus('idle'); setErrorMsg('') }

  const setOpt = (key) => (val) => setOptions((prev) => ({ ...prev, [key]: val }))

  const runForge = async () => {
    if (files.length === 0) { alert('Upload at least one .md file.'); return }
    setStatus('loading')
    setErrorMsg('')
    setSuggestedTags([])
    setResult('')

    try {
      const res = await fetch('/.netlify/functions/forge', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          files:   files.map((f) => ({ name: f.name, content: f.content })),
          options,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Forge request failed.')
      setResult(data.result ?? '')
      setSuggestedTags(data.suggestedTags ?? [])
      setStatus('done')
      showToast('Forge complete.')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  const copyResult = () => {
    if (!result) return
    navigator.clipboard.writeText(result).then(() => showToast('Copied to clipboard.'))
  }

  const saveResult = () => {
    if (!result) return
    openForgeSaveModal({
      title:       `Forged Prompt — ${new Date().toLocaleDateString()}`,
      description: `AI-synthesised from ${files.length} source file(s)`,
      content:     result,
      keywords:    suggestedTags,
    })
  }

  return (
    <div className="page active forge-page">
      <div className="forge-wrap">
        {/* ── Input panel ── */}
        <section className="forge-panel">
          <div className="fp-head">
            <div className="fp-ttl">INPUT FILES</div>
            <button className="btn-outline btn-sm" onClick={clearAll}>
              <i className="ti ti-trash" aria-hidden="true"></i> CLEAR
            </button>
          </div>
          <div className="fp-body">
            {/* Drop zone */}
            <div
              className={`drop-zone${dragOver ? ' drag' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); readFiles(e.dataTransfer.files) }}
              role="button"
              aria-label="Upload markdown files"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click() }}
            >
              <i className="ti ti-file-import" aria-hidden="true"></i>
              <strong>Drop .md files here</strong>
              <p>or click to browse — upload multiple prompt files to compare and synthesise</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => readFiles(e.target.files)}
            />

            {/* Uploaded files */}
            {files.length > 0 && (
              <div className="uploaded-list">
                {files.map((f, i) => {
                  const rating = parseRating(f.content)
                  return (
                    <div className="up-item" key={`${f.name}-${i}`}>
                      <i className="ti ti-file-text" aria-hidden="true" style={{ fontSize: 18, color: 'var(--ink3)', flexShrink: 0, marginTop: 2 }}></i>
                      <div className="up-item-info">
                        <div className="up-item-name">{f.name}</div>
                        <div className="up-item-preview">{bodyPreview(f.content)}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        {rating !== null && (
                          <span className="up-badge" style={{ background: 'var(--amber-bg)', color: 'var(--amber)', border: '1px solid var(--amber-border)' }}>
                            ★ {rating.toFixed(1)}
                          </span>
                        )}
                        <button className="btn-icon" style={{ width: 24, height: 24 }} onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`}>
                          <i className="ti ti-x" style={{ fontSize: 10 }} aria-hidden="true"></i>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Options */}
            <div className="sidebar-sec" style={{ marginTop: 20 }}>Forge Options</div>
            <div className="forge-opts">
              <OptRow label="Deep comparison"     desc="Analyse structural differences"         checked={options.compare} onChange={setOpt('compare')} />
              <OptRow label="Merge best patterns" desc="Combine strongest sections from each"   checked={options.merge}   onChange={setOpt('merge')}   />
              <OptRow label="Rating-weighted"     desc="Give higher-rated files more influence" checked={options.rating}  onChange={setOpt('rating')}  />
              <OptRow label="Suggest tags"        desc="Auto-generate keyword tags"             checked={options.tags}    onChange={setOpt('tags')}    />
            </div>

            <button
              className="btn-amber"
              style={{ width: '100%', marginTop: 16 }}
              onClick={runForge}
              disabled={status === 'loading'}
            >
              <i className="ti ti-wand" aria-hidden="true"></i>{' '}
              {status === 'loading' ? 'FORGING…' : 'FORGE NEW PROMPT'}
            </button>
          </div>
        </section>

        {/* ── Output panel ── */}
        <section className="forge-panel">
          <div className="fp-head">
            <div className="fp-ttl">OUTPUT</div>
            {status === 'done' && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-outline btn-sm" onClick={saveResult}>
                  <i className="ti ti-device-floppy" aria-hidden="true"></i> SAVE TO LIBRARY
                </button>
                <button className="btn-outline btn-sm" onClick={copyResult}>
                  <i className="ti ti-copy" aria-hidden="true"></i> COPY
                </button>
              </div>
            )}
          </div>
          <div className="fp-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Suggested tags */}
            {suggestedTags.length > 0 && (
              <div className="analysis-block">
                <div className="ab-ttl">SUGGESTED TAGS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {suggestedTags.map((t) => (
                    <span className="kw-badge" key={t}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Result area */}
            {status === 'idle' && (
              <div className="forge-result empty">
                <i className="ti ti-wand" aria-hidden="true" style={{ fontSize: 28 }}></i>
                <span>Upload .md files and click Forge</span>
              </div>
            )}
            {status === 'loading' && (
              <div className="forge-result loading">
                <span className="loading-txt">Analysing files and synthesising…</span>
              </div>
            )}
            {status === 'error' && (
              <div className="forge-result">
                <strong style={{ color: 'var(--red)' }}>Error:</strong> {errorMsg}
              </div>
            )}
            {status === 'done' && (
              <div className="forge-result">{result}</div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
