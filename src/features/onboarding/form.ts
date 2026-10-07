import type { ApplicationTruck, CarrierApplication, CarrierDocumentType, EquipmentType, OperatingRadius } from '@/data/types'
import { EQUIPMENT_BY_TYPE } from '@/lib/equipment'

export interface OnboardingForm {
  account: { firstName: string; lastName: string; email: string; phone: string; password: string; confirm: string }
  company: { legalName: string; dba: string; dotNumber: string; mcNumber: string; ein: string; street: string; city: string; state: string; zip: string }
  equipment: { types: EquipmentType[]; truckCount: string; trucks: ApplicationTruck[] }
  preferences: { states: string[]; lanes: string; radius: OperatingRadius[]; maxDistance: string; minRatePerMile: string; availability: string }
  insurance: { provider: string; policyNumber: string; expiresAt: string }
  documents: Partial<Record<DocKey, string>>
  agree: boolean
}

export type DocKey = 'w9' | 'coi' | 'mc-authority' | 'cdl' | 'registration' | 'other'

export const DOCUMENTS: { key: DocKey; label: string; description: string; required: boolean; type: CarrierDocumentType }[] = [
  { key: 'w9', label: 'W-9', description: 'Signed IRS Form W-9 for your company', required: true, type: 'w9' },
  { key: 'coi', label: 'Certificate of Insurance', description: 'Auto liability & cargo — list Eagle Vision Dispatch as certificate holder', required: true, type: 'coi' },
  { key: 'mc-authority', label: 'MC Authority', description: 'Operating authority letter (MC/DOT)', required: true, type: 'mc-authority' },
  { key: 'cdl', label: "Driver's License", description: 'CDL or driver license, where applicable', required: false, type: 'cdl' },
  { key: 'registration', label: 'Truck Documents', description: 'Registration and annual inspection', required: false, type: 'registration' },
  { key: 'other', label: 'Other Requested Documents', description: 'Trailer interchange, factoring NOA, etc.', required: false, type: 'other' },
]

export const STEPS = ['Account', 'Company', 'Equipment', 'Preferences', 'Documents', 'Review & Submit']

export const emptyTruck = (equipment: EquipmentType = 'box-truck'): ApplicationTruck => ({ equipment, year: '', make: '', model: '', vin: '', dimensions: '', capacityLbs: '' })

