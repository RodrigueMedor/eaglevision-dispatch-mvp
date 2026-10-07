# Eagle Vision Dispatch — MVP Prototype

Client-demonstration prototype of the **Truck Dispatch Website & Operations Platform** described in
`Truck_Dispatch_Client_Proposal_With_Architecture.docx` (Eagle Vision Edge LLC, October 2026).

All data is **fictional sample data**, stored only in the browser (`localStorage`). Use **Reset demo** in the
prototype bar to restore it.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # serve the production build
```

Deploy `dist/` to any static host. `public/_redirects` provides the SPA fallback for Netlify.

## Prototype areas

| Area | Route | Notes |
|---|---|---|
| Brief | `/brief` | Project overview, guided demo walkthrough, architecture, roles, phases |
| Public website | `/`, `/about`, `/services`, `/services/:slug`, `/how-it-works`, `/pricing`, `/faq`, `/contact`, `/get-started`, `/privacy`, `/terms` | Box Truck is the featured segment |
| Carrier registration | `/get-started` | 6-step validated wizard → "Under Review" (try *Fill with sample data*) |
| Carrier portal | `/portal/*` | Dashboard, loads, load detail + timeline, trucks, drivers, documents, invoices, payments, messages, notifications, profile, support |
| Admin / dispatch | `/admin/*` | Dashboard, applications, carriers, drivers, trucks, loads, dispatch board (drag & drop), load board (demo), documents, invoices, payments, communication center, reports, users & roles, integrations, settings |
| Design system | `/design-system` | Tokens and component library |

The top **prototype bar** switches areas, previews **Desktop / Tablet / Mobile** (real-width iframe), switches
**role** (Super Admin, Admin, Dispatcher, Accounting, Support, Carrier, Driver) and resets the demo.

## Architecture

```
src/
  app/          prototype shell, routes, device preview
  components/   ui/ (Button, Form, Badge, Card, DataTable, Modal, Toast, Tabs, Timeline, Stepper, FileDrop…)
                charts/ (Recharts wrappers) · brand/ (logo, equipment silhouettes)
  data/         types.ts (domain model) · seed/ (fictional sample data + analytics history)
  services/     selectors.ts (read side) · commands.ts (workflow rules / write side)
  store/        DemoStore (persisted state) · hooks (actors, permissions)
  lib/          status maps, permissions (RBAC), fees, equipment catalog, formatting, tokens
  features/     public · onboarding · portal · admin · shared · brief · design-system
```

`src/services` mirrors the planned **Java 21 / Spring Boot** modules — each selector/command documents its future
REST endpoint, so the mock layer can be swapped for API calls (PostgreSQL, Redis, object storage) without
rewriting screens. Permissions in `src/lib/permissions.ts` map to future Spring Security authorities.

## What is mocked

Authentication, file uploads (file name only), SMS (Twilio), email, Google Maps, Stripe, QuickBooks, DocuSign and
load boards. **DAT / Truckstop data is sample data only** — live access requires authorized API agreements; nothing
is scraped. The dispatch fee (default 3%) is a configurable sample, not customer pricing.

## Live demo

https://eaglevision-dispatch-demo.netlify.app (start at `/brief`)

Redeploy after changes: `npm run build && netlify deploy --dir dist --no-build --prod`

## Photo credits

- `public/images/hero-us20-*.jpg` — "Truck on U.S. 20 east of Brothers" by OregonDOT
  (flickr.com/photos/28364885@N02/53991480962), licensed **CC BY 2.0**
  (creativecommons.org/licenses/by/2.0). Edited: advertising graphic on the trailer door removed, resized.
  Attribution is required and is shown on the homepage banner.
- `public/images/highway-*.jpg` — Bhargav Panchal on Unsplash (unsplash.com/photos/P0bVatS8Jdw), Unsplash License.
- `public/images/cascadia-*.jpg` — Robson Hatsukami Morgan on Unsplash (unsplash.com/photos/NKr0qBAkU4s), Unsplash License.

Inner-page banners rotate these photos (`PageHero photo=…`); each banner shows its credit line.
