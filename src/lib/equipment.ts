import type { EquipmentType } from '@/data/types'

export interface EquipmentInfo {
  type: EquipmentType
  /** URL slug used by /services/:slug */
  slug: string
  label: string
  short: string
  tagline: string
  description: string
  sizes: string[]
  freight: string[]
  highlights: { title: string; body: string }[]
  idealFor: string[]
  requirements: string[]
  featured?: boolean
}

export const EQUIPMENT: EquipmentInfo[] = [
  {
    type: 'box-truck',
    slug: 'box-truck',
    label: 'Box Truck',
    short: '16–26 ft straight box trucks',
    tagline: 'Keep your box truck loaded with steady local, regional and expedited freight.',
    description:
      'Box trucks are our core segment. We dispatch 16 ft, 20 ft, 24 ft and 26 ft box trucks — with or without liftgates — on LTL, partial, final-mile and dedicated regional freight, so non-CDL and CDL owner-operators can build consistent weekly revenue.',
    sizes: ["16' Box", "20' Box", "24' Box", "26' Box (most common)", 'Liftgate / pallet jack equipped'],
    freight: ['Retail & e-commerce pallets', 'Final-mile & white glove', 'Furniture & appliances', 'Expedited partials', 'Trade show & event freight'],
    highlights: [
      { title: 'Box-truck-friendly brokers', body: 'We build relationships with brokers who regularly post box-truck and partial loads, not just 53 ft van freight.' },
      { title: 'Liftgate & pallet-jack matching', body: 'We track your accessories so you only get loads that fit your setup and dock capabilities.' },
      { title: 'Back-to-back planning', body: 'We plan reloads near your delivery to cut deadhead and keep your truck earning all week.' },
    ],
    idealFor: ['Non-CDL owner-operators', 'Small box-truck fleets', 'New authorities building broker history'],
    requirements: ['Active MC/DOT authority', 'Auto liability & cargo insurance', 'W-9 and signed dispatch agreement'],
    featured: true,
  },
  {
    type: 'dry-van',
    slug: 'dry-van',
    label: 'Dry Van',
    short: "48' and 53' enclosed trailers",
    tagline: 'Consistent general-freight dispatch for 53 ft dry van operators.',
    description:
      'We source and negotiate full-truckload dry van freight across the lower 48, focusing on lanes that match your home time and target rate per mile.',
    sizes: ["53' Dry Van", "48' Dry Van", 'Air-ride / logistics posts'],
    freight: ['Consumer packaged goods', 'Paper & packaging', 'Beverages', 'Retail distribution'],
    highlights: [
      { title: 'Lane strategy', body: 'We map strong outbound and reload markets so your van is not stuck in a cold region.' },
      { title: 'Rate negotiation', body: 'Every load is negotiated against current market averages before it reaches you.' },
      { title: 'Paperwork handled', body: 'Rate confirmations, broker packets and invoices are managed by our back office.' },
    ],
    idealFor: ['Owner-operators with their own trailer', 'Small fleets (1–20 trucks)'],
    requirements: ['Active MC/DOT authority', 'Auto liability & cargo insurance', 'W-9'],
  },
  {
    type: 'reefer',
    slug: 'reefer',
    label: 'Reefer',
    short: 'Temperature-controlled freight',
    tagline: 'Temperature-controlled dispatch with appointment-driven planning.',
    description:
      'Reefer freight is time-sensitive. We plan around strict appointments, pre-cool requirements and food-grade standards, and keep you informed at every check call.',
    sizes: ["53' Reefer", "48' Reefer", 'Multi-temp units'],
    freight: ['Produce', 'Frozen foods', 'Dairy & meat', 'Pharmaceuticals'],
    highlights: [
      { title: 'Appointment management', body: 'We coordinate pickup and delivery appointments and lumper requirements in advance.' },
      { title: 'Temperature details captured', body: 'Set points and continuous/cycle requirements are documented on every load.' },
      { title: 'Produce-season planning', body: 'We position you for seasonal produce lanes for stronger rates.' },
    ],
    idealFor: ['Reefer owner-operators', 'Food-grade fleets'],
    requirements: ['Reefer breakdown coverage recommended', 'Auto liability & cargo insurance', 'W-9'],
  },
  {
    type: 'flatbed',
    slug: 'flatbed',
    label: 'Flatbed',
    short: 'Open-deck & securement freight',
    tagline: 'Open-deck freight with tarp, securement and permit details handled up front.',
    description:
      'Flatbed loads come with extra details — tarps, straps, chains, dimensions and permits. We confirm every requirement before booking so there are no surprises at the shipper.',
    sizes: ["48' Flatbed", "53' Flatbed", 'Conestoga'],
    freight: ['Steel & metals', 'Lumber & building materials', 'Machinery', 'Pipe & construction'],
    highlights: [
      { title: 'Securement verified', body: 'We confirm tarp, strap and chain requirements on every rate confirmation.' },
      { title: 'Over-dimension awareness', body: 'Dimension and permit needs are flagged before you commit.' },
      { title: 'Construction-season lanes', body: 'We track building-material demand to keep your deck loaded.' },
    ],
    idealFor: ['Flatbed owner-operators', 'Open-deck fleets'],
    requirements: ['Securement equipment', 'Auto liability & cargo insurance', 'W-9'],
  },
  {
    type: 'step-deck',
    slug: 'step-deck',
    label: 'Step Deck',
    short: 'Drop-deck for taller freight',
    tagline: 'Step deck dispatch for taller machinery and equipment freight.',
    description:
      'Step decks move freight that is too tall for a standard flatbed. We source machinery, equipment and specialized loads that fit your deck heights and ramps.',
    sizes: ["48' Step Deck", "53' Step Deck", 'With ramps'],
    freight: ['Machinery', 'Agricultural equipment', 'Vehicles', 'Tall construction materials'],
    highlights: [
      { title: 'Height & ramp matching', body: 'Deck heights and ramp availability are part of every match.' },
      { title: 'Specialized brokers', body: 'We work with brokers who regularly move equipment freight.' },
      { title: 'Permit coordination', body: 'We flag permit and escort requirements early.' },
    ],
    idealFor: ['Step deck owner-operators', 'Equipment haulers'],
    requirements: ['Securement equipment', 'Auto liability & cargo insurance', 'W-9'],
  },
  {
    type: 'hotshot',
    slug: 'hotshot',
    label: 'Hotshot',
    short: 'Expedited gooseneck & smaller loads',
    tagline: 'Fast-moving expedited freight for hotshot and gooseneck setups.',
    description:
      'Hotshot freight moves fast. We monitor expedited loads that fit your gooseneck or bumper-pull trailer and weight limits, and react quickly when time-critical freight appears.',
    sizes: ["40' Gooseneck", "30'–34' Gooseneck", 'Dually + bumper pull'],
    freight: ['Oilfield parts', 'Expedited machinery', 'Construction materials', 'Agricultural equipment'],
    highlights: [
      { title: 'Expedited response', body: 'We act quickly on hot loads that fit your weight and length limits.' },
      { title: 'Weight-aware matching', body: 'We respect your GVWR and CDL/non-CDL limitations.' },
      { title: 'Regional loops', body: 'We build regional loops to keep you closer to home.' },
    ],
    idealFor: ['Hotshot owner-operators', 'New-authority carriers'],
    requirements: ['Active MC/DOT authority', 'Auto liability & cargo insurance', 'W-9'],
  },
  {
    type: 'power-only',
    slug: 'power-only',
    label: 'Power Only',
    short: 'Tractor-only trailer moves',
    tagline: 'Power-only dispatch for tractors pulling customer-provided trailers.',
    description:
      'Power-only loads let you haul pre-loaded or drop trailers without owning a trailer. We source drop-and-hook, trailer repositioning and pool freight.',
    sizes: ['Day cab', 'Sleeper tractor'],
    freight: ['Drop & hook freight', 'Trailer repositioning', 'Drop trailer pools', 'Dedicated shuttles'],
    highlights: [
      { title: 'Drop & hook focus', body: 'We prioritize drop-and-hook freight to reduce dwell time.' },
      { title: 'Trailer interchange handled', body: 'Interchange agreements and trailer details are managed for you.' },
      { title: 'Low startup cost', body: 'Earn with a tractor only — no trailer investment required.' },
    ],
    idealFor: ['Tractor owner-operators', 'Carriers between trailers'],
    requirements: ['Trailer interchange coverage', 'Auto liability & cargo insurance', 'W-9'],
  },
  {
    type: 'straight-truck',
    slug: 'straight-truck',
    label: 'Straight Truck',
    short: 'Commercial straight trucks',
    tagline: 'Commercial straight-truck dispatch for local and regional freight.',
    description:
      'Straight trucks fill the gap between cargo vans and tractor-trailers. We dispatch dock-high and liftgate straight trucks on local delivery, regional and expedited freight.',
    sizes: ['Dock-high straight truck', 'Liftgate straight truck', 'Stake bed'],
    freight: ['Local distribution', 'Building supplies', 'Expedited partials', 'Retail store deliveries'],
    highlights: [
      { title: 'Local & regional', body: 'Most loads keep you within a day of home.' },
      { title: 'Dock & liftgate matching', body: 'Loads are matched to your dock height and liftgate capability.' },
      { title: 'Consistent shippers', body: 'We look for recurring shipper freight for weekly consistency.' },
    ],
    idealFor: ['Local fleets', 'Owner-operators'],
    requirements: ['Active MC/DOT authority', 'Auto liability & cargo insurance', 'W-9'],
  },
]

export const EQUIPMENT_BY_TYPE = Object.fromEntries(EQUIPMENT.map((e) => [e.type, e])) as Record<EquipmentType, EquipmentInfo>

export const equipmentLabel = (t: EquipmentType) => EQUIPMENT_BY_TYPE[t].label

export const equipmentBySlug = (slug: string) => EQUIPMENT.find((e) => e.slug === slug)
