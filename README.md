# SignalHangar

> **⚠️ Prototype — v0.1.0**
> This is an early-stage prototype. APIs, data models, and UI patterns
> may change significantly between releases. Not recommended for
> production use without further hardening (authentication, rate limiting,
> error boundaries, E2E tests).

A personal library for AI prompt requirement documents — prompts that
function as detailed project specs to be fed into AI coding tools like
[Bolt](https://bolt.new), [Lovable](https://lovable.dev), and
[Cursor](https://cursor.sh).

---

## Features

| Feature | Description |
|---|---|
| **Library** | Browse, search, sort, and filter prompts by project type or keyword tag |
| **Create / Edit** | Rich form — title, description, content, multi-select project types, keyword tags, 0.0–5.0 star rating |
| **Export to .md** | Download any prompt as a Markdown file with YAML frontmatter (rating included) |
| **Change Log** | Every create / update / delete is recorded with field-level diffs and rating history |
| **Forge** | Drop multiple `.md` files → Claude compares them → synthesises an improved prompt |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| State | Zustand 4 |
| Database | Supabase (PostgreSQL) |
| Serverless | Netlify Functions (esbuild) |
| AI (Forge) | Anthropic Claude — server-side via Netlify Function |
| Hosting | Netlify |
| Version control | GitHub |

---

## Project Structure

```
signal-hangar/
│
├── netlify/
│   └── functions/
│       └── forge.js           # Serverless AI proxy (keeps API key server-side)
│
├── supabase/
│   └── schema.sql             # Full DB schema — run once in Supabase SQL Editor
│
├── src/
│   ├── app/                   # Entry point, shell, global styles
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── features/              # Feature-based modules
│   │   ├── library/           # Prompt CRUD, search, filter
│   │   │   ├── components/
│   │   │   │   ├── LibraryPage.jsx
│   │   │   │   ├── LibrarySidebar.jsx
│   │   │   │   ├── StatStrip.jsx
│   │   │   │   ├── PromptList.jsx
│   │   │   │   ├── PromptRow.jsx
│   │   │   │   ├── PromptModal.jsx
│   │   │   │   └── DetailView.jsx
│   │   │   └── hooks/
│   │   │       ├── useFilteredPrompts.js  # Memoised filter + sort
│   │   │       └── usePromptActions.js    # CRUD + toast + modal wiring
│   │   │
│   │   ├── forge/             # Multi-file AI synthesis
│   │   │   └── components/
│   │   │       └── ForgePage.jsx
│   │   │
│   │   └── changelog/         # Global change history
│   │       └── components/
│   │           └── ChangelogPage.jsx
│   │
│   └── shared/                # Cross-feature utilities
│       ├── components/
│       │   ├── Toast.jsx
│       │   ├── StarRating.jsx
│       │   └── EmptyState.jsx
│       ├── hooks/             # (reserved for future shared hooks)
│       ├── lib/
│       │   ├── supabase.js    # Supabase client singleton
│       │   ├── markdown.js    # .md export + frontmatter parsing
│       │   ├── utils.js       # Date, string, array helpers
│       │   └── constants.js   # Project types, sort options, tabs
│       └── stores/
│           ├── usePromptStore.js  # Zustand: data + Supabase actions
│           └── useUIStore.js      # Zustand: tab, modal, toast, filter
│
├── .env.example
├── .gitignore
├── index.html
├── netlify.toml
├── package.json
└── vite.config.js
```

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/your-username/signal-hangar.git
cd signal-hangar
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Apply the database schema

1. Go to [supabase.com](https://supabase.com) → your project → **SQL Editor → New query**
2. Paste the contents of `supabase/schema.sql` and run it
3. This creates the `prompts` and `change_log` tables, indexes, RLS policies, and seeds 3 example prompts

### 4. Run the dev server

**Library + Forge (full stack):**

```bash
# Requires Netlify CLI — runs Vite dev server + Netlify Functions locally
npm install -g netlify-cli
netlify dev
```

**Library only (no Forge):**

```bash
npm run dev
# http://localhost:5173
# Forge will show an error when used — everything else works fine
```

---

## Deployment (Netlify + GitHub)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "chore: initial prototype"
git remote add origin https://github.com/your-username/signal-hangar.git
git push -u origin main
```

### 2. Connect to Netlify

1. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. Select your GitHub repo
3. Build settings (auto-detected from `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`

### 3. Set environment variables

In Netlify → **Site settings → Environment variables**, add:

| Key | Value | Scope |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Builds |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Builds |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Functions |

> **Security note:** `ANTHROPIC_API_KEY` must NOT be prefixed with `VITE_`.
> The `VITE_` prefix embeds variables into the browser bundle. The Anthropic
> key stays server-side in the Netlify Function only.

### 4. Deploy

Netlify will auto-deploy on every push to `main`. The first deploy will also
be triggered when you save the environment variables.

---

## How Forge Works

1. Export prompts from the Library as `.md` files (each includes `rating:` in frontmatter)
2. Go to the **Forge** tab and drop in 2+ `.md` files
3. Configure synthesis options:
   - **Deep comparison** — identify structural differences and gaps
   - **Merge best patterns** — extract strongest sections from each
   - **Rating-weighted** — higher-rated files have more influence
   - **Suggest tags** — auto-generate keyword tags for the result
4. Click **Forge New Prompt**
   - The browser posts file contents + options to `/.netlify/functions/forge`
   - The Netlify Function calls the Anthropic API (server-side, key is never in the browser)
   - Returns: synthesised prompt + suggested keyword tags
5. Click **Save to Library** — opens the modal pre-filled with the result

---

## Database Schema

### `prompts`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, auto-generated |
| `title` | `text` | Required |
| `description` | `text` | One-line summary |
| `content` | `text` | Full prompt body |
| `rating` | `numeric(3,1)` | 0.0–5.0, checked constraint |
| `project_types` | `text[]` | GIN-indexed for fast filtering |
| `keywords` | `text[]` | GIN-indexed for fast filtering |
| `created_at` | `timestamptz` | Auto-set |
| `updated_at` | `timestamptz` | Auto-updated via trigger |

### `change_log`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `prompt_id` | `uuid` | FK → `prompts.id`, ON DELETE SET NULL |
| `prompt_title` | `text` | Preserved after prompt deletion |
| `action` | `text` | `created` \| `updated` \| `deleted` |
| `changes` | `jsonb` | `[{ field, from, to }]` — only on `updated` |
| `prev_rating` | `numeric(3,1)` | Only when rating changed |
| `new_rating` | `numeric(3,1)` | Only when rating changed |
| `created_at` | `timestamptz` | Auto-set |

---

## State Architecture

Two Zustand stores replace all prop-drilling:

**`usePromptStore`** — server state  
Holds `prompts[]`, `changelog[]`, `loading`, `error`.  
Exposes `loadAll()`, `createPrompt()`, `updatePrompt()`, `deletePrompt()`.  
Each mutation writes to Supabase and updates local state optimistically.

**`useUIStore`** — client state  
Holds active tab, search query, sort value, active type/keyword filters,
expanded row, detail overlay prompt, modal state (open/mode/initial/editing),
and toast state. All UI interactions go through this store — no `useState` in
page-level components.

---

## Adding Multi-User Support

The schema ships with permissive RLS (`using (true)`) for single-user use.
To isolate data per Supabase Auth user:

1. Add `user_id uuid not null default auth.uid()` to both tables
2. Enable Supabase Auth (Email, OAuth, etc.)
3. Replace the RLS policies:
   ```sql
   create policy "users_own_prompts"
     on prompts for all
     using (auth.uid() = user_id)
     with check (auth.uid() = user_id);
   ```
4. Add the Supabase Auth UI or a login page to the React app

---

## Known Prototype Limitations

- No authentication — the anon key gives full read/write access to anyone
  who knows your Supabase URL
- No error boundaries — uncaught render errors will crash the page
- No pagination — all prompts are fetched in a single query
- No offline support — requires network for all data operations
- Forge requires a paid Anthropic API key and is limited to the
  `claude-sonnet-4-20250514` model
- No automated tests

---

## License

MIT
