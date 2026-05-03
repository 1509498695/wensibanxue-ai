import {
  createResultExportFileName,
  formatResultByType,
  getResultExportFilters,
  getResultExportMimeType,
  type ResultExportData,
  type ResultExportFormat,
} from './exportFormatter'

function browserDownload(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function exportResultFile(format: ResultExportFormat, prefix: string, data: ResultExportData) {
  const fileName = createResultExportFileName(prefix, format)
  const content = formatResultByType(format, data)
  const filters = getResultExportFilters(format)

  if (window.wensibanxue?.saveFile) {
    return window.wensibanxue.saveFile(content, fileName, filters)
  }

  browserDownload(fileName, content, getResultExportMimeType(format))

  return { canceled: false }
}
