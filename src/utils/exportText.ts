import { formatResultAsText } from './exportFormatter'

type ResultExportOptions = {
  input?: string
  output: string
  title: string
  typeLabel: string
}

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

export function createExportFileName(prefix: string) {
  const now = new Date()
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(
    now.getMinutes(),
  )}`

  return `${prefix}-${timestamp}.txt`
}

export function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function buildResultExportText({ input, output, title, typeLabel }: ResultExportOptions) {
  return formatResultAsText({ input, output, title, typeLabel })
}
