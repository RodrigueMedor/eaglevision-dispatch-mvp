import { Button } from '@/components/ui/Button'
import { EquipmentGlyph } from '@/components/brand/EquipmentGlyph'

export function NotFoundPage() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <div className="w-56 opacity-70">
        <EquipmentGlyph type="power-only" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-navy-900">Wrong exit</h1>
      <p className="mt-2 text-road-600">We couldn’t find that page. Let’s get you back on route.</p>
      <Button to="/" variant="accent" className="mt-6">
        Back to home
      </Button>
    </div>
  )
}
