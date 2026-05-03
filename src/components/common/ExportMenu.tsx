import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Download, FileCode2, FileText } from 'lucide-react'
import type { ResultExportFormat } from '../../utils/exportFormatter'

type ExportMenuProps = {
  disabled?: boolean
  label?: string
  onExport: (format: ResultExportFormat) => void
}

const exportOptions: Array<{
  format: ResultExportFormat
  label: string
  Icon: typeof FileText
}> = [
  { format: 'txt', label: '导出 TXT', Icon: FileText },
  { format: 'md', label: '导出 Markdown', Icon: Download },
  { format: 'html', label: '导出 HTML', Icon: FileCode2 },
]

function ExportMenu({ disabled = false, label = '导出', onExport }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  return (
    <div className="export-menu" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        className="secondary-button export-menu-trigger"
        disabled={disabled}
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <Download size={18} />
        {label}
        <ChevronDown size={16} />
      </button>
      {isOpen ? (
        <div className="export-menu-panel">
          {exportOptions.map(({ Icon, format, label: optionLabel }) => (
            <button
              key={format}
              onClick={() => {
                setIsOpen(false)
                onExport(format)
              }}
              type="button"
            >
              <Icon size={16} />
              {optionLabel}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default ExportMenu
