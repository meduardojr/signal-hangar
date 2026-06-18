import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Warn in dev; in prod the app will still mount but data calls will fail
  // with a descriptive message surfaced by the store.
  console.warn(
    '[SignalHangar] Supabase credentials missing.\n' +
    'Copy .env.example → .env and fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(
  supabaseUrl  ?? '',
  supabaseAnonKey ?? ''
)
