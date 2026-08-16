-- ====================================================================
-- SUPEROPTIMITZACIÓ I SEGURETAT DE LA BASE DE DADES (SUPABASE / POSTGRESQL)
-- DJ POSAXA PLATFORM
-- ====================================================================

-- 1. TAULA: song_requests (Peticions de cançons en directe)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.song_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_title VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255) NOT NULL DEFAULT 'Desconegut',
  album_art VARCHAR(500),
  preview_url VARCHAR(500),
  requester_name VARCHAR(100) DEFAULT 'Anònim',
  notes VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'played', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. ÍNDEXS D'ALTA VELOCITAT (OPTIMITZACIÓ DE CONSULTES)
-- ====================================================================

-- Índexs per a song_requests:
-- Permet filtrar instantàniament per estat (pending/played) i ordenar per data
CREATE INDEX IF NOT EXISTS idx_song_requests_status_created 
  ON public.song_requests (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_song_requests_created_at 
  ON public.song_requests (created_at DESC);

-- Índexs per a reservations (Reserves d'esdeveniments):
-- Accelera la càrrega del panell d'administració i del perfil d'usuari
CREATE INDEX IF NOT EXISTS idx_reservations_user_created 
  ON public.reservations (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reservations_status_date 
  ON public.reservations (status, event_date);

CREATE INDEX IF NOT EXISTS idx_reservations_created_at 
  ON public.reservations (created_at DESC);

-- Índexs per a messages (Xats entre clients i DJ Posaxa):
-- Permet carregar converses en mil·lisegons agrupades per usuari
CREATE INDEX IF NOT EXISTS idx_messages_user_created 
  ON public.messages (user_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_messages_created_at 
  ON public.messages (created_at DESC);

-- Índex per a tokens FCM de notificacions:
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_user_id 
  ON public.user_fcm_tokens (user_id);


-- 3. POLÍTIQUES DE SEGURETAT DE NIVELL DE FILA (ROW LEVEL SECURITY - RLS)
-- ====================================================================

-- Activar RLS a totes les taules crítiques
ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Netejar polítiques antigues si existeixen per evitar conflictes
DROP POLICY IF EXISTS "Allow public insert to song_requests" ON public.song_requests;
DROP POLICY IF EXISTS "Allow public select on song_requests" ON public.song_requests;
DROP POLICY IF EXISTS "Allow admin modify on song_requests" ON public.song_requests;
DROP POLICY IF EXISTS "Allow service role on song_requests" ON public.song_requests;

-- Polítiques per a song_requests:
-- A) Qualsevol persona pot demanar una cançó
CREATE POLICY "Allow public insert to song_requests" 
  ON public.song_requests 
  FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (length(song_title) > 0);

-- B) Tothom pot consultar les cançons per veure la llista en directe
CREATE POLICY "Allow public select on song_requests" 
  ON public.song_requests 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- C) Només administradors i Service Role poden actualitzar l'estat o eliminar peticions
CREATE POLICY "Allow service role full access on song_requests" 
  ON public.song_requests 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Polítiques per a reservations:
-- D) Usuaris autenticats només poden veure i crear les seves pròpies reserves
DROP POLICY IF EXISTS "Users can read own reservations" ON public.reservations;
CREATE POLICY "Users can read own reservations" 
  ON public.reservations 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reservations" ON public.reservations;
CREATE POLICY "Users can insert own reservations" 
  ON public.reservations 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full reservations" ON public.reservations;
CREATE POLICY "Service role full reservations" 
  ON public.reservations 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Polítiques per a messages:
-- E) Usuaris només poden veure i enviar missatges associats al seu user_id
DROP POLICY IF EXISTS "Users can read own messages" ON public.messages;
CREATE POLICY "Users can read own messages" 
  ON public.messages 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
CREATE POLICY "Users can insert own messages" 
  ON public.messages 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full messages" ON public.messages;
CREATE POLICY "Service role full messages" 
  ON public.messages 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Polítiques per a user_fcm_tokens:
DROP POLICY IF EXISTS "Users can manage own tokens" ON public.user_fcm_tokens;
CREATE POLICY "Users can manage own tokens" 
  ON public.user_fcm_tokens 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full fcm tokens" ON public.user_fcm_tokens;
CREATE POLICY "Service role full fcm tokens" 
  ON public.user_fcm_tokens 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- ====================================================================
-- FINALITZACIÓ: Comprovació d'estat
-- ====================================================================
ANALYZE public.song_requests;
ANALYZE public.reservations;
ANALYZE public.messages;
