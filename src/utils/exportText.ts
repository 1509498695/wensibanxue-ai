type ResultExportOptions = {
  input?: string
  output: string
  title: string
  typeLabel: string
}

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

function formatDateTime(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`
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
  return [
    `# ${typeLabel}`,
    '',
    `标题：${title}`,
    `导出时间：${formatDateTime()}`,
    '',
    input ? '## 输入内容' : '',
    input || '',
    input ? '' : '',
    '## 生成结果',
    output,
  ]
    .filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
    .join('\n')
}
