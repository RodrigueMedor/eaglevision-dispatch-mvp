import { DemoStoreProvider } from '@/store/DemoStore'
import { ToastProvider } from '@/components/ui/Toast'
import { PrototypeShell } from './PrototypeShell'

export function App() {
  return (
    <DemoStoreProvider>
      <ToastProvider>
        <PrototypeShell />
      </ToastProvider>
    </DemoStoreProvider>
  )
}
