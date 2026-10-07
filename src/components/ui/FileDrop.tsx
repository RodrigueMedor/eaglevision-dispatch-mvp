import { useEffect, useRef, useState } from 'react'
import { CircleCheck, FileText, UploadCloud, X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface FileDropProps {
  label: string
  description?: string
  value?: string
  onChange: (fileName: string | undefined) => void
  required?: boolean
  error?: string
  accept?: string
  compact?: boolean
  /** demo helper: file name used when "Use sample file" is clicked */
  sampleName?: string
}

/**
 * MOCK upload control. Files are never transmitted — we only keep the file name
 * and simulate progress. In production this posts multipart data to the API,
 * which stores the object in private, encrypted object storage.
 */
export function FileDrop({ label, description, value, onChange, required, error, accept = '.pdf,.jpg,.jpeg,.png', compact, sampleName }: FileDropProps) {
  const input = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearInterval(timer.current), [])

  const simulate = (name: string) => {
    setProgress(0)
    window.clearInterval(timer.current)
    timer.current = window.setInterval(() => {
      setProgress((p) => {
        const next = (p ?? 0) + 20
        if (next >= 100) {
          window.clearInterval(timer.current)
          onChange(name)
          return null
        }
        return next
      })
    }, 120)
  }

  if (value) {
    return (
      <div className={cn('flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60', compact ? 'p-2.5' : 'p-3.5')}>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 ring-1 ring-emerald-200">
          <FileText className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-road-500">{label}</p>
          <p className="truncate text-sm font-semibold text-navy-900">{value}</p>
        </div>
        <CircleCheck className="size-5 shrink-0 text-emerald-600" aria-label="Uploaded" />
        <button type="button" onClick={() => onChange(undefined)} className="rounded p-1 text-road-400 hover:bg-white hover:text-red-600" aria-label={`Remove ${label}`}>
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const f = e.dataTransfer.files[0]
          if (f) simulate(f.name)
        }}
        className={cn(
          'relative flex items-center gap-3 rounded-xl border-2 border-dashed transition-colors',
          compact ? 'p-2.5' : 'p-4',
          dragging ? 'border-amber-500 bg-amber-50' : error ? 'border-red-300 bg-red-50/40' : 'border-road-300 bg-white hover:border-navy-400',
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
          <UploadCloud className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-navy-900">
            {label}
            {required && <span className="ml-0.5 text-red-600">*</span>}
          </p>
          {progress !== null ? (
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-road-200">
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          ) : (
            <p className="text-xs text-road-500">{description ?? 'PDF, JPG or PNG · up to 10 MB'}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
          <button type="button" onClick={() => input.current?.click()} className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800">
            Browse
          </button>
          {sampleName && (
            <button type="button" onClick={() => simulate(sampleName)} className="text-xs font-medium text-navy-600 underline-offset-2 hover:underline">
              Use sample
            </button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept={accept}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) simulate(f.name)
            e.target.value = ''
          }}
        />
      </div>
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}
