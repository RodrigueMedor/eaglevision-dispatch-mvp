/**
 * Public website copy. Placeholder marketing content for client review —
 * final copy, contact details and pricing are supplied/approved by the client.
 */
import {
  BadgeDollarSign,
  CalendarClock,
  ClipboardList,
  FileCheck,
  Handshake,
  Headphones,
  MapPin,
  Route,
  Search,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Timer,
  Truck,
  Wallet,
  Waypoints,
} from 'lucide-react'

export const CONTACT = {
  phone: '(800) 555-0199',
  email: 'dispatch@eaglevisiondispatch.demo',
  hours: 'Dispatch desk: Mon–Sat 6 AM – 10 PM ET · After-hours support for active loads',
  address: 'Orlando, FL (sample address)',
}

export const SERVICES = [
  { icon: Search, title: 'Load Sourcing', body: 'We search load boards and broker networks for freight that matches your equipment, lanes and target rate.' },
  { icon: Handshake, title: 'Rate Negotiation', body: 'Every load is negotiated before it reaches you, so you are not leaving money on the table.' },
  { icon: ClipboardList, title: 'Broker Setup', body: 'We complete broker packets and carrier setups so you are ready to haul when the right load appears.' },
  { icon: FileCheck, title: 'Paperwork & Billing', body: 'Rate confirmations, BOLs, PODs and invoices handled by our back office.' },
  { icon: Route, title: 'Route & Reload Planning', body: 'We plan around your home time and line up reloads to minimize deadhead miles.' },
  { icon: Headphones, title: 'Dedicated Dispatcher', body: 'A dispatcher who knows your truck, your lanes and how you like to run.' },
  { icon: CalendarClock, title: 'Compliance Reminders', body: 'Insurance, registration and license expiration reminders before they become a problem.' },
  { icon: Wallet, title: 'Payment Tracking', body: 'See invoices, broker payments and dispatch fees in one transparent portal.' },
]

export const WHY_US = [
  { icon: Truck, title: 'Box truck specialists', body: 'Box trucks are a core segment — not an afterthought behind 53 ft vans.' },
  { icon: ShieldCheck, title: 'You stay in control', body: 'No forced dispatch. You approve every load before it is booked.' },
  { icon: BadgeDollarSign, title: 'Transparent fees', body: 'A simple percentage per load you can see on every invoice — no hidden charges.' },
  { icon: Smartphone, title: 'Real carrier portal', body: 'Loads, documents, invoices and messages in one mobile-friendly portal.' },
]

export const BENEFITS = [
  { icon: TrendingUp, stat: 'More loaded miles', body: 'Planned reloads and lane strategy keep your truck earning, not waiting.' },
  { icon: Timer, stat: 'Hours back every week', body: 'Stop scrolling load boards and calling brokers after a long day of driving.' },
  { icon: MapPin, stat: 'Lanes that fit your life', body: 'Local, regional or OTR — we plan around your preferred states and home time.' },
  { icon: Waypoints, stat: 'Fewer surprises', body: 'Appointment times, accessorials and requirements confirmed before you roll.' },
]

export const WHAT_WE_HANDLE = [
  'Load searching on authorized load boards',
  'Broker credit and payment-history checks',
  'Rate negotiation & rate confirmations',
  'Broker packets & carrier setup',
  'Pickup and delivery appointment scheduling',
  'Check calls & status updates to brokers',
  'Detention, layover & TONU requests',
  'BOL / POD collection and filing',
  'Invoicing and payment follow-up',
  'Lumper receipts & accessorial paperwork',
  'Insurance & document expiration reminders',
  'Factoring company coordination (if used)',
]

export const HOW_IT_WORKS = [
  { title: 'Apply online', body: 'Complete the carrier application in about 10 minutes — company, equipment, lanes and documents.' },
  { title: 'Get approved & onboarded', body: 'We verify authority and insurance, sign the dispatch agreement and set up your carrier portal.' },
  { title: 'We find & book loads', body: 'Your dispatcher sources and negotiates freight that matches your preferences. You approve every load.' },
  { title: 'Drive — we handle the rest', body: 'Upload BOL/POD from your phone. We handle billing, follow-up and keep your next load lined up.' },
]

export const WORKFLOW = [
  'Load opportunity identified',
  'Carrier / truck matched',
  'Rate reviewed or negotiated',
  'Carrier approval',
  'Rate confirmation',
  'Load dispatched',
  'Pickup confirmed',
  'In transit',
  'Delivery confirmed',
  'POD / BOL uploaded',
  'Invoice & dispatch fee',
  'Completed',
]

export const TESTIMONIALS = [
  { quote: 'I run a 26 ft box truck out of Orlando. Before, I spent nights on load boards. Now my dispatcher has my next load lined up before I deliver.', name: 'Sample Owner-Operator', role: 'Box truck · Florida', rating: 5 },
  { quote: 'The portal is the big difference. Rate cons, PODs and payments are all in one place on my phone.', name: 'Sample Fleet Owner', role: '4 trucks · Georgia', rating: 5 },
  { quote: 'They negotiate harder than I ever did and never book a load without my OK.', name: 'Sample Hotshot Carrier', role: 'Hotshot · Texas', rating: 5 },
]

export const FAQS = [
  { q: 'What types of trucks do you dispatch?', a: 'Box trucks (16–26 ft), dry vans, reefers, flatbeds, step decks, hotshots, power only and straight trucks. Additional equipment can be configured as the business grows.' },
  { q: 'Do I need my own MC authority?', a: 'Yes. We dispatch for carriers operating under their own active MC/DOT authority with the required auto liability and cargo insurance.' },
  { q: 'How much does dispatch cost?', a: 'Dispatch is typically a percentage of the gross load rate, shown transparently on every invoice. Final pricing is confirmed during onboarding. (Prototype values are samples only.)' },
  { q: 'Is it forced dispatch?', a: 'No. Your dispatcher presents loads that match your preferences, and you approve every load before it is booked.' },
  { q: 'Can I dispatch a box truck without a CDL?', a: 'Yes — many 16–26 ft box trucks under 26,001 lbs GVWR do not require a CDL. We match loads to your truck’s weight rating and your license class.' },
  { q: 'How do I send BOLs and PODs?', a: 'Take a photo or upload a PDF from the carrier portal on your phone. The load status updates automatically and billing can start right away.' },
  { q: 'How and when do I get paid?', a: 'Brokers pay according to their terms (or your factoring company pays faster). You can track invoices, payments and dispatch fees in your portal.' },
  { q: 'What documents do I need to sign up?', a: 'W-9, Certificate of Insurance, MC authority letter, and driver license / truck documents where applicable. You can upload them during the application.' },
  { q: 'Which load boards do you use?', a: 'We work with major load boards and direct broker relationships. Platform integrations with providers such as DAT and Truckstop depend on authorized API access.' },
  { q: 'Can I choose my lanes and home time?', a: 'Absolutely. You set preferred states, lanes, maximum distance, minimum rate per mile and availability during onboarding — and can update them anytime.' },
]

/** What every dispatch plan includes (pricing page). Fee % itself comes from platform settings. */
export const INCLUDED = [
  'Dedicated dispatcher',
  'Load sourcing & rate negotiation',
  'Broker setup & paperwork',
  'Rate confirmations, BOL & POD handling',
  'Invoicing & payment follow-up',
  'Carrier portal (web & mobile)',
  'Document expiration reminders',
  'SMS & email load notifications',
]
