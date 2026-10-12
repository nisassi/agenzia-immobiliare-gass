-- =============================================================================
-- seed.sql  —  DEMONSTRATION DATA
-- -----------------------------------------------------------------------------
-- Everything below is clearly labeled sample content for development only.
-- It is NOT real agency information. Replace or delete it before launch.
--
-- Idempotent: every row uses a fixed UUID (or a fixed id for site_settings),
-- so the script can be run repeatedly without creating duplicates. To remove
-- all demo content later, delete the fixed ids listed below.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Site settings (demo)
-- ---------------------------------------------------------------------------
update public.site_settings set
  agency_name             = 'Agenzia Demo',
  tagline                 = 'Immobili selezionati in Italia',
  hero_eyebrow            = 'Immobili selezionati',
  hero_headline           = 'Spazi che meritano di essere raccontati',
  hero_subheadline        = 'Un servizio immobiliare curato e trasparente. Contenuto dimostrativo: personalizzalo dal pannello di amministrazione.',
  hero_primary_label      = 'Sfoglia gli immobili',
  hero_primary_href       = '/immobili',
  hero_secondary_label    = 'Richiedi una valutazione',
  hero_secondary_href     = '/contatti#valutazione',
  intro_title             = 'Un approccio su misura',
  intro_body              = 'Contenuto di esempio. Descrivi qui l''approccio della tua agenzia: consulenza, trasparenza e attenzione al dettaglio in ogni fase della compravendita o della locazione.',
  about_title             = 'Chi siamo',
  about_body              = 'Pagina di esempio. Racconta la storia della tua agenzia, il team e i valori che guidano il tuo lavoro. Evita qualifiche, premi o anni di esperienza finché non sono verificabili.',
  services_title          = 'I nostri servizi',
  services_subtitle       = 'Dalla vendita alla locazione, fino alla valutazione: un supporto completo.',
  contact_title           = 'Contattaci',
  contact_intro           = 'Scrivici per informazioni su un immobile o per richiedere una valutazione. I dati di contatto sottostanti sono segnaposto.',
  contact_email           = 'info@example.com',
  contact_phone           = '+39 000 000 0000',
  contact_address         = 'Via Esempio 1, 00100 Roma (RM) — indirizzo dimostrativo',
  opening_hours           = 'Lun–Ven 9:00–13:00 / 15:00–19:00',
  footer_note             = 'Sito dimostrativo. Contenuti e dati di contatto sono di esempio e vanno sostituiti prima della pubblicazione.',
  seo_default_title       = 'Agenzia Demo — Immobili in vendita e in affitto',
  seo_default_description = 'Consulta immobili in vendita e in affitto e richiedi una valutazione. Sito dimostrativo.'
where id = 1;

