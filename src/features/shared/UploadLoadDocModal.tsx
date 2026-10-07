import { useState } from 'react'
import type { LoadDocumentKind } from '@/data/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Form'
import { FileDrop } from '@/components/ui/FileDrop'
import { Alert } from '@/components/ui/Feedback'

export const LOAD_DOC_LABEL: Record<LoadDocumentKind, string> = {
  'rate-con': 'Rate Confirmation',
  bol: 'Bill of Lading (BOL)',
  pod: 'Proof of Delivery (POD)',
  lumper: 'Lumper Receipt',
  other: 'Other',
}

export function UploadLoadDocModal({ open, onClose, loadId, initialKind = 'pod', kinds, onUpload }: { open: boolean; onClose: () => void; loadId: string; initialKind?: LoadDocumentKind; kinds: LoadDocumentKind[]; onUpload: (kind: LoadDocumentKind, name: string) => void }) {
  const [kind, setKind] = useState<LoadDocumentKind>(initialKind)
  const [file, setFile] = useState<string>()
  const [error, setError] = useState<string>()

  const close = () => {
    setFile(undefined)
    setError(undefined)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={`Upload document · ${loadId}`}
      description="Take a photo or choose a PDF. Status updates automatically."
      footer={
        <>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={() => {
              if (!file) return setError('Choose a file to upload')
              onUpload(kind, file)
              close()
            }}
          >
            Upload
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select label="Document type" value={kind} onChange={(e) => setKind(e.target.value as LoadDocumentKind)} options={kinds.map((k) => ({ value: k, label: LOAD_DOC_LABEL[k] }))} />
        <FileDrop label={LOAD_DOC_LABEL[kind]} value={file} onChange={(f) => { setFile(f); setError(undefined) }} error={error} sampleName={`${kind.toUpperCase()}_${loadId}_photo.jpg`} accept=".pdf,.jpg,.jpeg,.png,.heic" />
        {kind === 'pod' && <Alert tone="info">Uploading a signed POD marks the load as <strong>POD Received</strong> and notifies accounting to invoice the broker.</Alert>}
        {kind === 'bol' && <Alert tone="info">Uploading the BOL at the shipper confirms pickup.</Alert>}
      </div>
    </Modal>
  )
}
