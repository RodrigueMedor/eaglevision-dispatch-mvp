import { LoaderCircle } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-road-400">
      <LoaderCircle className="size-6 animate-spin" aria-label="Loading" />
    </div>
  )
}