-- ---------------------------------------------------------------------------
-- Services (demo)
-- ---------------------------------------------------------------------------
insert into public.services (id, title, description, icon, sort_order, is_published) values
  ('a0000000-0000-4000-8000-000000000001', 'Vendita immobiliare', 'Assistenza completa nella vendita: valutazione, promozione dell''immobile e gestione delle trattative. Contenuto dimostrativo.', 'home', 1, true),
  ('a0000000-0000-4000-8000-000000000002', 'Locazione', 'Ricerca di inquilini affidabili e gestione dei contratti di affitto. Contenuto dimostrativo.', 'key', 2, true),
  ('a0000000-0000-4000-8000-000000000003', 'Valutazione immobiliare', 'Stima del valore di mercato dell''immobile sulla base di dati e comparabili. Contenuto dimostrativo.', 'calculator', 3, true),
  ('a0000000-0000-4000-8000-000000000004', 'Consulenza', 'Supporto su aspetti tecnici, catastali e finanziari legati all''acquisto o alla vendita. Contenuto dimostrativo.', 'compass', 4, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Properties (demo)
-- ---------------------------------------------------------------------------
insert into public.properties (
  id, slug, title, short_description, description,
  transaction_type, property_type, price, city, province, neighborhood,
  living_area, rooms, bedrooms, bathrooms, floor, year_built, energy_rating,
  amenities, cover_image_url, is_featured, status
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'demo-appartamento-centro-storico',
    'Demo — Appartamento in centro storico',
    'Appartamento luminoso con soffitti alti e finiture di pregio. Annuncio dimostrativo.',
    'Questo è un annuncio dimostrativo. Descrivi qui metratura, stato dell''immobile, esposizione, contesto e dotazioni. Sostituisci il testo con le informazioni reali prima della pubblicazione.',
    'sale', 'Appartamento', 420000, 'Firenze', 'Firenze', 'Centro storico',
    120, 5, 3, 2, '2', 1920, 'F',
    array['Balcone', 'Ascensore', 'Aria condizionata', 'Cantina'],
    '/images/demo/interior-1.svg', true, 'published'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'demo-villa-con-giardino',
    'Demo — Villa con giardino',
    'Villa indipendente con ampio giardino e zona giorno open space. Annuncio dimostrativo.',
    'Questo è un annuncio dimostrativo. Indica superfici interne ed esterne, numero di piani, esposizione, pertinenze e caratteristiche impiantistiche.',
    'sale', 'Villa', 890000, 'Bologna', 'Bologna', null,
    280, 8, 4, 3, null, 2005, 'C',
    array['Giardino', 'Garage doppio', 'Piscina', 'Camino'],
    '/images/demo/interior-2.svg', true, 'published'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'demo-bilocale-arredato-affitto',
    'Demo — Bilocale arredato in affitto',
    'Bilocale arredato con cucina abitabile, ideale per studenti o lavoratori. Annuncio dimostrativo.',
    'Questo è un annuncio dimostrativo. Specifica durata del contratto, spese incluse, dotazioni e disponibilità.',
    'rent', 'Appartamento', 850, 'Milano', 'Milano', 'Città Studi',
    55, 2, 1, 1, '3', 1975, 'D',
    array['Arredato', 'Ascensore', 'Portiere'],
    '/images/demo/interior-3.svg', false, 'published'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'demo-attico-con-terrazza',
    'Demo — Attico con terrazza panoramica',
    'Attico all''ultimo piano con terrazza e vista aperta. Annuncio dimostrativo.',
    'Questo è un annuncio dimostrativo. Descrivi la terrazza, l''esposizione e la vista, oltre alle dotazioni interne.',
    'sale', 'Attico', 1150000, 'Roma', 'Roma', 'Parioli',
    180, 6, 3, 3, '7', 1998, 'B',
    array['Terrazza', 'Ascensore', 'Aria condizionata', 'Box auto'],
    '/images/demo/interior-4.svg', true, 'published'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'demo-ufficio-centro-affitto',
    'Demo — Ufficio in centro',
    'Spazio per ufficio in palazzina signorile con sale riunioni. Annuncio dimostrativo.',
    'Questo è un annuncio dimostrativo. Indica la destinazione d''uso, la metratura, la divisione degli spazi e le dotazioni.',
    'rent', 'Ufficio', 2400, 'Torino', 'Torino', 'Centro',
    200, 6, null, 2, '1', 1960, 'D',
    array['Aria condizionata', 'Fibra ottica', 'Ascensore'],
    '/images/demo/interior-5.svg', false, 'published'
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'demo-terreno-edificabile',
    'Demo — Terreno edificabile',
    'Terreno edificabile in zona residenziale. Annuncio dimostrativo.',
    'Questo è un annuncio dimostrativo. Specifica destinazione urbanistica, indici, superficie e accessi.',
    'sale', 'Terreno', 260000, 'Pisa', 'Pisa', null,
    null, null, null, null, null, null, null,
    array['Zona residenziale'],
    '/images/demo/interior-6.svg', false, 'published'
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Gallery images (demo)
-- ---------------------------------------------------------------------------
insert into public.property_images (id, property_id, url, path, alt, sort_order) values
  ('b0000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', '/images/demo/interior-1.svg', null, 'Soggiorno (demo)', 0),
  ('b0000000-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', '/images/demo/interior-2.svg', null, 'Cucina (demo)', 1),
  ('b0000000-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', '/images/demo/interior-3.svg', null, 'Camera (demo)', 2),
  ('b0000000-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', '/images/demo/interior-2.svg', null, 'Villa (demo)', 0),
  ('b0000000-0000-4000-8000-000000000005', '22222222-2222-4222-8222-222222222222', '/images/demo/interior-4.svg', null, 'Giardino (demo)', 1),
  ('b0000000-0000-4000-8000-000000000006', '33333333-3333-4333-8333-333333333333', '/images/demo/interior-3.svg', null, 'Zona giorno (demo)', 0),
  ('b0000000-0000-4000-8000-000000000007', '44444444-4444-4444-8444-444444444444', '/images/demo/interior-4.svg', null, 'Terrazza (demo)', 0),
  ('b0000000-0000-4000-8000-000000000008', '44444444-4444-4444-8444-444444444444', '/images/demo/interior-1.svg', null, 'Soggiorno (demo)', 1),
  ('b0000000-0000-4000-8000-000000000009', '55555555-5555-4555-8555-555555555555', '/images/demo/interior-5.svg', null, 'Ufficio (demo)', 0),
  ('b0000000-0000-4000-8000-000000000010', '66666666-6666-4666-8666-666666666666', '/images/demo/interior-6.svg', null, 'Terreno (demo)', 0)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Sample inquiry (demo) — optional, shows the dashboard inbox populated
-- ---------------------------------------------------------------------------
insert into public.inquiries (id, type, name, email, phone, message, status, source_page)
values (
  'c0000000-0000-4000-8000-000000000001',
  'general',
  'Mario Rossi (demo)',
  'mario.rossi@example.com',
  '+39 000 000 0000',
  'Messaggio di esempio inviato dal modulo contatti. Può essere gestito o eliminato dal pannello.',
  'new',
  '/contatti'
)
on conflict (id) do nothing;
