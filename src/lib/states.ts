export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
] as const

export const REGIONS: Record<string, string[]> = {
  Southeast: ['FL', 'GA', 'AL', 'SC', 'NC', 'TN', 'MS'],
  Midwest: ['IL', 'IN', 'OH', 'MI', 'WI', 'MO', 'IA'],
  Texas: ['TX', 'OK', 'LA', 'AR'],
  Northeast: ['NY', 'NJ', 'PA', 'MA', 'CT', 'MD'],
  West: ['CA', 'AZ', 'NV', 'UT', 'OR', 'WA'],
}