export const EMPTY_FORM: OnboardingForm = {
  account: { firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' },
  company: { legalName: '', dba: '', dotNumber: '', mcNumber: '', ein: '', street: '', city: '', state: '', zip: '' },
  equipment: { types: [], truckCount: '1', trucks: [emptyTruck()] },
  preferences: { states: [], lanes: '', radius: [], maxDistance: '500', minRatePerMile: '', availability: 'Mon–Fri' },
  insurance: { provider: '', policyNumber: '', expiresAt: '' },
  documents: {},
  agree: false,
}

/** Fictional demo applicant used by the "Fill with sample data" helper. */
export function sampleForm(): OnboardingForm {
  const exp = new Date()
  exp.setFullYear(exp.getFullYear() + 1)
  return {
    account: { firstName: 'Jordan', lastName: 'Sample', email: 'jordan@sunbeltboxlines.demo', phone: '(407) 555-0190', password: 'DemoPass#2026', confirm: 'DemoPass#2026' },
    company: { legalName: 'Sunbelt Box Lines LLC', dba: 'Sunbelt Express', dotNumber: '4201188', mcNumber: 'MC-1488302', ein: '12-3456789', street: '2400 Sand Lake Rd', city: 'Orlando', state: 'FL', zip: '32809' },
    equipment: {
      types: ['box-truck'],
      truckCount: '2',
      trucks: [
        { equipment: 'box-truck', year: '2023', make: 'Isuzu', model: 'NRR', vin: 'DEMO1234567890ABC', dimensions: `26' × 102" × 102"`, capacityLbs: '10000' },
        { equipment: 'box-truck', year: '2021', make: 'Freightliner', model: 'M2 106', vin: 'DEMO0987654321XYZ', dimensions: `24' × 96" × 96"`, capacityLbs: '8500' },
      ],
    },
    preferences: { states: ['FL', 'GA', 'SC', 'NC'], lanes: 'Orlando ↔ Atlanta, Jacksonville → Charlotte', radius: ['local', 'regional'], maxDistance: '600', minRatePerMile: '2.25', availability: 'Mon–Sat, home on weekends' },
    insurance: { provider: 'Sample Mutual Insurance Co.', policyNumber: 'SMI-26-555010', expiresAt: exp.toISOString().slice(0, 10) },
    documents: { w9: 'W9_SunbeltBoxLines.pdf', coi: 'COI_2026_SunbeltBoxLines.pdf', 'mc-authority': 'MC1488302_Authority.pdf', cdl: 'DriverLicense_JSample.jpg', registration: 'Registration_Isuzu_NRR.pdf' },
    agree: true,
  }
}

export type Errors = Record<string, string>

const email = (v: string) => /^\S+@\S+\.\S+$/.test(v)
const digits = (v: string) => v.replace(/\D/g, '')

export function validateStep(step: number, f: OnboardingForm): Errors {
  const e: Errors = {}
  const req = (key: string, value: string, msg = 'Required') => {
    if (!value.trim()) e[key] = msg
  }
  if (step === 0) {
    req('account.firstName', f.account.firstName)
    req('account.lastName', f.account.lastName)
    if (!email(f.account.email)) e['account.email'] = 'Enter a valid email'
    if (digits(f.account.phone).length !== 10) e['account.phone'] = 'Enter a 10-digit phone number'
    if (f.account.password.length < 8) e['account.password'] = 'At least 8 characters'
    else if (!/[0-9]/.test(f.account.password) || !/[A-Za-z]/.test(f.account.password)) e['account.password'] = 'Use letters and numbers'
    if (f.account.confirm !== f.account.password) e['account.confirm'] = 'Passwords do not match'
  }
  if (step === 1) {
    req('company.legalName', f.company.legalName)
    if (!/^\d{6,8}$/.test(digits(f.company.dotNumber))) e['company.dotNumber'] = 'USDOT numbers are 6–8 digits'
    if (f.company.mcNumber && !/^\d{5,8}$/.test(digits(f.company.mcNumber))) e['company.mcNumber'] = 'Enter a valid MC number'
    if (digits(f.company.ein).length !== 9) e['company.ein'] = 'EIN is 9 digits (XX-XXXXXXX)'
    req('company.street', f.company.street)
    req('company.city', f.company.city)
    req('company.state', f.company.state)
    if (!/^\d{5}$/.test(f.company.zip)) e['company.zip'] = '5-digit ZIP'
  }
  if (step === 2) {
    if (f.equipment.types.length === 0) e['equipment.types'] = 'Select at least one equipment type'
    if (!(Number(f.equipment.truckCount) >= 1)) e['equipment.truckCount'] = 'At least 1 truck'
    f.equipment.trucks.forEach((t, i) => {
      if (!/^(19|20)\d{2}$/.test(t.year)) e[`trucks.${i}.year`] = 'Year'
      if (!t.make.trim()) e[`trucks.${i}.make`] = 'Make'
      if (!t.model.trim()) e[`trucks.${i}.model`] = 'Model'
    })
  }
  if (step === 3) {
    if (f.preferences.states.length === 0) e['preferences.states'] = 'Select at least one state'
    if (f.preferences.radius.length === 0) e['preferences.radius'] = 'Choose local, regional and/or OTR'
    if (!(Number(f.preferences.maxDistance) > 0)) e['preferences.maxDistance'] = 'Enter miles'
    if (f.preferences.minRatePerMile && !(Number(f.preferences.minRatePerMile) > 0)) e['preferences.minRatePerMile'] = 'Enter a rate, e.g. 2.25'
  }
  if (step === 4) {
    DOCUMENTS.filter((d) => d.required && !f.documents[d.key]).forEach((d) => (e[`documents.${d.key}`] = `${d.label} is required`))
    req('insurance.provider', f.insurance.provider)
    req('insurance.policyNumber', f.insurance.policyNumber)
    req('insurance.expiresAt', f.insurance.expiresAt)
  }
  if (step === 5 && !f.agree) e.agree = 'Please confirm to submit'
  return e
}

export function toApplication(f: OnboardingForm): Omit<CarrierApplication, 'id' | 'status' | 'submittedAt' | 'notes'> {
  return {
    owner: { firstName: f.account.firstName, lastName: f.account.lastName, email: f.account.email, phone: f.account.phone },
    company: {
      legalName: f.company.legalName,
      dba: f.company.dba,
      dotNumber: digits(f.company.dotNumber),
      mcNumber: f.company.mcNumber ? `MC-${digits(f.company.mcNumber)}` : '—',
      ein: `••-•••${digits(f.company.ein).slice(-4)}`,
      address: { street: f.company.street, city: f.company.city, state: f.company.state, zip: f.company.zip },
    },
    equipment: { types: f.equipment.types, truckCount: Number(f.equipment.truckCount), trucks: f.equipment.trucks },
    preferences: {
      states: f.preferences.states,
      lanes: f.preferences.lanes,
      radius: f.preferences.radius,
      maxDistance: Number(f.preferences.maxDistance),
      minRatePerMile: Number(f.preferences.minRatePerMile) || 0,
      availability: f.preferences.availability,
    },
    insurance: { provider: f.insurance.provider, policyNumber: f.insurance.policyNumber, autoLiability: 1_000_000, cargo: 100_000, expiresAt: new Date(f.insurance.expiresAt).toISOString() },
    documents: DOCUMENTS.filter((d) => d.key !== 'other' || f.documents.other).map((d) => ({ type: d.type, name: d.label, status: f.documents[d.key] ? 'received' : 'missing' })),
  }
}

export const equipmentNames = (types: EquipmentType[]) => types.map((t) => EQUIPMENT_BY_TYPE[t].label).join(', ') || '—'
