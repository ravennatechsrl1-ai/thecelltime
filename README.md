# TheCellTime — Piattaforma E-Commerce & Riparazioni

Piattaforma mobile-first per vendita telefoni/accessori e gestione riparazioni, ispirata all'estetica industriale minimalista di Mobilax.

## Stack

- **Next.js 15** (App Router)
- **TypeScript** (strict, no `any`)
- **Tailwind CSS** (mobile-first)
- **Supabase** (database, storage, realtime)
- **Stripe** (checkout EUR)

## Setup

1. Installare le dipendenze:

```bash
npm install
```

2. Copiare le variabili d'ambiente:

```bash
cp .env.example .env.local
```

3. Configurare Supabase — eseguire lo script SQL in `supabase/migrations/001_initial_schema.sql` nel SQL Editor del progetto.

4. Avviare il server di sviluppo:

```bash
npm run dev
```

## Variabili d'ambiente

| Variabile | Descrizione |
|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chiave anonima Supabase |
| `STRIPE_SECRET_KEY` | Chiave segreta Stripe (server) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chiave pubblica Stripe |
| `NEXT_PUBLIC_SITE_URL` | URL deploy (es. `https://thecelltime.it`) |
| `ADMIN_PASSWORD` | Password pannello admin |

## Struttura

- `/` — Homepage
- `/shop` — Catalogo prodotti
- `/repair` — Prenotazione riparazione
- `/track` — Tracciamento stato ticket
- `/admin` — Pannello gestionale
- `/api/checkout` — Stripe Checkout Session

## Lingue (i18n)

Supporto multilingua integrato: **Italiano** (default), **English**, **Français**.

- Selettore lingua nell'header (IT / EN / FR)
- Preferenza salvata in `localStorage`
- Traduzioni in `lib/i18n/translations/`
- Prezzi formattati nella locale selezionata (sempre EUR)
