# Sito web per agenzia immobiliare

Sito vetrina **premium per una singola agenzia immobiliare italiana**, con un
pannello di amministrazione realmente funzionante e dati persistenti su
Supabase. Non è un SaaS multi-tenant: ogni deployment ospita **una sola
agenzia**.

L'intero contenuto (immobili, testi, immagini, contatti) è gestibile dal
pannello `/admin` da persona non tecnica, senza toccare il codice.

---

## Indice

1. [Funzionalità](#funzionalità)
2. [Stack tecnologico](#stack-tecnologico)
3. [Avvio in locale](#avvio-in-locale)
4. [Variabili d'ambiente](#variabili-dambiente)
5. [Database: migrazioni, RLS e Storage](#database-migrazioni-rls-e-storage)
6. [Dati dimostrativi (seed)](#dati-dimostrativi-seed)
7. [Primo amministratore](#primo-amministratore)
8. [Gestione dei media](#gestione-dei-media)
9. [Deployment](#deployment)
10. [Guida all'uso per l'agenzia (handover)](#guida-alluso-per-lagenzia-handover)
11. [Sicurezza](#sicurezza)
12. [Test eseguiti e risultati](#test-eseguiti-e-risultati)
13. [Verifiche manuali ancora consigliate](#verifiche-manuali-ancora-consigliate)
14. [Cosa deve ancora fornire il cliente](#cosa-deve-ancora-fornire-il-cliente)
15. [Checklist legale e copyright pre-lancio](#checklist-legale-e-copyright-pre-lancio)
16. [Costi e servizi gratuiti](#costi-e-servizi-gratuiti)
17. [Struttura del progetto](#struttura-del-progetto)

---

## Funzionalità

### Sito pubblico

- **Homepage** — hero editoriale, immobili in evidenza, presentazione, blocco
  valutazione, form contatti.
- **Catalogo immobili** (`/immobili`) — filtri per contratto, tipologia, città,
  camere, prezzo, superficie; ordinamento (recenti, prezzo, superficie);
  paginazione. I filtri sono salvati nell'URL, quindi condivisibili e
  navigabili avanti/indietro.
- **Scheda immobile** (`/immobili/[slug]`) — URL con slug leggibile, galleria
  con lightbox, video (file caricato o link YouTube/Vimeo), tabella
  caratteristiche, form di richiesta informazioni, immobili correlati,
  dati strutturati JSON-LD per i motori di ricerca, immagine Open Graph.
- **Chi siamo**, **Servizi**, **Contatti** — tutte guidate dal contenuto
  editabile; la pagina contatti include sia il form di contatto sia quello di
  **richiesta di valutazione**.
- **Stati** — pagine 404 dedicate, pagina errore con possibilità di riprovare,
  stato di caricamento del catalogo.
- **SEO/tecniche** — `sitemap.xml` dinamica (include gli immobili pubblicati),
  `robots.txt`, metadata per pagina, titoli/descrizioni SEO editabili dal
  pannello.
- **Accessibilità** — struttura semantica, focus visibile, etichette dei campi,
  `aria-*` sui controlli, animazioni disattivate con `prefers-reduced-motion`.
- **Responsive** — layout mobile-first, navigazione con menu su mobile.

### Pannello di amministrazione (`/admin`)

- **Autenticazione sicura** con Supabase Auth (email + password), recupero
  password via email, nessuna registrazione pubblica.
- **Panoramica** — metriche reali (pubblicati, bozze, archiviati, in evidenza,
  richieste nuove) e ultimi contenuti/richieste.
- **Immobili** — elenco con ricerca e filtro per stato; creazione, modifica,
  pubblicazione, ritorno in bozza, archiviazione, evidenza, duplicazione ed
  eliminazione. Slug univoco generato automaticamente e controllato per evitare
  collisioni.
- **Media** — caricamento immagini multiple, scelta copertina, riordino
  galleria, eliminazione (con pulizia dei file su Storage); video caricato
  oppure link esterno.
- **Contenuti** — testi di tutte le pagine, colori del marchio, logo e immagini
  principali (upload), dati di contatto, social, nota di piè di pagina, SEO
  predefinita.
- **Servizi** — creazione, modifica, pubblicazione/nascondimento, ordinamento,
  eliminazione.
- **Richieste** — elenco filtrabile per stato (nuova / in lavorazione /
  gestita), dettagli completi, risposta via email, telefono, cambio stato ed
  eliminazione.

---

## Stack tecnologico

| Ambito        | Scelta                                                             |
| ------------- | ------------------------------------------------------------------ |
| Framework     | Next.js 16.4 (App Router, Turbopack), React 19                     |
| Linguaggio    | TypeScript in modalità `strict`                                    |
| Stile         | Tailwind CSS v4 (loader `@tailwindcss/turbopack`)                  |
| Backend / DB  | Supabase (Postgres + Auth + Storage + Row Level Security)          |
| Client DB     | `@supabase/supabase-js` + `@supabase/ssr`                          |
| Validazione   | Zod (lato server, prima di ogni scrittura)                         |
| Icone         | `lucide-react` (nessuna emoji, nessuna icona brand non licenziata) |
| Font          | `next/font` (Inter + Cormorant Garamond, open source)              |
| Hosting       | Netlify **o** Vercel o qualsiasi host Node (next start)            |

Nessuna dipendenza a pagamento, nessun tracker/analytics, nessuno script di
terze parti.

---

## Avvio in locale

Requisiti: **Node.js 20+** (testato con Node 26) e npm.

```bash
npm install
cp .env.example .env.local     # Windows PowerShell: Copy-Item .env.example .env.local
# inserisci le credenziali Supabase in .env.local (vedi sotto)
npm run dev
```

Apri http://localhost:3000.

> Il sito è progettato per **non andare in crash** quando il database non è
> ancora collegato: mostra un avviso di configurazione e contenuti segnaposto,
> così puoi vedere subito il layout mentre prepari Supabase.

Script disponibili:

| Comando         | Descrizione                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | server di sviluppo                   |
| `npm run build` | build di produzione                  |
| `npm run start` | avvia la build di produzione         |
| `npm run lint`  | ESLint                               |
| `npx tsc --noEmit` | controllo dei tipi TypeScript    |

---

## Variabili d'ambiente

Tutte le variabili sono documentate in [`.env.example`](./.env.example) (che
**non** contiene segreti ed è l'unico file `.env` versionato; `.env.local` è
escluso da Git).

| Variabile                              | Obbligatoria | Note                                                     |
| -------------------------------------- | :----------: | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             |      sì      | URL del progetto Supabase                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`        |      sì      | chiave **publishable/anon** (protetta da RLS)            |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`  |      no      | default `property-media`                                 |
| `NEXT_PUBLIC_MAX_IMAGE_UPLOAD_BYTES`   |      no      | default 10 MB                                            |
| `NEXT_PUBLIC_MAX_VIDEO_UPLOAD_BYTES`   |      no      | default 50 MB                                            |
| `NEXT_PUBLIC_SITE_URL`                 |      no      | URL pubblico canonico (sitemap, metadata)                |
| `RESEND_API_KEY`                       |      no      | email di notifica per nuove richieste                    |
| `INQUIRY_NOTIFICATION_EMAIL`           |      no      | destinatario delle notifiche                             |
| `INQUIRY_FROM_EMAIL`                   |      no      | mittente verificato su Resend                            |

> **Importante:** nel browser va **solo** la chiave `ANON`/publishable. La
> chiave **service-role** non deve mai comparire in una variabile `NEXT_PUBLIC_`,
> nel repository o nel codice client.

Le notifiche email sono **facoltative**: senza Resend le richieste vengono
comunque salvate nel database e visibili nel pannello.

---

## Database: migrazioni, RLS e Storage

I file SQL sono in [`supabase/`](./supabase) e vanno eseguiti **in quest'ordine**
dall'SQL Editor di Supabase (oppure con la CLI `supabase db push`):

1. [`supabase/migrations/0001_schema.sql`](./supabase/migrations/0001_schema.sql)
   — tabelle `admins`, `properties`, `property_images`, `services`,
   `site_settings`, `inquiries`; indici; vincoli e trigger per `updated_at` e
   `published_at`.
2. [`supabase/migrations/0002_rls.sql`](./supabase/migrations/0002_rls.sql)
   — attiva RLS su ogni tabella esposta e definisce le policy. La funzione
   `public.is_admin()` (`SECURITY DEFINER`, `set search_path = ''`) è l'unica
   fonte di autorizzazione.
3. [`supabase/migrations/0003_storage.sql`](./supabase/migrations/0003_storage.sql)
   — bucket pubblico `property-media` con lettura pubblica e scrittura
   riservata agli amministratori.

> **Scorciatoia:** [`supabase/setup.sql`](./supabase/setup.sql) è la
> concatenazione, nello stesso ordine, dei tre file. Incollalo una sola volta
> nell'SQL Editor e premi *Run*.

Regole di sicurezza effettive:

- **Anonimi** possono leggere solo immobili/servizi **pubblicati**, le immagini
  relative e le impostazioni del sito; possono **inserire** una richiesta
  (con vincoli di lunghezza e `status = 'new'`), ma **non** leggerle.
- **Solo gli amministratori** (riga in `public.admins`) possono creare,
  modificare o eliminare contenuti e caricare media.
- L'appartenenza ad `admins` non è mai auto-assegnabile: non esistono policy
  INSERT/UPDATE/DELETE su quella tabella.

### Schema (sintesi)

- `properties` — annuncio completo (slug univoco, contratto, tipologia, prezzo,
  ubicazione, superfici, locali, dotazioni `text[]`, copertina, video, stato,
  evidenza, SEO).
- `property_images` — galleria, con `sort_order`.
- `services` — servizi editabili (icona, immagine, ordine, pubblicazione).
- `site_settings` — riga singola (`id = 1`) con tutti i testi/immagini del sito.
- `inquiries` — richieste di contatto, informazioni immobile e valutazione.
- `admins` — elenco degli amministratori autorizzati.

---

## Dati dimostrativi (seed)

[`supabase/seed.sql`](./supabase/seed.sql) inserisce **contenuti di esempio**
chiaramente etichettati ("Demo — …"). Sono utili per vedere subito il sito
popolato e per provare il pannello.

- È **idempotente**: usa UUID fissi e `on conflict (id) do nothing`, quindi può
  essere rieseguito senza creare duplicati.
- Va **rimosso prima della pubblicazione** (vedi la checklist pre-lancio). Gli
  immobili demo usano UUID `11111111…` → `66666666…`, i servizi `a0000000…`,
  le immagini `b0000000…`, la richiesta `c0000000…`.

Le immagini demo sono **SVG originali** creati per questo progetto
(`public/images/demo/`), non materiale di terzi.

---

## Primo amministratore

Non esiste registrazione pubblica. Il primo amministratore si crea così:

1. **Supabase Dashboard → Authentication → Users → Add user**: crea l'account
   con l'email del titolare e una password robusta; conferma l'email (o
   disabilita la conferma per questo singolo utente).
2. Copia l'**UUID** dell'utente dalla tabella `auth.users`.
3. Esegui nell'SQL Editor (sostituendo i segnaposto):

   ```sql
   insert into public.admins (user_id, email)
   values ('<USER_UUID>', '<EMAIL_TITOLARE>')
   on conflict (user_id) do nothing;
   ```

Vedi il template [`supabase/admin_setup.sql`](./supabase/admin_setup.sql).

Per **revocare** l'accesso: `delete from public.admins where user_id = '<UUID>';`

### Accesso al pannello

- Nel sito pubblico c'è un collegamento **"Area riservata"** nell'header e nel
  footer (puntano a `/admin`). Nessuno deve digitare l'URL a mano.
- `/admin` reindirizza automaticamente: al **pannello** se hai già effettuato
  l'accesso, alla **pagina di login** altrimenti. È pronto anche il flusso di
  **recupero password** (`/admin/reset-password`).
- Quando un amministratore è connesso, il collegamento nell'header diventa
  **"Pannello"** (icona dashboard) per tornare rapidamente all'area riservata.
- **La sessione resta attiva**: i cookie di Supabase vengono impostati con
  scadenza a **400 giorni** e il `proxy.ts` rinnova il token a ogni richiesta,
  quindi l'utente rimane connesso anche chiudendo il browser. Per uscire si usa
  **"Esci"** dal pannello.
- La pagina di login è raggiungibile solo dopo che Supabase è configurato
  (altrimenti mostra l'avviso di configurazione). Se un amministratore già
  connesso apre `/admin/login`, viene reindirizzato direttamente al pannello.

---

## Gestione dei media

- I file vengono caricati **direttamente dal browser** verso Supabase Storage
  usando la sessione dell'amministratore: le policy di Storage verificano
  `is_admin()` lato database, quindi un utente non autorizzato non può scrivere
  anche se conoscesse il bucket.
- Dopo l'upload, il server registra la riga nel database (l'app non si fida del
  client per i dati strutturati).
- **Immagini**: JPG, PNG, WebP, AVIF, GIF. Prima immagine caricata = copertina
  automatica. Riordino, cambio copertina ed eliminazione sono nel pannello.
- **Video**: upload diretto (MP4/WebM/MOV) **oppure** link esterno
  (YouTube/Vimeo consigliato per i file grandi). I link esterni vengono
  incorporati tramite iframe solo per domini riconosciuti.
- **Pulizia**: eliminando un'immagine o un immobile vengono rimossi i file non
  più referenziati. Duplicando un immobile le immagini condividono i file
  originali (non vengono cancellate finché esiste almeno un riferimento).
- **Limiti** (configurabili): 10 MB immagini, 50 MB video; sul bucket è
  impostato un tetto di 50 MB e una allow-list di MIME.

---

## Deployment

L'app è un normale progetto Next.js: funziona su **Vercel** (consigliato),
**Netlify** o un server Node.

> Prerequisiti: schema applicato su Supabase (`supabase/setup.sql`), primo
> amministratore creato, e codice caricato su un repository Git
> (GitHub/GitLab/Bitbucket).

### Vercel (consigliato)

1. **Repository** — esegui il primo commit e carica il progetto su GitHub
   (Vercel importa da lì). `.env.local` è escluso da Git: i segreti non vengono
   mai inviati al repository.
2. **Import** — su Vercel: *Add New → Project* → seleziona il repository. Vercel
   rileva Next.js automaticamente; **non** servono comandi di build
   personalizzati (*Build Command* `next build`, *Output* gestito dal preset).
3. **Environment Variables** — aggiungile per *Production*, *Preview* e
   *Development* con **gli stessi nomi** di `.env.example`:

   | Variabile | Obbligatoria | Valore |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | ✅ | `https://jqyglzcotjctnjlnpjgs.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | la chiave publishable |
   | `NEXT_PUBLIC_SITE_URL` | ✅ | dominio finale, es. `https://tuodominio.it` |
   | `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | ➖ | `property-media` (default) |
   | `NEXT_PUBLIC_MAX_IMAGE_UPLOAD_BYTES` | ➖ | `10485760` |
   | `NEXT_PUBLIC_MAX_VIDEO_UPLOAD_BYTES` | ➖ | `52428800` |
   | `RESEND_API_KEY` · `INQUIRY_NOTIFICATION_EMAIL` · `INQUIRY_FROM_EMAIL` | ➖ | solo per le notifiche email |

   > ⚠️ **Mai** aggiungere la **service-role key**: serve solo lato server e non
   > va mai usata in questo progetto (né su Vercel né nel browser).

4. **Node.js** — Next.js 16 richiede **Node ≥ 20.9**; Vercel usa una versione
   LTS recente. `package.json` dichiara `engines.node` in modo coerente. Per
   fissarla: *Settings → General → Node.js Version*.
5. **Deploy** — Vercel esegue `npm install` e `next build`.
6. **Dominio** — *Settings → Domains*: aggiungi il dominio e configura il DNS.
   Vercel genera il certificato **HTTPS** automaticamente.

Se `NEXT_PUBLIC_SITE_URL` non è impostata, l'app usa automaticamente il dominio
Vercel (`VERCEL_PROJECT_PRODUCTION_URL`), quindi anche le anteprime hanno
canonical e sitemap sensati.

### Dopo il primo deploy (obbligatorio)

- **Supabase → Authentication → URL Configuration**:
  - *Site URL*: `https://tuodominio.it`
  - *Redirect URLs*: `https://tuodominio.it/admin/reset-password` (e, per le
    anteprime, `https://*-<progetto>.vercel.app/**`).

  Senza questo passaggio il **recupero password** e i link nelle email non
  funzionano.
- Verifica che **HTTPS** sia attivo (necessario per cookie e sessioni sicure).
- **Hardening**: disattiva la **registrazione pubblica** su Supabase
  (*Authentication → Sign In / Up → "Allow new users to sign up"*).

### Netlify (alternativa)

1. Collega il repository (o installa la CLI, `npm i -g netlify-cli`).
2. Il plugin ufficiale `@netlify/plugin-nextjs` è rilevato automaticamente.
3. Imposta le stesse variabili d'ambiente.
4. Deploy.

### Checklist post-deploy

- [ ] `/` risponde 200 e mostra i **tuoi** contenuti (non quelli demo).
- [ ] `/immobili` elenca gli immobili pubblicati.
- [ ] `/admin` reindirizza al login; l'accesso con l'account admin funziona.
- [ ] `/sitemap.xml` e `/robots.txt` puntano al dominio reale.
- [ ] Invio del modulo contatti → riga visibile in *Richieste*.
- [ ] Upload di un'immagine dal pannello riesce.
- [ ] *(Se configurato)* email di notifica ricevuta.

---

## Guida all'uso per l'agenzia (handover)

1. Accedi su `https://tuodominio.it/admin` con le credenziali fornite.
2. **Contenuti** — sostituisci nome agenzia, logo, colori, testi di home/pagine,
   indirizzo/telefono/email, social e SEO. Salva.
3. **Immobili → Nuovo immobile** — compila i dati, salva (viene creato come
   bozza), poi carica le foto e imposta la copertina nella sezione Media.
4. Imposta lo stato su **Pubblicato** quando l'annuncio è pronto; usa
   **In evidenza** per mostrarlo in homepage.
5. **Servizi** — adatta i servizi offerti (titolo, descrizione, icona, ordine).
6. **Richieste** — controlla i messaggi ricevuti; puoi rispondere via email,
   chiamare, segnare come gestite o eliminare.
7. Per modificare un testo del sito non serve un tecnico: tutto è nel pannello.

---

## Sicurezza

- Autorizzazione applicata **nel database** (RLS), non solo nell'interfaccia.
- Gli slug sono normalizzati e resi univoci lato server.
- Tutti gli input sono validati con **Zod** prima della scrittura.
- Nessuna chiave privilegiata nel client; nel browser solo la chiave anon.
- La funzione `is_admin()` usa `set search_path = ''` per prevenire hijacking.
- `proxy.ts` rinnova solo la sessione; **non** prende decisioni di
  autorizzazione (che restano in layout/server action).

---

## Test eseguiti e risultati

Tutto quanto segue è stato eseguito realmente su questo repository
(Windows, Node 26, npm 11):

| Verifica                          | Comando                    | Risultato |
| --------------------------------- | -------------------------- | --------- |
| Controllo tipi (TypeScript strict)| `npx tsc --noEmit`         | ✅ 0 errori |
| Lint                              | `npm run lint`             | ✅ 0 errori/0 avvisi |
| Build di produzione               | `npm run build`            | ✅ compilata |
| Avvio server di sviluppo          | `npm run dev`              | ✅ attivo su :3000 |

Rotte generate dalla build:

```
ƒ /                     ƒ /immobili            ƒ /admin
○ /_not-found           ƒ /immobili/[slug]     ƒ /admin/contenuti
ƒ /chi-siamo            ○ /robots.txt          ƒ /admin/immobili
ƒ /contatti             ƒ /sitemap.xml         ƒ /admin/immobili/[id]
ƒ /servizi                                     ƒ /admin/immobili/nuovo
                                               ƒ /admin/login
                                               ○ /admin/reset-password
                                               ƒ /admin/richieste
                                               ƒ /admin/servizi
                                               ○ /admin/unauthorized
```

### Verifica con database reale (progetto Supabase collegato)

Il sito è stato avviato con `.env.local` puntato al progetto reale
(`https://jqyglzcotjctnjlnpjgs.supabase.co`) e verificato dal vivo.

Codici di stato HTTP (server di sviluppo, `curl`):

| URL | Esito osservato |
| --- | --- |
| `/` | ✅ hero e testi letti da `site_settings`; **nessun** avviso di configurazione |
| `/immobili` | ✅ filtri, ordinamento e stato "nessun immobile" |
| `/chi-siamo`, `/servizi`, `/contatti` | ✅ rendono; entrambi i form presenti |
| `/immobili/non-esiste` | ✅ "Immobile non trovato" + **HTTP 404** |
| `/pagina-inesistente` | ✅ **HTTP 404** |
| `/admin` e tutte le sotto-rotte | ✅ **HTTP 307** → `/admin/login` (anonimo) |
| `/admin/login` | ✅ form di accesso (HTTP 200) |
| `/sitemap.xml`, `/robots.txt` | ✅ validi; robots esclude `/admin` |

RLS provata con la **sola chiave anon** (REST API) — è il vero confine di
sicurezza:

| Test (chiave anon) | Atteso | Osservato |
| --- | --- | --- |
| `rpc is_admin()` | `false` | ✅ `false` |
| `select` su `properties` | solo pubblicati | ✅ nessuna bozza visibile |
| `insert` su `properties` | rifiutato | ✅ `42501` violazione RLS |
| `update` su `site_settings` | 0 righe modificate | ✅ valore invariato |
| `select` su `inquiries` / `admins` | nascosti | ✅ risultato vuoto |
| `insert` su `inquiries` | consentito | ✅ **HTTP 201** |
| upload Storage (anon) | rifiutato | ✅ **403 AccessDenied** |
| lettura Storage pubblica | consentita | ✅ policy applicata |

Flusso amministratore con l'account reale dell'agenzia:

| Passo | Esito |
| --- | --- |
| Login su `/admin/login` | ✅ `POST` → sessione creata |
| `/admin` (overview) | ✅ HTTP 200 |
| `/admin/immobili` | ✅ HTTP 200 |
| `/admin/immobili/nuovo` | ✅ HTTP 200 |

> Nota: la pagina di caricamento del catalogo è stata confinata al solo elenco
> (`immobili/(list)/loading.tsx`) in modo che la scheda immobile restituisca un
> vero `404` e non un "soft 404".

---

## Verifiche manuali ancora consigliate

Il codice è collegato e funzionante sul progetto reale. Restano da provare
interattivamente le operazioni che non sono state eseguite automaticamente:

1. **CRUD completo di un immobile** — crea → salva bozza → carica immagini →
   imposta copertina → riordina → pubblica → verifica la scheda pubblica →
   duplica → elimina.
2. **Upload Storage dal pannello** — verifica i MIME consentiti e il
   dimensionamento; un utente non-admin **non** deve poter caricare.
3. **Modifica contenuti sito** — cambia nome/testi in *Contenuti* e verifica
   l'aggiornamento sul sito pubblico.
4. **Gestione richieste** — cambia lo stato di una richiesta e verifica i filtri.
5. **Recupero password** — imposta i *Redirect URL* in Supabase e completa il
   flusso.
6. **Email (facoltativa)** — configura Resend e verifica la ricezione.

### Hardening consigliato su Supabase

- **Disattiva la registrazione pubblica** (Authentication → Sign In / Up →
  "Allow new users to sign up"). Gli utenti non-admin non possono comunque
  accedere al pannello (serve la riga in `public.admins`), ma la registrazione
  aperta consente di creare account inutili.
- Imposta **Site URL** e **Redirect URLs** sul dominio di produzione (necessario
  per reset password e link nelle email).
- Imposta `NEXT_PUBLIC_SITE_URL` sul dominio reale (oggi `http://localhost:3000`,
  usato da `sitemap.xml` e `robots.txt`).

---

## Cosa deve ancora fornire il cliente

- **Progetto Supabase** (gratuito) e relative chiavi URL + anon.
- **Account admin** del titolare (email + password robusta).
- **Dominio** (o sottodominio) da collegare all'hosting.
- **Contenuti reali**: nome dell'agenzia, logo, testi, numeri di telefono,
  email, indirizzo, orari, social, P.IVA/REA se da mostrare.
- **Foto degli immobili** originali (di cui possiede i diritti).
- **Recapiti/comparabili** per i servizi (es. valutazioni) se presenti.
- Eventuale **logo** in alta risoluzione (PNG o WebP con sfondo trasparente;
  il caricamento rifiuta gli SVG per motivi di sicurezza).
- Conferma dei **testi legali** (privacy/cookie) se deciderà di aggiungerli.
- (Facoltativo) **Resend** o altro servizio email per le notifiche.

---

## Checklist legale e copyright pre-lancio

Il sito **non** include pagine privacy/cookie né banner di consenso: sono stati
volutamente rinviati. Prima della pubblicazione:

- [ ] Rimuovere **tutti** i contenuti dimostrativi (immobili/servizi/richieste
      demo) e sostituirli con dati reali; eliminare anche le immagini
      `public/images/demo/`.
- [ ] Verificare che **ogni foto** e ogni logo sia di proprietà dell'agenzia o
      regolarmente licenziato; non usare immagini trovate online.
- [ ] Controllare che i **testi** non millantino premi, certificazioni, anni di
      attività, numero di immobili o recensioni non documentabili.
- [ ] Predisporre **Privacy Policy** e informativa sul trattamento dei dati
      (i form raccolgono nome, email, telefono, messaggio): obbligatorie se il
      sito è rivolta al pubblico.
- [ ] Predisporre i **cookie**: attualmente il sito non installa cookie di
      profilazione né analitici. I cookie tecnici legati all'autenticazione
      dell'area riservata vanno comunque dichiarati.
- [ ] Inserire **dati societari** se richiesti (ragione sociale, P.IVA, REA,
      sede).
- [ ] Verificare la conformità dell'eventuale **modulo di valutazione** a
      eventuali obblighi professionali locali.
- [ ] Non inventare conformità GDPR: nessun banner/consenso fittizio è incluso.

---

## Costi e servizi gratuiti

- **Supabase Free** — Postgres, Auth, Storage e RLS. Nota: i progetti gratuiti
  vanno in pausa se inattivi; valutare il piano a pagamento per la produzione.
- **Netlify / Vercel** — piani gratuiti adatti a un sito vetrina; verificare i
  limiti di banda/funzioni del piano scelto.
- **Resend** (facoltativo) — piano gratuito con limiti di invio.
- **Font** (Inter, Cormorant Garamond) e **icone** (Lucide) sono open source.

Verificare sempre i termini d'uso commerciale dei piani gratuiti scelti.

---

## Struttura del progetto

```
src/
  app/
    (site)/            pagine pubbliche (home, immobili, servizi, chi-siamo, contatti)
    admin/
      login/           accesso e azioni di autenticazione
      reset-password/  impostazione nuova password
      (panel)/         pannello protetto (panoramica, immobili, richieste, servizi, contenuti)
    layout.tsx         layout radice, font, metadata, colore del marchio
    sitemap.ts / robots.ts
  components/          componenti UI (pubblici e admin)
  lib/
    queries.ts         lettura dati pubblici
    admin-queries.ts   lettura dati amministrazione
    validation.ts      schemi Zod
    auth.ts            guardie di autorizzazione
    env.ts             variabili d'ambiente e rilevamento configurazione
    supabase/          client browser/server e refresh sessione
  proxy.ts             refresh sessione Supabase (Next 16 "middleware")
supabase/
  migrations/          schema, RLS, storage
  seed.sql             dati dimostrativi
  admin_setup.sql      template di provisioning del primo admin
public/images/         asset originali (hero + demo)
```

---

## Note sul brand

Il colore d'accento è configurabile dal pannello (default `#8A6A45` con variante
scura `#6B5236`) e viene iniettato come variabili CSS, quindi pulsanti, link e
accenti si adattano automaticamente al marchio dell'agenzia.
