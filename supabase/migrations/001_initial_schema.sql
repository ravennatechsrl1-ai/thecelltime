-- TheCellTime — Schema iniziale Supabase
-- Eseguire nel SQL Editor del progetto Supabase

-- Tabella prodotti
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL CHECK (category IN ('phones', 'accessories')),
  condition TEXT CHECK (condition IN ('new', 'used') OR condition IS NULL),
  brand TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabella ticket riparazione
CREATE TABLE IF NOT EXISTS repair_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  issue TEXT NOT NULL,
  estimated_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Ricevuto'
    CHECK (status IN ('Ricevuto', 'In Diagnostica', 'In Riparazione', 'Pronto al Ritiro')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indice per ricerca ticket
CREATE INDEX IF NOT EXISTS idx_repair_tickets_ticket_id ON repair_tickets (ticket_id);

-- Trigger aggiornamento updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS repair_tickets_updated_at ON repair_tickets;
CREATE TRIGGER repair_tickets_updated_at
  BEFORE UPDATE ON repair_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Abilita RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_tickets ENABLE ROW LEVEL SECURITY;

-- Policy prodotti: lettura pubblica
CREATE POLICY "Prodotti visibili a tutti"
  ON products FOR SELECT
  USING (true);

-- Policy prodotti: inserimento pubblico (in produzione restringere con auth)
CREATE POLICY "Inserimento prodotti"
  ON products FOR INSERT
  WITH CHECK (true);

-- Policy ticket: lettura per ticket_id (pubblico per tracker)
CREATE POLICY "Lettura ticket per tracking"
  ON repair_tickets FOR SELECT
  USING (true);

-- Policy ticket: inserimento pubblico (form prenotazione)
CREATE POLICY "Creazione ticket riparazione"
  ON repair_tickets FOR INSERT
  WITH CHECK (true);

-- Policy ticket: aggiornamento stato (admin — in produzione usare auth)
CREATE POLICY "Aggiornamento stato ticket"
  ON repair_tickets FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Bucket storage per immagini prodotti
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy storage: upload pubblico (in produzione restringere)
CREATE POLICY "Upload immagini prodotti"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Lettura immagini prodotti"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Aggiornamento immagini prodotti"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');

CREATE POLICY "Eliminazione immagini prodotti"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');

-- Abilita Realtime per repair_tickets (tracker live)
ALTER PUBLICATION supabase_realtime ADD TABLE repair_tickets;
