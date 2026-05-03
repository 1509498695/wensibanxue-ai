export type ResultExportFormat = 'txt' | 'md' | 'html'

export type ResultExportData = {
  input?: string
  output: string
  title: string
  typeLabel: string
  exportedAt?: Date
}

const extensionByFormat: Record<ResultExportFormat, string> = {
  txt: 'txt',
  md: 'md',
  html: 'html',
}

const mimeByFormat: Record<ResultExportFormat, string> = {
  txt: 'text/plain;charset=utf-8',
  md: 'text/markdown;charset=utf-8',
  html: 'text/html;charset=utf-8',
}

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

function formatDate(date = new Date()) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
}

function formatDateTime(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function normalizeTitle(value: string) {
  return value.trim().replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ') || '导出结果'
}

function sectionLines(title: string, content?: string) {
  if (!content?.trim()) {
    return []
  }

  return ['', `## ${title}`, '', content.trim()]
}

export function createResultExportFileName(prefix: string, format: ResultExportFormat, date = new Date()) {
  return `${normalizeTitle(prefix)}_${formatDate(date)}.${extensionByFormat[format]}`
}

export function getResultExportMimeType(format: ResultExportFormat) {
  return mimeByFormat[format]
}

export function getResultExportFilters(format: ResultExportFormat) {
  if (format === 'html') {
    return [{ name: 'HTML 文件', extensions: ['html'] }]
  }

  if (format === 'md') {
    return [{ name: 'Markdown 文件', extensions: ['md'] }]
  }

  return [{ name: '文本文件', extensions: ['txt'] }]
}

export function formatResultAsText({ input, output, title, typeLabel, exportedAt = new Date() }: ResultExportData) {
  return [
    `# ${typeLabel}`,
    '',
    `标题：${title}`,
    `导出时间：${formatDateTime(exportedAt)}`,
    ...sectionLines('输入内容', input),
    '',
    '## 生成结果',
    '',
    output.trim(),
  ]
    .filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
    .join('\n')
}

export function formatResultAsMarkdown({ input, output, title, typeLabel, exportedAt = new Date() }: ResultExportData) {
  return [
    `# ${title}`,
    '',
    `- 功能类型：${typeLabel}`,
    `- 生成时间：${formatDateTime(exportedAt)}`,
    ...sectionLines('输入内容', input),
    '',
    '## 结果内容',
    '',
    output.trim(),
  ]
    .filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
    .join('\n')
}

function markdownishToHtml(content: string) {
  const lines = content.trim().split(/\r?\n/)
  const html: string[] = []
  let listOpen = false

  const closeList = () => {
    if (listOpen) {
      html.push('</ul>')
      listOpen = false
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      closeList()
      continue
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed)
    const listItem = /^[-*]\s+(.+)$/.exec(trimmed) || /^\d+\.\s+(.+)$/.exec(trimmed)

    if (heading) {
      closeList()
      const level = Math.min(heading[1].length + 1, 4)
      html.push(`<h${level}>${escapeHtml(heading[2])}</h${level}>`)
    } else if (listItem) {
      if (!listOpen) {
        html.push('<ul>')
        listOpen = true
      }
      html.push(`<li>${escapeHtml(listItem[1])}</li>`)
    } else {
      closeList()
      html.push(`<p>${escapeHtml(trimmed)}</p>`)
    }
  }

  closeList()

  return html.join('\n')
}

export function formatResultAsHtml({ input, output, title, typeLabel, exportedAt = new Date() }: ResultExportData) {
  const safeTitle = escapeHtml(title)
  const safeType = escapeHtml(typeLabel)
  const safeTime = escapeHtml(formatDateTime(exportedAt))
  const inputBlock = input?.trim()
    ? `<section class="card"><h2>输入内容</h2><p>${escapeHtml(input.trim()).replace(/\n/g, '<br />')}</p></section>`
    : ''

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>
    :root { color-scheme: light; --blue: #2563eb; --purple: #7c3aed; --text: #172033; --muted: #64748b; --line: #dbeafe; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 36px;
      color: var(--text);
      background: linear-gradient(180deg, #f7faff 0%, #ffffff 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", Arial, sans-serif;
      line-height: 1.75;
    }
    main { max-width: 920px; margin: 0 auto; }
    header {
      padding: 28px 30px;
      border: 1px solid var(--line);
      border-radius: 22px;
      background: linear-gradient(135deg, #ffffff, #eff6ff);
      box-shadow: 0 18px 40px rgba(37, 99, 235, 0.08);
    }
    h1 { margin: 0; font-size: 30px; line-height: 1.25; }
    .meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; color: var(--muted); font-size: 14px; font-weight: 700; }
    .meta span { padding: 4px 10px; border-radius: 999px; background: #eef2ff; color: var(--purple); }
    .card {
      margin-top: 18px;
      padding: 22px 24px;
      border: 1px solid #e0e7ff;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.94);
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
    }
    h2 { margin: 0 0 12px; font-size: 21px; color: #0f2f66; }
    h3 { margin: 18px 0 8px; font-size: 17px; color: var(--blue); }
    h4 { margin: 14px 0 6px; font-size: 15px; color: var(--purple); }
    p { margin: 8px 0; white-space: pre-wrap; }
    ul { margin: 8px 0 12px; padding-left: 22px; }
    li { margin: 5px 0; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>${safeTitle}</h1>
      <div class="meta">
        <span>${safeType}</span>
        <span>导出时间：${safeTime}</span>
      </div>
    </header>
    ${inputBlock}
    <section class="card">
      <h2>结果内容</h2>
      ${markdownishToHtml(output)}
    </section>
  </main>
</body>
</html>`
}

export function formatResultByType(format: ResultExportFormat, data: ResultExportData) {
  if (format === 'html') {
    return formatResultAsHtml(data)
  }

  if (format === 'md') {
    return formatResultAsMarkdown(data)
  }

  return formatResultAsText(data)
}
